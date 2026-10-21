import {readFile} from "node:fs/promises";

const releaseId=process.env.PROOFRAIL_RELEASE_ID||"hardened-v7";
if(!/^[a-z0-9][a-z0-9-]{2,63}$/.test(releaseId))throw Error("PROOFRAIL_RELEASE_ID is invalid");
const policy=JSON.parse(await readFile(new URL(`../artifacts/evidence-policy.${releaseId}.json`,import.meta.url),"utf8"));
const counter=JSON.parse(await readFile(new URL(`../artifacts/counterevidence.${releaseId}.json`,import.meta.url),"utf8"));
const fail=message=>{throw Error(`candidate policy rejected: ${message}`)};
if(policy.schema!=="proofrail.evidence-policy/v7")fail("policy is not a v7 pre-funded dual-panel policy");
if(counter.schema!=="proofrail.counterevidence/v1")fail("counter-panel schema mismatch");
if(JSON.stringify(policy.counterevidence)!==JSON.stringify(counter))fail("nested counter panel differs from separately published panel");
if(policy.sources.length<policy.source_rule?.min_sources||counter.sources.length<policy.counter_rule?.min_sources)fail("panel counts do not meet their frozen rules");
const identities=new Set();
for(const source of [...policy.sources,...counter.sources]){
  const url=new URL(source.url),domain=source.publisher_domain.toLowerCase().replace(/\.$/,"");
  if(url.protocol!=="https:"||url.hostname.toLowerCase()!==domain||url.username||url.password||url.port||url.search||url.hash)fail(`${source.source_id}: origin is ambiguous`);
  if(source.publisher_id!==`did:web:${domain}`||source.url!==`https://${domain}${source.service_path}${source.content_sha256}.json`)fail(`${source.source_id}: identity/path binding mismatch`);
  if(!/^[a-f0-9]{64}$/.test(source.did_sha256)||!/^[a-f0-9]{64}$/.test(source.content_sha256))fail(`${source.source_id}: pinned digest malformed`);
  for(const identity of [domain,source.publisher_id,source.authority_id,source.source_id]){if(identities.has(identity))fail(`${source.source_id}: duplicate identity across panels`);identities.add(identity)}
}
console.log(`Verified ${releaseId} v7 pre-funded dual-panel manifest integrity. It is a candidate policy, not a funded or deployed proof.`);
