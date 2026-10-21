# Production browser-wallet walkthrough

## Hardened-v10 injected-wallet lifecycle — Studionet rail 2 (current)

On 2026-10-21, the production client at [`https://proof-rails.vercel.app`](https://proof-rails.vercel.app) completed a real injected-wallet lifecycle on the current `hardened-v10` contract (`0x0dd0e186c7C509c8E94E38A6536B78A0754fB4c9`, chain ID `61999`). Issuer `0x6f0b4cE7a1872db132b2F6B7743deFb30eBa698a` funded rail 2 with `1.0 GEN`; recipient/challenger `0x7401c129EDfc26E68FE19309fE461eb3Db1058Eb` lodged the claim, triggered primary review, posted the exact `0.05 GEN` (5%) challenge bond using the same pre-committed three-source counter panel frozen into the policy at funding, triggered counter review, and received both the `1.0 GEN` principal and the full `0.05 GEN` bond back. All seven transactions were finalized.

The primary review authenticated two sources, each bound to the policy's frozen `obligation_id`: both publishers asserted `BREACHED`, while validators classified the frozen numerical facts as `FULFILLED` (2 verified, 2 agreeing). The separately authenticated, pre-funded counter panel authenticated three sources: all asserted `FULFILLED`, while validators classified the facts as `BREACHED` (3 verified, 3 agreeing). This reversed the provisional result and selected the committed `BREACHED` payout.

| Browser action | Finalized Studionet transaction |
| --- | --- |
| Open/fund rail | [`0x9b5030…f91b6555`](https://explorer-studio.genlayer.com/tx/0x9b503073c9f066c6c65529190ebbc492a6059fc3d3915676f100ccf1f91b6555) |
| Lodge claim | [`0xc63a15…0463a263a`](https://explorer-studio.genlayer.com/tx/0xc63a15182b7ebf13e449d815ad909f11e64efe9e64932f090496d1d0463a263a) |
| Primary review | [`0x5c819c…8c7c194eb`](https://explorer-studio.genlayer.com/tx/0x5c819c58ca54912329bb1126d9d109aedcdf8b29464ee36a72bf9ce8c7c194eb) |
| Bonded dispute (`0.05 GEN`) | [`0xd48480…56750de90`](https://explorer-studio.genlayer.com/tx/0xd48480bc2d3379c24736e76626b2b0bc2a956ea7e3f4a8f676f237856750de90) |
| Counter review and reversal | [`0xd9b387…91db56adf`](https://explorer-studio.genlayer.com/tx/0xd9b387eebcfa5b5f07bbebed2030ebf39896d2fa9c4debfe2585db291db56adf) |
| Principal payout to recipient (`1.0 GEN`) | [`0xc7d2e4…8eddfef4`](https://explorer-studio.genlayer.com/tx/0xc7d2e419c274f174e08ebab62b4092f3de3829c6c8a28936c2252dae8eddfef4) |
| Successful challenge-bond return (`0.05 GEN`) | [`0xf0b638…99104151c`](https://explorer-studio.genlayer.com/tx/0xf0b63805e07b42d9859f9a7f274c7248dde4c036ffd75d3de87cbef99104151c) |

The capture is indexed in `artifacts/browser-wallet-hardened-v10.studionet.json`; rail-2-specific receipts, source URLs, DID hashes, and validator provenance are in `artifacts/live-receipts.hardened-v10.studionet.json` (rail 1's separate receipt capture is preserved at `artifacts/live-receipts.hardened-v10-rail1.studionet.json`). The account owner supplied all seven transaction hashes; `PROOFRAIL_RELEASE_ID=hardened-v10 node scripts/verify_browser_wallet_candidate.mjs` independently re-fetches every transaction from Studionet and checks finalization, GenVM consensus, decoded calldata (actual method name and target rail ID, not just the capture's own action label), sender, recipient, and exact value — then independently re-reads `get_rail`/`accounting` from the live contract, not the cached release record, to confirm the claimed terminal, conserved state still holds. It does not merely trust the supplied hashes or the capture file's own numbers. An earlier version of this capture recorded the challenge bond and its return as `0`; this was a real data-entry bug, caught in review and corrected against values independently re-read from the finalized transactions, and the verifier now checks exact amounts so the same mistake cannot pass silently again (30 corruption cases in `tests/scripts/wallet_lifecycle_checks.test.mjs`, run via `npm test --prefix scripts`).

## Hardened V6 injected-wallet lifecycle — Studionet rail 2 (historical, retired contract)

On 2026-10-20, the production client at [`https://proof-rails.vercel.app`](https://proof-rails.vercel.app) completed the V6 browser write lifecycle through the injected wallet on GenLayer Studionet (chain ID `61999`). The issuer wallet `0x7401c129EDfc26E68FE19309fE461eb3Db1058Eb` funded rail 2 with `0.01 GEN`; recipient/challenger `0x6f0b4cE7a1872db132b2F6B7743deFb30eBa698a` submitted the claim, primary review, bonded dispute (`0.0005 GEN`), and counter review. All seven transactions were finalized.

The primary review authenticated two sources: both publishers asserted `BREACHED`, while validators classified the frozen numerical facts as `FULFILLED` (2 verified, 2 agreeing). The separately authenticated counter panel authenticated three sources: all asserted `FULFILLED`, while validators classified the facts as `BREACHED` (3 verified, 3 agreeing). This reversed the provisional result and selected the committed `BREACHED` payout. The recipient received all `0.01 GEN` principal and the successful challenger received the `0.0005 GEN` bond back. The contract page showed `0 GEN` balance, and terminal accounting showed zero principal and bonds locked.

| Browser action | Finalized Studionet transaction |
| --- | --- |
| Fund/open rail | [`0xa48453…88370c91`](https://explorer-studio.genlayer.com/tx/0xa48453a3ec24a1e16015f1426e004e327ea2c8369a7529f0e0646a0988370c91) |
| Lodge claim | [`0xb4b508…b403246f`](https://explorer-studio.genlayer.com/tx/0xb4b50867f6b2dc7b38d7052356bc01129ecbd102983198d87c450c17b403246f) |
| Primary review | [`0x40b39b…4c3048a3`](https://explorer-studio.genlayer.com/tx/0x40b39b925e1d27728c6e34b313ed4b3d6035573fb13f940111a9a4f74c3048a3) |
| Bonded dispute | [`0xed7482…f1a2bb71`](https://explorer-studio.genlayer.com/tx/0xed748281bbecebb54d553f0b65a1e5f4bdbc92602fff9b341bb7adebf1a2bb71) |
| Counter review and reversal | [`0x010e2a…00dc840b`](https://explorer-studio.genlayer.com/tx/0x010e2a6453a0fa52d0c8d8523493453584e4359c9d0335e4e95421b500dc840b) |
| Principal payout to recipient | [`0x97b04a…248e12f1`](https://explorer-studio.genlayer.com/tx/0x97b04a993dbaec657511f69b6a229a20a8cd8b96d4b5e19db0a7db70248e12f1) |
| Successful challenge-bond return | [`0xb2e25c…6506ff6d`](https://explorer-studio.genlayer.com/tx/0xb2e25cb4b17ba9f472687425e6583c6b0ad469cad6d340cc71eb642a6506ff6d) |

The capture is indexed in `artifacts/browser-wallet-hardened-v6.studionet.json`. Source URLs, pinned DID hashes, evidence digests, versions, statuses, observation bounds, and validator provenance are in the source-matched `artifacts/live-receipts.hardened-v6.studionet.json`. The production Attestations view rendered the publisher assertions separately from validator classifications, with expected and observed evidence digests matching. The account owner supplied the seven transaction hashes; the contract transaction list independently confirms the lifecycle method labels and finality, and detailed explorer pages independently expose both review outputs and the two settlement sends. The explorer detail route intermittently failed for the funding, claim, and dispute entries, so those exact hashes are transparently marked as user-supplied in the evidence JSON.

## Scope and organizational-independence caveat

For hardened-v10, the five publishers have distinct technical domains, DID documents, authorities, and source identities, and are spread across three distinct hosting providers (Vercel, Cloudflare Pages, GitHub Pages) instead of one shared account. This demonstrates technical and infrastructure source separation, not separately operated independent real-world organizations: all three hosting accounts are reachable from this project's own development environment, and none has completed the credentialed admission process that would establish organizational independence. For the historical hardened-v6 walkthrough above, the five publisher deployments additionally shared a single Vercel account outright. Production organizational independence requires separately operated, credentialed publishers or a governed authority registry; see [Authority governance](AUTHORITY_GOVERNANCE.md).

## Historical V5 browser-wallet lifecycle

`artifacts/browser-wallet-pr2.studionet.json` records an earlier injected-wallet lifecycle against the retired V5 contract. It is historical audit evidence only and is not needed to establish the current hardened-v10 browser path.

No private key, seed phrase, or wallet secret is stored in the repository or browser bundle.
