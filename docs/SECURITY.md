# Security

## Evidence integrity

The contract rejects issuer-selected single-source authority. A frozen v5 policy requires at least two configured, verified, and agreeing sources and separately freezes counter-panel thresholds. Counterevidence cannot reuse source IDs, domains, DIDs, or authority identities. Each source binds its publisher, authority, version, period, authorized path, DID digest, and evidence digest. Validators require HTTP 200, bounded bodies, exact pinned DID bytes, the exact `#evidence` LinkedDomains service, and exact evidence bytes. A winner must meet `min_verified`, `min_agreement`, and a strict majority. Receipts distinguish `TAMPERED`, `INVALID`, `UNAVAILABLE`, and `VERIFIED` with reasons and full provenance.

## Evidence isolation and false classifications

Challenge prose and evidence prose never enter an instruction channel and cannot select a code. The v5 uptime rule accepts only exact structured facts—total seconds, unavailable seconds, and matching period bounds—and applies frozen integer basis-point arithmetic. Publisher outcome codes remain visible assertions but are ignored. A false or confidently wrong model response has no execution path, while missing, ambiguous, malformed, or inconsistent facts fail closed as `INVALID` or leave the panel below quorum.

## Funds and liveness

Funding and challenge bonds must be exact. A storage guard rejects every write callback while native transfers are active. Transfers are attempted before settlement, recovery, or accounting state is committed, while GenVM transaction atomicity provides the final rollback boundary. Retry count and spacing, response sizes, and review windows are finite; recovery closes every nonterminal flow. Terminal rails cannot settle twice, and receipt rounds are restricted to 1–5.

An unresolved dispute cannot be reviewed after its three-day deadline. Permissionless recovery preserves the last verified provisional verdict and returns the bond to the challenger. This is intentionally neutral: infrastructure unavailability does not transfer the bond to either opponent, while withdrawing evidence cannot erase or improve the already-supported provisional financial outcome.

## Client transaction integrity

The frontend requires an injected wallet, never embeds signing keys, and treats a submitted hash as pending rather than successful. Success requires majority consensus plus explicit GenVM execution evidence. Creation enforces the same minimum post-observation claim window as the contract; disputes require a nonempty written reason; and recovery is offered only for contract states whose deadline has actually expired. These checks improve operator safety but do not replace contract enforcement.

## Residual assumptions

TLS origin authentication depends on the public PKI and publisher domain control at retrieval time. SHA-256 precommitment detects mutation but does not prove a statement is factually correct. Independent-source quorum and authenticated counterevidence reduce, but cannot eliminate, correlated publisher failure. GenLayer consensus governs nondeterministic acceptance.

The contract's documented web-access surface provides HTTP status and response bytes, not a final-response URL or redirect chain. It consequently enforces the normalized configured request origin/path, HTTP 200, DID service binding, and exact-byte digest in GenVM, while `scripts/verify_publishers.mjs` separately rejects redirects and checks final URL equality for release verification. The latter is an external verification control, not an in-contract final-origin guarantee.

The current five publisher origins are a protocol demonstration operated from one deployment account. Their distinct domains, DIDs, and authority IDs prove that the anti-duplication and corroboration machinery works, but they are not evidence of organizational independence. Production authority admission follows [Publisher authority governance](AUTHORITY_GOVERNANCE.md): non-self-issued W3C VC 2.0 organizational credentials, active status, stable legal-entity identity (preferably GLEIF vLEI), separate operator/infrastructure control, and conflict disclosure. The current fixtures are explicitly `DEMONSTRATION_ONLY` and cannot satisfy that policy.

