# Production browser-wallet walkthrough

On 2026-10-20 the production client at `https://proof-rails.vercel.app` completed rail PR-2 through an injected Chrome wallet on GenLayer Studionet (chain ID `61999`). This is a real write-path exercise, not a read-only rendering of runner-created state.

The issuer wallet `0x7401c129edfc26e68fe19309fe461eb3db1058eb` opened and funded PR-2 with `0.01 GEN` for recipient `0x6f0b4ce7a1872db132b2f6b7743defb30eba698a`. The recipient wallet then lodged the claim, ran the primary review, posted the exact `0.0005 GEN` challenge bond with the frozen three-source counterevidence manifest, and ran dispute review. Each UI action displayed submitted/pending and finalized states before the next action became available.

The primary receipt verified two sources and recorded the deliberately misleading publisher assertions (`BREACHED`) separately from the validator classifications (`FULFILLED`). The dispute receipt verified all three counter-sources and again separated their misleading assertions (`FULFILLED`) from validator classifications (`BREACHED`). Consensus therefore changed the provisional result from `FULFILLED` to terminal `BREACHED`, paid the `0.01 GEN` escrow to the recipient, and returned the successful challenger bond.

Captured finalized transaction receipts:

| Browser action | Transaction |
| --- | --- |
| Lodge claim | `0x7c72e1ba9ca29a56380ab4190df042dc239e969e003f144feb477002074d4d19` |
| Primary validator review | `0xf643957c7dddf641f0701594f5474fffa6087f2ba923b326b16e067d90c79c1a` |
| Counterevidence review and payout | `0xe6fe8ee3362a5cc5c38d4ded4e64b7e63e907ad35cccc323c210b599b449fda1` |

`artifacts/browser-wallet-pr2.studionet.json` records the addresses, amounts, observation period, quorum results, assertions, classifications, and terminal state. The production Attestations view is the reproducible receipt display for all five PR-2 sources. `artifacts/live-e2e-4.studionet.json` remains the canonical source-matched artifact for complete transaction execution hashes, balance deltas, and conservation accounting.

No private key, seed phrase, or wallet secret is stored in the repository or browser bundle.
