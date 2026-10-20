# Testing

The Direct Mode suite deploys the real `ProofRail` contract through `direct_deploy` and mocks only the web boundary. No evidence or challenge text reaches an LLM.

The v4 adversarial suite covers:

- independent-source quorum and verified-versus-asserted provenance;
- three authenticated counter-sources overturning a two-source provisional verdict and changing payout;
- forged DID, wrong service path, redirect status, stale DID and artifact metadata, schema injection, canonical-domain aliases, duplicated authority identity, conflicting sources, timeout/retry, validator disagreement, dispute/finalize/recovery rollback, replay, and fund conservation;
- repeated deterministic validator recomputation agreeing with the captured leader result, plus a funded Studionet lifecycle whose transactions finalized with `MAJORITY_AGREE`.

Run:

```bash
pytest -q
npm test --prefix apps/web
npm run typecheck --prefix apps/web
npm run build --prefix apps/web
```

The current v4 local verification produces:

- Direct Mode: 22 passed;
- frontend protocol, autofill, and contract-client tests: 24 passed across three files;
- TypeScript project build: passed;
- Vite production build: passed (2,373 modules transformed).

Direct Mode proves storage/runtime integration and validator equivalence with controlled inputs. The source-matched network proof is `artifacts/live-e2e-4.studionet.json`: it records the finalized hardened deployment, a funded five-transaction Studionet lifecycle, 2/2 verified primary sources, 5/5 verified dispute sources, a strict-majority 3–2 consensus reversal, payout, balance delta, bond clearing, fund conservation, and GenVM finality.

The v4 E2E runner requires `PROOFRAIL_EVIDENCE_POLICY` and `PROOFRAIL_COUNTEREVIDENCE`. It rejects a run unless both rounds meet the frozen source quorum, every transaction reaches majority consensus with GenVM execution evidence, accounting conserves funds, and the expected payout reaches the recipient. Only its newly generated `proofrail.live-verification/v4` artifact may be used as source-matched funded proof.

The frontend suite separately verifies the 24-hour schedule guard, recovery eligibility for expired draft/claim/dispute states, and the rule that a finalized wallet receipt is successful only when consensus is `MAJORITY_AGREE` and GenVM execution is explicitly `FINISHED_WITH_RETURN` or a finalized transaction provides an execution hash.

The production browser at `https://proof-rails.vercel.app` reads the hardened contract directly. Its receipt ledger renders asserted versus verified provenance, agreeing/verified vote counts, expected and observed digests, source outcomes, authority identities, and escrow/bond accounting. Wallet writes use the same finalized-receipt guard as the funded runner. The contract record, rather than browser UI state, remains authoritative.

