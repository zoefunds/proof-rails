# ProofRail

> Evidence-bound settlement for obligations that live outside the chain.

ProofRail is a GenLayer attestation escrow. An issuer funds a rail for a named recipient and freezes a measurable criterion, payout table, observation window, publisher identity, HTTPS origin, content version, and SHA-256 digest. Validators independently retrieve the exact artifact. Only bytes matching the committed digest may enter semantic classification; deterministic contract logic maps the agreed outcome code to the frozen payout.

## Why GenLayer

Deterministic contracts can enforce funding, permissions, time windows, and arithmetic, but cannot interpret a delivery report, service incident record, or milestone attestation. A single backend or model would become a private judge. ProofRail makes independent retrieval and constrained semantic classification part of consensus while keeping money movement deterministic.

## Evidence pipeline

1. **Bind** — freeze the publisher ID, exact TLS origin, version, observation window, and SHA-256 digest before funding.
2. **Authenticate** — validators retrieve the publisher's `did:web` document, require a same-origin linked service endpoint, and record its SHA-256 digest.
3. **Retrieve** — validators independently fetch the content-addressed artifact.
4. **Verify** — each validator recomputes the digest. Changed bytes yield `TAMPERED`; missing content yields `UNAVAILABLE`. Neither reaches the model.
5. **Interpret** — matching bytes are classified against a frozen criterion and finite outcome set with human-readable definitions but no payout amounts.
6. **Receipt** — the contract records evidence and publisher-document URLs and digests, version, observation window, phase, round, timestamp, and result.
7. **Settle** — contract code applies `funded × payout_bps / 10,000`.

TLS authenticates the committed publisher origin at retrieval time; the frozen digest authenticates the exact content version selected before escrow. The receipt makes the bytes that drove settlement independently auditable.

## Lifecycle

`SCHEDULED → CLAIM_LODGED → EVIDENCE_CHECK → CHALLENGE_WINDOW → PAID | RELEASED`

A failed retrieval remains retryable inside a bounded review window. Either financial party may post the exact 5% bond and a reason to request reconsideration of the same frozen evidence. A verified successful challenge returns the bond; a verified unsuccessful challenge awards it to the counterparty. Expired draft, unreviewed, reviewing, and disputed rails all have permissionless recovery paths. If infrastructure remains unresolvable through dispute expiry, recovery preserves the provisional settlement and neutrally refunds the challenger bond.

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

Studionet contract: `0xe0eD7d02f8c0F907f342E4d3A2aF1F707EDc97dc` (chain ID `61999`). The immutable deployment record includes matching local/deployed source SHA-256 values; funded lifecycle evidence is stored in `artifacts/`.

The release runner in `scripts/live_e2e.mjs` executes funded creation, named-recipient claim, independent evidence review, reasoned bonded reconsideration, deterministic settlement, receipt verification, and accounting verification against Studionet. Scenario 4 proves a `BREACHED` result, 0.01 GEN recipient payout, successful final execution, and a 0.0095 GEN net recipient balance increase after bond disposition.

## Safety properties

- exact funding and immutable payout rules;
- one named recipient and no admin settlement path;
- publisher-origin and exact-byte binding;
- evidence treated as inert data;
- classification codes only—models cannot select amounts;
- recorded retrieval receipts for every review round;
- exact challenge bonds, bounded retry timing, and permissionless recovery;
- accounting zeroed before external transfers;
- bounded list reads and terminal-state replay protection.

See [Architecture](docs/ARCHITECTURE.md), [Security](docs/SECURITY.md), [Testing](docs/TESTING.md), and [Deployment](docs/DEPLOYMENT.md).

