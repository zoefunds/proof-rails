# Testing

The Direct Mode suite deploys the real `ProofRail` contract through `direct_deploy` and mocks only web and model boundaries.

High-risk successful paths are executable tests:

- claim → matching content digest → semantic breach → provisional result → deterministic payout;
- claim → provisional pass → bonded recipient dispute → second review → higher payout and bond return;
- unavailable dispute retrieval → bond preserved in dispute state → bounded retry → deterministic settlement;
- changed evidence bytes → `TAMPERED` receipt → classifier bypass and retryable state;
- publisher-origin mismatch rejected at creation;
- credential-bearing and ambiguous URL authorities rejected;
- incomplete observation intervals rejected;
- expired unreviewed claims recovered permissionlessly;
- permanently unavailable disputes reject late review, preserve the provisional verdict, and refund the challenger bond;
- arbitrary frozen outcome codes interpreted from their registered descriptions;
- failed native transfers surfaced as transaction failures;
- exact accounting and bounded reads.

Run:

```bash
pytest -q
npm test --prefix apps/web
npm run typecheck --prefix apps/web
npm run build --prefix apps/web
```

The 2026-10-16 release verification produced the following exact local results:

- Direct Mode: 14 passed;
- frontend protocol, autofill, and contract-client tests: 20 passed across three files;
- TypeScript project build: passed;
- Vite production build: passed (2,373 modules transformed).

Direct Mode proves storage/runtime integration and the complete nondeterministic lifecycle with controlled validator inputs. A production release should additionally deploy to a local multi-validator Studio network, then Studionet, and archive transaction receipts for creation, claim, review, challenge, and settlement.

`PROOFRAIL_E2E_SCENARIO=4 npm run e2e --prefix scripts` performs the funded breach lifecycle against the public content-addressed release attestation. It fails unless both retrieval receipts reproduce the frozen digest, the agreed code is `BREACHED`, the full principal is paid, every transaction finalizes with majority agreement and explicit execution evidence, and the named recipient's balance increases. The current immutable output is `artifacts/live-e2e-4.studionet.json`; it records rail 2, five finalized transactions, both retrieval receipts, terminal rail state, aggregate accounting, and the recipient balance delta.

The frontend suite separately verifies the 24-hour schedule guard, recovery eligibility for expired draft/claim/dispute states, and the rule that a finalized wallet receipt is successful only when consensus is `MAJORITY_AGREE` and GenVM execution is explicitly `FINISHED_WITH_RETURN` or a finalized transaction provides an execution hash.

The production browser workflow was completed at `https://proof-rails.vercel.app` after the current contract deployment. It covered rail creation with distinct deadlines, named-recipient claim, a nonempty challenge reason and exact bond, finalized settlement reporting, deadline and consequence rendering, and the permissionless recovery action when eligible. The contract record, rather than browser UI state, is authoritative; the current public read reports two rails and no locked principal or bond.

