export const VERIFIED_RELEASE = {
  name: "Browser-wallet uptime dispute proof",
  recipient: "0x6f0b4cE7a1872db132b2F6B7743deFb30eBa698a",
  criterion: "For the frozen 2026-10-20 13:50–14:50 UTC observation period, classify FULFILLED only when measured uptime is at least 99.90%; otherwise classify BREACHED. Publisher outcome declarations are non-authoritative.",
  amount: "0.01",
  url: "https://source-1-inky.vercel.app/evidence/4ad20c0c68c8ff5d499211e7073225d8dfbfefd9e57ee20626d1878c1e0734b8.json",
  domain: "source-1-inky.vercel.app",
  publisher: "did:web:source-1-inky.vercel.app",
  servicePath: "/evidence/",
  version: "proofrail-v5/uptime-primary-1",
  digest: "4ad20c0c68c8ff5d499211e7073225d8dfbfefd9e57ee20626d1878c1e0734b8",
  observedFrom: "2026-10-20T13:50:00Z",
  observedUntil: "2026-10-20T14:50:00Z",
  claimBy: "2026-10-22T15:00:00Z",
} as const;
export function localDateTimeInput(iso:string){const d=new Date(iso),p=(v:number)=>String(v).padStart(2,"0");return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`}
export function verifiedReleaseForm(){return{name:VERIFIED_RELEASE.name,recipient:VERIFIED_RELEASE.recipient,criterion:VERIFIED_RELEASE.criterion,amount:VERIFIED_RELEASE.amount,url:VERIFIED_RELEASE.url,domain:VERIFIED_RELEASE.domain,publisher:VERIFIED_RELEASE.publisher,servicePath:VERIFIED_RELEASE.servicePath,version:VERIFIED_RELEASE.version,digest:VERIFIED_RELEASE.digest,from:localDateTimeInput(VERIFIED_RELEASE.observedFrom),until:localDateTimeInput(VERIFIED_RELEASE.observedUntil),claimBy:localDateTimeInput(VERIFIED_RELEASE.claimBy)}}
