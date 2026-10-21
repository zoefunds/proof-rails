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

export { CaptureRejected };
