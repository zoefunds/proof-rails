# Security

## Evidence integrity

The contract uses a standards-compliant URL parser and rejects non-HTTPS, credentials, fragments, non-default ports, ambiguous authorities, mismatched canonical publisher origins, malformed digests, invalid observation windows, and mutable policy after creation. Every validator also retrieves the `did:web` document, verifies its identifier and same-origin linked service, and records its digest. Every review compares the retrieved raw bytes to the precommitted digest before any semantic prompt. Receipts expose publisher-document and evidence digests for audit.

## Prompt injection

Evidence is delimited and declared inert. It cannot add authorities, change criteria, add outcome codes, or select payout amounts. A classifier response outside the frozen code set becomes `INVALID`.

## Funds and liveness

Funding and challenge bonds must be exact. Accounting is updated before transfers, and a failed native transfer reverts the on-chain transaction. Retry spacing, initial review windows, and dispute windows are finite; permissionless recovery closes every nonterminal flow. Terminal rails cannot be settled twice.

## Residual assumptions

TLS origin authentication depends on the public PKI and publisher domain control at retrieval time. SHA-256 precommitment detects mutation but does not prove a publisher's statement is factually correct; parties must select an appropriate authoritative publisher. GenLayer consensus governs nondeterministic acceptance.

