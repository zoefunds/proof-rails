import {mkdir,readFile,writeFile} from "node:fs/promises";
import {createAccount,createClient} from "genlayer-js";
import {studionet} from "genlayer-js/chains";
import {TransactionStatus} from "genlayer-js/types";

const address=process.env.PROOFRAIL_CONTRACT_ADDRESS,railId=BigInt(process.env.PROOFRAIL_RAIL_ID||""),releaseId=process.env.PROOFRAIL_RELEASE_ID,openHash=process.env.PROOFRAIL_OPEN_TX,finalHash=process.env.PROOFRAIL_FINAL_TX;
if(!address||!releaseId||!openHash||!finalHash||railId<1n)throw Error("contract address, release ID, rail ID, open transaction, and final transaction are required");
if(!/^[a-z0-9][a-z0-9-]{0,63}$/.test(releaseId))throw Error("release ID must be a lowercase release identifier");
const read=createClient({chain:studionet}),safe=value=>JSON.parse(JSON.stringify(value,(_,item)=>typeof item==="bigint"?item.toString():item));
const canonical=value=>JSON.stringify(value,(_,item)=>item&&typeof item==="object"&&!Array.isArray(item)?Object.fromEntries(Object.entries(item).sort(([a],[b])=>a.localeCompare(b))):item);
const receipt=async(hash,label)=>{const finalized=await read.waitForTransactionReceipt({hash,status:TransactionStatus.FINALIZED,retries:12,interval:5000}),transaction=await read.getTransaction({hash}),consensus=finalized.result_name??finalized.resultName,executionHash=transaction.tx_execution_hash??transaction.txExecutionHash;if(consensus!=="MAJORITY_AGREE"||!executionHash)throw Error(`${label} lacks majority finality or execution hash`);return {label,hash,consensus,execution:"FINALIZED_WITH_EXECUTION_HASH",executionHash};};
const [deployment,policy,counter,open,final,rail,accounting,primaryReceipt,disputeReceipt]=await Promise.all([
  JSON.parse(await readFile(new URL(`../artifacts/deployment.${releaseId}.studionet.json`,import.meta.url),"utf8")),
  JSON.parse(await readFile(new URL(`../artifacts/evidence-policy.${releaseId}.json`,import.meta.url),"utf8")),
  JSON.parse(await readFile(new URL(`../artifacts/counterevidence.${releaseId}.json`,import.meta.url),"utf8")),
  receipt(openHash,"funded rail open"),receipt(finalHash,"counterevidence review and settlement"),
  read.readContract({address,functionName:"get_rail",args:[railId]}),read.readContract({address,functionName:"accounting",args:[]}),
  read.readContract({address,functionName:"get_receipt",args:[railId,false,1]}),read.readContract({address,functionName:"get_receipt",args:[railId,true,1]}),
]);
if(policy.schema!=="proofrail.evidence-policy/v7"||counter.schema!=="proofrail.counterevidence/v1"||canonical(policy.counterevidence)!==canonical(counter))throw Error("release manifests do not prove a pre-funded matching counter panel");
if(deployment.releaseId!==releaseId)throw Error("deployment record release does not match receipt capture release");
if(deployment.contractAddress.toLowerCase()!==address.toLowerCase())throw Error("deployment record contract does not match capture contract");
if(canonical(JSON.parse(String(rail.counterevidence_json)))!==canonical(counter))throw Error("rail did not persist the pre-funded counter panel");
const report={schema:"proofrail.live-receipt-capture/v1",releaseId,network:"GenLayer Studionet",chainId:61999,contractAddress:address,railId:railId.toString(),deployment,evidencePolicy:policy,counterevidence:counter,finalizedTransactions:[open,final],rail:safe(rail),accounting:safe(accounting),primaryReceipt:safe(primaryReceipt),disputeReceipt:safe(disputeReceipt),capturedAt:new Date().toISOString()};
await mkdir(new URL("../artifacts",import.meta.url),{recursive:true});await writeFile(new URL(`../artifacts/live-receipts.${releaseId}.studionet.json`,import.meta.url),JSON.stringify(report,null,2)+"\n");console.log(JSON.stringify(report,null,2));
