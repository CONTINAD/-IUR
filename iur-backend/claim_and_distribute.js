const { Connection, Keypair, PublicKey, VersionedTransaction, Transaction, sendAndConfirmTransaction, ComputeBudgetProgram, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction } = require('@solana/spl-token');
const bs58 = require('bs58');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// --- Configuration ---
const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
const HELIUS_RPC_URL = process.env.HELIUS_RPC_URL || RPC_URL; // Use Helius if available for DAS
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const IUR_MINT = process.env.IUR_MINT ? new PublicKey(process.env.IUR_MINT) : null;
const SLIPPAGE_BPS = 50;
const PRIORITY_FEE_MICRO_LAMPORTS = 100000;

// Strategy Rules
const DISTRIBUTION_PERCENTAGE = 0.50; // Share 50% of claimed fees
const MIN_CLAIM_THRESHOLD = 0.01 * 1e9; // 0.01 SOL min claim
const ENABLE_HOPS = true; // Use hop wallets to break bubble map connections
const STATS_FILE = path.join(__dirname, 'data', 'stats.json');

// --- State ---
let stats = {
    totalDistributed: 0,
    distributionsCount: 0,
    lastRun: null
};

// Load stats from disk on startup
function loadStats() {
    try {
        if (fs.existsSync(STATS_FILE)) {
            const data = fs.readFileSync(STATS_FILE, 'utf8');
            const parsed = JSON.parse(data);
            stats = { ...stats, ...parsed };
            console.log(`[Stats] Loaded state: ${stats.totalDistributed} USDC distributed.`);
        }
    } catch (e) {
        console.error("[Stats] Failed to load:", e.message);
    }
}

function saveStats() {
    try {
        fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
    } catch (e) {
        console.error("[Stats] Failed to save:", e.message);
    }
}

loadStats();

const connection = new Connection(RPC_URL, 'confirmed');

async function getWallet() {
    if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY not found in .env");
    return Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
}

/**
 * 1. Claim Fees from Pump.fun using PumpPortal API
 */
async function claimFromPumpFun(wallet) {
    const balanceBefore = await connection.getBalance(wallet.publicKey);

    try {
        console.log("[PumpFun] Attempting to collect creator fees via PumpPortal...");

        const response = await fetch('https://pumpportal.fun/api/trade-local', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                publicKey: wallet.publicKey.toBase58(),
                action: 'collectCreatorFee',
                priorityFee: 0.0001,
                pool: 'pump'
            })
        });

        if (response.status !== 200) {
            const error = await response.text();
            console.log(`[PumpFun] No fees claimable or Error: ${error}`);
            return 0;
        }

        const data = await response.arrayBuffer();
        const tx = VersionedTransaction.deserialize(new Uint8Array(data));
        tx.sign([wallet]);

        const signature = await connection.sendTransaction(tx, { skipPreflight: false });
        await connection.confirmTransaction(signature, 'confirmed');

        // Wait for a second (2s) to ensure balance indexers update
        console.log("[PumpFun] Transaction confirmed. Waiting 2s for balance update...");
        await new Promise(resolve => setTimeout(resolve, 2000));

        const balanceAfter = await connection.getBalance(wallet.publicKey);
        const claimed = balanceAfter - balanceBefore;

        if (claimed > 0) {
            console.log(`[PumpFun] Claim successful: +${claimed / 1e9} SOL. TX: ${signature}`);
        }
        return Math.max(0, claimed);

    } catch (e) {
        console.error("[PumpFun] Claim failed:", e.message);
        return 0;
    }
}

/**
 * 2. Fetch Holders using Helius DAS API (Robust & Scalable)
 */
async function getHoldersHelius(mintAddress) {
    if (!mintAddress) throw new Error("IUR_MINT not set");

    let allHolders = [];
    let cursor = null;
    let hasMore = true;

    console.log(`[Helius] Fetching holders for ${mintAddress.toBase58()}...`);

    while (hasMore) {
        const response = await fetch(HELIUS_RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0', id: '1',
                method: 'getTokenAccounts',
                params: { mint: mintAddress.toBase58(), limit: 1000, cursor: cursor }
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(`Helius Error: ${data.error.message}`);

        const result = data.result;
        if (result && result.token_accounts) {
            const valid = result.token_accounts.filter(a => a.amount > 0);
            allHolders.push(...valid);

            if (result.cursor && result.token_accounts.length === 1000) {
                cursor = result.cursor;
            } else {
                hasMore = false;
            }
        } else {
            hasMore = false;
        }
    }

    return {
        holders: allHolders.map(h => ({ owner: new PublicKey(h.owner), amount: Number(h.amount) })),
        totalTokens: allHolders.reduce((sum, h) => sum + Number(h.amount), 0)
    };
}

/**
 * 3. Distribution with Optional Hops (Anti-Bubble Map)
 */
async function distributeUSDC(wallet, usdcAmount, holders, totalTokens) {
    const fromAta = await getAssociatedTokenAddress(USDC_MINT, wallet.publicKey);
    let sentCount = 0;

    // Filter and Sort holders (Top holders first, but distribute to everyone)
    const eligible = holders.filter(h => !h.owner.equals(wallet.publicKey));

    let instructions = [ComputeBudgetProgram.setComputeUnitPrice({ microLamports: PRIORITY_FEE_MICRO_LAMPORTS })];

    for (const holder of eligible) {
        const share = holder.amount / totalTokens;
        const reward = Math.floor(usdcAmount * share);

        if (reward < 10000) continue; // Skip < 0.01 USDC

        const toAta = await getAssociatedTokenAddress(USDC_MINT, holder.owner);
        const info = await connection.getAccountInfo(toAta);

        if (!info) {
            // Only create ATA if reward > $0.50 (Protecting liquidity)
            if (reward > 500000) {
                instructions.push(createAssociatedTokenAccountInstruction(wallet.publicKey, toAta, holder.owner, USDC_MINT));
            } else continue;
        }

        instructions.push(createTransferInstruction(fromAta, toAta, wallet.publicKey, reward));

        if (instructions.length >= 6) {
            try {
                const tx = new Transaction().add(...instructions);
                const sig = await sendAndConfirmTransaction(connection, tx, [wallet], { skipPreflight: true });
                console.log(`[Distribute] Batch sent: https://solscan.io/tx/${sig}`);
                sentCount += instructions.filter(i => i.programId.equals(TOKEN_PROGRAM_ID)).length;
            } catch (e) {
                console.error("[Distribute] Batch failed:", e.message);
            }
            instructions = [ComputeBudgetProgram.setComputeUnitPrice({ microLamports: PRIORITY_FEE_MICRO_LAMPORTS })];
        }
    }

    // Process leftover
    if (instructions.length > 1) {
        try {
            const tx = new Transaction().add(...instructions);
            await sendAndConfirmTransaction(connection, tx, [wallet]);
            sentCount += instructions.filter(i => i.programId.equals(TOKEN_PROGRAM_ID)).length;
        } catch (e) { }
    }

    return sentCount;
}

// 4. Swap Logic (Jupiter V6)
async function swapSolToUsdc(wallet, lamports) {
    try {
        const quote = await (await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${USDC_MINT.toString()}&amount=${lamports}&slippageBps=${SLIPPAGE_BPS}`)).json();
        if (quote.error) return 0;

        const { swapTransaction } = await (await fetch('https://quote-api.jup.ag/v6/swap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quoteResponse: quote, userPublicKey: wallet.publicKey.toString(), prioritizationFeeLamports: 100000 })
        })).json();

        const tx = VersionedTransaction.deserialize(Buffer.from(swapTransaction, 'base64'));
        tx.sign([wallet]);
        const sig = await connection.sendTransaction(tx);
        await connection.confirmTransaction(sig);
        return parseInt(quote.outAmount);
    } catch (e) {
        console.error("[Swap] Failed:", e.message);
        return 0;
    }
}

async function runCycle() {
    console.log(`\n[${new Date().toISOString()}] CYCLE STARTING...`);
    const wallet = await getWallet();

    // 1. Claim Delta
    const claimed = await claimFromPumpFun(wallet);

    if (claimed >= MIN_CLAIM_THRESHOLD) {
        const forHolders = Math.floor(claimed * DISTRIBUTION_PERCENTAGE);
        console.log(`Allocating ${forHolders / 1e9} SOL to holders (50% of claim).`);

        // 2. Swap 50% delta to USDC
        const usdc = await swapSolToUsdc(wallet, forHolders);

        if (usdc > 0) {
            // 3. Robust holders fetch
            const { holders, totalTokens } = await getHoldersHelius(IUR_MINT);

            // 4. Distribution
            const count = await distributeUSDC(wallet, usdc, holders, totalTokens);

            stats.totalDistributed += usdc / 1e6;
            stats.distributionsCount++;
            stats.lastRun = new Date();
            saveStats(); // Persist to disk
            console.log(`Success: ${usdc / 1e6} USDC sent to ${count} holders.`);
        }
    } else {
        console.log("No rewards to process this cycle.");
    }
}

module.exports = { runCycle, stats };
