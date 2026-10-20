# Deployment

## Current v5 deployment and evidence status — 2026-10-20

- Contract: `0x3D320749926Ef3E4258adb404B25bc8d29ACF0CC`
- Deployment transaction: `0xc54571b716e89334c98e0b5bb5b11ba49180e67fc70c5ad1edade68ea872df98`
- Local and deployed source SHA-256: `f460ea0a246772894f710760899ec4416e76ad0ae48a67149eb3bb5af875cc59`
- Source-matched runner proof: `artifacts/live-e2e-4.studionet.json`
- Browser-wallet proof: `artifacts/browser-wallet-pr2.studionet.json`
- Release manifest: `artifacts/release-verification.v5.json` (implementation commit `985f591710134a4222d2e234120f8ebd7a34f3d2`)
- Authority/CI evidence commit: `f0aa0be9c98c3b9e36871c992e71307bc71d9ca5`
- Production browser: `https://proof-rails.vercel.app`

The two records serve different review purposes. Rail 1 is the source-matched runner record with complete execution hashes and conservation accounting. PR-2 is the separately captured production-browser, injected-wallet write-path record. Both show a 0.01 GEN funded escrow whose primary consensus was `FULFILLED`, then changed to terminal `BREACHED` after a separate authenticated three-source counter panel. See [evidence-record status](EVIDENCE_STATUS.md) for immutable-record handling and scope.

## Deployed-source equivalence

The deployment transaction finalized with `MAJORITY_AGREE`. Its `contract_code` was decoded from base64 and hashed independently from the local UTF-8 source. Both byte sequences produced `f460ea0a246772894f710760899ec4416e76ad0ae48a67149eb3bb5af875cc59`; `artifacts/deployment.studionet.json` records both values, the byte count (`20,622`), execution hash, deployer, and finalization timestamps.

## Source-matched funded lifecycle — Rail 1

Rail 1 was funded with `0.01 GEN` by issuer `0x86640E27BB18E467aE2193A2FF680375653c69FC` for recipient `0x53705Bb2B34ff7CEcC93F79a1D91aDa1185D87Dd`. The primary round authenticated two distinct origins, DIDs, and authority identifiers. The dispute round added three more and persisted matching expected/observed evidence and DID digests for all three counter-sources.

| Action | Transaction | GenVM execution hash |
| --- | --- | --- |
| Open funded rail | `0x3ccacc0775b1b1f11966619b32eb8716b07d129f981525eec97d6f9e59d06da0` | `0x7f7476de0e18462bbe39b617ab643f57927f5bb17eeb91859fdd6990477f1c2a` |
| Lodge recipient claim | `0x3c765d844c0eded80003b37615b0e840a9a753895168a2be3ceb784c5da3cb81` | `0xac684ea0210461ecc6797cbc3a71f0d6ed82080026abda52555f545cd64c3211` |
| Primary evidence review | `0xa7b9d63bde32e48fa0f48ed4f64ba7ff7e5c9e3f6120ee461ad4195db14df877` | `0x14ba267a522d88871bc0f2e3a51d134f133d6bc5bb4cb36051521e5c54d720fb` |
| Submit reasoned 5% bond | `0x2603800d9802d4aeeac775a7180a25dc28ee52408180a56e4d0655e67af464b7` | `0x3ef4151544304da9bd4e85422f05ad1781a62500099e2c786e7a8d2f6025428e` |
| Resolve dispute | `0x06eb4673734a149ac2742a1145b45c3bc2316163596cdf5eba8153ef2df16a3c` | `0x6f4329dbc62b6fd3b3c121084be3cd3d4914f5a7a53dbd18d577c505462dd51e` |

Every transaction reached `MAJORITY_AGREE` with explicit finalized GenVM execution evidence. The provisional code was `FULFILLED`; the independent counter panel changed it to `BREACHED` at 10,000 basis points. The recipient balance increased by exactly 0.01 GEN, with zero principal and bond remaining locked.

## Production browser-wallet lifecycle — PR-2

The public production interface at `https://proof-rails.vercel.app` completed the full write lifecycle for rail PR-2 using injected issuer and recipient wallets. The browser opened and funded the rail, lodged the claim, ran primary consensus, posted the 5% bond with three authenticated counter-sources, and ran dispute consensus. The finalized UI showed `FULFILLED` changing to terminal `BREACHED`, a paid 0.01 GEN escrow, and five matching expected/observed evidence digests. See [BROWSER_WALKTHROUGH.md](BROWSER_WALKTHROUGH.md) and `artifacts/browser-wallet-pr2.studionet.json`. The Rail 1 runner artifact remains the canonical complete execution-hash and balance-conservation record; no browser key or private signing material is stored in the repository.

## Release procedure

1. Run contract lint, Direct Mode tests, frontend tests, typecheck, and build.
2. Validate and generate the schema with the GenLayer CLI.
3. Deploy `contracts/proofrail.py` to a fresh Studionet address.
4. Update the pinned production contract address and verify chain ID `61999`.
5. Exercise creation, claim, review, reasoned challenge, and settlement through the public browser client; verify recovery paths in Direct Mode and use the browser when a live rail is eligible.
6. Record the source commit, deployment transaction, contract address, finalized lifecycle receipts, execution hashes, terminal accounting, and balance movement before publishing.

## Production web origin

The production console is served from `https://proof-rails.vercel.app`. Independent publisher origins expose a pinned `/.well-known/did.json` and immutable `/evidence/<sha256>.json` artifacts.

No private key belongs in this repository or browser bundle.

## CI status

The complete release gate passes locally: contract lint, 34 Direct Mode tests, 24 frontend tests, typecheck, production build, production-dependency audit, live publisher verification, source-matched artifact verification, release-manifest verification, and review-evidence verification. The manifest hashes every release-critical artifact and binds them to implementation commit `985f591710134a4222d2e234120f8ebd7a34f3d2`. Current GitHub Actions jobs do not execute any steps because GitHub reports that the repository owner's account is locked for a billing issue. This is an external runner-availability failure, not a passing hosted CI result. The exact job IDs, annotation, and decision rule are recorded in [CI attestation](CI_ATTESTATION.md) and `artifacts/ci-blocker.v1.json`; rerun the workflow after restoring Actions billing.

