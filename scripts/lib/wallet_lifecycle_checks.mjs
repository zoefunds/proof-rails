// Pure, network-free validation of a browser-wallet capture artifact against
// its paired live-receipts release record. Factored out of
// verify_browser_wallet_candidate.mjs so the exact amount/recipient math
// that originally let a wrong bond value (0 instead of 5% of funded) slip
// through unnoticed can be exercised directly by tests, without a live
// Studionet connection.

export const ACTIONS = ["open_rail", "lodge_claim", "review_claim", "dispute", "review_dispute", "recipient_payout", "successful_challenger_bond_return"];
// Must match BOND_BPS in contracts/proofrail.py.
export const BOND_BPS = 500n;

export const canonical = (value) =>
  JSON.stringify(value, (_, item) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)))
      : item
  );

class CaptureRejected extends Error {}

function fail(message) {
  throw new CaptureRejected(`candidate browser evidence rejected: ${message}`);
}

/**
 * Validates a browser-wallet capture artifact against its release record and
 * the current contract source digest, using only the two JSON documents —
 * no network access. Throws CaptureRejected on any mismatch; returns the
 * computed expected bond (bigint) on success, for callers that want it.
 */
export function validateCaptureAgainstRelease(capture, release, releaseId, sourceSha256) {
  if (capture.schema !== "proofrail.browser-wallet-lifecycle/v2" || capture.releaseId !== releaseId || capture.network !== "GenLayer Studionet" || capture.chainId !== 61999) fail("capture identity is invalid");
  if (release.schema !== "proofrail.live-receipt-capture/v1" || release.deployment?.sourceSha256 !== sourceSha256 || release.deployment?.deployedSourceSha256 !== sourceSha256) fail("current source is not bound to deployment evidence");
  if (capture.contractAddress?.toLowerCase() !== release.contractAddress?.toLowerCase() || capture.railId !== release.railId) fail("browser and release rail bindings differ");
  if (release.evidencePolicy?.schema !== "proofrail.evidence-policy/v7" || canonical(release.evidencePolicy.counterevidence) !== canonical(release.counterevidence) || canonical(JSON.parse(release.rail.counterevidence_json)) !== canonical(release.counterevidence)) fail("counter panel was not frozen before funding");
  if (!Array.isArray(capture.transactions) || capture.transactions.length !== ACTIONS.length || capture.transactions.some((tx, index) => tx.action !== ACTIONS[index] || tx.status !== "FINALIZED" || !/^0x[0-9a-f]{64}$/i.test(tx.hash))) fail("wallet transaction sequence is incomplete");
  if (new Set(capture.transactions.map((tx) => tx.hash.toLowerCase())).size !== ACTIONS.length) fail("wallet transaction hashes are not unique");

  // Per-rail reversal and settlement: this specific rail paid out its full
  // funded amount and released its own lock/bond, regardless of how many
  // other rails the contract has ever funded.
  if (release.rail.status !== 5 || release.rail.provisional_code !== "FULFILLED" || release.rail.final_code !== "BREACHED" || release.rail.final_bps !== 10000 || release.rail.bond !== 0 || release.rail.locked !== 0 || release.rail.paid !== release.rail.funded) fail("reversal or terminal accounting is invalid");
  // Global conservation: the contract-wide ledger balances. This does not
  // assume the contract has funded only one rail — accounting.funded is the
  // cumulative total across every rail this contract has ever funded.
  if (BigInt(release.accounting.funded) !== BigInt(release.accounting.locked) + BigInt(release.accounting.paid) + BigInt(release.accounting.returned)) fail("global fund conservation invariant failed");

  for (const [receipt, code, count] of [
    [release.primaryReceipt, "FULFILLED", 2],
    [release.disputeReceipt, "BREACHED", 3],
  ]) {
    if (receipt.result !== "VERIFIED" || receipt.outcome_code !== code || receipt.verified_sources !== count || receipt.agreeing_sources !== count) fail("quorum receipt mismatch");
    for (const sourceRow of JSON.parse(receipt.provenance_json)) {
      if (sourceRow.status !== "VERIFIED" || sourceRow.expected_digest !== sourceRow.observed_digest || sourceRow.asserted_code === sourceRow.code) fail("publisher assertion/classification evidence is incomplete");
    }
  }

  // Exact amounts and recipients. This is the check that was missing
  // entirely when the first hardened-v10 capture was produced: it recorded
  // a bond and bond-return value of 0 for a rail that actually posted and
  // returned a 0.05 GEN (5%) bond, and nothing caught it.
  const funded = BigInt(release.rail.funded);
  const expectedBond = (funded * BOND_BPS) / 10000n;
  const recipient = String(release.rail.recipient).toLowerCase();
  const byAction = Object.fromEntries(capture.transactions.map((tx) => [tx.action, tx]));

  const openTx = byAction.open_rail;
  if (openTx?.value === undefined) fail("open_rail transaction is missing its funded value");
  if (BigInt(openTx.value) !== funded) fail(`open_rail value ${openTx.value} does not equal the rail's funded amount ${funded}`);

  const disputeTx = byAction.dispute;
  if (disputeTx?.value === undefined) fail("dispute transaction is missing its bond value");
  if (BigInt(disputeTx.value) !== expectedBond) fail(`dispute bond ${disputeTx.value} does not equal the required ${expectedBond} (${Number(BOND_BPS) / 100}% of funded)`);

  const payoutTx = byAction.recipient_payout;
  if (payoutTx?.value === undefined || payoutTx?.recipient === undefined) fail("recipient_payout transaction is missing value or recipient");
  if (BigInt(payoutTx.value) !== funded) fail(`recipient_payout value ${payoutTx.value} does not equal the rail's funded amount ${funded}`);
  if (String(payoutTx.recipient).toLowerCase() !== recipient) fail("recipient_payout recipient does not match the rail's recorded recipient");

  const bondReturnTx = byAction.successful_challenger_bond_return;
  if (bondReturnTx?.value === undefined || bondReturnTx?.recipient === undefined) fail("successful_challenger_bond_return transaction is missing value or recipient");
  if (BigInt(bondReturnTx.value) !== expectedBond) fail(`bond return value ${bondReturnTx.value} does not equal the required bond ${expectedBond}`);
  if (String(bondReturnTx.recipient).toLowerCase() !== recipient) fail("successful_challenger_bond_return recipient does not match the rail's recorded recipient");

  return expectedBond;
}

// Maps each browser-wallet action to the contract method it must have
// called. recipient_payout and successful_challenger_bond_return are not
// contract calls at all — they are the contract's own internal native
// transfers (via _pay()), which carry no calldata and no GenVM execution
// hash, so they are excluded from calldata/consensus checks and verified by
// value/recipient alone.
export const METHOD_BY_ACTION = { open_rail: "open_rail", lodge_claim: "lodge_claim", review_claim: "review_claim", dispute: "dispute", review_dispute: "review_dispute" };
export const CONTRACT_CALL_ACTIONS = new Set(Object.keys(METHOD_BY_ACTION));

/**
 * Decodes genlayer-js's `data.calldata.readable` string into {method, args}.
 * That string is not valid JSON (e.g. `{"args":[2,]"method":"lodge_claim"}`),
 * so this parses it with targeted regexes rather than JSON.parse.
 */
export function decodeCalldata(readable) {
  if (typeof readable !== "string" || !readable) return { method: null, firstArg: null };
  const method = readable.match(/"method"\s*:\s*"([^"]+)"/)?.[1] ?? null;
  const argsMatch = readable.match(/"args"\s*:\s*\[\s*([^,\]]*)/);
  const rawFirstArg = argsMatch?.[1]?.trim();
  const firstArg = rawFirstArg !== undefined && /^-?\d+$/.test(rawFirstArg) ? Number(rawFirstArg) : (rawFirstArg || null);
  return { method, firstArg };
}

/**
 * Validates one already-fetched chain transaction against what the browser-
 * wallet action it claims to be requires: finalization, GenVM consensus and
 * execution for contract calls, decoded method name and target rail ID
 * (transaction-to-rail correspondence), sender, recipient, and value. Takes
 * a plain chainTx object so it is testable with synthetic fixtures — no
 * network access, no live client — exercising exactly the same logic the
 * live verifier runs against real Studionet responses.
 *
 * chainTx shape (subset of genlayer-js's getTransaction() result):
 *   { statusName, result_name, tx_execution_hash, from_address, to_address,
 *     value, data: { calldata: { readable } } }
 */
export function validateChainTransaction(action, railId, chainTx, expected) {
  const label = `${action} (${expected.hash ?? "unknown hash"})`;
  if (chainTx.statusName !== "FINALIZED") fail(`${label}: on-chain status is ${chainTx.statusName || "unknown"}, not FINALIZED`);
  const from = String(chainTx.from_address ?? "").toLowerCase();
  const to = String(chainTx.to_address ?? "").toLowerCase();
  const value = chainTx.value !== undefined && chainTx.value !== null ? BigInt(chainTx.value) : undefined;

  if (CONTRACT_CALL_ACTIONS.has(action)) {
    if (chainTx.result_name !== "MAJORITY_AGREE") fail(`${label}: on-chain consensus is ${chainTx.result_name || "unknown"}, not MAJORITY_AGREE`);
    if (!chainTx.tx_execution_hash) fail(`${label}: no GenVM execution hash recorded — execution success cannot be confirmed`);
    if (to !== expected.contractAddress.toLowerCase()) fail(`${label}: does not target the release's contract address (transaction-to-rail correspondence failed)`);
    const { method, firstArg } = decodeCalldata(chainTx.data?.calldata?.readable);
    if (method !== METHOD_BY_ACTION[action]) fail(`${label}: decoded calldata method is ${method || "undecodable"}, not the expected ${METHOD_BY_ACTION[action]} (mislabeled function call)`);
    if (action !== "open_rail" && firstArg !== railId) fail(`${label}: decoded calldata targets rail ${firstArg}, not the expected rail ${railId} (wrong-rail call)`);
  }
  if (from !== expected.sender.toLowerCase()) fail(`${label}: on-chain sender ${from} does not match the expected ${expected.sender}`);
  if (expected.value !== undefined) {
    if (value === undefined) fail(`${label}: on-chain transaction carries no value`);
    if (value !== expected.value) fail(`${label}: on-chain value ${value} does not match the expected ${expected.value}`);
  }
  if (expected.recipient !== undefined && to !== expected.recipient.toLowerCase()) fail(`${label}: on-chain recipient ${to} does not match the rail's recorded recipient ${expected.recipient}`);
  return true;
}

/**
 * Independently re-derives pass/fail from freshly-read, current contract
 * state (get_rail + accounting results), rather than trusting the cached
 * release.json. Used after re-fetching state live; also directly testable
 * with synthetic state objects.
 */
export function validateFreshRailState(freshRail, freshAccounting) {
  if (freshRail.status !== 5) fail(`independently re-read rail status is ${freshRail.status}, not PAID/RELEASED(5)`);
  if (freshRail.final_code !== "BREACHED") fail(`independently re-read rail final_code is ${freshRail.final_code}, not BREACHED`);
  if (freshRail.bond !== 0) fail(`independently re-read rail bond is ${freshRail.bond}, not 0`);
  if (freshRail.locked !== 0) fail(`independently re-read rail locked is ${freshRail.locked}, not 0`);
  if (String(freshRail.paid) !== String(freshRail.funded)) fail(`independently re-read rail paid (${freshRail.paid}) does not equal funded (${freshRail.funded})`);
  if (BigInt(freshAccounting.funded) !== BigInt(freshAccounting.locked) + BigInt(freshAccounting.paid) + BigInt(freshAccounting.returned)) fail("independently re-read global accounting fails conservation");
  return true;
}

export { CaptureRejected };
