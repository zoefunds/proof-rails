# Deployment

## Retired hardened-v6 deployment and evidence status — 2026-10-20

> **Historical scope:** the deployed hardened-v6 address below has funded technical evidence, but it did not freeze the counter panel at funding time. It is retired: the production browser no longer points at it. The current deployment is hardened-v9 (see below), which additionally binds every evidence artifact to a frozen `obligation_id` and spreads publisher fixtures across three distinct hosting providers instead of one shared Vercel account. This still does not establish real-world organizational independence — see [Authority governance](AUTHORITY_GOVERNANCE.md).

- Hardened-v6 contract: `0x7F21Cfd207C7843078c99a05d4F0cF3e0fcb8986`
- Deployment transaction: `0x99f66b9fa54d4f319a10ee06d416f25b9e1ed9c4a59e984005d63e1e8fcc9c12`
- Source SHA-256: `4610fccc254641a69eefbf47dc4ad9fd398be79380513de3959a228d8720c22e`
- Funded technical demonstration: `artifacts/live-receipts.hardened-v6.studionet.json`
- Production injected-wallet lifecycle: `artifacts/browser-wallet-hardened-v6.studionet.json` (rail 2)

## Corrected candidate release — hardened-v7 (single-provider, superseded)

`hardened-v7` was the published, pre-funded dual-panel candidate policy for the corrected source, deployed and funded at `0xC217A00E471368E005A624B926bC5A13B267c7F4` (deployment `0xde5cbd37896ebb9ac05bf79de5d78030de9a24d36d096eee969c22721d103c11`, source SHA-256 `5e88ce4cc4cb88747f76a4ad1cb5ecdd960fa99e7293e00d45bb2350a6fc235c`). Its funded reversal is recorded in `artifacts/live-e2e-hardened-v7-4.studionet.json`. It is retired in favor of hardened-v8 below, which uses the identical corrected source but spreads its five publisher sources across three hosting providers instead of one.

## Corrected candidate release — hardened-v8 (multi-provider sources, retired)

`hardened-v8` used the exact same `contracts/proofrail.py` source as hardened-v7 (SHA-256 `5e88ce4cc4cb88747f76a4ad1cb5ecdd960fa99e7293e00d45bb2350a6fc235c`) with its five publisher sources hosted on three distinct providers/accounts instead of one shared Vercel account, deployed and funded at `0xE91096019eBf3a4E96654a2Ab7649d6002E073b6` (deployment `0x42b41db1daa29cd38b620eb3012d6de9ed75fc4068217a133e36189994f9dbd5`). Its funded reversal is recorded in `artifacts/live-e2e-hardened-v8-4.studionet.json`. It is retired: independent review found that, like v6/v7, it bound an evidence artifact to a rail only through publisher identity, authority, version, and observation window — not to *which obligation* the rail was about. A correctly hashed, correctly signed artifact for an unrelated obligation could in principle satisfy its quorum. hardened-v9 below fixes this.

## Corrected candidate release — hardened-v9 (obligation-bound, multi-provider, current)

`hardened-v9` uses the same corrected `contracts/proofrail.py` lineage as v7/v8, hardened further: the evidence policy now carries a frozen `obligation_id` (schema `proofrail.evidence-policy/v7`), and every retrieved artifact must carry the identical `obligation_id` (schema `proofrail.independent-attestation/v3`) or the contract rejects it as `INVALID` regardless of correct hashing and DID authentication. Receipts also now commit to the complete material policy — evidence spec *and* payout table — not the evidence spec alone. See [Security](SECURITY.md#obligation-binding) for the full rationale and the adversarial test that demonstrates it (`test_evidence_for_a_different_obligation_is_rejected_even_when_correctly_hashed`).

Publisher sources remain spread across the same three distinct providers/accounts as v8:

| Source | Role | Provider/account | Domain |
| --- | --- | --- | --- |
| publisher-1 | Primary | Vercel (existing team account) | `source-1-inky.vercel.app` |
| publisher-2 | Primary | Vercel (existing team account) | `source-2-ten.vercel.app` |
| publisher-3 | Counter | Cloudflare Pages (separate Cloudflare account) | `proofrail-source3.pages.dev` |
| publisher-4 | Counter | Cloudflare Pages (separate Cloudflare account) | `proofrail-source4.pages.dev` |
| publisher-5 | Counter | GitHub Pages (separate GitHub account, `zoefunds`) | `zoefunds.github.io` |

`scripts/verify_candidate_policy.mjs` validates the manifest shape locally and `PROOFRAIL_RELEASE_ID=hardened-v9 node scripts/verify_publishers.mjs` verified all ten live DID/evidence objects across all three providers with no redirects, exact final URLs, HTTP 200, and matching SHA-256 digests.

The candidate is **deployed and funded** on Studionet:

- Hardened-v9 contract: `0xC4C899Bd6A06544d56E58eFA87e96bC78eE46100`
- Deployment transaction: `0xe5f6ba3ac974e645de462cecc60a471be137d48082d3d8bedf5d6b2571a33f96`
- Local and deployed source SHA-256: `ac524584cd74d3c968ea2aaf5c7149109718fc95e5fa515c9fa4a97061b60c8b`
- Deployment record: `artifacts/deployment.hardened-v9.studionet.json`
- Funding-time-frozen, obligation-bound, multi-provider funded lifecycle: `artifacts/live-e2e-hardened-v9-4.studionet.json` (rail 1; see below)

The production browser (`https://proof-rails.vercel.app`) is rebound to the hardened-v9 address: `apps/web/src/contract.ts` pins `CONTRACT=0xC4C899Bd6A06544d56E58eFA87e96bC78eE46100` and `DEPLOYMENT_SUPPORTS_PRE_FUNDED_COUNTEREVIDENCE=true`. Frontend lint/tests (27 passed), typecheck, and production build were rerun before deploy; the deployed bundle was confirmed byte-matched to the build that embeds the v9 address.

**What the multi-provider spread does and does not establish:** removing the single-shared-Vercel-account correlation is a real infrastructure improvement — GenVM's own nondeterministic validators independently retrieve and authenticate evidence from three unrelated hosting platforms, not one. It is **not** organizational independence: all three hosting accounts (Vercel, Cloudflare, GitHub) are controlled by the same operator. See [Authority governance](AUTHORITY_GOVERNANCE.md) for the credentialed-admission rule that actually establishes independence, which still requires real separate organizations to be onboarded.

`scripts/verify_browser_wallet_candidate.mjs` for the currently live contract is **still outstanding**: it requires a real injected-wallet lifecycle, captured the same way as the historical V6 browser walkthrough — by the wallet owner personally funding, claiming, reviewing, disputing, and settling a rail through the production UI, then supplying the resulting transaction hashes. That cannot be produced by an automated key, only by the account owner's own injected wallet.

- Historical v5 contract: `0x3D320749926Ef3E4258adb404B25bc8d29ACF0CC`
- Deployment transaction: `0xc54571b716e89334c98e0b5bb5b11ba49180e67fc70c5ad1edade68ea872df98`
- Local and deployed source SHA-256: `f460ea0a246772894f710760899ec4416e76ad0ae48a67149eb3bb5af875cc59`
- Source-matched runner proof: `artifacts/live-e2e-4.studionet.json`
- Browser-wallet proof: `artifacts/browser-wallet-pr2.studionet.json`
- Release manifest: `artifacts/release-verification.v5.json` (implementation commit `985f591710134a4222d2e234120f8ebd7a34f3d2`)
- Current implementation commit: `2fc32738e8786f23060a23277546f6f991dfb3ff`
- Current CI-attestation commit: `01d9591f0e6faf141301384afe6bae0278710ca6`
- Production browser: [`https://proof-rails.vercel.app`](https://proof-rails.vercel.app) (Vercel project name `nw3`, attached production domain)
- Current Vercel production deployment: `dpl_4xB7tPKwyqU6kTxqVCyJCZoo22pz` (`READY`, production alias `https://proof-rails.vercel.app` applied)

The two historical V6 records serve complementary purposes. Rail 1 is the source-matched runner record with publisher evidence, execution hashes, and conservation accounting. Rail 2 is the production-browser injected-wallet write-path record with seven finalized transactions and terminal accounting. Neither proves the corrected candidate. Historical V5 records remain audit-only. See [evidence-record status](EVIDENCE_STATUS.md) for record scope.

## Hardened-v7 funded lifecycle — Rail 1 (funding-time-frozen counter panel, historical)

Rail 1 on the hardened-v7 contract was funded with `0.01 GEN` by issuer `0x86640E27BB18E467aE2193A2FF680375653c69FC` for recipient `0x53705Bb2B34ff7CEcC93F79a1D91aDa1185D87Dd`, using the frozen dual-panel policy (`artifacts/evidence-policy.hardened-v7.json`) committed at `open_rail` time — the three-source counter panel was part of the funded escrow from the start, not supplied later at dispute time. The 2/2 primary review classified `FULFILLED`; the challenger then disputed with the *same pre-committed* three-source counter panel (the contract rejects any other panel at dispute time), and the 3/3 counter review classified `BREACHED`, reversing the provisional verdict and deterministically changing the payout. The recipient balance increased by exactly `0.01 GEN`; the challenge bond was returned to the successful challenger; `funded == locked + paid + returned` held with zero residual lock. This is the first funded, on-chain demonstration that a distinct, separately authenticated counterevidence panel can reverse a provisional consensus result under the funding-time freeze. See `artifacts/live-e2e-hardened-v7-4.studionet.json` for every transaction hash, execution hash, and receipt.

## Hardened-v6 deployed-source equivalence

The hardened-v6 deployment transaction finalized with `MAJORITY_AGREE`. Its `contract_code` was decoded from base64 and hashed independently from the local UTF-8 source. Both byte sequences produced `4610fccc254641a69eefbf47dc4ad9fd398be79380513de3959a228d8720c22e`; `artifacts/deployment.studionet.json` records both values, the byte count (`20,883`), execution hash, deployer, and finalization timestamps.

## Hardened V6 funded lifecycle — Rail 1

Rail 1 is the historical source-matched runner demonstration, funded with `0.01 GEN`. It records an authenticated 2/2 primary receipt classified `FULFILLED` while both publishers asserted `BREACHED`; the 3/3 counter panel classified `BREACHED` while all three publishers asserted `FULFILLED`. That result reversed the provisional verdict and paid the recipient, returning the successful challenge bond and leaving zero locked. However, that deployed contract received the counter panel at dispute time, not at funding; it cannot evidence the corrected candidate invariant. The old artifact remains immutable historical proof only.

## Hardened V6 production browser lifecycle — Rail 2

On 2026-10-20 the production browser at `https://proof-rails.vercel.app` drove a complete injected-wallet lifecycle using issuer `0x7401c129EDfc26E68FE19309fE461eb3Db1058Eb` and recipient/challenger `0x6f0b4cE7a1872db132b2F6B7743deFb30eBa698a`. The seven explorer-linked transactions in `artifacts/browser-wallet-hardened-v6.studionet.json` cover funding, claim, primary review, bonded dispute, counter review, `0.01 GEN` recipient payout, and `0.0005 GEN` successful bond return. The contract page showed zero GEN after settlement. Primary validator classification was `FULFILLED` despite two `BREACHED` publisher assertions; the three-source counter review reversed that to `BREACHED` despite three `FULFILLED` assertions. This is the V6 production write-path proof, distinct from the V6 runner-created Rail 1 proof.

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

The earlier PR-2 browser recording used the retired V5 contract and is preserved as audit-only evidence in `artifacts/browser-wallet-pr2.studionet.json`. Current V6 browser receipts are separately captured for rail 2. No browser key or private signing material is stored in the repository.

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

The production console is served from `https://proof-rails.vercel.app`, attached to the Vercel project named `nw3`. The deployed bundle points to the hardened-v9 contract address above. Five publisher origins expose a pinned `/.well-known/did.json` and immutable `/evidence/<sha256>.json` artifacts, spread across three distinct hosting providers (Vercel, Cloudflare Pages, GitHub Pages) instead of one, and every evidence artifact is bound to the policy's frozen `obligation_id`. They use distinct technical origins and separate hosting accounts, but all are controlled by the same operator, so organizational independence is still not established.

No private key belongs in this repository or browser bundle.

## CI status

For the current hardened-v9 source tree, contract lint, 42 Direct Mode tests, 27 frontend tests on Vitest `5.0.5`, TypeScript, production build, live multi-provider publisher verification, and both full and production dependency audits pass locally. The full dependency audit is clean after resolving the three former Vitest-related advisories. The latest hosted run, attached to commit `35bd3d1`, failed before executing any steps because GitHub reports an account billing lock; that status predates the v7/v8/v9 work and has not changed since — no new hosted run has been possible. The hosted status is not green CI; that external status is separate from passing local gates and the finalized hardened-v9 funded on-chain lifecycle. See [CI attestation](CI_ATTESTATION.md) for the latest run and job IDs.

