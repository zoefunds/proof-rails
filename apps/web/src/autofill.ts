export const VERIFIED_RELEASE = {
  name: "ProofRail v2 production release verification",
  recipient: "0x5e48a9D408885Abbc110fAE230e440b17727cE6a",
  criterion: "Classify FULFILLED only when the immutable ProofRail release attestation reports thirteen passing Direct Mode contract tests, ten passing frontend protocol tests, a passing contract lint, passing TypeScript and production build, and zero production dependency vulnerabilities. Otherwise classify BREACHED.",
  amount: "0.01",
  url: "https://proof-rails.vercel.app/evidence/a912d78cc5052b6bfdecca0e1cc3b3a2f512f414c5697669f96d0437714d19b1.json",
  domain: "proof-rails.vercel.app",
  publisher: "did:web:proof-rails.vercel.app",
  version: "proofrail-release/2.0.0",
  digest: "a912d78cc5052b6bfdecca0e1cc3b3a2f512f414c5697669f96d0437714d19b1",
  observedFrom: "2026-10-15T19:30:00Z",
  observedUntil: "2026-10-15T21:25:00Z",
} as const;
export function localDateTimeInput(iso:string){const d=new Date(iso),p=(v:number)=>String(v).padStart(2,"0");return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`}
export function verifiedReleaseForm(){return{name:VERIFIED_RELEASE.name,recipient:VERIFIED_RELEASE.recipient,criterion:VERIFIED_RELEASE.criterion,amount:VERIFIED_RELEASE.amount,url:VERIFIED_RELEASE.url,domain:VERIFIED_RELEASE.domain,publisher:VERIFIED_RELEASE.publisher,version:VERIFIED_RELEASE.version,digest:VERIFIED_RELEASE.digest,from:localDateTimeInput(VERIFIED_RELEASE.observedFrom),until:localDateTimeInput(VERIFIED_RELEASE.observedUntil)}}
