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
node scripts/verify_browser_wallet_evidence.mjs
```

The current hardened-v6 local verification produces:

- Direct Mode: 37 passed;
- frontend protocol, autofill, and contract-client tests: 26 passed across three files;
- TypeScript project build: passed;
- Vite production build: passed (2,372 modules transformed).

Direct Mode proves storage/runtime integration and validator equivalence with controlled inputs. `artifacts/live-e2e-4.studionet.json` remains historical V5 proof. The current source-matched technical demonstration is `artifacts/live-receipts.hardened-v6.studionet.json`, verified by `PROOFRAIL_RELEASE_ID=hardened-v6 node scripts/verify_live_receipts.mjs`: it records a finalized hardened deployment, live 2/2 primary and 3/3 counter provenance, consensus reversal, payout, bond clearing, terminal accounting, and finalized execution evidence. The publisher origins share one Vercel account, so this is not organizational-independence proof.

The lifecycle runner accepts `PROOFRAIL_EVIDENCE_POLICY` and `PROOFRAIL_COUNTEREVIDENCE` overrides, retries within a bounded count and interval, and rejects a run unless both panels meet quorum, every recorded transaction reaches majority consensus with GenVM execution evidence, accounting conserves funds, and the expected payout reaches the recipient. The source-matched current record is `artifacts/live-receipts.hardened-v6.studionet.json`; `artifacts/live-e2e-4.studionet.json` is a historical record and must not be used as proof for the current contract.

The production dependency audit reports zero advisories, and the full dependency graph now also reports zero: Vitest was upgraded to the npm-fixed `5.0.5` release after the earlier report of three Vitest-related advisories (1 moderate, 2 critical). The web suite still passes on Vitest 5.0.5. Current hosted workflows do not start because GitHub marks the account locked for billing; both jobs contain zero executed steps. This is recorded as an external CI blocker, not described as green CI.

The frontend suite separately verifies the 24-hour schedule guard, recovery eligibility for expired draft/claim/dispute states, and the rule that a finalized wallet receipt is successful only when consensus is `MAJORITY_AGREE` and GenVM execution is explicitly `FINISHED_WITH_RETURN` or a finalized transaction provides an execution hash.

The current production browser at `https://proof-rails.vercel.app` is pinned to the hardened-v6 contract. The paid Rail 1 view and five source receipts render assertions, classifications, quorum counts, and hashes. Rail 2 has completed the injected-wallet lifecycle: seven finalized Studionet transactions cover funding, claim, primary review, bonded dispute, counter review, payout, and successful bond return. `node scripts/verify_browser_wallet_evidence.mjs` checks the browser capture against the source-matched funded rail. The browser capture is `artifacts/browser-wallet-hardened-v6.studionet.json`; the publisher receipt record is `artifacts/live-receipts.hardened-v6.studionet.json`. `artifacts/browser-wallet-pr2.studionet.json` is historical V5 only. The contract record and explorer receipts, rather than UI state alone, are authoritative.

### Latest local follow-up (2026-10-20)

After the production-interface wording and browser-status documentation update, `pytest -q` passed (37), `npm test --prefix apps/web` passed (26), TypeScript typecheck passed, and the production web build passed. The live-receipt, source-equivalence, and governance evidence verifiers passed. Registry connectivity was restored for the final check: the publisher verifier passed for all 10 pinned objects (HTTP 200, no redirects, exact URL and SHA-256), and both full and production `npm audit` reported zero vulnerabilities after the Vitest update. Earlier DNS failures were transient and are not the current verification result. These local results do not change hosted CI status: GitHub still did not start either job because of the account billing lock. The subsequent V6 browser rail-2 transactions are recorded separately in `artifacts/browser-wallet-hardened-v6.studionet.json` and verified against the explorer.

