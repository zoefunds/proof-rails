# Deployment

## Current production deployment

- Console: `https://proof-rails.vercel.app`
- Network: GenLayer Studionet (`61999`)
- Contract: `0x55E598C3AAefD6C3610E82289276cFEcB6499Ef9`
- Deployment transaction: `0x8b2d09b20d3bfa709e95952d365d8873208e240d4a9ee6a259e530222d0ff084`
- Live verification rail: `1`
- Deployment record: `artifacts/deployment.studionet.json`
- Lifecycle record: `artifacts/live-e2e.studionet.json`

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

