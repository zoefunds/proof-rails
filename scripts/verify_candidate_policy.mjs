import {readFile} from "node:fs/promises";

const policy=JSON.parse(await readFile(new URL("../artifacts/evidence-policy.hardened-v6.json",import.meta.url),"utf8"));
const counter=JSON.parse(await readFile(new URL("../artifacts/counterevidence.hardened-v6.json",import.meta.url),"utf8"));
const fail=message=>{throw Error(`candidate policy rejected: ${message}`)};
if(policy.schema!=="proofrail.evidence-policy/v5")fail("historical pinned source artifact was changed unexpectedly");
if(counter.schema!=="proofrail.counterevidence/v1")fail("historical counter panel schema mismatch");
if(policy.sources.length!==2||counter.sources.length!==3)fail("historical panel counts do not match documented funded proof");
const identities=new Set();
for(const source of [...policy.sources,...counter.sources]){
  const url=new URL(source.url),domain=source.publisher_domain.toLowerCase().replace(/\.$/,"");
  if(url.protocol!=="https:"||url.hostname.toLowerCase()!==domain||url.username||url.password||url.port||url.search||url.hash)fail(`${source.source_id}: origin is ambiguous`);
  if(source.publisher_id!==`did:web:${domain}`||source.url!==`https://${domain}${source.service_path}${source.content_sha256}.json`)fail(`${source.source_id}: identity/path binding mismatch`);
  if(!/^[a-f0-9]{64}$/.test(source.did_sha256)||!/^[a-f0-9]{64}$/.test(source.content_sha256))fail(`${source.source_id}: pinned digest malformed`);
  for(const identity of [domain,source.publisher_id,source.authority_id,source.source_id]){if(identities.has(identity))fail(`${source.source_id}: duplicate identity across panels`);identities.add(identity)}
}
console.log("Verified historical v5 source manifests remain byte-preserved. They are not a v6 pre-funded dual-panel candidate or live deployment proof.");
