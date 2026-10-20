# Production browser-wallet walkthrough

> **Historical V5 transaction record:** the wallet transactions below were made against the earlier V5 contract. They are not a V6 wallet recording. On 2026-10-20, Chrome read-only inspection of the production V6 interface confirmed the current rail and attestation ledger render the source-matched on-chain receipts. The designated issuer wallet is now connected to a prepared V6 browser form, but funding and all later wallet transactions remain unsigned and outstanding.

On 2026-10-20 the production client at `https://proof-rails.vercel.app` completed rail PR-2 through an injected Chrome wallet on GenLayer Studionet (chain ID `61999`). This is a real write-path exercise, not a read-only rendering of runner-created state.

The issuer wallet `0x7401c129edfc26e68fe19309fe461eb3db1058eb` opened and funded PR-2 with `0.01 GEN` for recipient `0x6f0b4ce7a1872db132b2f6b7743defb30eba698a`. The recipient wallet then lodged the claim, ran the primary review, posted the exact `0.0005 GEN` challenge bond with the frozen three-source counterevidence manifest, and ran dispute review. Each UI action displayed submitted/pending and finalized states before the next action became available.

The primary receipt verified two sources and recorded the deliberately misleading publisher assertions (`BREACHED`) separately from the validator classifications (`FULFILLED`). The dispute receipt verified all three counter-sources and again separated their misleading assertions (`FULFILLED`) from validator classifications (`BREACHED`). Consensus therefore changed the provisional result from `FULFILLED` to terminal `BREACHED`, paid the `0.01 GEN` escrow to the recipient, and returned the successful challenger bond.

Captured finalized transaction receipts:

| Browser action | Transaction |
| --- | --- |
| Lodge claim | `0x7c72e1ba9ca29a56380ab4190df042dc239e969e003f144feb477002074d4d19` |
| Primary validator review | `0xf643957c7dddf641f0701594f5474fffa6087f2ba923b326b16e067d90c79c1a` |
| Counterevidence review and payout | `0xe6fe8ee3362a5cc5c38d4ded4e64b7e63e907ad35cccc323c210b599b449fda1` |

`artifacts/browser-wallet-pr2.studionet.json` records the historical V5 addresses, amounts, observation period, quorum results, assertions, classifications, and terminal state. The current V6 runner capture is `artifacts/live-receipts.hardened-v6.studionet.json`, which includes finalized execution evidence, accounting, payout, and source receipts. The V5 browser recording does not establish that the current V6 browser flow was exercised.

## Current V6 production read-only check

The production site at `https://proof-rails.vercel.app` loaded contract `0x7F21Cfd207C7843078c99a05d4F0cF3e0fcb8986` on Studionet. The control room showed one terminal `PAID` rail, `0.01 GEN` total funded and paid, and zero locked principal or bonds. The rail view showed provisional `FULFILLED`, terminal `BREACHED`, a 2/2 primary quorum and 3/3 counter quorum. The Attestations page rendered all five V6 source receipts, including publisher assertion and validator classification as separate fields, each source's DID hash, and equal expected/observed artifact hashes.

This was a read-only inspection of the already finalized runner-created rail. In the latest browser preparation, the owner designated `0x7401c129EDfc26E68FE19309fE461eb3Db1058Eb` as issuer and `0x6f0b4cE7a1872db132b2F6B7743deFb30eBa698a` as recipient. The connected issuer label ends in `58Eb`, matching the designated issuer. The form is prepared with the frozen two-source primary policy, `0.01 GEN` maximum escrow, and matching observation period; this preparation is not a funding authorization. The funding button has not been pressed and no V6 browser transaction has been submitted or signed. Funding requires the issuer's wallet signature; claim and later review/dispute transactions will require the appropriate wallet actions. See `artifacts/live-receipts.hardened-v6.studionet.json` for the separate runner-created finalized transactions.

No private key, seed phrase, or wallet secret is stored in the repository or browser bundle.
