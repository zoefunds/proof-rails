# Architecture

ProofRail separates objective evidence integrity from semantic interpretation.

The issuer commits an `EvidenceSpec` JSON object containing one HTTPS URL, a `did:web` publisher identifier, a publisher domain, a content version, the lowercase SHA-256 digest of the raw response body, and an observation interval. Contract validation parses the URL authority, rejects credentials, fragments and non-default ports, canonicalizes the hostname, and requires it to equal the publisher domain. During review, every validator retrieves the publisher DID document and requires a same-origin linked service before retrieving evidence.

`observed_until` and `closes_at` are separate deadlines. The contract requires at least 86,400 seconds after observation completion for the named recipient to lodge a claim. The frontend exposes both fields and applies the same guard before wallet submission.

During review, every validator fetches the same URL and hashes the raw UTF-8 body. Missing content and digest mismatches are typed outcomes and bypass the LLM. Only a matching artifact is inserted into the classification prompt. Validators recompute the full structured result exactly. The accepted result becomes a `Receipt` stored under `(rail, phase, round)`.

Financial policy is independent of review. Outcome codes and basis points are immutable. Settlement, refunds, and bond routing execute after consensus in deterministic code.

## Deadlines and recovery

- `observed_until` is the end of the period being measured.
- `closes_at` is the last instant at which the named recipient may lodge a claim and must be at least 86,400 seconds later.
- A claimed rail has seven days from `claimed_at` to obtain its first verified review.
- A provisional verdict has a 48-hour challenge window.
- A bonded dispute has a three-day deadline. `review_dispute()` rejects attempts after it, so late review cannot race permissionless recovery.

Recovery is terminal and permissionless when a deadline expires. An unclaimed rail returns principal to the issuer. An unreviewed claim returns principal to the issuer. An unresolved dispute preserves the last verified provisional verdict, applies its frozen payout, and refunds the challenge bond to the challenger. This prevents infrastructure failure from awarding the bond to an opponent without erasing the already authenticated result.

## Client integration

The browser reads rails with paginated contract methods. Transaction submission is not reported as success merely because a wallet returned a hash: the client waits for finalization, requires `MAJORITY_AGREE`, and requires either `FINISHED_WITH_RETURN` or a finalized transaction carrying a GenVM execution hash. The detail page exposes the observation, claim, primary-review, challenge, and dispute deadlines; explains the applicable principal and bond consequences; accepts a written dispute reason; and shows `recover()` only when the current state and deadline make it eligible.

## Trust boundaries

- The issuer chooses the criterion and evidence before the counterparty claims.
- TLS and canonical authority parsing bind retrieval to the frozen publisher domain.
- The publisher DID document binds the declared identity to a same-origin evidence service, and its digest is persisted in every successful receipt.
- SHA-256 binds retrieval to the frozen content version.
- Validators independently retrieve, hash, and classify.
- The contract alone computes transfers.
- The interface is an untrusted transaction composer and read client.

