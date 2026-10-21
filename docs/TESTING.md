# Testing

The Direct Mode suite deploys the real `ProofRail` contract through `direct_deploy` and mocks the web boundary. Structured numerical classification remains real contract execution; deliberately false model mocks are ignored and cannot override frozen arithmetic.

The hardened-v9 Direct Mode adversarial suite covers:

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
PROOFRAIL_RELEASE_ID=hardened-v9 node scripts/verify_candidate_policy.mjs
PROOFRAIL_RELEASE_ID=hardened-v9 node scripts/verify_publishers.mjs
node scripts/verify_live_artifact.mjs
node scripts/verify_review_evidence.mjs
node scripts/verify_browser_wallet_evidence.mjs
```

The old `hardened-v6`, `hardened-v7`, and `hardened-v8` release-id commands are intentionally historical-only: they bind to earlier deployed bytes or a retired evidence-policy schema (pre-`obligation_id`). Do not use them as current release gates; use `hardened-v9`.

The last recorded local verification (2026-10-21) produced:

- Direct Mode: 42 passed;
- frontend protocol, autofill, and contract-client tests: 27 passed across three files;
- TypeScript project build: passed;
- Vite production build: passed.

`hardened-v9` is **deployed and funded** at `0xC4C899Bd6A06544d56E58eFA87e96bC78eE46100` on Studionet, and is the address the production browser (`apps/web/src/contract.ts`) now pins. Its evidence policy (schema `proofrail.evidence-policy/v7`) carries a frozen `obligation_id` that every retrieved artifact (schema `proofrail.independent-attestation/v3`) must match, and its receipts commit to the full evidence+payout policy. It spreads its five publisher sources across three distinct hosting providers/accounts (Vercel, Cloudflare Pages, GitHub Pages) instead of one shared Vercel account. See [Deployment](DEPLOYMENT.md) for addresses and [Authority governance](AUTHORITY_GOVERNANCE.md) for why this is not organizational independence.

Direct Mode proves storage/runtime integration and validator equivalence with controlled inputs. `artifacts/live-e2e-4.studionet.json` remains historical V5 proof. `artifacts/live-receipts.hardened-v6.studionet.json` is historical deployed-source evidence for the retired v6 contract, where the counter panel was not frozen at initial funding — it is not evidence for the current invariant. `artifacts/live-e2e-hardened-v8-4.studionet.json` is historical: it proved the funding-time freeze but not obligation binding. `artifacts/live-e2e-hardened-v9-4.studionet.json` is the current funded, multi-provider, obligation-bound, funding-time-frozen record: live 2/2 primary and 3/3 counter provenance, reversal, payout, bond clearing, and terminal accounting, all on the live contract.

The lifecycle runner accepts `PROOFRAIL_EVIDENCE_POLICY` and `PROOFRAIL_COUNTEREVIDENCE` overrides, retries within a bounded count and interval, and rejects a run unless both panels are the same pre-funded policy, meet quorum, every recorded transaction reaches majority consensus with GenVM execution evidence, accounting conserves funds, and the expected payout reaches the recipient.

The production dependency audit reports zero advisories, and the full dependency graph now also reports zero: Vitest was upgraded to the npm-fixed `5.0.5` release after the earlier report of three Vitest-related advisories (1 moderate, 2 critical). The web suite still passes on Vitest 5.0.5. Current hosted workflows do not start because GitHub marks the account locked for billing; both jobs contain zero executed steps. This is recorded as an external CI blocker, not described as green CI.

The frontend suite separately verifies the 24-hour schedule guard, recovery eligibility for expired draft/claim/dispute states, and the rule that a finalized wallet receipt is successful only when consensus is `MAJORITY_AGREE` and GenVM execution is explicitly `FINISHED_WITH_RETURN` or a finalized transaction provides an execution hash.

The production browser at `https://proof-rails.vercel.app` previously completed a V6 injected-wallet lifecycle against the now-retired v6 contract (seven finalized Studionet transactions: funding, claim, primary review, bonded dispute, counter review, payout, bond return). That capture reflects the historical implementation where the counter panel was supplied at dispute time, so it is not proof for the current `hardened-v9` contract. The account owner supplied its transaction hashes; contract/explorer records remain authoritative. A fresh browser-driven lifecycle against `hardened-v9`, performed by the wallet owner, is still required — see the next paragraph.

For the current release, `PROOFRAIL_RELEASE_ID=hardened-v9 node scripts/verify_browser_wallet_candidate.mjs` is the required browser-evidence gate, and it has **not yet been run** — it needs `artifacts/browser-wallet-hardened-v9.studionet.json`, a real injected-wallet capture that only the wallet owner can produce (fund, claim, review, dispute, review, settle through the production UI, then supply the resulting transaction hashes). It rejects a capture unless the deployed source hash equals the current contract bytes, the nested and stored counter panels match, every one of the seven wallet actions is finalized, the 2/2 primary result reverses to the 3/3 counter result, publisher assertions differ from validator classifications, the bond is routed correctly, and terminal accounting is zero-locked. `artifacts/live-receipts.hardened-v9.studionet.json`, generated from the already-finalized runner-driven rail via `scripts/capture_live_evidence.mjs`, satisfies the non-wallet half of that gate.

