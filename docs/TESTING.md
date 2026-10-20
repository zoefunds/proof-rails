# Testing

The Direct Mode suite deploys the real `ProofRail` contract through `direct_deploy` and mocks web and semantic-classifier boundaries. The contract still builds the isolated prompt, validates the exact response, and runs validator recomputation.

The v5 adversarial suite covers:

- independent-source quorum and verified-versus-asserted provenance;
- three authenticated counter-sources overturning a two-source provisional verdict and changing payout;
- contradictory publisher assertions, ambiguity, prompt injection, forged DID, wrong service path, redirects, stale metadata, schema injection, canonical aliases, duplicated identities, conflicting sources, timeout/retry, validator disagreement, transfer rollback, replay, and fund conservation;
- repeated deterministic validator recomputation agreeing with the captured leader result, plus a funded Studionet lifecycle whose transactions finalized with `MAJORITY_AGREE`.

Run:

```bash
pytest -q
npm test --prefix apps/web
npm run typecheck --prefix apps/web
npm run build --prefix apps/web
```

The current v5 local verification produces:

- Direct Mode: 30 passed;
- frontend protocol, autofill, and contract-client tests: 24 passed across three files;
- TypeScript project build: passed;
- Vite production build: passed (2,372 modules transformed).

Direct Mode proves storage/runtime integration and validator equivalence with controlled inputs. The source-matched network proof is `artifacts/live-e2e-4.studionet.json`: it records the finalized hardened deployment, a funded five-transaction Studionet lifecycle, 2/2 verified primary sources, 3/3 verified counter-sources, a separate-panel 3-of-3 consensus reversal, payout, balance delta, bond clearing, fund conservation, and GenVM finality.

The v5 E2E runner requires `PROOFRAIL_EVIDENCE_POLICY` and `PROOFRAIL_COUNTEREVIDENCE`. It rejects a run unless both rounds meet the frozen source quorum, every transaction reaches majority consensus with GenVM execution evidence, accounting conserves funds, and the expected payout reaches the recipient. Only its newly generated `proofrail.live-verification/v5` artifact may be used as source-matched funded proof.

The frontend suite separately verifies the 24-hour schedule guard, recovery eligibility for expired draft/claim/dispute states, and the rule that a finalized wallet receipt is successful only when consensus is `MAJORITY_AGREE` and GenVM execution is explicitly `FINISHED_WITH_RETURN` or a finalized transaction provides an execution hash.

The production browser at `https://proof-rails.vercel.app` reads the hardened contract directly. Its receipt ledger renders asserted versus verified provenance, agreeing/verified vote counts, expected and observed digests, source outcomes, authority identities, and escrow/bond accounting. Wallet writes use the same finalized-receipt guard as the funded runner. The contract record, rather than browser UI state, remains authoritative.

