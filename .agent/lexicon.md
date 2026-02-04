# $IUR Project Lexicon

## Core Logic
- **Project Name**: Infinite USDC Strategy ($IUR)
- **Mechanics**: Claims Pump.fun global fees (simulated via SOL balance in bot wallet), swaps to USDC via Jupiter V6, and distributes to $IUR token holders proportional to their holdings.
- **Backend Stack**: Node.js/Express, @solana/web3.js, node-cron.
- **Frontend Stack**: React (Vite), TailwindCSS, Framer Motion, Lucide-React.

## Critical Technical Specs
- **USDC Mint**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- **Jupiter API**: Using V6 Quote & Swap endpoints.
- **Distribution Rules**: 
  - Skip reward amounts < 0.01 USDC (dust).
  - Automatically create USDC ATAs for holders ONLY if their reward > 0.50 USDC (to cover rent costs).
  - Batching: ~6 transfers per transaction to maximize landing probability.
  - Priority Fees: Hardcoded to 100,000 micro-lamports (adjustable in `claim_and_distribute.js`).

## Deployment
- **Frontend**: Netlify (configured via root `netlify.toml`).
- **Backend**: Requires a persistent VPS (Node.js) with `.env` configured for `PRIVATE_KEY` and `IUR_MINT`.
- **Port**: Backend runs on `3001` (CORS enabled for localhost:5173/5174).

## Context for Antigravity
- When working on the backend, ensure `PRIORITY_FEE_MICRO_LAMPORTS` is set.
- Always check if `IUR_MINT` is null before running holder snapshots.
- Frontend CSS uses a "Cyber-Neon" theme with "Press Start 2P" pixel font for headers.
