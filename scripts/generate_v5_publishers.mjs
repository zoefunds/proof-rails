import {createHash} from "node:crypto";
import {readdir,rm,writeFile} from "node:fs/promises";

const roots=[
  ["source-1","source-1-inky.vercel.app","FULFILLED"],
  ["source-2","source-2-ten.vercel.app","FULFILLED"],
  ["source-3","source-3-five.vercel.app","BREACHED"],
  ["source-4","source-4-kappa.vercel.app","BREACHED"],
  ["source-5","source-5-three.vercel.app","BREACHED"],
];
const observed_from=1792504200,observed_until=1792507800,sha=value=>createHash("sha256").update(value).digest("hex"),stable=value=>JSON.stringify(value);
const sources=[];
for(let index=0;index<roots.length;index++){
  const [directory,domain,outcome]=roots[index],number=index+1,source_id=`publisher-${number}`,authority_id=`urn:proofrail:independent-authority:${number}`,content_version=`proofrail-v5/${number<=2?"primary":"counter"}-${number}`;
  const artifact=stable({schema:"proofrail.independent-attestation/v2",publisher_id:`did:web:${domain}`,authority_id,source_id,subject:"ProofRail v5 contested release gate",content_version,outcome,observed_from,observed_until,statement:outcome==="FULFILLED"?"Independent observation The independently observed release condition was fulfilled.":"Independent counter-observation The independently observed release condition was breached."});
  const content_sha256=sha(artifact),did=stable({id:`did:web:${domain}`,service:[{id:`did:web:${domain}#evidence`,type:"LinkedDomains",serviceEndpoint:`https://${domain}/evidence/`}]}),did_sha256=sha(did),root=new URL(`../publishers/${directory}/`,import.meta.url);
  for(const old of await readdir(new URL("evidence/",root)))await rm(new URL(`evidence/${old}`,root));
  await writeFile(new URL(`evidence/${content_sha256}.json`,root),artifact);
  await writeFile(new URL(".well-known/did.json",root),did);
  sources.push({source_id,authority_id,url:`https://${domain}/evidence/${content_sha256}.json`,publisher_id:`did:web:${domain}`,publisher_domain:domain,did_sha256,service_path:"/evidence/",content_version,content_sha256,observed_from,observed_until});
}
const policy={schema:"proofrail.evidence-policy/v5",observed_from,observed_until,source_rule:{min_sources:2,min_verified:2,min_agreement:2},counter_rule:{min_sources:3,min_verified:3,min_agreement:2},sources:sources.slice(0,2)};
const counter={schema:"proofrail.counterevidence/v1",sources:sources.slice(2)};
await writeFile(new URL("../artifacts/evidence-policy.v5.json",import.meta.url),stable(policy)+"\n");
await writeFile(new URL("../artifacts/counterevidence.v5.json",import.meta.url),stable(counter)+"\n");
console.log(`Generated ${sources.length} schema-bound publisher artifacts.`);
