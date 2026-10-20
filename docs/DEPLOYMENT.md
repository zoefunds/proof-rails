# Deployment

## Current v4 deployment — 2026-10-20

- Contract: `0x7d61a7BaD67904Db4C46c8108b77C42D03908daC`
- Deployment transaction: `0xdb4045b5aa314f79a2eebe99b4d94783e251ec83284c5a0ab999f9a9d9ff8813`
- Local and deployed source SHA-256: `2ee60390f63982855417cb36c8454b06fe3dae3f660aad8b4142baedd341a259`
- Funded proof: `artifacts/live-e2e-4.studionet.json`
- Production browser: `https://proof-rails.vercel.app`

Rail 1 locked 0.01 GEN. The primary receipt verified two asserted sources and provisionally selected `FULFILLED`. A 5% recipient bond introduced three separately addressed, DID-pinned counter-sources. The dispute receipt verified all five sources and changed consensus 3–2 to `BREACHED`; 0.01 GEN reached the recipient and both locked-principal and locked-bond accounting returned to zero. Every deployment and lifecycle transaction reports `MAJORITY_AGREE` plus a finalized GenVM execution hash.

## Deployed-source equivalence

The deployment transaction finalized with `MAJORITY_AGREE`. Its `contract_code` was decoded from base64 and hashed independently from the local UTF-8 source. Both byte sequences produced `2ee60390f63982855417cb36c8454b06fe3dae3f660aad8b4142baedd341a259`; `artifacts/deployment.studionet.json` records both values, the byte count (`16,701`), execution hash, deployer, and finalization timestamps.

## Current funded lifecycle

Rail 1 was funded with `0.01 GEN` by issuer `0x86640E27BB18E467aE2193A2FF680375653c69FC` for recipient `0x53705Bb2B34ff7CEcC93F79a1D91aDa1185D87Dd`. The primary round authenticated two distinct origins, DIDs, and authority identifiers. The dispute round added three more and persisted matching expected/observed evidence and DID digests for all five sources.

| Action | Transaction | GenVM execution hash |
| --- | --- | --- |
| Open funded rail | `0x74b119f68d96d521e841d28c2293b85b24144128ec3c54e1a5348f08ba5ec3e2` | `0x22cb09dc39f8f25ee3a5a8481ba4cf83707de7d0d121da2c77106ce1e35df7bc` |
| Lodge recipient claim | `0x65b198daad776a9b08e1608a3e6cebb0e3e9a8f7427ab1adacbc1c1398199cf5` | `0xa6741c743530674f89d18c38d9b6578d134920c1afcafddb82f25e31eec8a9d6` |
| Primary evidence review | `0xa6a6a00cd5d542b82e2b2b976f44871c12840251e17603ea1ebf57031000afa6` | `0xcf4c27541abbf68626e48d1f0a6fecb6368ef7be538a52e72ab9f737a614dc21` |
| Submit reasoned 5% bond | `0x3478ff41e9fdf7a22e147b6fe2bc4b6798cba984225d5f19c86c36aad679c9c3` | `0x6f4329dbc62b6fd3b3c121084be3cd3d4914f5a7a53dbd18d577c505462dd51e` |
| Resolve dispute | `0xd1304a9d547afa38932d91d62145f38b5b1312ffdc9e30576fa791f76a7e13e2` | `0x6f4329dbc62b6fd3b3c121084be3cd3d4914f5a7a53dbd18d577c505462dd51e` |

Every transaction reached `MAJORITY_AGREE` with explicit finalized GenVM execution evidence. The provisional code was `FULFILLED`; authenticated counterevidence changed the strict-majority result to `BREACHED` at 10,000 basis points. The recipient balance increased by exactly 0.01 GEN, with zero principal and bond remaining locked.

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

