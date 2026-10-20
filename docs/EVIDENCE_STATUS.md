# Evidence record status

## Current production records

> **Current funded candidate (multi-provider sources):** hardened-v8 is deployed at `0xE91096019eBf3a4E96654a2Ab7649d6002E073b6` on GenLayer Studionet, using the same corrected source as hardened-v7 but with its five publisher sources spread across three distinct hosting providers/accounts: Vercel (`source-1-inky.vercel.app`, `source-2-ten.vercel.app`), Cloudflare Pages (`proofrail-source3.pages.dev`, `proofrail-source4.pages.dev`), and GitHub Pages (`zoefunds.github.io`). Rail 1 on this contract (`artifacts/live-e2e-hardened-v8-4.studionet.json`) reproduces the same funding-time-frozen reversal as hardened-v7 — 2-of-2 primary `FULFILLED` reversed to 3-of-3 counter `BREACHED`, full payout, zero residual lock — with GenVM's own validators independently retrieving evidence from all three providers. This removes the single-shared-Vercel-account correlation present in v6/v7. It is **still not organizational independence**: all three hosting accounts are controlled by the same operator. See [Authority governance](AUTHORITY_GOVERNANCE.md) for what independence actually requires.

> **Current funded candidate (single-provider, superseded by v8 above):** hardened-v7 is deployed at `0xC217A00E471368E005A624B926bC5A13B267c7F4` on GenLayer Studionet (`artifacts/deployment.hardened-v7.studionet.json`, source SHA-256 `5e88ce4cc4cb88747f76a4ad1cb5ecdd960fa99e7293e00d45bb2350a6fc235c`, byte-equivalent deployed source). Rail 1 on this contract (`artifacts/live-e2e-hardened-v7-4.studionet.json`) funded the counterevidence panel at open time — not at dispute time — and `dispute()` enforces that the challenger's panel must equal that frozen panel. A 2-of-2 primary review produced a provisional `FULFILLED` verdict; a distinct, separately authenticated 3-of-3 counterevidence panel reversed it to a finalized `BREACHED` verdict (`DISPUTE_RESOLVED`), deterministically paying the full 0.01 GEN principal to the recipient, clearing the challenge bond, and leaving `funded == locked + paid + returned` with zero residual lock. The five publishers still shared one Vercel account, so this did not establish organizational independence — see the boundary note below.

> **Historical technical demonstration:** hardened-v6 is deployed at `0x7F21Cfd207C7843078c99a05d4F0cF3e0fcb8986`. Its source-matched bytes and funded lifecycle are captured in the deployment and receipt artifacts. That implementation supplied counterevidence at dispute time, not funding time — the defect the v7 candidate above fixes and demonstrates fixed.

| Record | Scope | What it proves |
| --- | --- | --- |
| `artifacts/live-e2e-hardened-v8-4.studionet.json` | Rail 1 on the current candidate, multi-provider source-matched runner | Everything the v7 row proves, plus evidence authenticated across three distinct hosting providers (Vercel, Cloudflare Pages, GitHub Pages) instead of one, on the deployed hardened-v8 contract. |
| `artifacts/live-e2e-hardened-v7-4.studionet.json` | Rail 1 on the single-provider candidate, source-matched runner | Funding-time-frozen counterevidence panel, deployment/source equivalence, finalized GenVM execution hashes, a distinct 3-of-3 counter panel reversing a 2-of-2 provisional verdict, payout, bond clearing, and conservation accounting, all on the deployed hardened-v7 contract. |

ProofRail v5 has two historical funded-lifecycle records for the retired contract, `0x3D320749926Ef3E4258adb404B25bc8d29ACF0CC` on GenLayer Studionet (chain ID `61999`):

| Record | Scope | What it proves |
| --- | --- | --- |
| `artifacts/live-e2e-4.studionet.json` | Rail 1, source-matched runner | Deployment/source equivalence, finalized GenVM execution hashes, authenticated primary and counter evidence, consensus reversal, payout, bond clearing, and conservation accounting. |
| `artifacts/browser-wallet-pr2.studionet.json` | PR-2, production Chrome UI | A real injected-wallet browser write lifecycle: fund, claim, primary review, bonded challenge, counter review, and payout. |
| `artifacts/browser-wallet-hardened-v6.studionet.json` | Rail 2, production Chrome UI | Historical V6 injected-wallet lifecycle with seven finalized transaction receipts, counterevidence reversal, principal payout, returned challenge bond, and zero terminal contract balance/locks. The counter panel was supplied at dispute time. |

The two historical V6 records are complementary: Rail 1 is the source-matched runner record with detailed publisher receipts and execution/accounting evidence; rail 2 establishes the production injected-wallet write path for that same historical contract. Neither proves the current candidate's funding-time freeze. They must not be conflated: each has its own rail ID, transaction hashes, issuer, recipient, and lifecycle. See [Deployment](DEPLOYMENT.md) and [Browser walkthrough](BROWSER_WALKTHROUGH.md) for receipts and scope.

## Preserved historical display-label discrepancy

The five immutable publisher artifacts used by the Rail 1 record, and the corresponding historic runner artifact, contain a human-readable `subject`/criterion phrase saying `09:50–10:50 UTC`. Their verified numeric fields instead bind the actual frozen observation period: `observed_from` `1792504200`, `observed_until` `1792507800`, or 2026-10-20 13:50:00–14:50:00 UTC. The artifact facts use those same numeric start and end values.

This is a legacy display-text defect, not a change to the funded evidence. The contract treats `subject` and evidence prose as bounded untrusted display data. Its classifier ignores them and requires the schema-bound numeric period and uptime facts to equal the policy's frozen fields before it can classify an outcome. The policy, evidence digests, receipts, PR-2 data, and current publisher generator use the 13:50–14:50 UTC bounds.

The historic bytes and their wording are deliberately preserved. Editing them would change their SHA-256 digests, break the frozen policy and source-matched receipts, and falsely imply that an already finalized proof had different source bytes. Future artifacts generated by `scripts/generate_v5_publishers.mjs` use the corrected 13:50–14:50 UTC display phrase.

## Trust and release boundaries

- The current (`hardened-v8`) demonstration publishers are technically distinct and now spread across three hosting providers/accounts (Vercel, Cloudflare Pages, GitHub Pages) rather than one shared account; the retired v6/v7 fixtures were all on one Vercel account. All releases remain `DEMONSTRATION_ONLY`, not proof of independent real-world organizations, since every hosting account is controlled by the same operator. [Authority governance](AUTHORITY_GOVERNANCE.md) defines the credentialed admission policy needed for production independence.
- GenVM execution validates the requested origin/path, pinned HTTP status, DID binding, and exact response bytes. The runtime interface does not document response-level final URL or redirect-history access. `scripts/verify_publishers.mjs` supplies the separate release check that rejects redirects and requires final URL equality. The frozen SHA-256 value remains the in-contract transport-independent boundary when redirect history is unavailable.
- GitHub Actions remains `HOSTED_CI_NOT_EXECUTED` because the account billing lock prevents jobs from starting. This hosted status is separate from the passing local release gates and the finalized V6 runner/browser evidence. See [CI attestation](CI_ATTESTATION.md) and [Browser walkthrough](BROWSER_WALKTHROUGH.md).
