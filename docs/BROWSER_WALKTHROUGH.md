# Production browser-wallet walkthrough

## Hardened V6 injected-wallet lifecycle — Studionet rail 2

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

The five publishers have distinct technical domains, DID documents, authorities, and source identities. Their deployments share one Vercel account, so this demonstrates technical source separation, not separately operated independent real-world organizations. Production organizational independence requires separately operated, credentialed publishers or a governed authority registry; see [Authority governance](AUTHORITY_GOVERNANCE.md).

## Historical V5 browser-wallet lifecycle

`artifacts/browser-wallet-pr2.studionet.json` records an earlier injected-wallet lifecycle against the retired V5 contract. It is historical audit evidence only and is not needed to establish the current V6 browser path.

No private key, seed phrase, or wallet secret is stored in the repository or browser bundle.
