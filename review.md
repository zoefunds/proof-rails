# ProofRail — Review Response Summary

This document maps the review team's requirements to the actual fixes, tests, and on-chain/production evidence produced in response, across all review rounds on this branch. It is a summary for reviewers; the authoritative detail lives in `docs/` and in the commit history (`git log`).

Current state referenced throughout: contract **hardened-v10** at `0x0dd0e186c7C509c8E94E38A6536B78A0754fB4c9` (GenLayer Studionet, chain ID `61999`), source SHA-256 `ac524584cd74d3c968ea2aaf5c7149109718fc95e5fa515c9fa4a97061b60c8b`, production console `https://proof-rails.vercel.app`. Local test totals: **43 Direct Mode tests**, **32 frontend tests**, **30 browser-wallet-verifier corruption tests** — all passing, rerun from a clean install immediately before this document was written.

---

## 1. "Replace issuer-selected single-source authority with a frozen multi-source policy requiring corroboration and separately authenticated counterevidence. Demonstrate that a distinct counterevidence panel can reverse a provisional consensus result and deterministically change the escrow payout."

**Contract (`contracts/proofrail.py`):** `_validate_policy` rejects any policy without `min_sources ≥ min_verified ≥ min_agreement ≥ 2` for both the primary and counter panels (`test_policy_rejects_issuer_selected_single_source`). The issuer commits the **complete counter panel at `open_rail` time**, not at dispute time — `dispute()` byte-compares the submitted panel to the one frozen at funding and rejects any other (`test_dispute_cannot_replace_precommitted_counterevidence`). This was a real defect in the historical hardened-v6 deployment (counter panel supplied at dispute time) and is the reason hardened-v7 through v10 exist.

**Demonstrated live, not just unit-tested:** `artifacts/live-e2e-hardened-v10-4.studionet.json` — a real funded rail on the live contract where a 2-of-2 primary panel reached a provisional `FULFILLED`, a distinct, separately authenticated 3-of-3 counter panel reversed it to `BREACHED`, and the escrow payout changed accordingly (full principal to recipient, challenge bond returned). Reproduced independently on a **second, real wallet-signed rail** (`artifacts/browser-wallet-hardened-v10.studionet.json`, rail 2, funded `1.0 GEN`, driven by the account owner through the production UI, not a test script).

---

## 2. "Pin each publisher's DID document bytes, authorized same-origin evidence path, expected HTTP status, publisher identity, authority ID, content version, observation period, and SHA-256 evidence digest before funding. Fail closed when DID retrieval, path validation, schema validation, metadata matching, or byte hashing fails."

Every field listed is a required, individually validated member of each source object in `_validate_source`/`_validate_policy`: `did_sha256`, `service_path`, `did_http_status`/`evidence_http_status` (pinned to `200`), `publisher_id` (`did:web:<domain>`), `authority_id`, `content_version`, `observed_from`/`observed_until`, `content_sha256`. At review time, `_review()` fails closed (`TAMPERED`/`INVALID`/`UNAVAILABLE`) on: DID digest mismatch, unauthorized `#evidence` service entry, wrong path, schema drift, metadata mismatch, or byte-hash mismatch — covered by `test_forged_did_wrong_path_redirect_and_stale_metadata_fail_closed`, `test_policy_requires_pinned_success_http_status`, `test_schema_metadata_and_injection_fail_closed`, `test_missing_or_inconsistent_measurement_facts_are_invalid`.

**Obligation binding (added in response to review):** the policy additionally carries a frozen `obligation_id` (schema `proofrail.evidence-policy/v7`), and every accepted artifact (schema `proofrail.independent-attestation/v3`) must carry the identical value or is rejected `INVALID` — closing a real gap where a correctly-hashed, correctly-DID-authenticated artifact for an *unrelated* obligation could otherwise satisfy quorum. See `test_evidence_for_a_different_obligation_is_rejected_even_when_correctly_hashed`.

---

## 3. "Validate redirects and effective URLs in the release verifier; treat exact-byte cryptographic binding as the in-contract transport-independent security boundary where GenVM does not expose redirect history."

GenVM's documented web-access surface does not expose a final-response URL or redirect chain, so the contract cannot verify redirect history in-protocol. `scripts/verify_publishers.mjs` is the explicit release-time control: it performs real HTTP retrieval, rejects any redirect, and requires the final URL to equal the requested URL — run and passing against all 10 live hardened-v10 objects across all three hosting providers (Vercel, Cloudflare Pages, GitHub Pages) immediately before this document. In-contract, the frozen SHA-256 digest remains the transport-independent boundary regardless of what happened in transit. This split (release verifier owns redirect/URL checks; contract owns byte-exact content binding) is documented explicitly in `docs/SECURITY.md` and `docs/ARCHITECTURE.md`.

---

## 4. "Restrict verdicts to schema-bound, frozen numerical evidence fields and frozen outcome codes. Treat publisher outcomes as untrusted assertions, isolate evidence and challenge prose from instruction channels, and ensure payout values never enter classification."

Classification is exact integer arithmetic: `(total_seconds − unavailable_seconds) × 10,000 ÷ total_seconds` against a frozen `threshold_bps`, mapped only to the frozen `fulfilled_code`/`breached_code`. Publisher `outcome` is recorded as `asserted_code` and never influences the computed `code`. Challenge reason and evidence `statement`/`subject` are stored as bounded display strings, never parsed as instructions. Payout basis points are not visible to or usable by the classifier at all — `_settle`/`_settle_dispute` apply them only after a code is already chosen.

**Capability-claim correction (made in response to review):** earlier documentation used phrasing like "semantic classification" that could be misread as LLM/`gl.nondet.exec_prompt()`-based reasoning. All docs and UI copy now say plainly that this is deterministic integer arithmetic over schema-bound numeric facts — no model call sits on the path from evidence to outcome code. See `README.md`'s "Capability note" and `docs/SECURITY.md`.

**Obligation transparency (added in response to review):** because the human-readable `criterion` is never read by the classifier, the production UI now renders the actual machine-bound fields (`obligation_id`, metric, threshold, outcome codes) in a dedicated block, separate from the free-text criterion, in both the rail-detail view and the new-rail funding form — and funding requires the issuer to explicitly acknowledge that block before the button unlocks.

---

## 5. "Add Direct Mode and multi-validator adversarial tests for forged DID documents, unauthorized paths, redirects, stale or inconsistent metadata, malformed schemas, prompt injection, conflicting sources, unavailable retrieval, bounded retries, rollback, replay, duplicate settlement, bond routing, recovery, and principal conservation."

All present in `tests/direct/test_proofrail_direct.py` (43 tests, run via `pytest -q`):

| Area | Test(s) |
|---|---|
| Forged DID / wrong path / redirect / stale metadata | `test_forged_did_wrong_path_redirect_and_stale_metadata_fail_closed` |
| Malformed schema / prompt injection | `test_schema_metadata_and_injection_fail_closed`, `test_ambiguous_prompt_injection_is_inert_when_facts_are_complete` |
| Conflicting sources | `test_conflicting_sources_have_no_consensus` |
| Unavailable retrieval / bounded retries | `test_timeout_retry_and_validator_disagreement`, `test_retry_cap_receipt_boundaries_and_late_review` |
| Rollback | `test_failed_transfer_rolls_back_settlement`, `test_failed_dispute_transfer_preserves_escrow_and_bond`, `test_failed_recovery_transfer_preserves_locked_accounting` |
| Replay / duplicate settlement | `test_duplicate_publishers_replay_and_fund_conservation` |
| Bond routing | `test_both_parties_can_challenge_and_unchanged_outcome_forfeits_bond`, `test_issuer_successfully_challenges_overpayment` |
| Recovery | `test_unresolved_dispute_deadline_preserves_provisional_and_refunds_bond`, `test_failed_recovery_transfer_preserves_locked_accounting` |
| Principal conservation | asserted in nearly every settlement test via `accounting()["funded"]==locked+paid+returned` |
| Multi-validator agreement | `test_multiple_validators_recompute_identical_provenance` |

Added in response to later review rounds:
- `test_evidence_for_a_different_obligation_is_rejected_even_when_correctly_hashed` — obligation binding.
- `test_receipt_policy_digest_commits_to_payout_table_not_just_evidence` — receipt commits to the full policy, not evidence alone.
- `test_coordinated_identical_false_facts_pass_quorum_by_design` — demonstrates, rather than merely asserts, the documented collusion boundary: authenticated bytes prove retrieval integrity, not factual truth.
- `test_contradictory_free_text_criterion_cannot_override_frozen_structured_fields` — a criterion asserting the opposite of the real `semantic_rule` has zero effect on classification.

**Adversarial coverage was also extended to the off-chain verifier**, not just the contract, after a real bug was found there (see §6): 30 corruption tests in `tests/scripts/wallet_lifecycle_checks.test.mjs` prove the browser-wallet verifier rejects zeroed/wrong bond amounts, misrouted payouts, wrong rail IDs, mislabeled contract methods, missing execution hashes, consensus disagreement, wrong senders, duplicate hashes, non-finalized transactions, and live on-chain state that disagrees with the claimed terminal status.

---

## 6. "Provide source-matched funded Studionet evidence showing authenticated provenance, asserted versus validator-classified outcomes, finalized GenVM receipts, a bonded dispute, consensus reversal, payout, bond movement or recovery, and terminal accounting. Demonstrate the production browser flow with injected-wallet funding, claim, review, dispute, finalization, and receipt rendering."

**Source-matched runner evidence:** `artifacts/live-e2e-hardened-v10-4.studionet.json` — deployed-source SHA-256 equivalence, full per-source provenance (asserted vs. classified code, expected vs. observed digest), finalized GenVM execution hashes with `MAJORITY_AGREE` consensus on every transaction, a bonded dispute (`0.05 GEN`, 5% of `1.0 GEN` — see below), the 2-of-2→3-of-3 reversal, principal payout, bond return, and terminal accounting (`funded == locked + paid + returned`, zero residual lock).

**Production browser flow, real and wallet-signed, not simulated:** `artifacts/browser-wallet-hardened-v10.studionet.json` — the account owner drove `https://proof-rails.vercel.app` with a real injected wallet through the complete lifecycle (fund `1.0 GEN`, claim, primary review, bonded dispute, counter review, finalization, payout, bond return) and supplied all seven resulting transaction hashes.

**A real financial-record bug was found and fixed here:** the first version of this artifact recorded both the challenge bond and its return as `0`, when the real on-chain amounts (independently re-read from the finalized transactions) were `0.05 GEN` each. This was caught in review, the artifact was corrected against ground-truth chain data, and `scripts/verify_browser_wallet_candidate.mjs` was rewritten so this class of error cannot pass unnoticed again:
- It independently re-fetches all seven transactions from Studionet (not just trusting the capture file) and checks finalization, `MAJORITY_AGREE` consensus, GenVM execution-hash presence, sender, recipient, and exact value.
- It decodes each contract call's real calldata to confirm the actual method name and target rail ID — not just the capture's self-reported "action" label — catching a mislabeled function call or a call that targeted the wrong rail.
- It independently re-reads `get_rail`/`accounting` from the **live** contract (not the cached release record) and confirms the claimed terminal, conserved state still holds.

Receipt rendering is live in production: the Attestations view separates publisher assertions from validator classifications, shows expected-vs-observed SHA-256, and quorum agreement counts, for every source on every rail — verified directly in the browser against real on-chain data, not assumed from script output.

---

## 7. "Clearly distinguish technical source separation from independent real-world organizations. The protocol enforces unique domains, DIDs, authorities, and source identities; organizational independence requires separately operated, credentialed publishers or a governed authority registry."

`docs/AUTHORITY_GOVERNANCE.md` defines the actual admission standard (non-self-issued W3C VC 2.0 organizational credentials, e.g. GLEIF vLEI, active status, unique legal-entity/operator/infrastructure control, conflict disclosure) and states plainly that it is **not implemented on-chain** — admission would need to be enforced in contract execution or via a governed registry, and "ProofRail cannot issue those credentials to itself."

**Infrastructure diversity was genuinely improved**, and is reported as exactly that — not conflated with organizational independence: the five hardened-v10 publisher sources are spread across three distinct hosting providers under three distinct accounts (Vercel: `source-1-inky.vercel.app`, `source-2-ten.vercel.app`; Cloudflare Pages: `proofrail-source3.pages.dev`, `proofrail-source4.pages.dev`; GitHub Pages: `zoefunds.github.io`), removing the single-shared-Vercel-account correlation the hardened-v6/v7 fixtures had. Every doc that mentions this is explicit that it is **not organizational independence**: all three hosting accounts are reachable from this project's own development environment, and none has completed the credentialed admission process above. `hardened-v6` through `hardened-v10` are all marked `DEMONSTRATION_ONLY` for this reason.

**An approach to closing this gap was proposed and explicitly declined:** using two other individuals' personal Vercel accounts (credentials they had shared) to host additional publisher fixtures. This was not done, because it would not have established organizational independence by the standard above — those accounts would still be populated at this project's direction, which is the opposite of "separately operated." This reasoning is recorded in `docs/AUTHORITY_GOVERNANCE.md` rather than silently acted on or silently dropped.

---

## 8. "Clearly report hosted CI status separately from local release-gate results."

`docs/CI_ATTESTATION.md` reports hosted GitHub Actions as `HOSTED_CI_NOT_EXECUTED`: the account's billing lock prevents any job from starting (zero steps executed, not a code-test failure, not describable as green CI) — a condition outside this repository's control that has not changed across any review round. This is kept strictly separate from local gate results, which are run and reported fresh at every round:

| Gate | Result (this document) |
|---|---|
| `genvm-lint contracts/proofrail.py` | Passed, 3 checks |
| `pytest -q` (Direct Mode) | 43 passed |
| `npm test --prefix apps/web` | 32 passed |
| `npm run typecheck --prefix apps/web` | Passed |
| `npm run build --prefix apps/web` | Passed |
| `npm test --prefix scripts` (browser-wallet verifier corruption suite) | 30 passed |
| `PROOFRAIL_RELEASE_ID=hardened-v10 node scripts/verify_publishers.mjs` | 10/10 live objects verified |
| `PROOFRAIL_RELEASE_ID=hardened-v10 node scripts/verify_browser_wallet_candidate.mjs` | Passed (live on-chain re-verification) |
| `node scripts/verify_review_evidence.mjs` | Passed |

`.github/workflows/ci.yml` targets `hardened-v10` throughout (no stale `hardened-v6`/`v7` commands) and was re-simulated locally end-to-end from a **clean `node_modules` reinstall** for both `apps/web` and `scripts` immediately before this document — every step reproduces. That local reproduction is offered as the best available substitute for an independent hosted run while the billing block persists; it is not represented as hosted CI.

---

## Review rounds — bugs actually found and fixed, in order

This submission went through several review rounds; each round surfaced at least one genuine defect, not just documentation gaps. They are listed here because "what was fixed" is more informative than "what passes now":

1. **Funding-time counter-panel freeze** (hardened-v6 → v7): the original deployed contract accepted counterevidence at dispute time, not funding time, letting a challenger submit an arbitrary panel after the fact. Fixed by freezing the complete counter panel into rail state at `open_rail`.
2. **Autofill date-field bug**: the new-rail form's "Observed from" field is used by `submit()` as the rail's `opens_at` and is checked for *exact* equality against the policy's `observed_from` — not merely `≤`. The autofill helper set it to one day earlier, which passed the contract's own looser constraint but failed the frontend's stricter one, surfacing a confusing "periods must match" error. Fixed by setting it to the exact value.
3. **Obligation binding gap** (v8 → v9): evidence was bound to a rail only via publisher identity and observation window, not to *which obligation* the rail was about — a correctly hashed, correctly authenticated artifact for an unrelated obligation could in principle satisfy quorum. Fixed with the frozen `obligation_id` mechanism described in §2.
4. **Receipt digest scope**: `policy_digest` originally hashed only the evidence spec, not the payout table, so a receipt didn't actually commit to the complete financial terms. Fixed to hash evidence + outcomes together.
5. **Browser-wallet verifier never checked amounts at all**: the gate that was supposed to prove a real wallet-driven settlement didn't check bond or payout *values* — a capture could claim any number and pass. This let a genuine data-entry error (challenge bond and its return recorded as `0` instead of the real `0.05 GEN`) through unnoticed. Fixed with exact-amount/recipient checks plus live on-chain re-verification (§6).
6. **Browser-wallet verifier's global-accounting check broke under multi-rail usage**: it compared the contract's cumulative `paid` against one rail's `funded`, which only holds for a contract that has funded exactly one rail. Surfaced once a second real rail existed on the same contract. Fixed to check per-rail conservation plus the real, rail-count-independent global identity.
7. **`assertSuccessfulReceipt()` silently treated "execution hash present" as equivalent to an explicit success flag**, when direct inspection of live Studionet responses shows that flag is never actually populated for historical transactions in practice. Rewrote it to say so honestly and added `confirmRailState()` for independent post-transaction state read-back.
8. **Imprecise organizational-independence claims**: earlier docs asserted "controlled by the same operator/party" — a claim stronger than what could actually be verified from this environment. Corrected to the narrower, defensible fact (accounts reachable from this project's development environment, admission process not completed) without weakening the underlying compliance conclusion.
9. **Unused, misleading frontend config**: `.env.example` listed `VITE_PROOFRAIL_CONTRACT_ADDRESS` as if it configured the deployed address; the frontend never actually read it (the address is hardcoded in `contract.ts` by design). Removed the dead variable and documented the real binding; added fail-closed validation in `scripts/live_e2e.mjs` so a stale `PROOFRAIL_CONTRACT_ADDRESS` in `.env` cannot silently target a retired contract.

---

## What remains genuinely open

Stated plainly, because this project's own documentation style has consistently avoided implying otherwise:

- **Organizational independence** is not established and cannot be established by this repository alone. It requires real, separately operated, credentialed publishers or a governed authority registry — a business/legal outcome, not a code change.
- **Hosted CI** remains blocked by a GitHub account billing lock outside this repository's control. Local, reproducible, clean-install verification is the best currently available substitute.
- **`finalize()`-without-dispute and every `recover()` variant** are gated by real multi-day Studionet wall-clock windows (48h/7-day/3-day) and were not re-exercised live in a single session; they are proven against the identical contract bytecode by the Direct Mode suite's time-warped VM clock instead, and this substitution is disclosed rather than assumed away.
