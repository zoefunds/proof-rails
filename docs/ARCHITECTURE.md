# Architecture

ProofRail separates objective evidence integrity from semantic interpretation.

The issuer commits an `EvidenceSpec` JSON object containing one HTTPS URL, a publisher identifier, a publisher domain, a content version, the lowercase SHA-256 digest of the raw response body, and an observation interval. Contract validation requires the URL hostname to equal the publisher domain exactly. This prevents a display label from claiming one publisher while retrieving another.

During review, every validator fetches the same URL and hashes the raw UTF-8 body. Missing content and digest mismatches are typed outcomes and bypass the LLM. Only a matching artifact is inserted into the classification prompt. Validators recompute the full structured result exactly. The accepted result becomes a `Receipt` stored under `(rail, phase, round)`.

Financial policy is independent of review. Outcome codes and basis points are immutable. Settlement, refunds, and bond routing execute after consensus in deterministic code.

## Trust boundaries

- The issuer chooses the criterion and evidence before the counterparty claims.
- TLS binds retrieval to the frozen publisher domain.
- SHA-256 binds retrieval to the frozen content version.
- Validators independently retrieve, hash, and classify.
- The contract alone computes transfers.
- The interface is an untrusted transaction composer and read client.

