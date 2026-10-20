# ProofRail

> Evidence-bound settlement for obligations that live outside the chain.

ProofRail is a GenLayer evidence escrow. A funder freezes a measurable criterion, payout table, observation window, and separate primary and counter-source quorums. Every source pins its publisher DID bytes, authorized HTTPS path, version, period, and evidence bytes. Validators evaluate authenticated structured measurements against the frozen numerical rule; deterministic contract logic alone maps consensus to payout.

## Why GenLayer

Deterministic contracts can enforce funding, permissions, time windows, and arithmetic, but external facts still require authenticated observations. A single issuer-selected backend would become a private judge. ProofRail makes independent, digest-bound retrieval and semantic classification part of consensus. Publisher outcome codes remain visible assertions but never decide settlement.

## Evidence pipeline

1. **Bind** — freeze the publisher ID, exact TLS origin, version, observation window, and SHA-256 digest before funding.
2. **Authenticate** — validators retrieve the publisher's `did:web` document, require a same-origin linked service endpoint, and record its SHA-256 digest.
3. **Retrieve** — validators independently fetch the content-addressed artifact.
4. **Verify** — each validator recomputes both digests. Digest mismatch yields `TAMPERED`, schema/metadata failure yields `INVALID`, and retrieval/classification failure yields `UNAVAILABLE`.
5. **Classify** — validators calculate uptime basis points from exact structured facts and map the result only to frozen codes. Statements, publisher declarations, model output, and payout values cannot influence classification.
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

Studionet v5 contract: `0x3D320749926Ef3E4258adb404B25bc8d29ACF0CC` (chain ID `61999`). The finalized deployment and local source both hash to `f460ea0a246772894f710760899ec4416e76ad0ae48a67149eb3bb5af875cc59`.

`artifacts/live-e2e-4.studionet.json` is the funded v5 proof. Two primary measurements calculated above the frozen 99.90% threshold despite `BREACHED` publisher declarations; three counter-measurements calculated below it despite `FULFILLED` declarations and changed the verdict to `BREACHED`. All five transactions reached majority agreement with GenVM execution hashes, 0.01 GEN was paid, and no principal or bond remained locked. The canonical production browser is live at `https://proof-rails.vercel.app`.

Rail PR-2 independently exercised that lifecycle through the production Chrome UI with injected issuer and recipient wallets. It finalized a 0.01 GEN escrow, 0.0005 GEN challenge bond, 2/2 primary receipt, 3/3 counter receipt, and consensus change from `FULFILLED` to terminal `BREACHED`. See [production browser-wallet walkthrough](docs/BROWSER_WALKTHROUGH.md) and `artifacts/browser-wallet-pr2.studionet.json`.

`artifacts/release-verification.v5.json` binds the reviewed implementation commit to the exact contract, deployment, funded proof, policy, counterevidence, and frontend configuration bytes. `node scripts/verify_release_artifact.mjs` rejects any drift.

The organizational-admission policy and audited CI-blocker evidence were added in commit `f0aa0be9c98c3b9e36871c992e71307bc71d9ca5`. The five hosted fixtures remain explicitly demonstration-only; production organizational independence requires separately controlled publishers holding admissible third-party credentials. This is presently an onboarding/release gate, not on-chain credential verification; the deployed contract enforces technical identity uniqueness only.

Local release verification is green. The current GitHub Actions run did not start because GitHub reports an account-level billing lock; see [CI attestation](docs/CI_ATTESTATION.md) for the zero-step job evidence and exact reviewer decision rule. This repository does not claim a passing hosted run until GitHub executes the jobs.

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

See [Architecture](docs/ARCHITECTURE.md), [Authority governance](docs/AUTHORITY_GOVERNANCE.md), [Security](docs/SECURITY.md), [Testing](docs/TESTING.md), [CI attestation](docs/CI_ATTESTATION.md), [browser walkthrough](docs/BROWSER_WALKTHROUGH.md), and [Deployment](docs/DEPLOYMENT.md).

