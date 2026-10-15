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

Direct Mode proves storage/runtime integration and the complete nondeterministic lifecycle with controlled validator inputs. A production release should additionally deploy to a local multi-validator Studio network, then Studionet, and archive transaction receipts for creation, claim, review, challenge, and settlement.

`PROOFRAIL_E2E_SCENARIO=4 npm run e2e --prefix scripts` performs the funded breach lifecycle against the public content-addressed v3 release attestation. It fails unless both retrieval receipts reproduce the frozen digest, the agreed code is `BREACHED`, the full principal is paid, every transaction finalizes with majority agreement, and the named recipient's balance increases.

The frontend suite separately verifies the 24-hour schedule guard, recovery eligibility for expired draft/claim/dispute states, and the rule that a finalized wallet receipt is successful only when consensus is `MAJORITY_AGREE` and GenVM execution is explicitly `FINISHED_WITH_RETURN`. Production browser QA at `proof-rails.vercel.app` verifies the v3 autofill renders distinct observation and claim deadlines, the live rail renders all recovery/review deadlines and bond consequences, and the registry reads the v3 on-chain payout rail.

