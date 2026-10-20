# Deployment

## Current v5 deployment — 2026-10-20

- Contract: `0xa8533cC75600637a824B9A34EB5ddE9d38A6aBe6`
- Deployment transaction: `0xf4370bcbf668dcfc492251af9ae964fe069d425f19d9bb477fd8d8ee3c8cbc63`
- Local and deployed source SHA-256: `feaecbd181cca305c1f1035509eba5897da9e6a284aa6257bbf5797df0151381`
- Funded proof: `artifacts/live-e2e-4.studionet.json`
- Production browser: `https://proof-rails.vercel.app`

Rail 1 locked 0.01 GEN. Validators semantically classified two primary statements as `FULFILLED`. A 5% recipient bond opened the separately frozen three-source counter panel; all three statements classified as `BREACHED`. This replaced the provisional result without enlarging the primary electorate. The recipient received exactly 0.01 GEN and principal/bond accounting returned to zero.

## Deployed-source equivalence

The deployment transaction finalized with `MAJORITY_AGREE`. Its `contract_code` was decoded from base64 and hashed independently from the local UTF-8 source. Both byte sequences produced `feaecbd181cca305c1f1035509eba5897da9e6a284aa6257bbf5797df0151381`; `artifacts/deployment.studionet.json` records both values, the byte count (`20,223`), execution hash, deployer, and finalization timestamps.

## Current funded lifecycle

Rail 1 was funded with `0.01 GEN` by issuer `0x86640E27BB18E467aE2193A2FF680375653c69FC` for recipient `0x53705Bb2B34ff7CEcC93F79a1D91aDa1185D87Dd`. The primary round authenticated two distinct origins, DIDs, and authority identifiers. The dispute round added three more and persisted matching expected/observed evidence and DID digests for all three counter-sources.

| Action | Transaction | GenVM execution hash |
| --- | --- | --- |
| Open funded rail | `0xc5db721d16b59f95bcf96a61483c8698ab885b1774f9b34ecde90846f4a25ab3` | `0x7f7476de0e18462bbe39b617ab643f57927f5bb17eeb91859fdd6990477f1c2a` |
| Lodge recipient claim | `0x1cc54c1c2ce343047ccf2d28844464ecdaf23378ee56a4e26caaf278648ec7a8` | `0xb5d92aa4044eb34fd44363c2b9656eb99a85e76abe96141cd647d6dd83eb25aa` |
| Primary evidence review | `0x27a7a5c2cd253f055eeb3bbb4ce62fd3266631b1c69ab035ee98790170d3693e` | `0xb5d92aa4044eb34fd44363c2b9656eb99a85e76abe96141cd647d6dd83eb25aa` |
| Submit reasoned 5% bond | `0x2c8216b154e293db4d595a72e0bd71b48760931c251c189ac3de2cbe7203c51b` | `0x14bbe4047ae2f9eddad16ac3a05e1e7a40ab2be1537164a343d347a141d41332` |
| Resolve dispute | `0x62c936795e97bef9ba52719bd0ad087d3366727a3ee07f27c0b11c0f4faf660e` | `0xb5d92aa4044eb34fd44363c2b9656eb99a85e76abe96141cd647d6dd83eb25aa` |

Every transaction reached `MAJORITY_AGREE` with explicit finalized GenVM execution evidence. The provisional code was `FULFILLED`; the independent counter panel changed it to `BREACHED` at 10,000 basis points. The recipient balance increased by exactly 0.01 GEN, with zero principal and bond remaining locked.

## Browser verification

The public production interface at `proof-rails.vercel.app` was checked against the fresh deployment. It reads rail 1 and both on-chain receipts, displaying authority identity, asserted/verified state, vote code, agreeing/verified counts, and matching expected/observed digests. The immutable transaction-level proof above remains the canonical settlement record; no browser key or private signing material is stored in the repository.

## Release procedure

1. Run contract lint, Direct Mode tests, frontend tests, typecheck, and build.
2. Validate and generate the schema with the GenLayer CLI.
3. Deploy `contracts/proofrail.py` to a fresh Studionet address.
4. Update the pinned production contract address and verify chain ID `61999`.
5. Exercise creation, claim, review, reasoned challenge, settlement, and eligible recovery through the public browser client.
6. Record the source commit, deployment transaction, contract address, finalized lifecycle receipts, execution hashes, terminal accounting, and balance movement before publishing.

## Production web origin

The production console is served from `https://proof-rails.vercel.app`. Independent publisher origins expose a pinned `/.well-known/did.json` and immutable `/evidence/<sha256>.json` artifacts.

No private key belongs in this repository or browser bundle.

