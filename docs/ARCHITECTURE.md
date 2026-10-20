# Architecture

ProofRail separates objective evidence integrity from deterministic payout policy.

The issuer commits a v5 policy containing separate primary and counter rules. `min_sources` is the configured panel floor, `min_verified` is the number that must authenticate and classify successfully, and `min_agreement` is the equal-weight vote floor. Every rule also requires a strict majority of successfully verified sources. Every source has a distinct source ID, canonical domain, DID, and authority identifier, plus a version, SHA-256 digest, and observation interval. Validation rejects credentials, queries, fragments, malformed DNS labels and non-default ports, and requires exactly `<service_path><digest>.json`.

`observed_until` and `closes_at` are separate deadlines. The contract requires at least 86,400 seconds after observation completion for the named recipient to lodge a claim. The frontend exposes both fields and applies the same guard before wallet submission.

During review, every validator fetches and hashes the same UTF-8 body. Only an exact `proofrail.independent-attestation/v2` artifact is accepted. Publisher, authority, source, version, and observation bounds must match. The publisher outcome is recorded only as `asserted_code`. A neutral classifier receives the frozen criterion, outcome descriptions without payout values, and subject/statement in an isolated untrusted-data object. Its exact response must select a frozen code with `HIGH` confidence. Validators recompute authentication, classification, quorum, and provenance through GenLayer consensus; ambiguity or malformed model output fails closed.

A dispute does not append votes to the primary population. It replaces the review panel with the separately frozen counter rule and submitted counter-source set. Primary and counter sources cannot reuse source IDs, origins, DIDs, or authority IDs. Challenge prose is stored for audit but never enters classification. All admitted sources have equal weight.

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

- The issuer chooses the criterion, but cannot use one source, reuse an origin/DID/authority, or bypass strict-majority corroboration.
- TLS and canonical authority parsing bind retrieval to the frozen publisher domain.
- The publisher DID document binds the declared identity to a same-origin evidence service, and its digest is persisted in every successful receipt.
- SHA-256 binds retrieval to the frozen content version.
- Validators independently retrieve, hash, schema-check, and count outcomes.
- Validators independently interpret authenticated statements; publisher codes cannot choose the result.
- The contract alone computes transfers.
- The interface is an untrusted transaction composer and read client.

Distinct identifiers are a technical anti-reuse rule, not proof that publishers are unrelated legal or operational entities. The current funded demonstration uses separately addressed publisher deployments controlled by one project operator. A production trust claim therefore requires independently operated publisher domains or a separately governed authority registry; the demonstration does not relabel its five origins as organizationally independent.

