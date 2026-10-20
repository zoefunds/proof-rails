# Testing

The Direct Mode suite deploys the real `ProofRail` contract through `direct_deploy` and mocks the web boundary. Structured numerical classification remains real contract execution; deliberately false model mocks are ignored and cannot override frozen arithmetic.

The hardened-v6 candidate Direct Mode adversarial suite covers:

- independent-source quorum and verified-versus-asserted provenance;
- three authenticated counter-sources, pinned inside the funded policy, overturning a two-source provisional verdict and changing payout; dispute-time source substitution is rejected;
- contradictory publisher assertions, false-but-confident model output, ambiguity, prompt injection, missing or inconsistent facts, forged DID, wrong service path, redirects, stale metadata, schema injection, canonical aliases, duplicated identities, conflicting sources, timeout/retry, validator disagreement, transfer rollback, replay, and fund conservation;
- repeated deterministic validator recomputation agreeing with the captured leader result, plus a funded Studionet lifecycle whose transactions finalized with `MAJORITY_AGREE`.

Run:

```bash
pytest -q
npm test --prefix apps/web
npm run typecheck --prefix apps/web
npm run build --prefix apps/web
PROOFRAIL_RELEASE_ID=hardened-v7 node scripts/verify_candidate_policy.mjs
PROOFRAIL_RELEASE_ID=hardened-v7 node scripts/verify_publishers.mjs
node scripts/verify_live_artifact.mjs
node scripts/verify_review_evidence.mjs
node scripts/verify_browser_wallet_evidence.mjs
```

The old `hardened-v6` receipt commands are intentionally historical-only: they bind to the earlier deployed bytes and correctly reject the corrected source tree. Do not use them as current release gates.

The last previously recorded hardened-v6 local verification produced:

- Direct Mode: 38 passed;
- frontend protocol, autofill, and contract-client tests: 26 passed across three files;
- TypeScript project build: passed;
- Vite production build: passed (2,372 modules transformed).

The current source tree contains a post-deployment contract change: v6 now freezes the counter panel at funding. This changes contract bytes and invalidates the existing deployed-source match; no claim is made that the deployed contract at `0x7F21Cfd207C7843078c99a05d4F0cF3e0fcb8986` has this fix. A fresh deploy, funded receipt, and production injected-wallet lifecycle are required before the stricter candidate can be called deployed evidence.

Direct Mode proves storage/runtime integration and validator equivalence with controlled inputs. `artifacts/live-e2e-4.studionet.json` remains historical V5 proof. `artifacts/live-receipts.hardened-v6.studionet.json` is historical deployed-source evidence: it records live 2/2 primary and 3/3 counter provenance, reversal, payout, bond clearing, and terminal accounting, but the counter panel was not frozen at initial funding. It is not evidence for the stricter pre-funded dual-panel invariant. The publisher origins share one Vercel account, so this is not organizational-independence proof.

The lifecycle runner accepts `PROOFRAIL_EVIDENCE_POLICY` and `PROOFRAIL_COUNTEREVIDENCE` overrides, retries within a bounded count and interval, and rejects a run unless both panels are the same pre-funded policy, meet quorum, every recorded transaction reaches majority consensus with GenVM execution evidence, accounting conserves funds, and the expected payout reaches the recipient. Existing source-matched records are historical, not proof for the modified candidate.

The production dependency audit reports zero advisories, and the full dependency graph now also reports zero: Vitest was upgraded to the npm-fixed `5.0.5` release after the earlier report of three Vitest-related advisories (1 moderate, 2 critical). The web suite still passes on Vitest 5.0.5. Current hosted workflows do not start because GitHub marks the account locked for billing; both jobs contain zero executed steps. This is recorded as an external CI blocker, not described as green CI.

The frontend suite separately verifies the 24-hour schedule guard, recovery eligibility for expired draft/claim/dispute states, and the rule that a finalized wallet receipt is successful only when consensus is `MAJORITY_AGREE` and GenVM execution is explicitly `FINISHED_WITH_RETURN` or a finalized transaction provides an execution hash.

The production browser at `https://proof-rails.vercel.app` previously completed a V6 injected-wallet lifecycle. Seven finalized Studionet transactions cover funding, claim, primary review, bonded dispute, counter review, payout, and bond return. This capture reflects the historical implementation where the counter panel was supplied at dispute time, so it is not proof for the fixed candidate. The account owner supplied its transaction hashes; contract/explorer records remain authoritative. A new browser run must follow redeployment of the candidate.

### Latest local follow-up (2026-10-20)

The latest candidate local verification on 2026-10-20 passed `pytest -q` (38), frontend tests (26), TypeScript typecheck, production build (2,372 modules), contract lint (3 checks), browser capture integrity, and CI blocker/governance evidence. The build emits a non-fatal chunk-size advisory. Current candidate source intentionally does not match old deployed receipt hashes. Live publisher retrieval could not be re-run in this turn because DNS was unavailable. GitHub hosted jobs remain blocked at runner startup by billing; no hosted check was triggered.

