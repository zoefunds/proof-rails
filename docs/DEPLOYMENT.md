# Deployment

## Current production deployment

- Console: `https://proof-rails.vercel.app`
- Network: GenLayer Studionet (`61999`)
- Contract: `0xe0eD7d02f8c0F907f342E4d3A2aF1F707EDc97dc`
- Deployment transaction: `0x6759d35a1f8e4e30a76555064810c17321dbbf0c53f86e449bcf2cf04ae9b7d0`
- Execution hash: `0xa2f5ec8983763d6b4bea082d10b5f7ddd879c250a5a479cb34a17bafd906deb3`
- Exact deployed/local source SHA-256: `4705ad10c2e201d2b623b4416ccbfc37becd4d95aba8c1ab1f758eb087e961ff`
- Current v3 verification rail: `1` (`artifacts/live-e2e-4.studionet.json`)
- Deployment record: `artifacts/deployment.studionet.json`
- Historical v2 lifecycle records: `artifacts/live-e2e-1.studionet.json`, `artifacts/live-e2e-2.studionet.json`, and `artifacts/live-e2e-3.studionet.json`

The first three records refer to prior deployments. The current `live-e2e-4` file identifies schema `proofrail.live-verification/v3`, the v3 contract above, and its five finalized transaction hashes. Git history preserves the earlier v2 positive-payout record.

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

