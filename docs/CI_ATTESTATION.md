# CI attestation and external runner blocker

## Current hosted result

The latest audited GitHub Actions run, <https://github.com/zoefunds/proof-rails/actions/runs/39483030368>, is attached to CI-attestation commit `01d9591f0e6faf141301384afe6bae0278710ca6`. GitHub created the `contract` and `web` jobs, executed zero steps in each, and emitted this annotation for both jobs. The hardened implementation itself is commit `2fc32738e8786f23060a23277546f6f991dfb3ff`; its run is [39482917952](https://github.com/zoefunds/proof-rails/actions/runs/39482917952) and had the same startup block.

> The job was not started because your account is locked due to a billing issue.

This is classified as `RUNNER_STARTUP_BLOCKED`, not a test failure and not a passing CI run. The machine-readable record is `artifacts/ci-blocker.v1.json`.

## Equivalent release gate executed locally

The following release-commit inputs were run successfully:

| Gate | Command | Result |
| --- | --- | --- |
| Contract lint | `genvm-lint contracts/proofrail.py` | passed, 3 checks |
| Direct Mode | `pytest -q` | 37 passed |
| Frontend tests | `npm test --prefix apps/web` | 26 passed, 3 files |
| TypeScript | `npm run typecheck --prefix apps/web` | passed |
| Production build | `npm run build --prefix apps/web` | passed, 2,372 modules |
| Production dependency audit | `npm audit --prefix apps/web --omit=dev --audit-level=high` | passed on 2026-10-20: zero advisories |
| Full dependency audit | `npm audit --prefix apps/web` | completed on 2026-10-20: 3 development-dependency advisories (1 moderate, 2 critical), in Vitest-related tooling; this is not a clean full-graph result |
| Hardened-v6 publisher retrieval | `PROOFRAIL_RELEASE_ID=hardened-v6 node scripts/verify_publishers.mjs` | passed on 2026-10-20: 10 objects, HTTP 200, no redirects, exact final URLs, and matching SHA-256 |
| Funded V6 receipt proof | `PROOFRAIL_RELEASE_ID=hardened-v6 node scripts/verify_live_receipts.mjs` | passed: finalized deployment, 2/2→3/3 reversal, payout, bond return, and terminal conservation |
| Source equivalence and lifecycle | `node scripts/verify_live_artifact.mjs` | passed: source hash, finality, provenance, reversal, and balance conservation |
| Governance evidence | `node scripts/verify_review_evidence.mjs` | passed: organizational-independence scope and current zero-step CI blocker |

These results establish reproducibility and supply exact review evidence. `scripts/verify_release_artifact.mjs` and `artifacts/release-verification.v5.json` remain historical V5 records; that verifier intentionally rejects the current source because it is bound to old V5 bytes and results. The hosted workflow now runs the hardened-v6 publisher and receipt verifiers instead. Local checks do not provide the independent execution identity that a hosted runner or separate reviewer provides.

## Reviewer decision rule

An automated or human review should evaluate the states separately:

- `LOCAL_RELEASE_GATE_GREEN`: repository commands and byte-level verifiers passed.
- `HOSTED_CI_NOT_EXECUTED`: GitHub executed zero steps because of an account-level billing lock.
- `HOSTED_CI_GREEN`: **not yet achieved**.

The repository must never translate `RUNNER_STARTUP_BLOCKED` into a successful check. Once billing is restored, rerun the workflow at the same commit. A valid final submission includes both green jobs, nonempty step lists, and a run whose `headSha` equals the submitted commit.

## Future provenance

After hosted execution is restored, the workflow should issue GitHub artifact attestations for the release manifest. GitHub artifact attestations use Sigstore, and SLSA provenance can bind produced artifacts to the hosted build identity. This requires a running GitHub job and OIDC permissions, so it cannot be truthfully generated while the account is locked.

References:

- <https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/verify-attestations-offline>
- <https://slsa.dev/spec/v1.2/provenance>
