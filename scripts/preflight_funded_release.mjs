import {createHash} from "node:crypto";
import {readFile} from "node:fs/promises";

const releaseId=process.env.PROOFRAIL_RELEASE_ID||"hardened-v7";
if(!/^[a-z0-9][a-z0-9-]{2,63}$/.test(releaseId))throw Error("PROOFRAIL_RELEASE_ID is invalid");
for(const name of ["PROOFRAIL_DEPLOYER_KEY","PROOFRAIL_ISSUER_KEY","PROOFRAIL_RECIPIENT_KEY"]){if(!process.env[name])throw Error(`${name} is required for the later funded release`)}
const [source,policyText,counterText]=await Promise.all([
  readFile(new URL("../contracts/proofrail.py",import.meta.url)),
  readFile(new URL(`../artifacts/evidence-policy.${releaseId}.json`,import.meta.url),"utf8"),
  readFile(new URL(`../artifacts/counterevidence.${releaseId}.json`,import.meta.url),"utf8"),
]);
const policy=JSON.parse(policyText),counter=JSON.parse(counterText);
if(policy.schema!=="proofrail.evidence-policy/v7"||counter.schema!=="proofrail.counterevidence/v1"||JSON.stringify(policy.counterevidence)!==JSON.stringify(counter))throw Error("policy is not a matching pre-funded dual-panel release");
if(policy.sources.length<policy.source_rule.min_sources||counter.sources.length<policy.counter_rule.min_sources)throw Error("policy lacks a quorum panel");
console.log(JSON.stringify({releaseId,sourceSha256:createHash("sha256").update(source).digest("hex"),primarySources:policy.sources.length,counterSources:counter.sources.length,issuerAndRecipientKeys:"configured",nextWrites:["deploy corrected contract","fund 0.01 GEN escrow","post 0.0005 GEN challenge bond","settle escrow"],note:"Preflight performs no chain write and does not print secret material."},null,2));
