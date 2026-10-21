import {test} from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {validateCaptureAgainstRelease, CaptureRejected} from "../../scripts/lib/wallet_lifecycle_checks.mjs";

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
