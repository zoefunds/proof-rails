# Deployment

## Current production deployment

- Console: `https://proof-rails.vercel.app`
- Network: GenLayer Studionet (`61999`)
- Contract: `0xe0eD7d02f8c0F907f342E4d3A2aF1F707EDc97dc`
- Deployment transaction: `0x6759d35a1f8e4e30a76555064810c17321dbbf0c53f86e449bcf2cf04ae9b7d0`
- Execution hash: `0xa2f5ec8983763d6b4bea082d10b5f7ddd879c250a5a479cb34a17bafd906deb3`
- Exact deployed/local source SHA-256: `4705ad10c2e201d2b623b4416ccbfc37becd4d95aba8c1ab1f758eb087e961ff`
- Current verification rail: `2` (`artifacts/live-e2e-4.studionet.json`)
- Deployment record: `artifacts/deployment.studionet.json`

Superseded lifecycle files from the earlier contract were removed from the current verification package. The repository now publishes only the active deployment record and the current source-equivalent contract's funded payout record. Earlier deployments remain traceable through Git history and are not presented as production evidence.

## Deployed-source equivalence

The deployment transaction finalized with `MAJORITY_AGREE`. Its `contract_code` was decoded from base64 and hashed independently from the local UTF-8 source. Both byte sequences produced `4705ad10c2e201d2b623b4416ccbfc37becd4d95aba8c1ab1f758eb087e961ff`; `artifacts/deployment.studionet.json` records both values, the byte count (`12,542`), execution hash, deployer, and finalization timestamps.

## Current funded lifecycle

Rail 2 was funded with `0.01 GEN` by issuer `0x86640E27BB18E467aE2193A2FF680375653c69FC` for recipient `0x53705Bb2B34ff7CEcC93F79a1D91aDa1185D87Dd`. Both review rounds independently retrieved the content-addressed release artifact, reproduced digest `2b53a61bfe866252f075406276067da51df22080b3289721cc5ff054df711a24`, authenticated `did:web:proof-rails.vercel.app`, and recorded publisher-document digest `84d6ad4e81ffdd9119efb02b9147d852248b5601d4e40af41723cf73331517ee`.

| Action | Transaction | GenVM execution hash |
| --- | --- | --- |
| Open funded rail | `0xa2a9ca982ef2058f4ba901bf88704f46a18f088263c2f433eb353fea93ba3f6d` | `0x00b256a833148584b55a3196de75e6315d2c4800b691bc6a8c3df6098fcf715f` |
| Lodge recipient claim | `0x5c649dfd8e866cc91be86839999811591a024880e66cb6984e9c4cf08f6bfc57` | `0xa767e962c6a170b6981aed50d50e316312b2631280aee1aa95973e6a18b3ca8c` |
| Primary evidence review | `0x45d26d022504ca016e43a9fae18f1b09a7bc2710c5c5d22149b66c06fad60a37` | `0x3072d097b251e3658deaa4c8e4fdfa0197990c342a7b6a5df68c211aaee0b741` |
| Submit reasoned 5% bond | `0x018486ec9ddeedeb8dbbe718bd335da01426ca34fae67c46b07e40d80a2aa92a` | `0x9c3f2b7db09189d03b3e498c7c8b35d97ecd6cb0a72dc6b32232ef3f25c8bda3` |
| Resolve dispute | `0xbe7f673a2bd08b86a127afdede5bf38e3b84d8f188cfa09f4d6e24003c8cfe2a` | `0xe80035b96d947a4f411d03e8e61c52b2416c6c4bfe7b6e688658760680211599` |

Every transaction reached `MAJORITY_AGREE` with explicit finalized GenVM execution evidence. The terminal code was `BREACHED` at 10,000 basis points: 0.01 GEN paid, zero principal locked, zero bond locked, and a 0.0095 GEN net recipient balance increase after the challenge bond. A fresh public read on 2026-10-16 reported two rails and aggregate accounting of 0.02 GEN funded, 0.02 GEN paid, 0 returned, and 0 locked.

## Browser verification

The public production interface at `proof-rails.vercel.app` was used to exercise the browser-originated workflow after deployment. The operator verified creation with distinct observation and claim deadlines, named-recipient claim submission, a bonded dispute carrying a written reason, settlement only after finalized GenVM success, and the deadline-gated recovery control. The immutable transaction-level proof above remains the canonical settlement record; no browser key or private signing material is stored in the repository.

## Release procedure

1. Run contract lint, Direct Mode tests, frontend tests, typecheck, and build.
2. Validate and generate the schema with the GenLayer CLI.
3. Deploy `contracts/proofrail.py` to a fresh Studionet address.
4. Set `VITE_PROOFRAIL_CONTRACT_ADDRESS`, `VITE_PROOFRAIL_CHAIN_ID=61999`, and the Studionet RPC URL.
5. Exercise creation, claim, review, reasoned challenge, settlement, and eligible recovery through the public browser client.
6. Record the source commit, deployment transaction, contract address, finalized lifecycle receipts, execution hashes, terminal accounting, and balance movement before publishing.

## Production web origin

The production console and evidence publisher are served from `https://proof-rails.vercel.app`. The DID document is available at `/.well-known/did.json`, and immutable evidence artifacts are stored below `/evidence/<sha256>.json`.

No private key belongs in this repository or browser bundle.

