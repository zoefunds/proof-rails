export const HISTORICAL_V5_RELEASE = {
  name: "Historical V5 browser-wallet dispute proof",
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
export function historicalV5ReleaseForm(){return{name:HISTORICAL_V5_RELEASE.name,recipient:HISTORICAL_V5_RELEASE.recipient,criterion:HISTORICAL_V5_RELEASE.criterion,amount:HISTORICAL_V5_RELEASE.amount,url:HISTORICAL_V5_RELEASE.url,domain:HISTORICAL_V5_RELEASE.domain,publisher:HISTORICAL_V5_RELEASE.publisher,servicePath:HISTORICAL_V5_RELEASE.servicePath,version:HISTORICAL_V5_RELEASE.version,digest:HISTORICAL_V5_RELEASE.digest,from:localDateTimeInput(HISTORICAL_V5_RELEASE.observedFrom),until:localDateTimeInput(HISTORICAL_V5_RELEASE.observedUntil),claimBy:localDateTimeInput(HISTORICAL_V5_RELEASE.claimBy)}}
