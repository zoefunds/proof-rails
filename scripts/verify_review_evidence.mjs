import {readFile} from "node:fs/promises";

const root=new URL("../",import.meta.url);
const governance=JSON.parse(await readFile(new URL("artifacts/authority-governance.v1.json",root),"utf8"));
const blocker=JSON.parse(await readFile(new URL("artifacts/ci-blocker.v1.json",root),"utf8"));
const fail=message=>{throw Error(`review evidence rejected: ${message}`)};
if(governance.schema!=="proofrail.authority-governance/v1"||governance.admissionMode!=="TRUSTED_ISSUER_CREDENTIAL")fail("authority governance schema is invalid");
if(governance.minimumIndependentPrimaryOperators<2||governance.minimumIndependentCounterOperators<3)fail("independent operator quorum is too weak");
for(const key of ["credentialProofRequired","credentialStatusRequired","expiryCheckRequired","uniqueLegalEntityId","uniqueOperatorId","uniquePublisherDid","uniqueRegistrableDomain","uniqueInfrastructureControl","conflictDisclosureRequired","unverifiableFailsClosed"])if(governance.requirements[key]!==true)fail(`missing governance requirement ${key}`);
if(governance.requirements.selfIssuedCredentialsAllowed!==false)fail("self-issued credentials cannot establish independence");
if(governance.currentDemonstration.classification!=="DEMONSTRATION_ONLY"||governance.currentDemonstration.organizationalIndependenceProven!==false)fail("fixture publishers are overstated");
if(blocker.schema!=="proofrail.ci-blocker/v1"||blocker.executionClassification!=="RUNNER_STARTUP_BLOCKED"||blocker.jobs.length!==2||blocker.jobs.some(job=>job.executedSteps!==0))fail("CI blocker evidence is inconsistent");
if(!blocker.githubAnnotation.includes("account is locked due to a billing issue"))fail("GitHub blocker annotation is missing");
console.log("Verified authority-admission requirements, honest demonstration scope, and zero-step GitHub runner blocker evidence.");
