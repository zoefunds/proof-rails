import {createHash} from "node:crypto";
import {readFile} from "node:fs/promises";

const policy=JSON.parse(await readFile(new URL("../artifacts/evidence-policy.v4.json",import.meta.url),"utf8"));
const counter=JSON.parse(await readFile(new URL("../artifacts/counterevidence.v4.json",import.meta.url),"utf8"));
const checks=[];
for(const source of [...policy.sources,...counter.sources]){
  checks.push([`https://${source.publisher_domain}/.well-known/did.json`,source.did_sha256]);
  checks.push([source.url,source.content_sha256]);
}
for(const [url,expected] of checks){
  const response=await fetch(url,{redirect:"manual"});
  if(response.status!==200||response.url!==url)throw Error(`${url}: status/final URL rejected`);
  const bytes=Buffer.from(await response.arrayBuffer()),observed=createHash("sha256").update(bytes).digest("hex");
  if(observed!==expected)throw Error(`${url}: expected ${expected}, observed ${observed}`);
}
console.log(`Verified ${checks.length} live objects with status 200, no redirect, exact final URL, and matching SHA-256.`);
