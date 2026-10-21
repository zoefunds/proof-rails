import {createHash} from "node:crypto";
import {readFile} from "node:fs/promises";
import {createClient} from "genlayer-js";
import {studionet} from "genlayer-js/chains";
import {validateCaptureAgainstRelease, validateChainTransaction, validateFreshRailState, ACTIONS} from "./lib/wallet_lifecycle_checks.mjs";

const releaseId=process.env.PROOFRAIL_RELEASE_ID;
if(!/^[a-z0-9][a-z0-9-]{2,63}$/.test(releaseId||""))throw Error("PROOFRAIL_RELEASE_ID is required");
const root=new URL("../",import.meta.url),readJson=path=>readFile(new URL(path,root),"utf8").then(JSON.parse);
const [capture,release,source]=await Promise.all([
  readJson(`artifacts/browser-wallet-${releaseId}.studionet.json`),
  readJson(`artifacts/live-receipts.${releaseId}.studionet.json`),
  readFile(new URL("contracts/proofrail.py",root)),
]);
const sourceSha256=createHash("sha256").update(source).digest("hex");

// Layer 1: pure, network-free consistency between the two JSON records —
// identity, rail binding, counter-panel freeze, quorum receipts, and exact
// bond/payout amounts and recipients. See scripts/lib/wallet_lifecycle_checks.mjs.
const expectedBond=validateCaptureAgainstRelease(capture,release,releaseId,sourceSha256);

// Layer 2: independent re-verification against the chain itself. The JSON
// capture is the account owner's claim; this layer does not trust it. Every
// transaction hash is re-fetched and checked for finalization, GenVM
// consensus/execution, decoded method name and target rail ID (so a
// mislabeled action or a call that actually targeted a different rail is
// caught, not just assumed from the capture's own "action" label), sender,
// recipient, and exact value.
const client=createClient({chain:studionet});
const address=release.contractAddress;
const issuer=String(release.rail.issuer).toLowerCase(),recipient=String(release.rail.recipient).toLowerCase();
const railIdNumber=Number(release.railId);
const expectedByAction={
  open_rail:{sender:issuer,value:BigInt(release.rail.funded)},
  lodge_claim:{sender:recipient},
  review_claim:{sender:recipient},
  dispute:{sender:recipient,value:expectedBond},
  review_dispute:{sender:recipient},
  recipient_payout:{sender:address,value:BigInt(release.rail.funded),recipient},
  successful_challenger_bond_return:{sender:address,value:expectedBond,recipient},
};

for(const tx of capture.transactions){
  const chainTx=await client.getTransaction({hash:tx.hash});
  validateChainTransaction(tx.action,railIdNumber,chainTx,{...expectedByAction[tx.action],hash:tx.hash,contractAddress:address});
}

// Layer 3: independently read back the current, live rail and accounting
// state directly from the contract — not the cached release.json — and
// confirm it still shows the terminal, conserved state the capture claims.
// This is the strongest affirmative confirmation available: if any of the
// five contract calls above had actually failed or been reordered, the
// live contract state would not match, regardless of what any individual
// transaction's hash/consensus fields report.
const freshRail=await client.readContract({address,functionName:"get_rail",args:[BigInt(railIdNumber)]});
const freshAccounting=await client.readContract({address,functionName:"accounting",args:[]});
const safe=value=>JSON.parse(JSON.stringify(value,(_,item)=>typeof item==="bigint"?item.toString():item));
validateFreshRailState(safe(freshRail),safe(freshAccounting));

console.log(`Verified ${releaseId} injected-wallet lifecycle: ${ACTIONS.length} transactions independently re-fetched from Studionet and checked for finalization, consensus, GenVM execution, decoded method/rail-ID correspondence, sender/recipient, and exact value; rail and accounting state independently re-read live (not from the cached release record); source-matched deployment, pre-funded counter panel, 2/2→3/3 reversal, exact payout (${release.rail.funded}) and bond (${expectedBond}) routing, and terminal conservation.`);
