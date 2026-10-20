# Deployment

## Current hardened-v6 deployment and evidence status — 2026-10-20

> **Scope:** hardened-v6 is source-matched and funded for a technical demonstration. Its five publishers are distinct Vercel origins but share one Vercel account; it must not be represented as a demonstration of independent real-world organizations.

- Hardened-v6 contract: `0x7F21Cfd207C7843078c99a05d4F0cF3e0fcb8986`
- Deployment transaction: `0x99f66b9fa54d4f319a10ee06d416f25b9e1ed9c4a59e984005d63e1e8fcc9c12`
- Source SHA-256: `4610fccc254641a69eefbf47dc4ad9fd398be79380513de3959a228d8720c22e`
- Funded technical demonstration: `artifacts/live-receipts.hardened-v6.studionet.json`

- Historical v5 contract: `0x3D320749926Ef3E4258adb404B25bc8d29ACF0CC`
- Deployment transaction: `0xc54571b716e89334c98e0b5bb5b11ba49180e67fc70c5ad1edade68ea872df98`
- Local and deployed source SHA-256: `f460ea0a246772894f710760899ec4416e76ad0ae48a67149eb3bb5af875cc59`
- Source-matched runner proof: `artifacts/live-e2e-4.studionet.json`
- Browser-wallet proof: `artifacts/browser-wallet-pr2.studionet.json`
- Release manifest: `artifacts/release-verification.v5.json` (implementation commit `985f591710134a4222d2e234120f8ebd7a34f3d2`)
- Current implementation commit: `2fc32738e8786f23060a23277546f6f991dfb3ff`
- Current CI-attestation commit: `01d9591f0e6faf141301384afe6bae0278710ca6`
- Production browser: [`https://proof-rails.vercel.app`](https://proof-rails.vercel.app) (Vercel project name `nw3`, attached production domain)
- Current Vercel production deployment: `dpl_HjNW898pzPWkG3EXj85rDeUrGWxY` (`READY`, production alias `https://proof-rails.vercel.app` applied)

The two v5 records serve different historical review purposes. Rail 1 is the source-matched runner record with complete execution hashes and conservation accounting. PR-2 is the separately captured production-browser, injected-wallet write-path record. They do not establish a V6 browser transaction lifecycle. The current source-matched V6 proof is Rail 1 in `artifacts/live-receipts.hardened-v6.studionet.json`; Chrome has separately confirmed that the production V6 interface renders its current rail and receipt ledger. See [evidence-record status](EVIDENCE_STATUS.md) for record scope.

## Hardened-v6 deployed-source equivalence

The hardened-v6 deployment transaction finalized with `MAJORITY_AGREE`. Its `contract_code` was decoded from base64 and hashed independently from the local UTF-8 source. Both byte sequences produced `4610fccc254641a69eefbf47dc4ad9fd398be79380513de3959a228d8720c22e`; `artifacts/deployment.studionet.json` records both values, the byte count (`20,883`), execution hash, deployer, and finalization timestamps.

## Hardened V6 funded lifecycle — Rail 1

Rail 1 is the current source-matched runner demonstration, funded with `0.01 GEN`. The contract persisted an authenticated 2/2 primary receipt classified `FULFILLED` while both publishers asserted `BREACHED`; the separately authenticated 3/3 counter panel classified `BREACHED` while all three publishers asserted `FULFILLED`. The counter result reversed the provisional verdict and paid the recipient. The successful challenge bond was returned, and the terminal contract accounting records zero principal and bond locked. `artifacts/live-receipts.hardened-v6.studionet.json` contains the deployment/source comparison, policy, source-matched receipt data, finalized transactions, and terminal accounting; `PROOFRAIL_RELEASE_ID=hardened-v6 node scripts/verify_live_receipts.mjs` verifies the artifact.

## Historical V5 funded lifecycle — Rail 1

Rail 1 was funded with `0.01 GEN` by issuer `0x86640E27BB18E467aE2193A2FF680375653c69FC` for recipient `0x53705Bb2B34ff7CEcC93F79a1D91aDa1185D87Dd`. The primary round authenticated two distinct origins, DIDs, and authority identifiers. The dispute round added three more and persisted matching expected/observed evidence and DID digests for all three counter-sources.

| Action | Transaction | GenVM execution hash |
| --- | --- | --- |
| Open funded rail | `0x3ccacc0775b1b1f11966619b32eb8716b07d129f981525eec97d6f9e59d06da0` | `0x7f7476de0e18462bbe39b617ab643f57927f5bb17eeb91859fdd6990477f1c2a` |
| Lodge recipient claim | `0x3c765d844c0eded80003b37615b0e840a9a753895168a2be3ceb784c5da3cb81` | `0xac684ea0210461ecc6797cbc3a71f0d6ed82080026abda52555f545cd64c3211` |
| Primary evidence review | `0xa7b9d63bde32e48fa0f48ed4f64ba7ff7e5c9e3f6120ee461ad4195db14df877` | `0x14ba267a522d88871bc0f2e3a51d134f133d6bc5bb4cb36051521e5c54d720fb` |
| Submit reasoned 5% bond | `0x2603800d9802d4aeeac775a7180a25dc28ee52408180a56e4d0655e67af464b7` | `0x3ef4151544304da9bd4e85422f05ad1781a62500099e2c786e7a8d2f6025428e` |
| Resolve dispute | `0x06eb4673734a149ac2742a1145b45c3bc2316163596cdf5eba8153ef2df16a3c` | `0x6f4329dbc62b6fd3b3c121084be3cd3d4914f5a7a53dbd18d577c505462dd51e` |

Every transaction reached `MAJORITY_AGREE` with explicit finalized GenVM execution evidence. The provisional code was `FULFILLED`; the independent counter panel changed it to `BREACHED` at 10,000 basis points. The recipient balance increased by exactly 0.01 GEN, with zero principal and bond remaining locked.

## Historical V5 browser-wallet lifecycle — PR-2

The earlier public interface completed the full write lifecycle for rail PR-2 using injected issuer and recipient wallets. It is preserved as historical V5 browser evidence only. The current `https://proof-rails.vercel.app` build is pinned to the hardened-v6 address above, and its V6 receipt ledger has been checked in Chrome against the live runner-created rail. The designated V6 issuer wallet is now connected to a prepared browser form with the two-source policy and designated recipient; the funding transaction has not been submitted or signed. Recipient claim/review/dispute actions and the remaining browser transaction receipts still require the account owner. See [BROWSER_WALKTHROUGH.md](BROWSER_WALKTHROUGH.md) and `artifacts/browser-wallet-pr2.studionet.json`. No browser key or private signing material is stored in the repository.

## Release procedure

1. Run contract lint, Direct Mode tests, frontend tests, typecheck, and build.
2. Obtain five separately operated publisher domains and credentials under the authority-admission policy; never reuse the historical fixture domains for a current release.
3. Set `PROOFRAIL_RELEASE_ID` and `PROOFRAIL_PUBLISHER_DOMAINS`, then run `PROOFRAIL_DRY_RUN=1 node scripts/generate_v5_publishers.mjs`. Review the generated manifests before allowing writes; rerun with `PROOFRAIL_DRY_RUN=0` only when the publisher folders are ready to deploy. The generator appends new content-addressed evidence and never deletes historic evidence files.
4. Publish each publisher's DID document and content-addressed evidence, then run `PROOFRAIL_RELEASE_ID=<release-id> node scripts/verify_publishers.mjs` against the fresh manifests.
5. Deploy `contracts/proofrail.py` to a fresh Studionet address.
6. Update the pinned production contract address and verify chain ID `61999`.
7. Exercise creation, claim, review, reasoned challenge, and settlement through the public browser client; verify recovery paths in Direct Mode and use the browser when a live rail is eligible.
8. Record the source commit, deployment transaction, contract address, finalized lifecycle receipts, execution hashes, terminal accounting, and balance movement before publishing.

## Production web origin

The production console is served from `https://proof-rails.vercel.app`, attached to the Vercel project named `nw3`. The deployed bundle points to the hardened-v6 contract address above. Five publisher origins expose a pinned `/.well-known/did.json` and immutable `/evidence/<sha256>.json` artifacts. They use distinct technical origins but share one Vercel account, so organizational independence is not established.

No private key belongs in this repository or browser bundle.

## CI status

For the hardened-v6 implementation, contract lint, 37 Direct Mode tests, 26 frontend tests on Vitest `5.0.5`, TypeScript, production build, live publisher verification, funded receipt verification, and both full and production dependency audits pass locally. The full dependency audit is now clean after resolving the three former Vitest-related advisories. The latest hosted run, attached to commit `35bd3d1`, failed before executing any steps because GitHub reports an account billing lock. The hosted status is not green CI. The V6 receipt display has been confirmed in Chrome; the issuer wallet is connected to a prepared form, but the V6 browser-wallet transaction lifecycle remains incomplete pending user signatures. See [CI attestation](CI_ATTESTATION.md) for the latest run and job IDs.

