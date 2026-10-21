# Publisher authority governance

## Production admission rule

ProofRail distinguishes technical source separation from independently governed authority. Different hostnames, DIDs, and `authority_id` values prevent simple replay and identity reuse, but do not prove different real-world control.

A publisher may be counted as **organizationally independent** only when all of the following are verified before a production rail is funded:

1. The publisher presents a W3C Verifiable Credential 2.0 secured with W3C Data Integrity or JOSE/COSE.
2. The credential is issued by an issuer in the rail's frozen trusted-issuer set. Self-issued credentials are not admissible.
3. The credential identifies the operating legal entity with a stable organizational identifier. GLEIF vLEI is the preferred profile; a current LEI plus an equivalent accredited credential may be accepted by governance.
4. Credential validity, proof, schema, expiry, and revocation/suspension status are checked. The credential digest and status result are frozen in the admission receipt.
5. `legal_entity_id`, `operator_id`, controlling organization, publisher DID, registrable domain, infrastructure account, and credential subject are unique across the primary and counter panels.
6. The operator declares beneficial-control and conflict-of-interest information. Undisclosed common control, shared signing keys, shared deployment accounts, or issuer/challenger control makes the source ineligible.
7. At least two admitted primary operators and the required counter-panel operators remain available after exclusions. Missing or unverifiable credentials fail closed and do not count toward quorum.

The frozen trusted-issuer policy, credential hashes, status-list hashes, and admission decisions must be published with the rail. Registry governance—not the funder or challenger—determines admission. Registry updates affect only newly created rails; an existing rail retains its frozen admission snapshot.

## Recommended standards profile

- W3C Verifiable Credentials Data Model 2.0 for the organizational credential.
- W3C Verifiable Credential Data Integrity 1.0 or VC JOSE/COSE for cryptographic proof.
- W3C Bitstring Status List 1.0 for suspension and revocation.
- GLEIF vLEI credentials and Qualified vLEI Issuers for independently governed legal-entity identity.
- W3C DID Core verification methods for publisher keys; DID service endpoints alone are not proof of organizational independence.

Normative references:

- <https://www.w3.org/TR/vc-data-model-2.0/>
- <https://www.w3.org/TR/vc-data-integrity/>
- <https://www.w3.org/TR/vc-bitstring-status-list/>
- <https://www.w3.org/TR/did-core/>
- <https://www.gleif.org/en/organizational-identity/become-a-vlei-issuer-qvi/vlei-ecosystem-governance-framework>

## Current demonstration classification

The five hardened-v6 publisher fixtures are hosted from one deployment account. They prove exact-byte retrieval, DID/path authentication, identity-duplication rejection, separate-panel quorum, misleading-assertion resistance, and consensus-changing settlement. They do **not** pass the organizational-independence admission rule above and are marked `DEMONSTRATION_ONLY` in the release evidence.

The hardened-v8 publisher fixtures improved on this at the infrastructure layer only: the five sources were hosted on three distinct hosting providers under three distinct accounts — `source-1-inky.vercel.app` and `source-2-ten.vercel.app` on the existing Vercel team account, `proofrail-source3.pages.dev` and `proofrail-source4.pages.dev` on a separate Cloudflare account (Cloudflare Pages), and `zoefunds.github.io` on a separate GitHub account (GitHub Pages). This removed the single-Vercel-account technical correlation that the hardened-v6/v7 fixtures shared, but — like v6/v7 — did not bind an artifact to a specific obligation, so a correctly hashed, correctly DID-authenticated artifact about an unrelated obligation could in principle still satisfy its quorum.

The current hardened-v9 publisher fixtures (`artifacts/evidence-policy.hardened-v9.json`, `artifacts/counterevidence.hardened-v9.json`) keep the same three-provider infrastructure spread and additionally close that gap: the policy carries a frozen `obligation_id`, every artifact must carry the identical value, and `scripts/verify_publishers.mjs` confirms all ten live DID/evidence objects across the three providers with no redirects, exact final URLs, HTTP 200, and matching SHA-256 digests. A funded on-chain run (`artifacts/live-e2e-hardened-v9-4.studionet.json`, contract `0xC4C899Bd6A06544d56E58eFA87e96bC78eE46100`) confirms GenVM's own nondeterministic validators independently retrieve and authenticate obligation-bound evidence across all three providers and still produce a correct 2-of-2 → 3-of-3 counterevidence reversal.

This is **still not organizational independence** and must not be represented as such: all three hosting accounts are controlled by the same operator. Spreading hosting providers only removes the specific "shared Vercel account" correlation; it does not establish separately operated, credentialed legal entities. The admission rule above — verifiable credentials from a trusted issuer, e.g. GLEIF vLEI — is the only thing that establishes organizational independence, and it still requires real separate organizations to be onboarded. `hardened-v6` through `hardened-v9` are all marked `DEMONSTRATION_ONLY` for this reason.

The deployed hardened-v6 contract enforces technical uniqueness of source IDs, authority IDs, DIDs, and origins. Organizational-credential admission is currently a documented release/onboarding gate; it is not represented as on-chain credential verification. A future deployment must add credential-proof and status verification to contract execution, or consume an independently governed on-chain registry, before the contract itself can enforce this policy without an external admission process.

No reviewer should infer independent real-world ownership from the funded demonstration. A maximum production-independence claim requires credentials from at least the minimum number of separately controlled admitted publishers. ProofRail cannot issue those credentials to itself.

## Collusion boundary

Credentials and registry admission establish accountable, separately identified control; they cannot prove that organizations will never collude. The protocol reduces this risk with separate primary/counter panels, strict-majority agreement, unique legal entities, frozen credentials, conflict disclosures, and public receipts. Governance must remove or suspend compromised operators, while existing rails follow their frozen recovery rules.
