# $IUR - Infinite USDC Strategy (Project Master Guide)

This project implements the **Infinite USDC Strategy**: an automated system that claims trading fees from Pump.fun, swaps them for USDC, and distributes them to token holders every minute.

## Architecture

### 1. Frontend (`/iur-web`)

- **Vite + React + TailwindCSS**
- **Premium Design**: Cyber-neon theme with pixel-art integration.
- **Components**:
  - `HeroSection`: High-fidelity branding and CA display.
  - `StatsSection`: Real-time dashboard fetching data from the backend.
  - `ParticlesBackground`: Dynamic "Cosmic Void" interactive background.
- **Deployment**: Configured for Netlify via root `netlify.toml`.

### 2. Backend Bot (`/iur-backend`)

- **Logic**: `claim_and_distribute.js`
- **Safety Tech (Dev Protection)**:
  - **Delta Tracking**: The bot measures the wallet balance *immediately before and after* the claim instruction. It ONLY processes the difference (the fees).
  - **50% Share**: Only 50% of the newly claimed fees are swapped for USDC.
  - **Capital Protection**: Existing SOL used for dev trading is never touched or swapped.
- **Network Resiliency**: Includes Priority Fees and automatic USDC Account creation for holders.
- **Server**: Express server on port `3001` providing an API for the frontend.

## Operational Guide

### Local Development

1. **Frontend**: `cd iur-web && npm run dev`
2. **Backend**:
   - `cd iur-backend`
   - Set up `.env` with `PRIVATE_KEY`, `RPC_URL`, and `IUR_MINT`.
   - `node server.js`

### Launch Checklist

- [ ] Deploy Token to Pump.fun.
- [ ] Update `IUR_MINT` in backend `.env`.
- [ ] Update `CA` constant in `iur-web/src/App.jsx`.
- [ ] Fund Bot Wallet with 0.5 SOL for gas and initial rent.

## Knowledge Base for AI Agents

- Configuration rules and program IDs are stored in `.agent/lexicon.md`.
- Always respect the `DISTRIBUTION_PERCENTAGE` constant in the backend logic.
- Do not modify CSS without maintaining the `glow-cyan` and `pixel-font` utility classes.
