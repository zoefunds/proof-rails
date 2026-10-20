import {createHash} from "node:crypto";
import {readFile} from "node:fs/promises";

const releaseId=process.env.PROOFRAIL_RELEASE_ID;
if(releaseId!==undefined&&!/^[a-z0-9][a-z0-9-]{2,63}$/.test(releaseId))throw Error("PROOFRAIL_RELEASE_ID is invalid");
const policyPath=releaseId?new URL(`../artifacts/evidence-policy.${releaseId}.json`,import.meta.url):new URL("../artifacts/evidence-policy.v5.json",import.meta.url);
const counterPath=releaseId?new URL(`../artifacts/counterevidence.${releaseId}.json`,import.meta.url):new URL("../artifacts/counterevidence.v5.json",import.meta.url);
const policy=JSON.parse(await readFile(policyPath,"utf8"));
const counter=JSON.parse(await readFile(counterPath,"utf8"));
const checks=[];
const digest=/^[a-f0-9]{64}$/;
const expectedKeys=["source_id","authority_id","url","publisher_id","publisher_domain","did_sha256","did_http_status","service_path","content_version","content_sha256","evidence_http_status","observed_from","observed_until"];
const validateSource=(source,period)=>{
  if(JSON.stringify(Object.keys(source).sort())!==JSON.stringify([...expectedKeys].sort()))throw Error(`${source.source_id||"unknown"}: source schema rejected`);
  const url=new URL(source.url),domain=String(source.publisher_domain).toLowerCase().replace(/\.$/,"");
  if(url.protocol!=="https:"||url.hostname.toLowerCase().replace(/\.$/,"")!==domain||url.username||url.password||url.port||url.search||url.hash)throw Error(`${source.source_id}: evidence origin rejected`);
  if(source.publisher_id!==`did:web:${domain}`||!source.service_path.startsWith("/")||!source.service_path.endsWith("/")||url.pathname!==`${source.service_path}${source.content_sha256}.json`)throw Error(`${source.source_id}: DID/path binding rejected`);
  if(!digest.test(source.did_sha256)||!digest.test(source.content_sha256)||source.did_http_status!==200||source.evidence_http_status!==200)throw Error(`${source.source_id}: digest or pinned HTTP status rejected`);
  if(source.observed_from!==period.observed_from||source.observed_until!==period.observed_until)throw Error(`${source.source_id}: observation period rejected`);
};
if(policy.schema!=="proofrail.evidence-policy/v5"||counter.schema!=="proofrail.counterevidence/v1")throw Error("policy schema rejected");
const seen={domains:new Set(),publishers:new Set(),authorities:new Set(),sources:new Set()};
for(const source of [...policy.sources,...counter.sources]){
  validateSource(source,policy);
  for(const [kind,value] of [["domains",source.publisher_domain.toLowerCase().replace(/\.$/,"")],["publishers",source.publisher_id],["authorities",source.authority_id],["sources",source.source_id]]){
    if(seen[kind].has(value))throw Error(`${source.source_id}: duplicate ${kind} rejected`);
    seen[kind].add(value);
  }
}
for(const source of [...policy.sources,...counter.sources]){
  checks.push([`https://${source.publisher_domain}/.well-known/did.json`,source.did_sha256,source.did_http_status]);
  checks.push([source.url,source.content_sha256,source.evidence_http_status]);
}
for(const [url,expected,expectedStatus] of checks){
  const response=await fetch(url,{redirect:"manual"});
  if(response.status!==expectedStatus||response.url!==url)throw Error(`${url}: status/final URL rejected`);
  const bytes=Buffer.from(await response.arrayBuffer()),observed=createHash("sha256").update(bytes).digest("hex");
  if(observed!==expected)throw Error(`${url}: expected ${expected}, observed ${observed}`);
}
console.log(`Verified ${checks.length} live objects for ${releaseId||"historical-v5"} with pinned HTTP 200, no redirect, exact final URL, and matching SHA-256.`);
