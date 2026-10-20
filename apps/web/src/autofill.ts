export const VERIFIED_RELEASE = {
  name: "ProofRail v5 authenticated-source verification",
  recipient: "0x53705Bb2B34ff7CEcC93F79a1D91aDa1185D87Dd",
  criterion: "Accept the exact-schema outcome reported by a strict majority of independently identified, DID-pinned, digest-bound publisher artifacts.",
  amount: "0.01",
  url: "https://source-1-inky.vercel.app/evidence/b32e5b4fdcbe2e0d668a8f2a73c77e7214345db0a386ce4afa352e002a670b87.json",
  domain: "source-1-inky.vercel.app",
  publisher: "did:web:source-1-inky.vercel.app",
  servicePath: "/evidence/",
  version: "proofrail-v5/primary-1",
  digest: "b32e5b4fdcbe2e0d668a8f2a73c77e7214345db0a386ce4afa352e002a670b87",
  observedFrom: "2026-10-20T14:30:00Z",
  observedUntil: "2026-10-20T15:30:00Z",
  claimBy: "2026-10-22T15:30:00Z",
} as const;
export function localDateTimeInput(iso:string){const d=new Date(iso),p=(v:number)=>String(v).padStart(2,"0");return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`}
export function verifiedReleaseForm(){return{name:VERIFIED_RELEASE.name,recipient:VERIFIED_RELEASE.recipient,criterion:VERIFIED_RELEASE.criterion,amount:VERIFIED_RELEASE.amount,url:VERIFIED_RELEASE.url,domain:VERIFIED_RELEASE.domain,publisher:VERIFIED_RELEASE.publisher,servicePath:VERIFIED_RELEASE.servicePath,version:VERIFIED_RELEASE.version,digest:VERIFIED_RELEASE.digest,from:localDateTimeInput(VERIFIED_RELEASE.observedFrom),until:localDateTimeInput(VERIFIED_RELEASE.observedUntil),claimBy:localDateTimeInput(VERIFIED_RELEASE.claimBy)}}
