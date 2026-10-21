import {createHash} from "node:crypto";
import {readFile} from "node:fs/promises";

const releaseId=process.env.PROOFRAIL_RELEASE_ID;
if(!/^[a-z0-9][a-z0-9-]{2,63}$/.test(releaseId||""))throw Error("PROOFRAIL_RELEASE_ID is required");
const root=new URL("../",import.meta.url),readJson=path=>readFile(new URL(path,root),"utf8").then(JSON.parse),fail=message=>{throw Error(`candidate browser evidence rejected: ${message}`)};
const [capture,release,source]=await Promise.all([
  readJson(`artifacts/browser-wallet-${releaseId}.studionet.json`),
  readJson(`artifacts/live-receipts.${releaseId}.studionet.json`),
  readFile(new URL("contracts/proofrail.py",root)),
]);
const sourceSha256=createHash("sha256").update(source).digest("hex"),canonical=value=>JSON.stringify(value,(_,item)=>item&&typeof item==="object"&&!Array.isArray(item)?Object.fromEntries(Object.entries(item).sort(([a],[b])=>a.localeCompare(b))):item);
const actions=["open_rail","lodge_claim","review_claim","dispute","review_dispute","recipient_payout","successful_challenger_bond_return"];
if(capture.schema!=="proofrail.browser-wallet-lifecycle/v2"||capture.releaseId!==releaseId||capture.network!=="GenLayer Studionet"||capture.chainId!==61999)fail("capture identity is invalid");
if(release.schema!=="proofrail.live-receipt-capture/v1"||release.deployment?.sourceSha256!==sourceSha256||release.deployment?.deployedSourceSha256!==sourceSha256)fail("current source is not bound to deployment evidence");
if(capture.contractAddress?.toLowerCase()!==release.contractAddress?.toLowerCase()||capture.railId!==release.railId)fail("browser and release rail bindings differ");
if(release.evidencePolicy?.schema!=="proofrail.evidence-policy/v7"||canonical(release.evidencePolicy.counterevidence)!==canonical(release.counterevidence)||canonical(JSON.parse(release.rail.counterevidence_json))!==canonical(release.counterevidence))fail("counter panel was not frozen before funding");
if(!Array.isArray(capture.transactions)||capture.transactions.length!==actions.length||capture.transactions.some((tx,index)=>tx.action!==actions[index]||tx.status!=="FINALIZED"||!/^0x[0-9a-f]{64}$/i.test(tx.hash)))fail("wallet transaction sequence is incomplete");
if(new Set(capture.transactions.map(tx=>tx.hash.toLowerCase())).size!==actions.length)fail("wallet transaction hashes are not unique");
if(release.rail.status!==5||release.rail.provisional_code!=="FULFILLED"||release.rail.final_code!=="BREACHED"||release.rail.final_bps!==10000||release.rail.bond!==0||release.accounting.locked!==0||release.accounting.bonds_locked!==0||release.accounting.paid!==release.rail.funded)fail("reversal or terminal accounting is invalid");
for(const [receipt,code,count] of [[release.primaryReceipt,"FULFILLED",2],[release.disputeReceipt,"BREACHED",3]]){if(receipt.result!=="VERIFIED"||receipt.outcome_code!==code||receipt.verified_sources!==count||receipt.agreeing_sources!==count)fail("quorum receipt mismatch");for(const sourceRow of JSON.parse(receipt.provenance_json)){if(sourceRow.status!=="VERIFIED"||sourceRow.expected_digest!==sourceRow.observed_digest||sourceRow.asserted_code===sourceRow.code)fail("publisher assertion/classification evidence is incomplete")}}
console.log(`Verified ${releaseId} injected-wallet lifecycle, source-matched deployment, pre-funded counter panel, 2/2→3/3 reversal, payout, bond return, and terminal conservation.`);
