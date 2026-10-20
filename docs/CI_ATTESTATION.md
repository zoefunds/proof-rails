# CI status and release-gate record

## Status summary

| Signal | Current documented state | Meaning |
| --- | --- | --- |
| GitHub Actions hosted CI | `HOSTED_CI_NOT_EXECUTED` | Latest inspected run never started either job; GitHub blocked runner startup on the account billing lock. This is neither a passing run nor a code-test failure. |
| Local contract and application gates | `LOCAL_RELEASE_GATE_GREEN` | Lint, Direct Mode, frontend tests, TypeScript, production build, release evidence verifiers, and local dependency audit pass as recorded below. |
| Independent hosted verification | `NOT_ESTABLISHED` | No hosted job execution or artifact attestation exists for the current release evidence. |

The repository owner has said the GitHub billing lock cannot be cleared now. Accordingly, hosted CI is documented as externally blocked and will remain unverified until GitHub permits jobs to start. No CI result is fabricated or inferred from local execution.

## Latest inspected hosted run

The latest inspected run record is [GitHub Actions run 39488889898](https://github.com/zoefunds/proof-rails/actions/runs/39488889898), workflow `verify`, attached to commit `35bd3d1306c93c60e84cfedf704695216a8fa8ab`. Inspection recorded at `2026-10-20T20:04:42Z` showed:

| Job | Job ID | Result | Steps executed |
| --- | ---: | --- | ---: |
| `contract` | `118856415204` | Runner startup blocked | 0 |
| `web` | `118856414910` | Runner startup blocked | 0 |

GitHub's annotation was: “The job was not started because your account is locked due to a billing issue.” The run's overall failure conclusion means the workflow could not execute; it must not be described as failed tests or as a green check. The same blocker was recorded for [run 39482917952](https://github.com/zoefunds/proof-rails/actions/runs/39482917952) on hardened implementation commit `2fc32738e8786f23060a23277546f6f991dfb3ff`.

The machine-readable observation, including the run URL, commit, timestamp, job IDs, zero step counts, exact annotation, interpretation, and remediation condition, is [`artifacts/ci-blocker.v1.json`](../artifacts/ci-blocker.v1.json). The repo's current HEAD may be newer than the commit of that last inspected run; the record does not claim that the current HEAD has a hosted result. A later no-op/docs commit uses `[skip ci]`, and the latest browser evidence commit was pushed after the recorded run. The current working workflow therefore requires a new hosted run once GitHub allows it.

## Current workflow contract

The authoritative workflow is [`.github/workflows/ci.yml`](../.github/workflows/ci.yml), named `verify`, triggered on pushes and pull requests. It defines two independent Ubuntu jobs:

| Job | Steps configured in the current workflow |
| --- | --- |
| `contract` | Checkout; set up Python 3.12; install `requirements.txt`; run `genvm-lint contracts/proofrail.py`; run `pytest -q` (Direct Mode adversarial suite). |
| `web` | Checkout; set up Node.js 22 with npm cache; `npm ci --prefix apps/web`; run frontend tests, TypeScript typecheck, and production build; run production dependency audit (`npm audit --prefix apps/web --omit=dev --audit-level=high`); verify historical deployment/artifact integrity; verify preserved historical source manifests; verify governance/CI-blocker evidence; verify historical V6 production injected-wallet capture. |

The browser capture verifier was added after run 39488889898, so it has only a passing local result at present. No claim is made that this latest workflow revision has run on GitHub.

## Local release-gate results

The following repository gates have passed locally. These results are useful review evidence, but they do not replace the independent runner identity of hosted CI.

| Gate | Command | Latest recorded/observed result |
| --- | --- | --- |
| Contract static lint | `genvm-lint contracts/proofrail.py` | Passed, 3 checks (rerun during this audit). |
| Direct Mode suite | `pytest -q` | 38 passed (rerun during this audit). |
| Frontend suite | `npm test --prefix apps/web` | 26 passed across 3 files (rerun during this audit). |
| TypeScript | `npm run typecheck --prefix apps/web` | Passed (rerun during this audit). |
| Production bundle | `npm run build --prefix apps/web` | Passed; 2,372 modules transformed (rerun during this audit). Vite emitted a non-fatal large-chunk advisory. |
| Full dependency audit | `npm audit --prefix apps/web --audit-level=low` | Zero vulnerabilities after Vitest update to `5.0.5` (previously verified); offline audit also returned zero during this audit. |
| Production dependency audit | `npm audit --prefix apps/web --omit=dev --audit-level=high` | Zero vulnerabilities on 2026-10-20 (previously verified; not an independent hosted result). |
| Live publisher verification | `PROOFRAIL_RELEASE_ID=hardened-v6 node scripts/verify_publishers.mjs` | Removed from the candidate's required local workflow because its artifact schema remains historical v5. Fresh v6 publisher manifests and deployments must be generated before live provenance is claimed. |
| Source-matched funded receipt | `PROOFRAIL_RELEASE_ID=hardened-v6 node scripts/verify_live_receipts.mjs` | Correctly rejects the modified candidate source because its SHA-256 differs from the deployed historical source. Not a candidate deployment proof. |
| Deployed source/lifecycle artifact | `node scripts/verify_live_artifact.mjs` | Passes historical record integrity and explicitly identifies that current candidate source is not the deployed source. |
| Candidate policy manifest | `PROOFRAIL_RELEASE_ID=hardened-v7 node scripts/verify_candidate_policy.mjs` | Passed locally; validates the published v6 dual-panel manifest shape and cross-panel identities. It is not funded/deployed proof. |
| Candidate publisher retrieval | `PROOFRAIL_RELEASE_ID=hardened-v7 node scripts/verify_publishers.mjs` | Passed locally against 10 live objects after the five Vercel publisher aliases were updated: exact URL/no redirect, HTTP 200, DID and evidence SHA-256 matched. |
| Governance and blocker record | `node scripts/verify_review_evidence.mjs` | Passed during this audit. |
| V6 production browser capture | `node scripts/verify_browser_wallet_evidence.mjs` | Passes as a historical capture; it is not source-matched to the current candidate contract. |

The locally executed Direct Mode suite covers forged DID content, wrong/unauthorized paths, redirects, stale or inconsistent metadata, malformed schemas, prompt injection, conflicting sources, unavailable retrieval, bounded retries, validator disagreement, rollback, replay, bond routing/recovery, and principal conservation. The V6 browser capture is a separate production wallet lifecycle from the source-matched runner rail; both have dedicated evidence records and verifiers.

## Resume condition and reporting rule

No repository change can clear an account-level GitHub billing lock. When the owner can restore GitHub billing/service, the release commit must be pushed or a workflow rerun dispatched for the exact intended commit. Then verify that:

1. the run's `headSha` is that commit;
2. both `contract` and `web` jobs actually start and finish successfully;
3. their step lists are nonempty and contain the configured gates above; and
4. no new failed, skipped, or cancelled required job is treated as green.

Until those conditions hold, report `HOSTED_CI_NOT_EXECUTED` separately from local results. Do not describe the billing blocker as a CI pass or as a repository test failure. This task will not retry/dispatch GitHub runs while the user has said the billing issue cannot be cleared now.

## Provenance limits

Because no hosted job started, there is no current-run GitHub artifact attestation, runner-generated SBOM, or hosted provenance statement. Such evidence must be generated by a successful authorized workflow with appropriate OIDC permissions; it cannot be recreated from a local run and represented as GitHub provenance. The source-matched Studionet records are chain/explorer evidence and are not hosted-CI attestations.

The V6 publisher sites have distinct technical domains, DIDs, authority IDs, and source identities but share one Vercel account. Their evidence demonstrates technical source separation only, not independent real-world organizations. See [authority governance](AUTHORITY_GOVERNANCE.md).

## Historical workflow records

[`artifacts/release-verification.v5.json`](../artifacts/release-verification.v5.json) and `scripts/verify_release_artifact.mjs` describe a historical V5 manifest and intentionally bind to old source bytes/results. They are not evidence of the hardened V6 hosted status. Current V6 source and lifecycle checks are the workflow commands listed above.
