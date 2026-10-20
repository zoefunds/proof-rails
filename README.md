# ProofRail

> Evidence-bound settlement for obligations that live outside the chain.

ProofRail is a GenLayer attestation escrow. A funder freezes a measurable criterion, payout table, observation window, and an independent-source quorum. Every source pins its publisher DID bytes, authorized HTTPS path, version, period, and evidence bytes. Authenticated counterevidence can change a contested outcome; deterministic contract logic alone maps consensus to payout.

## Why GenLayer

Deterministic contracts can enforce funding, permissions, time windows, and arithmetic, but external facts still require authenticated observations. A single issuer-selected backend would become a private judge. ProofRail makes independent, digest-bound retrieval part of consensus and accepts only exact-schema publisher outcomes while keeping money movement deterministic.

## Evidence pipeline

1. **Bind** — freeze the publisher ID, exact TLS origin, version, observation window, and SHA-256 digest before funding.
2. **Authenticate** — validators retrieve the publisher's `did:web` document, require a same-origin linked service endpoint, and record its SHA-256 digest.
3. **Retrieve** — validators independently fetch the content-addressed artifact.
4. **Verify** — each validator recomputes both digests. Changed bytes yield `TAMPERED`; missing or malformed content yields `UNAVAILABLE`.
5. **Validate** — only an exact `proofrail.independent-attestation/v2` object whose publisher, authority, source, version, period, and outcome match the frozen commitment can vote.
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

Studionet v4 contract: `0x7d61a7BaD67904Db4C46c8108b77C42D03908daC` (chain ID `61999`). The finalized deployment and local source both hash to `2ee60390f63982855417cb36c8454b06fe3dae3f660aad8b4142baedd341a259`.

`artifacts/live-e2e-4.studionet.json` is the funded v4 proof. Two pinned primary publishers produced `FULFILLED`; three authenticated counter-publishers changed the five-source consensus to `BREACHED`. All five transactions reached majority agreement with GenVM execution hashes, 0.01 GEN was paid, and no principal or bond remained locked. The canonical production browser is live at `https://proof-rails.vercel.app`.

## Safety properties

- exact funding and immutable payout rules;
- one named recipient and no admin settlement path;
- publisher-origin and exact-byte binding;
- evidence treated as inert data;
- exact-schema outcome codes only—untrusted prose cannot select results or amounts;
- recorded retrieval receipts for every review round;
- exact challenge bonds, bounded retry timing, and permissionless recovery;
- external transfers complete before settlement accounting is committed, with transaction-level rollback;
- bounded list reads and terminal-state replay protection.

See [Architecture](docs/ARCHITECTURE.md), [Security](docs/SECURITY.md), [Testing](docs/TESTING.md), and [Deployment](docs/DEPLOYMENT.md).

