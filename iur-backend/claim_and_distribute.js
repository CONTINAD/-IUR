const { Connection, Keypair, PublicKey, VersionedTransaction, Transaction, sendAndConfirmTransaction } = require('@solana/web3.js');
const { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const bs58 = require('bs58');
const fetch = require('node-fetch');

// --- Configuration ---
const RPC_URL = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const IUR_MINT = 'YOUR_TOKEN_MINT_ADDRESS_HERE'; // User needs to set this
const SLIPPAGE_BPS = 50; // 0.5%

// --- State ---
// (In a real app, use a database. Here we use in-memory for the demo)
let stats = {
    totalDistributed: 0,
    distributionsCount: 0,
    lastRun: null
};

// --- Helpers ---
const connection = new Connection(RPC_URL, 'confirmed');

async function getWallet() {
    if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY not found in .env");
    return Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
}

// 1. Swap SOL to USDC using Jupiter V6 API
async function swapSolToUsdc(wallet, amountSolLambda) {
    try {
        const quoteResponse = await (
            await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=${USDC_MINT}&amount=${amountSolLambda}&slippageBps=${SLIPPAGE_BPS}`)
        ).json();

        if (quoteResponse.error) throw new Error(quoteResponse.error);

        const { swapTransaction } = await (
            await fetch('https://quote-api.jup.ag/v6/swap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quoteResponse,
                    userPublicKey: wallet.publicKey.toString(),
                    wrapAndUnwrapSol: true,
                })
            })
        ).json();

        const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
        const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
        transaction.sign([wallet]);

        const txid = await connection.sendTransaction(transaction);
        await connection.confirmTransaction(txid);

        console.log(`Swap successful: https://solscan.io/tx/${txid}`);
        return parseInt(quoteResponse.outAmount); // Return USDC amount in smallest unit (6 decimals)
    } catch (err) {
        console.error("Swap failed:", err);
        return 0;
    }
}

// 2. Get Holders and Calculate Shares
async function getHoldersAndShares(mintAddress) {
    // Note: getProgramAccounts is heavy. For production, use Helius DAS API.
    const filters = [
        { dataSize: 165 },
        { memcmp: { offset: 0, bytes: mintAddress } }
    ];
    const accounts = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, { filters });

    let holders = [];
    let totalTokens = 0;

    accounts.forEach(account => {
        const amount = account.account.data.readBigUInt64LE(64);
        if (amount > 0) {
            holders.push({
                pubkey: account.pubkey,
                owner: new PublicKey(account.account.data.slice(32, 64)),
                amount: Number(amount)
            });
            totalTokens += Number(amount);
        }
    });

    return { holders, totalTokens };
}

// 3. Batch Distribute USDC
async function distribute(wallet, totalUsdcToDistribute, holders, totalTokens) {
    const usdcMint = new PublicKey(USDC_MINT);
    const fromTokenAccount = await getAssociatedTokenAddress(usdcMint, wallet.publicKey);

    let instructions = [];
    let sentCount = 0;

    for (const holder of holders) {
        const share = holder.amount / totalTokens;
        const usdcAmount = Math.floor(totalUsdcToDistribute * share);

        if (usdcAmount < 1000) continue; // Skip dust (e.g. < 0.001 USDC)

        const toTokenAccount = await getAssociatedTokenAddress(usdcMint, holder.owner);

        // Note: In reality, we must check if toTokenAccount exists, and if not, creating it costs Rent.
        // For simplicity, we assume robust implementation handles ATA creation or skips.

        instructions.push(
            createTransferInstruction(fromTokenAccount, toTokenAccount, wallet.publicKey, usdcAmount)
        );

        if (instructions.length >= 8) { // Batch ~8 transfers per TX
            const tx = new Transaction().add(...instructions);
            try {
                const sig = await sendAndConfirmTransaction(connection, tx, [wallet]);
                console.log(`Batch sent: ${sig}`);
                sentCount += instructions.length;
            } catch (e) {
                console.error("Batch failed:", e);
            }
            instructions = [];
        }
    }

    return sentCount;
}

// --- Main Pipeline ---
async function runCycle() {
    console.log("--- Starting Distribution Cycle ---");
    const wallet = await getWallet();

    // 1. Check Balance (Simulate "Claiming Fees" by checking what's in the wallet)
    const bal = await connection.getBalance(wallet.publicKey);
    const RESERVE = 0.05 * 1e9; // Keep 0.05 SOL for gas
    const swapAmount = bal - RESERVE;

    if (swapAmount > 100000) { // If > 0.0001 SOL available
        console.log(`Swapping ${swapAmount / 1e9} SOL to USDC...`);
        const usdcReceived = await swapSolToUsdc(wallet, swapAmount);

        if (usdcReceived > 0) {
            const { holders, totalTokens } = await getHoldersAndShares(IUR_MINT);
            console.log(`Found ${holders.length} holders. Distributing...`);

            await distribute(wallet, usdcReceived, holders, totalTokens);

            stats.totalDistributed += usdcReceived / 1e6;
            stats.distributionsCount++;
            stats.lastRun = new Date();
        }
    } else {
        console.log("Insufficient SOL balance to swap/distribute.");
    }
}

module.exports = { runCycle, stats };
