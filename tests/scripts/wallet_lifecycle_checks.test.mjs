import {test} from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {validateCaptureAgainstRelease, validateChainTransaction, validateFreshRailState, decodeCalldata, CaptureRejected} from "../../scripts/lib/wallet_lifecycle_checks.mjs";

// Uses the real, currently-live hardened-v10 artifacts as the known-good
// fixture (not synthetic placeholder data), then mutates copies to prove
// specific corruptions are rejected. This directly targets the gap that let
// a zeroed bond/bond-return value through unnoticed in the first capture.
const root = new URL("../../", import.meta.url);
const releaseId = "hardened-v10";
const [capture, release, source] = await Promise.all([
  readFile(new URL(`artifacts/browser-wallet-${releaseId}.studionet.json`, root), "utf8").then(JSON.parse),
  readFile(new URL(`artifacts/live-receipts.${releaseId}.studionet.json`, root), "utf8").then(JSON.parse),
  readFile(new URL("contracts/proofrail.py", root)),
]);
const sourceSha256 = createHash("sha256").update(source).digest("hex");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function byAction(c, action) {
  return c.transactions.find((tx) => tx.action === action);
}

test("the real, correct hardened-v10 capture passes", () => {
  const expectedBond = validateCaptureAgainstRelease(clone(capture), clone(release), releaseId, sourceSha256);
  assert.equal(expectedBond, (BigInt(release.rail.funded) * 500n) / 10000n);
});

test("rejects a zeroed bond value (the actual bug this test suite was written for)", () => {
  const corrupted = clone(capture);
  byAction(corrupted, "dispute").value = "0";
  assert.throws(() => validateCaptureAgainstRelease(corrupted, clone(release), releaseId, sourceSha256), CaptureRejected);
});

test("rejects a zeroed bond-return value", () => {
  const corrupted = clone(capture);
  byAction(corrupted, "successful_challenger_bond_return").value = "0";
  assert.throws(() => validateCaptureAgainstRelease(corrupted, clone(release), releaseId, sourceSha256), CaptureRejected);
});

test("rejects a bond value that is merely the wrong amount (not 5% of funded)", () => {
  const corrupted = clone(capture);
  byAction(corrupted, "dispute").value = "1";
  assert.throws(() => validateCaptureAgainstRelease(corrupted, clone(release), releaseId, sourceSha256), CaptureRejected);
});

test("rejects a payout value lower than the rail's funded amount", () => {
  const corrupted = clone(capture);
  byAction(corrupted, "recipient_payout").value = String(BigInt(release.rail.funded) - 1n);
  assert.throws(() => validateCaptureAgainstRelease(corrupted, clone(release), releaseId, sourceSha256), CaptureRejected);
});

test("rejects a payout sent to the wrong recipient", () => {
  const corrupted = clone(capture);
  byAction(corrupted, "recipient_payout").recipient = "0x0000000000000000000000000000000000dEaD";
  assert.throws(() => validateCaptureAgainstRelease(corrupted, clone(release), releaseId, sourceSha256), CaptureRejected);
});

test("rejects a bond return sent to the wrong recipient", () => {
  const corrupted = clone(capture);
  byAction(corrupted, "successful_challenger_bond_return").recipient = "0x0000000000000000000000000000000000dEaD";
  assert.throws(() => validateCaptureAgainstRelease(corrupted, clone(release), releaseId, sourceSha256), CaptureRejected);
});

test("rejects an open_rail value that does not match the rail's funded amount", () => {
  const corrupted = clone(capture);
  byAction(corrupted, "open_rail").value = "1";
  assert.throws(() => validateCaptureAgainstRelease(corrupted, clone(release), releaseId, sourceSha256), CaptureRejected);
});

test("rejects a railId that does not match the release record", () => {
  const corrupted = clone(capture);
  corrupted.railId = "99";
  assert.throws(() => validateCaptureAgainstRelease(corrupted, clone(release), releaseId, sourceSha256), CaptureRejected);
});

test("rejects a contract address that does not match the release record", () => {
  const corrupted = clone(capture);
  corrupted.contractAddress = "0x0000000000000000000000000000000000dEaD";
  assert.throws(() => validateCaptureAgainstRelease(corrupted, clone(release), releaseId, sourceSha256), CaptureRejected);
});

test("rejects a duplicated transaction hash", () => {
  const corrupted = clone(capture);
  byAction(corrupted, "lodge_claim").hash = byAction(corrupted, "review_claim").hash;
  assert.throws(() => validateCaptureAgainstRelease(corrupted, clone(release), releaseId, sourceSha256), CaptureRejected);
});

test("rejects a non-finalized transaction", () => {
  const corrupted = clone(capture);
  byAction(corrupted, "review_dispute").status = "PENDING";
  assert.throws(() => validateCaptureAgainstRelease(corrupted, clone(release), releaseId, sourceSha256), CaptureRejected);
});

test("rejects a release record whose source hash does not match the current contract source", () => {
  assert.throws(() => validateCaptureAgainstRelease(clone(capture), clone(release), releaseId, "0".repeat(64)), CaptureRejected);
});

// --- Calldata decoding (synthetic fixtures matching genlayer-js's actual
// malformed-JSON "readable" string format, observed live on Studionet) ---

test("decodeCalldata parses method and numeric first arg from the malformed-JSON readable string", () => {
  assert.deepEqual(decodeCalldata('{"args":[2,]"method":"review_dispute"}'), {method: "review_dispute", firstArg: 2});
});

test("decodeCalldata parses a multi-argument call and still extracts the first (rail id) arg", () => {
  assert.deepEqual(decodeCalldata('{"args":[2,"some reason text","{\\"schema\\":\\"x\\"}",]"method":"dispute"}'), {method: "dispute", firstArg: 2});
});

test("decodeCalldata returns nulls for undecodable input", () => {
  assert.deepEqual(decodeCalldata(undefined), {method: null, firstArg: null});
  assert.deepEqual(decodeCalldata(""), {method: null, firstArg: null});
});

// --- Live chain-transaction re-verification (synthetic chainTx fixtures —
// no network access, but exercising the exact same function the live
// verifier calls on real Studionet responses) ---

const GOOD_CHAIN_TX = {
  statusName: "FINALIZED",
  result_name: "MAJORITY_AGREE",
  tx_execution_hash: "0xabc123",
  from_address: "0x7401c129EDfc26E68FE19309fE461eb3Db1058Eb",
  to_address: "0x0dd0e186c7C509c8E94E38A6536B78A0754fB4c9",
  data: {calldata: {readable: '{"args":[2,]"method":"review_dispute"}'}},
};
const EXPECTED = {hash: "0xtest", contractAddress: "0x0dd0e186c7C509c8E94E38A6536B78A0754fB4c9", sender: "0x7401c129EDfc26E68FE19309fE461eb3Db1058Eb"};

test("validateChainTransaction accepts a correct contract-call transaction", () => {
  assert.equal(validateChainTransaction("review_dispute", 2, GOOD_CHAIN_TX, EXPECTED), true);
});

test("validateChainTransaction rejects a call targeting the wrong rail (wrong-rail call)", () => {
  assert.throws(() => validateChainTransaction("review_dispute", 99, GOOD_CHAIN_TX, EXPECTED), CaptureRejected);
});

test("validateChainTransaction rejects a mislabeled method name (calldata says a different method than the claimed action)", () => {
  const mislabeled = {...GOOD_CHAIN_TX, data: {calldata: {readable: '{"args":[2,]"method":"lodge_claim"}'}}};
  assert.throws(() => validateChainTransaction("review_dispute", 2, mislabeled, EXPECTED), CaptureRejected);
});

test("validateChainTransaction rejects a finalized transaction with no GenVM execution hash (finalized but unsuccessful/unconfirmed execution)", () => {
  const noHash = {...GOOD_CHAIN_TX, tx_execution_hash: ""};
  assert.throws(() => validateChainTransaction("review_dispute", 2, noHash, EXPECTED), CaptureRejected);
});

test("validateChainTransaction rejects a non-finalized transaction regardless of consensus", () => {
  const pending = {...GOOD_CHAIN_TX, statusName: "PENDING"};
  assert.throws(() => validateChainTransaction("review_dispute", 2, pending, EXPECTED), CaptureRejected);
});

test("validateChainTransaction rejects consensus disagreement even with an execution hash present", () => {
  const disagreed = {...GOOD_CHAIN_TX, result_name: "MAJORITY_DISAGREE"};
  assert.throws(() => validateChainTransaction("review_dispute", 2, disagreed, EXPECTED), CaptureRejected);
});

test("validateChainTransaction rejects a transaction from the wrong sender", () => {
  assert.throws(() => validateChainTransaction("review_dispute", 2, GOOD_CHAIN_TX, {...EXPECTED, sender: "0x0000000000000000000000000000000000dEaD"}), CaptureRejected);
});

test("validateChainTransaction rejects a transaction not targeting the release's contract address", () => {
  const wrongContract = {...GOOD_CHAIN_TX, to_address: "0x0000000000000000000000000000000000dEaD"};
  assert.throws(() => validateChainTransaction("review_dispute", 2, wrongContract, EXPECTED), CaptureRejected);
});

test("validateChainTransaction skips calldata/consensus checks for the contract's own internal transfers, but still checks value and recipient", () => {
  const transfer = {statusName: "FINALIZED", from_address: "0x0dd0e186c7C509c8E94E38A6536B78A0754fB4c9", to_address: "0x7401c129EDfc26E68FE19309fE461eb3Db1058Eb", value: "50000000000000000"};
  assert.equal(validateChainTransaction("successful_challenger_bond_return", 2, transfer, {hash: "0xtest", contractAddress: "0x0dd0e186c7C509c8E94E38A6536B78A0754fB4c9", sender: "0x0dd0e186c7C509c8E94E38A6536B78A0754fB4c9", value: 50000000000000000n, recipient: "0x7401c129EDfc26E68FE19309fE461eb3Db1058Eb"}), true);
});

test("validateChainTransaction rejects an internal transfer with the wrong value", () => {
  const transfer = {statusName: "FINALIZED", from_address: "0x0dd0e186c7C509c8E94E38A6536B78A0754fB4c9", to_address: "0x7401c129EDfc26E68FE19309fE461eb3Db1058Eb", value: "1"};
  assert.throws(() => validateChainTransaction("successful_challenger_bond_return", 2, transfer, {hash: "0xtest", contractAddress: "0x0dd0e186c7C509c8E94E38A6536B78A0754fB4c9", sender: "0x0dd0e186c7C509c8E94E38A6536B78A0754fB4c9", value: 50000000000000000n, recipient: "0x7401c129EDfc26E68FE19309fE461eb3Db1058Eb"}), CaptureRejected);
});

// --- Independent live-state re-read (synthetic get_rail/accounting fixtures) ---

const GOOD_FRESH_RAIL = {status: 5, final_code: "BREACHED", bond: 0, locked: 0, paid: "1000000000000000000", funded: "1000000000000000000"};
const GOOD_FRESH_ACCOUNTING = {funded: "1010000000000000000", locked: 0, paid: "1010000000000000000", returned: 0};

test("validateFreshRailState accepts a genuinely settled, conserved rail", () => {
  assert.equal(validateFreshRailState(GOOD_FRESH_RAIL, GOOD_FRESH_ACCOUNTING), true);
});

test("validateFreshRailState rejects a rail that is not actually in a terminal PAID/RELEASED status", () => {
  assert.throws(() => validateFreshRailState({...GOOD_FRESH_RAIL, status: 4}, GOOD_FRESH_ACCOUNTING), CaptureRejected);
});

test("validateFreshRailState rejects a rail whose live paid does not equal its funded amount (incomplete payout)", () => {
  assert.throws(() => validateFreshRailState({...GOOD_FRESH_RAIL, paid: "1"}, GOOD_FRESH_ACCOUNTING), CaptureRejected);
});

test("validateFreshRailState rejects live accounting that fails conservation", () => {
  assert.throws(() => validateFreshRailState(GOOD_FRESH_RAIL, {...GOOD_FRESH_ACCOUNTING, paid: "1"}), CaptureRejected);
});
