# Deployment

## Current production deployment

- Console: `https://proof-rails.vercel.app`
- Network: GenLayer Studionet (`61999`)
- Contract: `0x6ccB0124DEF180d34E6830ebCDC1450F61b4b365`
- Deployment transaction: `0x44581e5cb7c3e7bc553d0ff389ac9fee702b7ac83d6bf5ec5f765e41e2b5fe37`
- Live verification rails: `1`, `2`, and `3`
- Deployment record: `artifacts/deployment.studionet.json`
- Lifecycle records: `artifacts/live-e2e-1.studionet.json`, `artifacts/live-e2e-2.studionet.json`, and `artifacts/live-e2e-3.studionet.json`

## Release procedure

1. Run contract lint, Direct Mode tests, frontend tests, typecheck, and build.
2. Validate and generate the schema with the GenLayer CLI.
3. Deploy `contracts/proofrail.py` to a fresh Studionet address.
4. Set `VITE_PROOFRAIL_CONTRACT_ADDRESS`, `VITE_PROOFRAIL_CHAIN_ID=61999`, and the Studionet RPC URL.
5. Exercise one complete unchallenged rail and one successful challenged rail.
6. Record the source commit, deployment transaction, contract address, and lifecycle transaction receipts before publishing.

## Production web origin

The production console and evidence publisher are served from `https://proof-rails.vercel.app`. The DID document is available at `/.well-known/did.json`, and immutable evidence artifacts are stored below `/evidence/<sha256>.json`.

No private key belongs in this repository or browser bundle.

