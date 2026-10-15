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
- permanently unavailable disputes settled at their deadline with deterministic bond disposition;
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

`PROOFRAIL_E2E_SCENARIO=4 npm run e2e --prefix scripts` performs the funded breach lifecycle against the public content-addressed v2 release attestation. It fails unless both retrieval receipts reproduce the frozen digest, the agreed code is `BREACHED`, the full principal is paid, every transaction finalizes with majority agreement, and the named recipient's balance increases.

