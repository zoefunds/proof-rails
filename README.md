# ProofRail

> Evidence-bound settlement for obligations that live outside the chain.

ProofRail is a GenLayer attestation escrow. An issuer funds a rail for a named recipient and freezes a measurable criterion, payout table, observation window, publisher identity, HTTPS origin, content version, and SHA-256 digest. Validators independently retrieve the exact artifact. Only bytes matching the committed digest may enter semantic classification; deterministic contract logic maps the agreed outcome code to the frozen payout.

## Why GenLayer

Deterministic contracts can enforce funding, permissions, time windows, and arithmetic, but cannot interpret a delivery report, service incident record, or milestone attestation. A single backend or model would become a private judge. ProofRail makes independent retrieval and constrained semantic classification part of consensus while keeping money movement deterministic.

## Evidence pipeline

1. **Bind** — freeze the publisher ID, exact TLS origin, version, observation window, and SHA-256 digest before funding.
2. **Retrieve** — validators independently fetch the content-addressed artifact.
3. **Verify** — each validator recomputes the digest. Changed bytes yield `TAMPERED`; missing content yields `UNAVAILABLE`. Neither reaches the model.
4. **Interpret** — matching bytes are classified against a frozen criterion and finite outcome set.
5. **Receipt** — the contract records URL, publisher, version, expected and observed digest, observation window, phase, round, timestamp, and result.
6. **Settle** — contract code applies `funded × payout_bps / 10,000`.

TLS authenticates the committed publisher origin at retrieval time; the frozen digest authenticates the exact content version selected before escrow. The receipt makes the bytes that drove settlement independently auditable.

## Lifecycle

`SCHEDULED → CLAIM_LODGED → EVIDENCE_CHECK → CHALLENGE_WINDOW → PAID | RELEASED`

A failed retrieval remains retryable inside a bounded review window. Either financial party may post the exact 5% bond to request a second review. A successful challenge returns the bond; an unsuccessful challenge awards it to the counterparty. Expired unopened or unresolved rails can be recovered permissionlessly.

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

Studionet contract: `0xc323678aF48503F3CF3F99C0Ba58dc90A68Cf78c` (chain ID `61999`). The deployment and three complete finalized lifecycle records are stored in `artifacts/`.

The release runner in `scripts/live_e2e.mjs` executes a funded creation, named-recipient claim, independent evidence review, bonded second review, deterministic settlement, receipt verification, and accounting verification against Studionet. It writes the complete transaction and state record to `artifacts/live-e2e.studionet.json`.

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

