# HEXOS Lab

Local 2-chain demo: burn HEX (ETH) ? receive **native HEXOS** (gas coin) from a router treasury + auto-stake xHEX (5555d).
Ultra-cheap gas (1 wei) for web3 games. Centralized for speed.

## Quick Start
A: npm run node:eth    (8545)
B: npm run node:hexos  (8546)
C: npm run deploy:all  (funds router)
D: npm run relayer     (needs RELAYER_PK in .env)
E: npm run burn
F: npx hardhat run --network hexosLocal scripts/check_native.js

## Anti-whale (MintRouter.sol)
- CAP: 1B HEXOS total
- DAILY_CAP_WEI: 5,000,000 HEXOS/day
- MAX_BURN_PER_PROOF_8: 10,000,000 HEX (8 dec)
- SMALL_CAP_8: first 100k HEX gets +15% boost
- COOLDOWN: 60s per address

## Secrets
Copy .env.example ? .env and set RELAYER_PK (66 chars from HEXOS node).
