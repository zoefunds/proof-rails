import {createHash} from "node:crypto";
import {readFile} from "node:fs/promises";
import {createClient} from "genlayer-js";
import {studionet} from "genlayer-js/chains";
import {validateCaptureAgainstRelease, ACTIONS} from "./lib/wallet_lifecycle_checks.mjs";

const releaseId=process.env.PROOFRAIL_RELEASE_ID;
if(!/^[a-z0-9][a-z0-9-]{2,63}$/.test(releaseId||""))throw Error("PROOFRAIL_RELEASE_ID is required");
const root=new URL("../",import.meta.url),readJson=path=>readFile(new URL(path,root),"utf8").then(JSON.parse),fail=message=>{throw Error(`candidate browser evidence rejected: ${message}`)};
const [capture,release,source]=await Promise.all([
  readJson(`artifacts/browser-wallet-${releaseId}.studionet.json`),
  readJson(`artifacts/live-receipts.${releaseId}.studionet.json`),
  readFile(new URL("contracts/proofrail.py",root)),
]);
const sourceSha256=createHash("sha256").update(source).digest("hex");

// Layer 1: pure, network-free consistency between the two JSON records —
// identity, rail binding, counter-panel freeze, quorum receipts, and exact
// bond/payout amounts and recipients. See scripts/lib/wallet_lifecycle_checks.mjs;
// this is the layer that originally let a zeroed bond/bond-return value
// slip through unnoticed, because nothing compared the capture's claimed
// amounts to the rail's actual funded amount and BOND_BPS.
const expectedBond=validateCaptureAgainstRelease(capture,release,releaseId,sourceSha256);

// Layer 2: independent re-verification against the chain itself. The JSON
// capture is the account owner's claim; this layer does not trust it.
// Every transaction hash is re-fetched and its on-chain sender, recipient,
// value, finalization, and (for contract calls) GenVM consensus/execution
// are checked — so a capture that was hand-edited, or simply wrong, cannot
// pass on self-consistent arithmetic alone.
const client=createClient({chain:studionet});
const address=String(release.contractAddress).toLowerCase();
const issuer=String(release.rail.issuer).toLowerCase(),recipient=String(release.rail.recipient).toLowerCase();
const contractCallActions=new Set(["open_rail","lodge_claim","review_claim","dispute","review_dispute"]);
const expectedSender={open_rail:issuer,lodge_claim:recipient,review_claim:recipient,dispute:recipient,review_dispute:recipient,recipient_payout:address,successful_challenger_bond_return:address};
const expectedValue={open_rail:BigInt(release.rail.funded),dispute:expectedBond,recipient_payout:BigInt(release.rail.funded),successful_challenger_bond_return:expectedBond};
const expectedRecipient={recipient_payout:recipient,successful_challenger_bond_return:recipient};

for(const tx of capture.transactions){
  const chainTx=await client.getTransaction({hash:tx.hash});
  const status=chainTx.statusName,consensus=chainTx.result_name,executionHash=chainTx.tx_execution_hash;
  const from=String(chainTx.from_address??"").toLowerCase(),to=String(chainTx.to_address??"").toLowerCase();
  const value=chainTx.value!==undefined&&chainTx.value!==null?BigInt(chainTx.value):undefined;
  if(status!=="FINALIZED")fail(`${tx.action} (${tx.hash}): on-chain status is ${status||"unknown"}, not FINALIZED`);
  if(contractCallActions.has(tx.action)){
    if(consensus!=="MAJORITY_AGREE")fail(`${tx.action} (${tx.hash}): on-chain consensus is ${consensus||"unknown"}, not MAJORITY_AGREE`);
    if(!executionHash)fail(`${tx.action} (${tx.hash}): no GenVM execution hash recorded`);
    if(to!==address)fail(`${tx.action} (${tx.hash}): does not target the release's contract address (transaction-to-rail correspondence failed)`);
  }
  if(from!==expectedSender[tx.action])fail(`${tx.action} (${tx.hash}): on-chain sender ${from} does not match the expected ${expectedSender[tx.action]}`);
  if(expectedValue[tx.action]!==undefined){
    if(value===undefined)fail(`${tx.action} (${tx.hash}): on-chain transaction carries no value`);
    if(value!==expectedValue[tx.action])fail(`${tx.action} (${tx.hash}): on-chain value ${value} does not match the expected ${expectedValue[tx.action]}`);
  }
  if(expectedRecipient[tx.action]!==undefined&&to!==expectedRecipient[tx.action])fail(`${tx.action} (${tx.hash}): on-chain recipient ${to} does not match the rail's recorded recipient ${expectedRecipient[tx.action]}`);
}

console.log(`Verified ${releaseId} injected-wallet lifecycle: ${ACTIONS.length} transactions independently re-fetched from Studionet and checked for finalization, consensus, GenVM execution, sender/recipient, and exact value; source-matched deployment, pre-funded counter panel, 2/2→3/3 reversal, exact payout (${release.rail.funded}) and bond (${expectedBond}) routing, and terminal conservation.`);
