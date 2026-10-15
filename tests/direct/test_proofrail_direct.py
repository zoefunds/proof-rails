import hashlib,json,sys,pytest

BODY='{"availability":"99.2%","incident_minutes":350,"period":"2030-01"}'
DIGEST=hashlib.sha256(BODY.encode()).hexdigest()
EVIDENCE=json.dumps({"url":"https://status.acme.test/attestations/"+DIGEST+".json","publisher_id":"did:web:status.acme.test","publisher_domain":"status.acme.test","content_version":"2030-01/v1","content_sha256":DIGEST,"observed_from":1893456000,"observed_until":1896134400})
OUTCOMES=json.dumps([{"code":"PASS","description":"availability at least 99.9%","payout_bps":0},{"code":"BREACH","description":"availability below 99.9%","payout_bps":10000}])
START=1893456000; END=1896134400

def addr(c,x):return type(c._zero())(x)
def warp(vm,t):vm.warp(t);sys.modules["genlayer.gl"].message_raw["datetime"]=t
def create(vm,c,a,b,amount=20000):
 vm.sender=addr(c,a);vm.value=amount;c.open_rail(addr(c,b),"January service rail","Availability is at least 99.9%",START,END,amount,EVIDENCE,OUTCOMES)
def mocks(vm,code,body=BODY):
 did=json.dumps({"id":"did:web:status.acme.test","service":[{"id":"did:web:status.acme.test#attestations","type":"LinkedDomains","serviceEndpoint":"https://status.acme.test/attestations/"}]})
 vm.mock_web("status.acme.test/.well-known/did.json",{"method":"GET","status":200,"body":did});vm.mock_web("status.acme.test/attestations/"+DIGEST+".json",{"method":"GET","status":200,"body":body});vm.mock_llm(".*",code)

@pytest.mark.direct
def test_full_claim_to_payout_direct(direct_vm,direct_deploy,direct_alice,direct_bob,direct_charlie):
 c=direct_deploy("contracts/proofrail.py");create(direct_vm,c,direct_alice,direct_bob);warp(direct_vm,"2030-02-01T00:00:00Z");direct_vm.sender=addr(c,direct_bob);c.lodge_claim(1);mocks(direct_vm,"BREACH");direct_vm.sender=addr(c,direct_charlie);c.review_claim(1);assert c.get_rail(1).provisional_code=="BREACH";warp(direct_vm,"2030-02-03T00:00:01Z");c.finalize(1);assert c.get_rail(1).status==5;assert c.accounting()["paid"]==20000

@pytest.mark.direct
def test_successful_challenge_resolution_direct(direct_vm,direct_deploy,direct_alice,direct_bob,direct_charlie):
 c=direct_deploy("contracts/proofrail.py");create(direct_vm,c,direct_alice,direct_bob);warp(direct_vm,"2030-02-01T00:00:00Z");direct_vm.sender=addr(c,direct_bob);c.lodge_claim(1);mocks(direct_vm,"PASS");direct_vm.sender=addr(c,direct_charlie);c.review_claim(1);direct_vm.sender=addr(c,direct_bob);direct_vm.value=1000;c.dispute(1,"The recorded availability conflicts with the service commitment.");direct_vm.clear_mocks();mocks(direct_vm,"BREACH");direct_vm.sender=addr(c,direct_charlie);c.review_dispute(1);r=c.get_rail(1);assert r.status==5 and r.final_code=="BREACH";assert c.accounting()["bonds_locked"]==0

@pytest.mark.direct
def test_unavailable_dispute_remains_retryable_and_preserves_bond(direct_vm,direct_deploy,direct_alice,direct_bob,direct_charlie):
 c=direct_deploy("contracts/proofrail.py");create(direct_vm,c,direct_alice,direct_bob);warp(direct_vm,"2030-02-01T00:00:00Z");direct_vm.sender=addr(c,direct_bob);c.lodge_claim(1);mocks(direct_vm,"PASS");direct_vm.sender=addr(c,direct_charlie);c.review_claim(1);direct_vm.sender=addr(c,direct_bob);direct_vm.value=1000;c.dispute(1,"Request a bounded reconsideration of the same authenticated artifact.");direct_vm.clear_mocks();direct_vm.sender=addr(c,direct_charlie);c.review_dispute(1);r=c.get_rail(1);assert r.status==4 and r.bond==1000 and c.accounting()["bonds_locked"]==1000
 warp(direct_vm,"2030-02-01T01:00:01Z");mocks(direct_vm,"BREACH");c.review_dispute(1);r=c.get_rail(1);assert r.status==5 and r.final_code=="BREACH" and r.bond==0;assert c.accounting()["bonds_locked"]==0

@pytest.mark.direct
def test_tampered_bytes_never_reach_classifier(direct_vm,direct_deploy,direct_alice,direct_bob,direct_charlie):
 c=direct_deploy("contracts/proofrail.py");create(direct_vm,c,direct_alice,direct_bob);warp(direct_vm,"2030-02-01T00:00:00Z");direct_vm.sender=addr(c,direct_bob);c.lodge_claim(1);mocks(direct_vm,"PASS","changed");direct_vm.sender=addr(c,direct_charlie);c.review_claim(1);receipt=c.get_receipt(1,False,1);assert receipt.result=="TAMPERED" and receipt.expected_digest!=receipt.observed_digest;assert c.get_rail(1).status==2

@pytest.mark.direct
def test_publisher_origin_is_bound(direct_vm,direct_deploy,direct_alice,direct_bob):
 c=direct_deploy("contracts/proofrail.py");bad=json.loads(EVIDENCE);bad["publisher_domain"]="attacker.test";direct_vm.sender=addr(c,direct_alice);direct_vm.value=20000
 with pytest.raises(AssertionError):c.open_rail(addr(c,direct_bob),"x","y",START,END,20000,json.dumps(bad),OUTCOMES)

@pytest.mark.direct
def test_publisher_did_and_content_address_are_bound(direct_vm,direct_deploy,direct_alice,direct_bob):
 c=direct_deploy("contracts/proofrail.py");direct_vm.sender=addr(c,direct_alice);direct_vm.value=20000
 bad=json.loads(EVIDENCE);bad["publisher_id"]="did:web:somebody-else.test"
 with pytest.raises(AssertionError):c.open_rail(addr(c,direct_bob),"x","y",START,END,20000,json.dumps(bad),OUTCOMES)

@pytest.mark.direct
def test_malformed_url_authority_and_credentials_are_rejected(direct_vm,direct_deploy,direct_alice,direct_bob):
 c=direct_deploy("contracts/proofrail.py");direct_vm.sender=addr(c,direct_alice);direct_vm.value=20000
 bad=json.loads(EVIDENCE);bad["url"]="https://status.acme.test@evil.test/attestations/"+DIGEST+".json"
 with pytest.raises(AssertionError):c.open_rail(addr(c,direct_bob),"x","y",START,END,20000,json.dumps(bad),OUTCOMES)
 bad=json.loads(EVIDENCE);bad["url"]="https://user:password@status.acme.test/attestations/"+DIGEST+".json"
 with pytest.raises(AssertionError):c.open_rail(addr(c,direct_bob),"x","y",START,END,20000,json.dumps(bad),OUTCOMES)

@pytest.mark.direct
def test_claim_waits_for_completed_observation_window(direct_vm,direct_deploy,direct_alice,direct_bob):
 c=direct_deploy("contracts/proofrail.py");create(direct_vm,c,direct_alice,direct_bob);warp(direct_vm,"2030-01-15T00:00:00Z");direct_vm.sender=addr(c,direct_bob)
 with pytest.raises(AssertionError):c.lodge_claim(1)

@pytest.mark.direct
def test_expired_unreviewed_claim_is_permissionlessly_recoverable(direct_vm,direct_deploy,direct_alice,direct_bob,direct_charlie):
 c=direct_deploy("contracts/proofrail.py");create(direct_vm,c,direct_alice,direct_bob);warp(direct_vm,"2030-02-01T00:00:00Z");direct_vm.sender=addr(c,direct_bob);c.lodge_claim(1);warp(direct_vm,"2030-02-08T00:00:01Z");direct_vm.sender=addr(c,direct_charlie);c.recover(1);r=c.get_rail(1);assert r.status==8 and r.locked==0 and r.returned==20000;assert c.accounting()["locked"]==0

@pytest.mark.direct
def test_permanently_unavailable_dispute_has_bounded_recovery(direct_vm,direct_deploy,direct_alice,direct_bob,direct_charlie):
 c=direct_deploy("contracts/proofrail.py");create(direct_vm,c,direct_alice,direct_bob);warp(direct_vm,"2030-02-01T00:00:00Z");direct_vm.sender=addr(c,direct_bob);c.lodge_claim(1);mocks(direct_vm,"PASS");direct_vm.sender=addr(c,direct_charlie);c.review_claim(1);direct_vm.sender=addr(c,direct_bob);direct_vm.value=1000;c.dispute(1,"Reconsider the same authenticated artifact.");direct_vm.clear_mocks();direct_vm.sender=addr(c,direct_charlie);c.review_dispute(1);assert c.get_rail(1).status==4;warp(direct_vm,"2030-02-04T00:00:01Z");c.recover(1);r=c.get_rail(1);assert r.status==6 and r.final_code=="PASS" and r.locked==0 and r.bond==0;assert c.accounting()["bonds_locked"]==0

@pytest.mark.direct
def test_outcome_descriptions_are_supplied_for_arbitrary_codes(direct_vm,direct_deploy,direct_alice,direct_bob,direct_charlie):
 c=direct_deploy("contracts/proofrail.py");create(direct_vm,c,direct_alice,direct_bob);warp(direct_vm,"2030-02-01T00:00:00Z");direct_vm.sender=addr(c,direct_bob);c.lodge_claim(1);did=json.dumps({"id":"did:web:status.acme.test","service":[{"serviceEndpoint":"https://status.acme.test/attestations/"}]});direct_vm.mock_web("status.acme.test/.well-known/did.json",{"status":200,"body":did});direct_vm.mock_web("status.acme.test/attestations/"+DIGEST+".json",{"status":200,"body":BODY});direct_vm.mock_llm(".*OUTCOME_DEFINITIONS=.*availability below 99.9%.*","BREACH");direct_vm.sender=addr(c,direct_charlie);c.review_claim(1);assert c.get_rail(1).provisional_code=="BREACH"
 bad=json.loads(EVIDENCE);bad["url"]="https://status.acme.test/attestations/latest.json"
 with pytest.raises(AssertionError):c.open_rail(addr(c,direct_bob),"x","y",START,END,20000,json.dumps(bad),OUTCOMES)

@pytest.mark.direct
def test_exact_funding_and_bounded_reads(direct_vm,direct_deploy,direct_alice,direct_bob):
 c=direct_deploy("contracts/proofrail.py");create(direct_vm,c,direct_alice,direct_bob);assert c.accounting()["funded"]==20000 and len(c.list_rails(0,25))==1
 with pytest.raises(AssertionError):c.list_rails(0,26)

@pytest.mark.direct
def test_failed_native_transfer_reverts_settlement(direct_vm,direct_deploy,direct_alice,direct_bob,direct_charlie):
 c=direct_deploy("contracts/proofrail.py");create(direct_vm,c,direct_alice,direct_bob);warp(direct_vm,"2030-02-01T00:00:00Z");direct_vm.sender=addr(c,direct_bob);c.lodge_claim(1);mocks(direct_vm,"BREACH");direct_vm.sender=addr(c,direct_charlie);c.review_claim(1);warp(direct_vm,"2030-02-03T00:00:01Z")
 def fail_transfer(vm,request):
  if "EthSend" in request:raise RuntimeError("simulated native transfer failure")
 direct_vm._gl_call_hook=fail_transfer
 with pytest.raises(RuntimeError,match="native transfer failure"):c.finalize(1)

