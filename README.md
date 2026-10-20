# ProofRail

> Evidence-bound settlement for obligations that live outside the chain.

ProofRail is a GenLayer evidence escrow. A funder freezes a measurable criterion, payout table, observation window, and separate primary and counter-source quorums. Every source pins its publisher DID bytes, authorized HTTPS path, version, period, and evidence bytes. Validators semantically classify authenticated statements against the frozen criterion; deterministic contract logic alone maps consensus to payout.

## Why GenLayer

Deterministic contracts can enforce funding, permissions, time windows, and arithmetic, but external facts still require authenticated observations. A single issuer-selected backend would become a private judge. ProofRail makes independent, digest-bound retrieval and semantic classification part of consensus. Publisher outcome codes remain visible assertions but never decide settlement.

## Evidence pipeline

1. **Bind** — freeze the publisher ID, exact TLS origin, version, observation window, and SHA-256 digest before funding.
2. **Authenticate** — validators retrieve the publisher's `did:web` document, require a same-origin linked service endpoint, and record its SHA-256 digest.
3. **Retrieve** — validators independently fetch the content-addressed artifact.
4. **Verify** — each validator recomputes both digests. Digest mismatch yields `TAMPERED`, schema/metadata failure yields `INVALID`, and retrieval/classification failure yields `UNAVAILABLE`.
5. **Classify** — the statement is quoted as untrusted data. Validators receive the criterion and outcome descriptions, never payout values, and must return one frozen code with `HIGH` confidence under an exact response schema.
6. **Receipt** — the contract records asserted, verified, and agreeing counts plus the full per-source provenance manifest.
7. **Settle** — contract code applies `funded × payout_bps / 10,000`.

TLS authenticates the committed publisher origin at retrieval time; the frozen digest authenticates the exact content version selected before escrow. The receipt makes the bytes that drove settlement independently auditable.

## Lifecycle

`SCHEDULED → CLAIM_LODGED → EVIDENCE_CHECK → CHALLENGE_WINDOW → PAID | RELEASED`

A failed retrieval remains retryable inside a bounded review window. Either financial party may post the exact 5% bond, a reason, and independently authenticated counterevidence covering the same observation period. A verified successful challenge returns the bond; a verified unsuccessful challenge awards it to the counterparty. Expired flows have permissionless recovery, and an unresolvable dispute preserves the provisional settlement while neutrally refunding the challenger bond.

## Repository

```text
contracts/proofrail.py          Intelligent Contract
tests/direct/                   Direct Mode lifecycle and integrity tests
apps/web/                       React attestation control room
docs/                           Architecture, security, and testing notes
.github/workflows/ci.yml        Contract and frontend checks
```

## Run locally

Python 3.12+:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest -q
genvm-lint contracts/proofrail.py
```

Frontend:

```bash
npm install --prefix apps/web
npm run dev --prefix apps/web
npm test --prefix apps/web
npm run typecheck --prefix apps/web
npm run build --prefix apps/web
```

Copy `.env.example` to `.env` and provide the deployed address. The browser uses an injected external wallet and never handles private keys.

Production console: `https://proof-rails.vercel.app`

Studionet v5 contract: `0xa8533cC75600637a824B9A34EB5ddE9d38A6aBe6` (chain ID `61999`). The finalized deployment and local source both hash to `feaecbd181cca305c1f1035509eba5897da9e6a284aa6257bbf5797df0151381`.

`artifacts/live-e2e-4.studionet.json` is the funded v5 proof. Two pinned primary publishers produced `FULFILLED`; three authenticated counter-publishers changed the counter-panel consensus to `BREACHED`. All five transactions reached majority agreement with GenVM execution hashes, 0.01 GEN was paid, and no principal or bond remained locked. The canonical production browser is live at `https://proof-rails.vercel.app`.

Local release verification is green. The current GitHub Actions run did not start because GitHub reports an account-level billing lock; see [Deployment](docs/DEPLOYMENT.md#ci-status) for the exact status. This repository does not claim a passing hosted run until GitHub executes the jobs.

## Safety properties

- exact funding and immutable payout rules;
- one named recipient and no admin settlement path;
- publisher-origin and exact-byte binding;
- evidence isolated as quoted untrusted data and challenge prose excluded from classification;
- publisher codes are assertions only; exact-schema validator classifications select results without seeing amounts;
- recorded retrieval receipts for every review round;
- exact challenge bonds, bounded retry timing, and permissionless recovery;
- an explicit transfer callback guard plus transaction atomicity protects settlement before accounting is committed;
- bounded list reads and terminal-state replay protection.

See [Architecture](docs/ARCHITECTURE.md), [Security](docs/SECURITY.md), [Testing](docs/TESTING.md), and [Deployment](docs/DEPLOYMENT.md).

