# Security

## Evidence integrity

The contract rejects issuer-selected single-source authority. A frozen v4 policy requires at least two distinct canonical domains, DIDs, and authority identifiers plus an explicit agreement threshold. Counterevidence cannot reuse any of those identities through case or trailing-dot aliases. Each source binds its publisher, authority, content version, observation period, exact authorized service path, DID-document SHA-256, and evidence SHA-256. Validators require HTTP 200 (redirect statuses fail closed), reproduce the pinned DID bytes, require the exact same-origin service path, and reproduce evidence bytes before classification. A winning outcome must meet the configured threshold and a strict majority of verified sources. Receipts distinguish asserted, verified, and agreeing sources and persist the full provenance manifest.

## Prompt injection

Evidence and challenge prose never enter a model prompt. After byte and DID authentication, the contract accepts only an exact `proofrail.independent-attestation/v2` object. Publisher DID, authority ID, source ID, version, observation bounds, and outcome are checked deterministically; extra keys, unknown outcomes, malformed JSON, stale metadata, and instruction-bearing alternate schemas fail closed.

## Funds and liveness

Funding and challenge bonds must be exact. All native transfers are attempted before settlement, recovery, or bond-accounting state is committed, while GenVM transaction atomicity provides the final rollback boundary. Retry spacing, initial review windows, and dispute windows are finite; permissionless recovery closes every nonterminal flow. Terminal rails cannot be settled twice.

An unresolved dispute cannot be reviewed after its three-day deadline. Permissionless recovery preserves the last verified provisional verdict and returns the bond to the challenger. This is intentionally neutral: infrastructure unavailability does not transfer the bond to either opponent, while withdrawing evidence cannot erase or improve the already-supported provisional financial outcome.

## Client transaction integrity

The frontend requires an injected wallet, never embeds signing keys, and treats a submitted hash as pending rather than successful. Success requires majority consensus plus explicit GenVM execution evidence. Creation enforces the same minimum post-observation claim window as the contract; disputes require a nonempty written reason; and recovery is offered only for contract states whose deadline has actually expired. These checks improve operator safety but do not replace contract enforcement.

## Residual assumptions

TLS origin authentication depends on the public PKI and publisher domain control at retrieval time. SHA-256 precommitment detects mutation but does not prove a statement is factually correct. Independent-source quorum and authenticated counterevidence reduce, but cannot eliminate, correlated publisher failure. GenLayer consensus governs nondeterministic acceptance.

The current five publisher origins are a protocol demonstration operated from one deployment account. Their distinct domains, DIDs, and authority IDs prove that the anti-duplication and corroboration machinery works, but they are not evidence of organizational independence. Production use must onboard separately controlled publishers or adopt an independently governed registry; no documentation or receipt treats the present demonstration as satisfying that external requirement.

