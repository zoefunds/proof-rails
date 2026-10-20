import {createHash} from "node:crypto";
import {readFile} from "node:fs/promises";

const root=new URL("../",import.meta.url);
const manifest=JSON.parse(await readFile(new URL("artifacts/release-verification.v5.json",root),"utf8"));
const fail=message=>{throw Error(`release artifact rejected: ${message}`)};
if(manifest.schema!=="proofrail.release-verification/v1")fail("unexpected schema");
if(!/^[0-9a-f]{40}$/.test(manifest.implementationCommit))fail("invalid implementation commit");
if(manifest.chainId!==61999||manifest.network!=="GenLayer Studionet")fail("wrong network");
for(const [path,expected] of Object.entries(manifest.files)){
  if(!/^[0-9a-f]{64}$/.test(expected))fail(`invalid digest for ${path}`);
  const actual=createHash("sha256").update(await readFile(new URL(path,root))).digest("hex");
  if(actual!==expected)fail(`${path} differs from the reviewed release`);
}
const deployment=JSON.parse(await readFile(new URL("artifacts/deployment.studionet.json",root),"utf8"));
const proof=JSON.parse(await readFile(new URL("artifacts/live-e2e-4.studionet.json",root),"utf8"));
if(deployment.contractAddress.toLowerCase()!==manifest.contractAddress.toLowerCase()||deployment.txHash!==manifest.deploymentTransaction)fail("deployment identity mismatch");
if(proof.contractAddress.toLowerCase()!==manifest.contractAddress.toLowerCase())fail("proof contract mismatch");
if(manifest.verifiedResults.directMode!=="34 passed"||manifest.verifiedResults.frontend!=="24 passed"||manifest.verifiedResults.sourceEquivalent!==true)fail("release result summary is stale");
if(manifest.hostedCI.status!=="EXTERNAL_BLOCKER")fail("hosted CI status must remain explicit until an independent run passes");
console.log(`Verified release manifest for implementation commit ${manifest.implementationCommit}.`);
