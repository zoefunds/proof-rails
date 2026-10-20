import {createHash} from "node:crypto";
import {writeFile} from "node:fs/promises";

const releaseId=process.env.PROOFRAIL_RELEASE_ID,dryRun=process.env.PROOFRAIL_DRY_RUN==="1",domains=(process.env.PROOFRAIL_PUBLISHER_DOMAINS||"").split(",").map(value=>value.trim().toLowerCase()).filter(Boolean);
if(!/^[a-z0-9][a-z0-9-]{2,63}$/.test(releaseId||""))throw Error("PROOFRAIL_RELEASE_ID must be a lowercase release identifier");
if(domains.length!==5||new Set(domains).size!==5||domains.some(domain=>!/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)))throw Error("PROOFRAIL_PUBLISHER_DOMAINS must provide five unique DNS domains");
const roots=[
  ["source-1","BREACHED",1],
  ["source-2","BREACHED",2],
  ["source-3","FULFILLED",20],
  ["source-4","FULFILLED",24],
  ["source-5","FULFILLED",18],
];
const observed_from=1792504200,observed_until=1792507800,sha=value=>createHash("sha256").update(value).digest("hex"),stable=value=>JSON.stringify(value);
const sources=[];
for(let index=0;index<roots.length;index++){
  const [directory,outcome,unavailable_seconds]=roots[index],domain=domains[index],number=index+1,source_id=`publisher-${number}`,authority_id=`urn:proofrail:independent-authority:${number}`,content_version=`proofrail-${releaseId}/uptime-${number<=2?"primary":"counter"}-${number}`,total_seconds=observed_until-observed_from;
  const artifact=stable({schema:"proofrail.independent-attestation/v2",publisher_id:`did:web:${domain}`,authority_id,source_id,subject:"API availability on 2026-10-20 from 13:50–14:50 UTC",content_version,outcome,observed_from,observed_until,statement:`The monitor recorded ${unavailable_seconds} unavailable seconds out of ${total_seconds} seconds. The publisher outcome declaration is not authoritative.`,facts:{total_seconds,unavailable_seconds,period_start:observed_from,period_end:observed_until}});
  const content_sha256=sha(artifact),did=stable({id:`did:web:${domain}`,service:[{id:`did:web:${domain}#evidence`,type:"LinkedDomains",serviceEndpoint:`https://${domain}/evidence/`}]}),did_sha256=sha(did),root=new URL(`../publishers/${directory}/`,import.meta.url);
  // Content-addressed files are append-only: never remove historical evidence
  // that is referenced by finalized receipts.
  if(!dryRun){await writeFile(new URL(`evidence/${content_sha256}.json`,root),artifact);await writeFile(new URL(".well-known/did.json",root),did);}
  sources.push({source_id,authority_id,url:`https://${domain}/evidence/${content_sha256}.json`,publisher_id:`did:web:${domain}`,publisher_domain:domain,did_sha256,did_http_status:200,service_path:"/evidence/",content_version,content_sha256,evidence_http_status:200,observed_from,observed_until});
}
const policy={schema:"proofrail.evidence-policy/v5",observed_from,observed_until,source_rule:{min_sources:2,min_verified:2,min_agreement:2},counter_rule:{min_sources:3,min_verified:3,min_agreement:2},semantic_rule:{kind:"uptime_bps",threshold_bps:9990,fulfilled_code:"FULFILLED",breached_code:"BREACHED"},sources:sources.slice(0,2)};
const counter={schema:"proofrail.counterevidence/v1",sources:sources.slice(2)};
if(!dryRun){await writeFile(new URL(`../artifacts/evidence-policy.${releaseId}.json`,import.meta.url),stable(policy)+"\n");await writeFile(new URL(`../artifacts/counterevidence.${releaseId}.json`,import.meta.url),stable(counter)+"\n");}
console.log(JSON.stringify({releaseId,dryRun,sources,policy,counter},null,2));
