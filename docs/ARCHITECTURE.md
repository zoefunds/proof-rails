# Architecture

ProofRail separates objective evidence integrity from deterministic payout policy.

The issuer commits one frozen v6 evidence policy containing both separate primary and counter panels before funding. The contract copies the complete counter panel into rail state at `open_rail`; a later dispute can activate that panel but cannot replace it. `min_sources` is the configured panel floor, `min_verified` is the number that must authenticate and classify successfully, and `min_agreement` is the equal-weight vote floor. Every rule also requires a strict majority of successfully verified sources. Every source has a distinct source ID, canonical domain, publisher identity/DID, and authority identifier, plus a version, SHA-256 digest, pinned expected HTTP status, and observation interval. Validation rejects credentials, queries, fragments, malformed DNS labels and non-default ports, and requires exactly `<service_path><digest>.json`.

`observed_until` and `closes_at` are separate deadlines. The contract requires at least 86,400 seconds after observation completion for the named recipient to lodge a claim. The frontend exposes both fields and applies the same guard before wallet submission.

During review, every validator hashes the raw retrieved response bytes; it does not decode and re-encode them before comparison. Only an exact `proofrail.independent-attestation/v2` artifact is accepted. Publisher, authority, source, version, pinned status, and observation bounds must match. The publisher outcome is recorded only as `asserted_code`. For the frozen `uptime_bps` rule, validators require exact `total_seconds`, `unavailable_seconds`, `period_start`, and `period_end` facts, check the duration and bounds, and calculate `(total_seconds - unavailable_seconds) × 10,000 ÷ total_seconds` with integer arithmetic. The result maps only to the frozen fulfilled or breached code. Publisher prose, challenge text, payout values, and model output cannot affect classification.

A dispute does not append votes to the primary population. It replaces the review panel with the separately frozen counter rule and source set already stored at funding. The dispute call must supply byte-equivalent structured JSON to the stored counter manifest; a different manifest is rejected. Primary and counter sources cannot reuse source IDs, origins, publisher IDs/DIDs, or authority IDs. Challenge prose is stored for audit but never enters classification. All admitted sources have equal weight.

Financial policy is independent of review. Outcome codes and basis points are immutable. Settlement, refunds, and bond routing execute after consensus in deterministic code.

## Deadlines and recovery

- `observed_until` is the end of the period being measured.
- `closes_at` is the last instant at which the named recipient may lodge a claim and must be at least 86,400 seconds later.
- A claimed rail has seven days from `claimed_at` to obtain its first verified review.
- A provisional verdict has a 48-hour challenge window.
- A bonded dispute has a three-day deadline. `review_dispute()` rejects attempts after it, so late review cannot race permissionless recovery.

Recovery is terminal and permissionless when a deadline expires. An unclaimed rail returns principal to the issuer. An unreviewed claim returns principal to the issuer. An unresolved dispute preserves the last verified provisional verdict, applies its frozen payout, and refunds the challenge bond to the challenger. This prevents infrastructure failure from awarding the bond to an opponent without erasing the already authenticated result.

## Client integration

The browser reads rails with paginated contract methods. Transaction submission is not reported as success merely because a wallet returned a hash: the client waits for finalization, requires `MAJORITY_AGREE`, and requires either `FINISHED_WITH_RETURN` or a finalized transaction carrying a GenVM execution hash. The detail page exposes the observation, claim, primary-review, challenge, and dispute deadlines; explains the applicable principal and bond consequences; accepts only a written dispute reason (the frozen counter panel is loaded from rail state); and shows `recover()` only when the current state and deadline make it eligible.

The GenVM web-response interface used by the contract exposes status and body, but does not document a final-response URL or redirect-history field. Contract execution therefore validates the normalized, precommitted HTTPS request origin and path, HTTP status, DID binding, and exact response bytes; it fails closed when any of those checks fail. The release verifier (`scripts/verify_publishers.mjs`) separately performs manual redirect handling and requires the final URL to equal the requested URL. This makes final-redirect-origin verification an explicit external release boundary, not an unsubstantiated in-contract claim.

## Trust boundaries

- The issuer chooses the criterion, but cannot use one source, reuse an origin/DID/authority, or bypass strict-majority corroboration.
- TLS and canonical authority parsing bind retrieval to the frozen publisher domain.
- The publisher DID document binds the declared identity to a same-origin evidence service, and its digest is persisted in every successful receipt.
- SHA-256 binds retrieval to the frozen content version.
- Validators independently retrieve, hash, schema-check, and count outcomes.
- Validators independently evaluate authenticated measurements against the frozen numerical rule; publisher codes cannot choose the result.
- The contract alone computes transfers.
- The interface is an untrusted transaction composer and read client.

Distinct identifiers are a technical anti-reuse rule, not proof that publishers are unrelated legal or operational entities. The current funded demonstration (`hardened-v8`) spreads its five publisher deployments across three distinct hosting providers/accounts (Vercel, Cloudflare Pages, GitHub Pages), all controlled by one project operator. Production admission therefore follows [Publisher authority governance](AUTHORITY_GOVERNANCE.md): independently issued W3C organizational credentials, active credential status, unique legal-entity/operator/infrastructure control, and conflict disclosure. The demonstration does not relabel its five origins as organizationally independent.

