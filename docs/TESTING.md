# Testing

The Direct Mode suite deploys the real `ProofRail` contract through `direct_deploy` and mocks the web boundary. Structured numerical classification remains real contract execution; deliberately false model mocks are ignored and cannot override frozen arithmetic.

The v5 adversarial suite covers:

- independent-source quorum and verified-versus-asserted provenance;
- three authenticated counter-sources overturning a two-source provisional verdict and changing payout;
- contradictory publisher assertions, false-but-confident model output, ambiguity, prompt injection, missing or inconsistent facts, forged DID, wrong service path, redirects, stale metadata, schema injection, canonical aliases, duplicated identities, conflicting sources, timeout/retry, validator disagreement, transfer rollback, replay, and fund conservation;
- repeated deterministic validator recomputation agreeing with the captured leader result, plus a funded Studionet lifecycle whose transactions finalized with `MAJORITY_AGREE`.

Run:

```bash
pytest -q
npm test --prefix apps/web
npm run typecheck --prefix apps/web
npm run build --prefix apps/web
node scripts/verify_live_artifact.mjs
node scripts/verify_release_artifact.mjs
node scripts/verify_review_evidence.mjs
```

The current v5 local verification produces:

- Direct Mode: 37 passed;
- frontend protocol, autofill, and contract-client tests: 26 passed across three files;
- TypeScript project build: passed;
- Vite production build: passed (2,372 modules transformed).

Direct Mode proves storage/runtime integration and validator equivalence with controlled inputs. `artifacts/live-e2e-4.studionet.json` remains historical V5 proof. The current source-matched technical demonstration is `artifacts/live-receipts.hardened-v6.studionet.json`, verified by `PROOFRAIL_RELEASE_ID=hardened-v6 node scripts/verify_live_receipts.mjs`: it records a finalized hardened deployment, live 2/2 primary and 3/3 counter provenance, consensus reversal, payout, bond clearing, terminal accounting, and finalized execution evidence. The publisher origins share one Vercel account, so this is not organizational-independence proof.

The v5 E2E runner reads `artifacts/evidence-policy.v5.json` and `artifacts/counterevidence.v5.json` by default; `PROOFRAIL_EVIDENCE_POLICY` and `PROOFRAIL_COUNTEREVIDENCE` may override them. It verifies contract state after each review, performs at most five retries separated by the frozen interval, and rejects a run unless both panels meet quorum, every recorded transaction reaches majority consensus with GenVM execution evidence, per-run accounting conserves funds, and the expected payout reaches the recipient. Only its newly generated `proofrail.live-verification/v5` artifact is source-matched funded proof.

The production dependency audit passes: `npm audit --prefix apps/web --omit=dev --audit-level=high` reports zero advisories. This does not make the complete development-tool dependency graph clean: `npm audit --prefix apps/web` reports 3 advisories (1 moderate, 2 critical) in Vitest-related development dependencies. Current hosted workflows do not start because GitHub marks the account locked for billing; both jobs contain zero executed steps. This is recorded as an external CI blocker, not described as green CI.

The frontend suite separately verifies the 24-hour schedule guard, recovery eligibility for expired draft/claim/dispute states, and the rule that a finalized wallet receipt is successful only when consensus is `MAJORITY_AGREE` and GenVM execution is explicitly `FINISHED_WITH_RETURN` or a finalized transaction provides an execution hash.

The production browser at `https://proof-rails.vercel.app` reads the hardened contract directly. Its receipt ledger renders asserted versus verified provenance, agreeing/verified vote counts, expected and observed digests, source outcomes, authority identities, and escrow/bond accounting. Wallet writes use the same finalized-receipt guard as the funded runner. PR-2 is a separate injected-wallet production write-path record covering create/fund, claim, primary review, bonded dispute, dispute review, and payout; see [BROWSER_WALKTHROUGH.md](BROWSER_WALKTHROUGH.md) and `artifacts/browser-wallet-pr2.studionet.json`. The contract record, rather than browser UI state, remains authoritative.

