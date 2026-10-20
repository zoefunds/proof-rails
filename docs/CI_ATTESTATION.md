# CI attestation and external runner blocker

## Current hosted result

The latest audited GitHub Actions run, <https://github.com/zoefunds/proof-rails/actions/runs/39464643247>, is attached to governance-evidence commit `f0aa0be9c98c3b9e36871c992e71307bc71d9ca5`. GitHub created the `contract` and `web` jobs, executed zero steps in each, and emitted this annotation for both jobs:

> The job was not started because your account is locked due to a billing issue.

This is classified as `RUNNER_STARTUP_BLOCKED`, not a test failure and not a passing CI run. The machine-readable record is `artifacts/ci-blocker.v1.json`.

## Equivalent release gate executed locally

The following release-commit inputs were run successfully:

| Gate | Command | Result |
| --- | --- | --- |
| Contract lint | `genvm-lint contracts/proofrail.py` | passed, 3 checks |
| Direct Mode | `pytest -q` | 34 passed |
| Frontend tests | `npm test --prefix apps/web` | 24 passed, 3 files |
| TypeScript | `npm run typecheck --prefix apps/web` | passed |
| Production build | `npm run build --prefix apps/web` | passed, 2,372 modules |
| Dependency audit | `npm audit --prefix apps/web --omit=dev --audit-level=high` | 0 vulnerabilities |
| Publisher retrieval | `node scripts/verify_publishers.mjs` | 10 objects verified; HTTP 200, no redirects, exact URLs and SHA-256 |
| Funded proof | `node scripts/verify_live_artifact.mjs` | source, finality, provenance, reversal, and conservation verified |
| Release manifest | `node scripts/verify_release_artifact.mjs` | release-critical byte hashes verified |

These results establish reproducibility and supply exact review evidence. They do not provide the independent execution identity that a hosted runner or separate reviewer provides.

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
