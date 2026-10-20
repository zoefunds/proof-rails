# Testing

The Direct Mode suite deploys the real `ProofRail` contract through `direct_deploy` and mocks the web boundary. Structured numerical classification remains real contract execution; deliberately false model mocks are ignored and cannot override frozen arithmetic.

The hardened-v6 Direct Mode adversarial suite covers:

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
PROOFRAIL_RELEASE_ID=hardened-v6 node scripts/verify_publishers.mjs
PROOFRAIL_RELEASE_ID=hardened-v6 node scripts/verify_live_receipts.mjs
node scripts/verify_live_artifact.mjs
node scripts/verify_review_evidence.mjs
```

The current hardened-v6 local verification produces:

- Direct Mode: 37 passed;
- frontend protocol, autofill, and contract-client tests: 26 passed across three files;
- TypeScript project build: passed;
- Vite production build: passed (2,372 modules transformed).

Direct Mode proves storage/runtime integration and validator equivalence with controlled inputs. `artifacts/live-e2e-4.studionet.json` remains historical V5 proof. The current source-matched technical demonstration is `artifacts/live-receipts.hardened-v6.studionet.json`, verified by `PROOFRAIL_RELEASE_ID=hardened-v6 node scripts/verify_live_receipts.mjs`: it records a finalized hardened deployment, live 2/2 primary and 3/3 counter provenance, consensus reversal, payout, bond clearing, terminal accounting, and finalized execution evidence. The publisher origins share one Vercel account, so this is not organizational-independence proof.

The lifecycle runner accepts `PROOFRAIL_EVIDENCE_POLICY` and `PROOFRAIL_COUNTEREVIDENCE` overrides, retries within a bounded count and interval, and rejects a run unless both panels meet quorum, every recorded transaction reaches majority consensus with GenVM execution evidence, accounting conserves funds, and the expected payout reaches the recipient. The source-matched current record is `artifacts/live-receipts.hardened-v6.studionet.json`; `artifacts/live-e2e-4.studionet.json` is a historical record and must not be used as proof for the current contract.

The production dependency audit passes: `npm audit --prefix apps/web --omit=dev --audit-level=high` reports zero advisories. This does not make the complete development-tool dependency graph clean: `npm audit --prefix apps/web` reports 3 advisories (1 moderate, 2 critical) in Vitest-related development dependencies. Current hosted workflows do not start because GitHub marks the account locked for billing; both jobs contain zero executed steps. This is recorded as an external CI blocker, not described as green CI.

The frontend suite separately verifies the 24-hour schedule guard, recovery eligibility for expired draft/claim/dispute states, and the rule that a finalized wallet receipt is successful only when consensus is `MAJORITY_AGREE` and GenVM execution is explicitly `FINISHED_WITH_RETURN` or a finalized transaction provides an execution hash.

The current production browser at `https://proof-rails.vercel.app` is pinned to the hardened-v6 contract and exposes receipts and accounting. V6 live chain evidence has been verified by the runner, but V6 injected-wallet browser writes have not yet been recaptured. `artifacts/browser-wallet-pr2.studionet.json` records the prior V5 browser flow only; it does not attest the current deployment. The contract record, rather than browser UI state, remains authoritative.

