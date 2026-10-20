# ProofRail

> Evidence-bound settlement for obligations that live outside the chain.

ProofRail is a GenLayer evidence escrow. A funder freezes a measurable criterion, payout table, observation window, and both primary and counter-source quorums in one policy before funding. Every source in both panels pins its publisher DID bytes, authorized HTTPS path, expected status, version, period, and evidence digest. Validators evaluate authenticated structured measurements against the frozen numerical rule; deterministic contract logic alone maps consensus to payout.

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

The historical Studionet demonstration is deployed at `0x7F21Cfd207C7843078c99a05d4F0cF3e0fcb8986` (chain ID `61999`). Its source SHA-256 was `4610fccc254641a69eefbf47dc4ad9fd398be79380513de3959a228d8720c22e`. That implementation froze the counter panel at dispute time rather than funding time; the old address and receipts must not be represented as containing the fix below.

The corrected `hardened-v7` candidate, which requires the complete counter panel to be frozen before funding, was deployed and funded at `0xC217A00E471368E005A624B926bC5A13B267c7F4` and is now retired in favor of `hardened-v8` below.

`hardened-v8` is the same corrected source (SHA-256 `5e88ce4cc4cb88747f76a4ad1cb5ecdd960fa99e7293e00d45bb2350a6fc235c`) with its five publisher sources spread across three distinct hosting providers/accounts instead of one shared Vercel account: Vercel (`source-1-inky.vercel.app`, `source-2-ten.vercel.app`), Cloudflare Pages (`proofrail-source3.pages.dev`, `proofrail-source4.pages.dev`), and GitHub Pages (`zoefunds.github.io`). It is now **deployed and funded** at `0xE91096019eBf3a4E96654a2Ab7649d6002E073b6` (chain ID `61999`), and is the address the production browser points at. `PROOFRAIL_RELEASE_ID=hardened-v8 node scripts/verify_candidate_policy.mjs` validates its pre-funded panels locally, and `PROOFRAIL_RELEASE_ID=hardened-v8 node scripts/verify_publishers.mjs` has verified all ten live DID/evidence objects across all three providers with exact URLs, no redirects, HTTP 200, and matching SHA-256 values. A funded rail (`artifacts/live-e2e-hardened-v8-4.studionet.json`) exercised the same 2-of-2 primary `FULFILLED` → distinct 3-of-3 counterevidence `BREACHED` reversal as v7, with GenVM's own validators independently retrieving evidence from all three providers. See [Deployment](docs/DEPLOYMENT.md) and [Evidence status](docs/EVIDENCE_STATUS.md).

`artifacts/live-receipts.hardened-v6.studionet.json` is a historical source-matched funded record for the deployed implementation. It demonstrates consensus reversal and payout, but its counter panel was committed at dispute time rather than when funding occurred. It is not evidence for the current pre-funded dual-panel invariant.

Spreading the five publisher origins across three hosting providers removes the single-shared-Vercel-account correlation that v6/v7 had, but they are still `DEMONSTRATION_ONLY`, not proof of independent organizations — all three accounts are controlled by the same operator. [Authority governance](docs/AUTHORITY_GOVERNANCE.md) defines the separately operated, credentialed publisher admission requirement that actually establishes independence. Hosted CI is likewise not green: its jobs are blocked before steps begin by a GitHub account billing lock; see [CI attestation](docs/CI_ATTESTATION.md).

The V6 production injected-wallet flow has completed on Studionet for rail 2 under that historical implementation: issuer funding, recipient claim and primary review, bonded dispute, counter review, 0.01 GEN payout, and 0.0005 GEN bond return. Its capture remains useful historical evidence and passes structural verification, but cannot prove the candidate's corrected funding-time counter-panel freeze; a new deployment and wallet-signed lifecycle are still required.

Historical V5 artifacts are retained for audit only: `artifacts/live-e2e-4.studionet.json`, `artifacts/browser-wallet-pr2.studionet.json`, and `artifacts/release-verification.v5.json`. They must not be treated as hardened-v6 transaction evidence.

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

See [Architecture](docs/ARCHITECTURE.md), [Authority governance](docs/AUTHORITY_GOVERNANCE.md), [Security](docs/SECURITY.md), [Testing](docs/TESTING.md), [CI attestation](docs/CI_ATTESTATION.md), [evidence-record status](docs/EVIDENCE_STATUS.md), [browser walkthrough](docs/BROWSER_WALKTHROUGH.md), and [Deployment](docs/DEPLOYMENT.md).

