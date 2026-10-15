# Testing

The Direct Mode suite deploys the real `ProofRail` contract through `direct_deploy` and mocks only web and model boundaries.

High-risk successful paths are executable tests:

- claim → matching content digest → semantic breach → provisional result → deterministic payout;
- claim → provisional pass → bonded recipient dispute → second review → higher payout and bond return;
- changed evidence bytes → `TAMPERED` receipt → classifier bypass and retryable state;
- publisher-origin mismatch rejected at creation;
- exact accounting and bounded reads.

Run:

```bash
pytest -q
npm test --prefix apps/web
npm run typecheck --prefix apps/web
npm run build --prefix apps/web
```

Direct Mode proves storage/runtime integration and the complete nondeterministic lifecycle with controlled validator inputs. A production release should additionally deploy to a local multi-validator Studio network, then Studionet, and archive transaction receipts for creation, claim, review, challenge, and settlement.

`npm run e2e --prefix scripts` performs that Studionet lifecycle against the public content-addressed release attestation. It fails unless both retrieval receipts reproduce the frozen digest and the rail reaches a terminal state.

