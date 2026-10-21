# Testing

The Direct Mode suite deploys the real `ProofRail` contract through `direct_deploy` and mocks the web boundary. Structured numerical classification remains real contract execution; deliberately false model mocks are ignored and cannot override frozen arithmetic.

The hardened-v10 Direct Mode adversarial suite covers:

- independent-source quorum and verified-versus-asserted provenance;
- three authenticated counter-sources, pinned inside the funded policy, overturning a two-source provisional verdict and changing payout; dispute-time source substitution is rejected;
- **obligation binding**: a correctly hashed, correctly DID-authenticated artifact for a *different* obligation than the rail's frozen `obligation_id` is rejected as `INVALID` (`test_evidence_for_a_different_obligation_is_rejected_even_when_correctly_hashed`);
- **receipt policy-digest scope**: two rails with identical evidence but different payout tables produce different `policy_digest` values (`test_receipt_policy_digest_commits_to_payout_table_not_just_evidence`);
- **coordinated false measurement (documented limitation, not a bug)**: if every quorum source independently chooses to publish the same fabricated facts, authenticated corroboration still succeeds — this is demonstrated explicitly, not left implicit (`test_coordinated_identical_false_facts_pass_quorum_by_design`);
- contradictory publisher assertions, false-but-confident model output, ambiguity, prompt injection, missing or inconsistent facts, forged DID, wrong service path, redirects, stale metadata, schema injection, canonical aliases, duplicated identities, conflicting sources, timeout/retry, validator disagreement, transfer rollback, replay, and fund conservation;
- repeated deterministic validator recomputation agreeing with the captured leader result, plus a funded Studionet lifecycle whose transactions finalized with `MAJORITY_AGREE`.

Run:

```bash
pytest -q
npm test --prefix apps/web
npm run typecheck --prefix apps/web
npm run build --prefix apps/web
npm test --prefix scripts
PROOFRAIL_RELEASE_ID=hardened-v10 node scripts/verify_candidate_policy.mjs
PROOFRAIL_RELEASE_ID=hardened-v10 node scripts/verify_publishers.mjs
PROOFRAIL_RELEASE_ID=hardened-v10 node scripts/verify_browser_wallet_candidate.mjs
node scripts/verify_live_artifact.mjs
node scripts/verify_review_evidence.mjs
node scripts/verify_browser_wallet_evidence.mjs
```

The old `hardened-v6`, `hardened-v7`, `hardened-v8`, and `hardened-v9` release-id commands are intentionally historical-only: they bind to earlier deployed bytes, a retired evidence-policy schema (pre-`obligation_id`), or a retired deployment superseded by a fresh redeploy. Do not use them as current release gates; use `hardened-v10`.

The last recorded local verification (2026-10-21) produced:

- Direct Mode: 42 passed;
- frontend protocol, autofill, and contract-client tests: 27 passed across three files;
- TypeScript project build: passed;
- Vite production build: passed.

`hardened-v10` is **deployed and funded** at `0x0dd0e186c7C509c8E94E38A6536B78A0754fB4c9` on Studionet, and is the address the production browser (`apps/web/src/contract.ts`) now pins. It is a fresh redeploy of the identical hardened-v9 source and policy shape (byte-identical SHA-256), with newly generated publisher evidence, done to verify the deploy pipeline reproduces and to produce an independently verified funded lifecycle. Its evidence policy (schema `proofrail.evidence-policy/v7`) carries a frozen `obligation_id` that every retrieved artifact (schema `proofrail.independent-attestation/v3`) must match, and its receipts commit to the full evidence+payout policy. It spreads its five publisher sources across three distinct hosting providers/accounts (Vercel, Cloudflare Pages, GitHub Pages) instead of one shared Vercel account. See [Deployment](DEPLOYMENT.md) for addresses and [Authority governance](AUTHORITY_GOVERNANCE.md) for why this is not organizational independence.

Direct Mode proves storage/runtime integration and validator equivalence with controlled inputs. `artifacts/live-e2e-4.studionet.json` remains historical V5 proof. `artifacts/live-receipts.hardened-v6.studionet.json` is historical deployed-source evidence for the retired v6 contract, where the counter panel was not frozen at initial funding — it is not evidence for the current invariant. `artifacts/live-e2e-hardened-v8-4.studionet.json` is historical: it proved the funding-time freeze but not obligation binding. `artifacts/live-e2e-hardened-v9-4.studionet.json` is historical: it proved obligation binding on an earlier deployment of the same source. `artifacts/live-e2e-hardened-v10-4.studionet.json` is the current funded, multi-provider, obligation-bound, funding-time-frozen record: live 2/2 primary and 3/3 counter provenance, reversal, payout, bond clearing, and terminal accounting, all on the live contract.

**Live-app verification beyond the runner:** after this redeploy, the production site itself (not just the contract) was driven through every page — Control room, Rails, Attestations, Attestation detail cards for all five publishers across all three providers, Activity, Protocol, and the new-rail drawer's autofill — against this real funded rail, confirmed via the browser pane, not assumed from the runner's own output. `finalize()`-without-dispute and every `recover()` variant are gated by real wall-clock windows (48h/7-day/3-day) and were not re-exercised live in this session; they rely on the Direct Mode suite's time-warped coverage of the identical bytecode, rerun and confirmed passing (42/42) immediately before this redeploy.

The lifecycle runner accepts `PROOFRAIL_EVIDENCE_POLICY` and `PROOFRAIL_COUNTEREVIDENCE` overrides, retries within a bounded count and interval, and rejects a run unless both panels are the same pre-funded policy, meet quorum, every recorded transaction reaches majority consensus with GenVM execution evidence, accounting conserves funds, and the expected payout reaches the recipient.

The production dependency audit reports zero advisories, and the full dependency graph now also reports zero: Vitest was upgraded to the npm-fixed `5.0.5` release after the earlier report of three Vitest-related advisories (1 moderate, 2 critical). The web suite still passes on Vitest 5.0.5. Current hosted workflows do not start because GitHub marks the account locked for billing; both jobs contain zero executed steps. This is recorded as an external CI blocker, not described as green CI.

The frontend suite separately verifies the 24-hour schedule guard, recovery eligibility for expired draft/claim/dispute states, and the rule that a finalized wallet receipt is successful only when consensus is `MAJORITY_AGREE` and GenVM execution is explicitly `FINISHED_WITH_RETURN` or a finalized transaction provides an execution hash.

The production browser at `https://proof-rails.vercel.app` previously completed a V6 injected-wallet lifecycle against the now-retired v6 contract (seven finalized Studionet transactions: funding, claim, primary review, bonded dispute, counter review, payout, bond return). That capture reflects the historical implementation where the counter panel was supplied at dispute time, so it is not proof for the current `hardened-v10` contract. The account owner supplied its transaction hashes; contract/explorer records remain authoritative. A fresh browser-driven lifecycle against `hardened-v10`, performed by the wallet owner, is still required — see the next paragraph.

For the current release, `PROOFRAIL_RELEASE_ID=hardened-v10 node scripts/verify_browser_wallet_candidate.mjs` is the required browser-evidence gate, and it has **now been run and passed** against a real injected-wallet lifecycle: the account owner drove the production UI end to end — fund, claim, review, dispute, review, settle — and supplied all seven resulting transaction hashes, captured in `artifacts/browser-wallet-hardened-v10.studionet.json`. This is rail 2 on the hardened-v10 contract (issuer `0x6f0b4cE7a1872db132b2F6B7743deFb30eBa698a`, recipient/challenger `0x7401c129EDfc26E68FE19309fE461eb3Db1058Eb`, funded `1.0 GEN` — a real amount, not a test value), distinct from rail 1 (the runner-driven `0.01 GEN` rail used for the earlier deploy verification). `artifacts/live-receipts.hardened-v10.studionet.json` now captures rail 2's full receipt record (rail 1's receipt capture is preserved separately at `artifacts/live-receipts.hardened-v10-rail1.studionet.json`). The verifier confirms the deployed source hash equals the current contract bytes, the nested and stored counter panels match, every one of the seven wallet actions is finalized, the 2/2 primary result reverses to the 3/3 counter result, publisher assertions differ from validator classifications, the exact bond (`0.05 GEN`, 5% of `1.0 GEN`) is posted and returned to the exact right recipient, this rail's own accounting is zero-locked with `paid===funded`, and the contract's global fund-conservation invariant holds across both rails — and it re-fetches all seven transactions from Studionet itself to check sender, recipient, value, consensus, and GenVM execution, rather than trusting the capture file's self-reported fields.

Two real bugs were found and fixed while closing this gate:

1. **The capture artifact itself was wrong.** The first `browser-wallet-hardened-v10.studionet.json` recorded both the challenge bond and its return as `0`, when the real on-chain values were `0.05 GEN` each. Corrected against values independently re-read from the finalized dispute and bond-return transactions.
2. **The verifier never checked bond/payout amounts at all**, so a capture could claim any number and pass. `scripts/lib/wallet_lifecycle_checks.mjs` now checks exact amounts and recipients, and `tests/scripts/wallet_lifecycle_checks.test.mjs` (`npm test --prefix scripts`, 13 cases) proves specific corruptions — a zeroed bond, a zeroed bond return, a wrong bond amount, a misrouted payout — are all rejected, using the real hardened-v10 artifacts as the known-good fixture.

A third, unrelated bug was also found and fixed: the verifier originally compared the contract's *global* accumulated `accounting.paid` against this *one rail's* `funded` amount, an assumption that only holds when a contract has had exactly one rail ever funded. With two rails now funded on hardened-v10 (the 0.01 GEN runner rail and this 1.0 GEN browser rail), that comparison broke even though both rails independently settled correctly. The script now checks this rail's own `paid===funded` and `locked===0` directly, plus the real scale-invariant global conservation identity `funded===locked+paid+returned`, which holds regardless of rail count.

