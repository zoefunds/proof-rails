# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""ProofRail: content-addressed attestation escrow for real-world obligations."""
from dataclasses import dataclass
import datetime, hashlib, json
from urllib.parse import urlsplit
from genlayer import *

DRAFT=0; CLAIMED=1; REVIEWING=2; PROVISIONAL=3; DISPUTED=4; PAID=5; RELEASED=6; EXPIRED=7; VOIDED=8
VERIFIED="VERIFIED"; UNAVAILABLE="UNAVAILABLE"; TAMPERED="TAMPERED"; INVALID="INVALID"
CHALLENGE_WINDOW=u256(172800); REVIEW_WINDOW=u256(604800); DISPUTE_WINDOW=u256(259200); RETRY_INTERVAL=u256(60); MIN_CLAIM_WINDOW=u256(86400); BOND_BPS=u256(500);MAX_ATTEMPTS=5;MAX_BODY_BYTES=12000

@allow_storage
@dataclass
class Rail:
 issuer:Address; recipient:Address; name:str; criterion:str; evidence_json:str; counterevidence_json:str; outcomes_json:str; funded:u256; locked:u256; paid:u256; returned:u256; status:u8; opens_at:u256; closes_at:u256; claimed_at:u256; attempts:u8; last_attempt:u256; provisional_code:str; provisional_amount:u256; challenge_until:u256; challenger:Address; bond:u256; dispute_deadline:u256; challenge_reason:str; final_code:str; final_bps:u16; terminal_reason:str

@allow_storage
@dataclass
class Receipt:
 rail_id:u256; phase:str; round:u8; retrieved_at:u256; result:str; outcome_code:str; verified_sources:u8; agreeing_sources:u8; asserted_sources:u8; provenance_json:str; policy_digest:str

class ProofRail(gl.Contract):
 next_id:u256; rails:TreeMap[u256,Rail]; receipts:TreeMap[u256,Receipt]
 total_funded:u256; total_locked:u256; total_paid:u256; total_returned:u256; bonds_locked:u256
 transfer_active:bool

 def __init__(self):
  self.next_id=u256(1); self.total_funded=u256(0); self.total_locked=u256(0); self.total_paid=u256(0); self.total_returned=u256(0); self.bonds_locked=u256(0); self.transfer_active=False

 def _now(self)->u256:return u256(int(datetime.datetime.fromisoformat(gl.message_raw["datetime"]).timestamp()))
 def _zero(self)->Address:return Address("0x0000000000000000000000000000000000000000")
 def _get(self,i:u256)->Rail:assert i in self.rails,"unknown rail";return self.rails[i]
 def _rules(self,r:Rail)->list:return json.loads(r.outcomes_json)
 def _bps(self,r:Rail,code:str)->u16:
  for x in self._rules(r):
   if x["code"]==code:return u16(x["payout_bps"])
  raise gl.vm.UserError("outcome not frozen")
 def _pay(self,to:Address,amount:u256):
  if amount>0:
   @gl.evm.contract_interface
   class Recipient:
    class View:pass
    class Write:pass
   Recipient(to).emit_transfer(value=amount)

 def _canonical_https_host(self,url:str)->str:
  try:parsed=urlsplit(url)
  except Exception:raise gl.vm.UserError("invalid evidence URL")
  assert parsed.scheme=="https" and parsed.netloc!="" and parsed.hostname is not None,"HTTPS URL required"
  assert parsed.username is None and parsed.password is None,"URL credentials forbidden"
  assert parsed.port in (None,443) and parsed.fragment=="" and parsed.query=="","ambiguous URL authority"
  host=parsed.hostname.lower().rstrip(".")
  labels=host.split(".")
  assert 0<len(host)<=253 and len(labels)>=2 and all(0<len(x)<=63 and x[0].isalnum() and x[-1].isalnum() and all(c.isalnum() or c=="-" for c in x) for x in labels),"invalid canonical hostname"
  return host

 def _validate_source(self,s:dict,observed_from:int,observed_until:int):
  required={"source_id","authority_id","url","publisher_id","publisher_domain","did_sha256","did_http_status","service_path","content_version","content_sha256","evidence_http_status","observed_from","observed_until"}
  assert isinstance(s,dict) and set(s)==required
  host=self._canonical_https_host(s["url"]); domain=s["publisher_domain"].lower().rstrip(".")
  assert host==domain and s["publisher_id"]=="did:web:"+host,"publisher identity mismatch"
  assert isinstance(s["source_id"],str) and 0<len(s["source_id"])<=80 and isinstance(s["authority_id"],str) and 0<len(s["authority_id"])<=120 and isinstance(s["content_version"],str) and 0<len(s["content_version"])<=100
  assert len(s["did_sha256"])==64 and all(c in "0123456789abcdef" for c in s["did_sha256"]),"DID digest required"
  assert len(s["content_sha256"])==64 and all(c in "0123456789abcdef" for c in s["content_sha256"])
  assert type(s["did_http_status"]) is int and s["did_http_status"]==200,"DID must pin HTTP 200"
  assert type(s["evidence_http_status"]) is int and s["evidence_http_status"]==200,"evidence must pin HTTP 200"
  parsed=urlsplit(s["url"]);path=parsed.path;service=s["service_path"]
  assert service.startswith("/") and service.endswith("/") and "//" not in service and path.startswith(service),"unauthorized evidence path"
  assert path==service+s["content_sha256"]+".json","evidence URL must be exact content-addressed service path"
  assert type(s["observed_from"]) is int and type(s["observed_until"]) is int and s["observed_from"]==observed_from and s["observed_until"]==observed_until,"observation period mismatch"

 def _validate_policy(self,evidence_json:str,outcomes_json:str)->dict:
  evidence=json.loads(evidence_json); outcomes=json.loads(outcomes_json)
  assert isinstance(evidence,dict) and set(evidence)=={"schema","observed_from","observed_until","source_rule","counter_rule","semantic_rule","sources","counterevidence"}
  assert evidence["schema"]=="proofrail.evidence-policy/v6" and type(evidence["observed_from"]) is int and type(evidence["observed_until"]) is int and 0<=evidence["observed_from"]<evidence["observed_until"]<2**64
  rule=evidence["source_rule"];counter_rule=evidence["counter_rule"]
  for x in (rule,counter_rule):assert isinstance(x,dict) and set(x)=={"min_sources","min_verified","min_agreement"} and type(x["min_sources"]) is int and type(x["min_verified"]) is int and type(x["min_agreement"]) is int and 2<=x["min_agreement"]<=x["min_verified"]<=x["min_sources"]<=5
  semantic=evidence["semantic_rule"];assert isinstance(semantic,dict) and set(semantic)=={"kind","threshold_bps","fulfilled_code","breached_code"} and semantic["kind"]=="uptime_bps" and type(semantic["threshold_bps"]) is int and 1<=semantic["threshold_bps"]<=10000 and isinstance(semantic["fulfilled_code"],str) and isinstance(semantic["breached_code"],str) and semantic["fulfilled_code"]!=semantic["breached_code"]
  sources=evidence["sources"];assert isinstance(sources,list) and rule["min_sources"]<=len(sources)<=5
  counter=evidence["counterevidence"];assert isinstance(counter,dict) and set(counter)=={"schema","sources"} and counter["schema"]=="proofrail.counterevidence/v1"
  counter_sources=counter["sources"];assert isinstance(counter_sources,list) and counter_rule["min_sources"]<=len(counter_sources)<=5
  domains=[];ids=[];authorities=[];source_ids=[]
  for s in sources+counter_sources:
   self._validate_source(s,evidence["observed_from"],evidence["observed_until"]);domain=s["publisher_domain"].lower().rstrip(".")
   assert domain not in domains and s["publisher_id"] not in ids and s["authority_id"] not in authorities and s["source_id"] not in source_ids,"sources must be independent"
   domains.append(domain);ids.append(s["publisher_id"]);authorities.append(s["authority_id"]);source_ids.append(s["source_id"])
  assert isinstance(outcomes,list) and 2<=len(outcomes)<=5; codes=[]; zero=False; nonzero=False
  for x in outcomes:
   assert set(x)=={"code","description","payout_bps"} and isinstance(x["code"],str) and 0<len(x["code"])<=48 and x["code"] not in codes and isinstance(x["description"],str) and 0<len(x["description"])<=400 and type(x["payout_bps"]) is int and 0<=x["payout_bps"]<=10000
   codes.append(x["code"]); zero=zero or x["payout_bps"]==0; nonzero=nonzero or x["payout_bps"]>0
  assert zero and nonzero
  assert semantic["fulfilled_code"] in codes and semantic["breached_code"] in codes
  return evidence

 def _review(self,r:Rail,dispute:bool)->str:
  spec=json.loads(r.evidence_json);sources=list(json.loads(r.counterevidence_json)["sources"] if dispute else spec["sources"]);quorum=spec["counter_rule"] if dispute else spec["source_rule"]
  rules=self._rules(r);allowed=[x["code"] for x in rules];definitions=[{"code":x["code"],"description":x["description"]} for x in rules]
  def inspect()->str:
   provenance=[];counts={}
   for s in sources:
    p={"source_id":s["source_id"],"authority_id":s["authority_id"],"publisher_id":s["publisher_id"],"url":s["url"],"version":s["content_version"],"observed_from":s["observed_from"],"observed_until":s["observed_until"],"expected_digest":s["content_sha256"],"status":"ASSERTED","observed_digest":"","did_digest":"","asserted_code":"","code":"","error":""}
    try:
     did_url="https://"+s["publisher_domain"]+"/.well-known/did.json";dr=gl.nondet.web.get(did_url);assert dr.status==s["did_http_status"]
     assert len(dr.body)<=MAX_BODY_BYTES;did_digest=hashlib.sha256(dr.body).hexdigest();p["did_digest"]=did_digest;did_raw=dr.body.decode("utf-8")
     if did_digest!=s["did_sha256"]:p["status"]=TAMPERED;p["error"]="DID_DIGEST_MISMATCH";provenance.append(p);continue
     did=json.loads(did_raw);assert isinstance(did,dict) and did.get("id")==s["publisher_id"]
     services=did.get("service",[]);authorized=False
     for x in services:
      if isinstance(x,dict):
       endpoint=str(x.get("serviceEndpoint",""));ep=urlsplit(endpoint)
       if x.get("id")==s["publisher_id"]+"#evidence" and x.get("type")=="LinkedDomains" and self._canonical_https_host(endpoint)==s["publisher_domain"].lower().rstrip(".") and ep.path==s["service_path"] and ep.query=="" and ep.fragment=="":authorized=True
     assert authorized
     er=gl.nondet.web.get(s["url"]);assert er.status==s["evidence_http_status"] and len(er.body)<=MAX_BODY_BYTES;digest=hashlib.sha256(er.body).hexdigest();p["observed_digest"]=digest;raw=er.body.decode("utf-8")
     if digest!=s["content_sha256"]:p["status"]=TAMPERED;provenance.append(p);continue
     try:
      artifact=json.loads(raw);required={"schema","publisher_id","authority_id","source_id","subject","content_version","outcome","observed_from","observed_until","statement","facts"}
      assert isinstance(artifact,dict) and set(artifact)==required and artifact["schema"]=="proofrail.independent-attestation/v2","invalid evidence schema"
      assert artifact["publisher_id"]==s["publisher_id"] and artifact["authority_id"]==s["authority_id"] and artifact["source_id"]==s["source_id"],"evidence publisher mismatch"
      assert artifact["content_version"]==s["content_version"] and type(artifact["observed_from"]) is int and type(artifact["observed_until"]) is int and artifact["observed_from"]==s["observed_from"] and artifact["observed_until"]==s["observed_until"],"evidence metadata mismatch"
      assert artifact["outcome"] in allowed and isinstance(artifact["subject"],str) and 0<len(artifact["subject"])<=240 and isinstance(artifact["statement"],str) and 0<len(artifact["statement"])<=2000
      facts=artifact["facts"];assert isinstance(facts,dict) and set(facts)=={"total_seconds","unavailable_seconds","period_start","period_end"} and type(facts["total_seconds"]) is int and type(facts["unavailable_seconds"]) is int and type(facts["period_start"]) is int and type(facts["period_end"]) is int
      assert 0<facts["total_seconds"]<=31536000 and 0<=facts["unavailable_seconds"]<=facts["total_seconds"] and facts["period_start"]==s["observed_from"] and facts["period_end"]==s["observed_until"] and facts["total_seconds"]==facts["period_end"]-facts["period_start"]
     except Exception as e:p["status"]=INVALID;p["error"]=str(e)[:200];provenance.append(p);continue
     p["asserted_code"]=artifact["outcome"]
     uptime_bps=(facts["total_seconds"]-facts["unavailable_seconds"])*10000//facts["total_seconds"];semantic=spec["semantic_rule"];computed=semantic["fulfilled_code"] if uptime_bps>=semantic["threshold_bps"] else semantic["breached_code"]
     p["status"]=VERIFIED;p["code"]=computed;counts[computed]=counts.get(computed,0)+1
    except Exception as e:
     if p["status"]=="ASSERTED":p["status"]=UNAVAILABLE;p["error"]=str(e)[:200]
    provenance.append(p)
   winner="";best=0;tie=False
   for code in sorted(counts):
    if counts[code]>best:winner=code;best=counts[code];tie=False
    elif counts[code]==best:tie=True
   required=quorum["min_agreement"]
   verified=sum(1 for p in provenance if p["status"]==VERIFIED)
   result=VERIFIED if verified>=quorum["min_verified"] and best>=required and best*2>verified and not tie else UNAVAILABLE
   return json.dumps({"result":result,"code":winner if result==VERIFIED else "","verified":verified,"agreeing":best if result==VERIFIED else 0,"provenance":provenance},sort_keys=True)
  def validator(leader):
   try:return isinstance(leader,gl.vm.Return) and inspect()==leader.calldata
   except Exception:return False
  return gl.vm.run_nondet_unsafe(inspect,validator)

 def _receipt_key(self,i:u256,dispute:bool,round:u8)->u256:
  assert u8(1)<=round<=u8(MAX_ATTEMPTS),"invalid receipt round"
  return i*u256(1000)+(u256(500) if dispute else u256(0))+u256(round)
 def _apply_review(self,i:u256,dispute:bool):
  r=self._get(i); result=json.loads(self._review(r,dispute)); spec=json.loads(r.evidence_json); round=u8(r.attempts+1)
  provenance=json.dumps(result["provenance"],sort_keys=True);self.receipts[self._receipt_key(i,dispute,round)]=Receipt(i,"DISPUTE" if dispute else "PRIMARY",round,self._now(),result["result"],result["code"],u8(result["verified"]),u8(result["agreeing"]),u8(len(result["provenance"])),provenance,hashlib.sha256(r.evidence_json.encode("utf-8")).hexdigest())
  r.attempts=round;r.last_attempt=self._now()
  if result["result"]!=VERIFIED:r.status=u8(DISPUTED if dispute else REVIEWING);self.rails[i]=r;return
  code=result["code"]
  if dispute:
   amount=r.funded*u256(self._bps(r,code))//u256(10000); success=(r.challenger==r.recipient and amount>r.provisional_amount) or (r.challenger==r.issuer and amount<r.provisional_amount);bond_to=r.challenger if success else (r.issuer if r.challenger==r.recipient else r.recipient);self._settle_dispute(i,code,"DISPUTE_RESOLVED",bond_to);return
  r.provisional_code=code;r.provisional_amount=r.funded*u256(self._bps(r,code))//u256(10000);r.challenge_until=self._now()+CHALLENGE_WINDOW;r.status=u8(PROVISIONAL);self.rails[i]=r

 def _settle(self,i:u256,code:str,reason:str):
  r=self._get(i);bps=self._bps(r,code);amount=r.funded*u256(bps)//u256(10000);refund=r.locked-amount
  assert not self.transfer_active,"transfer callback forbidden";self.transfer_active=True
  try:self._pay(r.recipient,amount);self._pay(r.issuer,refund)
  finally:self.transfer_active=False
  r.locked=u256(0);r.paid=amount;r.returned=refund;r.final_code=code;r.final_bps=bps;r.terminal_reason=reason;r.status=u8(PAID) if amount>0 else u8(RELEASED);self.total_locked-=amount+refund;self.total_paid+=amount;self.total_returned+=refund;self.rails[i]=r

 def _settle_dispute(self,i:u256,code:str,reason:str,bond_to:Address):
  r=self._get(i);bps=self._bps(r,code);amount=r.funded*u256(bps)//u256(10000);refund=r.locked-amount;bond=r.bond
  assert not self.transfer_active,"transfer callback forbidden";self.transfer_active=True
  try:self._pay(r.recipient,amount);self._pay(r.issuer,refund);self._pay(bond_to,bond)
  finally:self.transfer_active=False
  r.locked=u256(0);r.paid=amount;r.returned=refund;r.final_code=code;r.final_bps=bps;r.terminal_reason=reason;r.status=u8(PAID) if amount>0 else u8(RELEASED);r.bond=u256(0);self.total_locked-=amount+refund;self.total_paid+=amount;self.total_returned+=refund;self.bonds_locked-=bond;self.rails[i]=r

 @gl.public.write.payable
 def open_rail(self,recipient:Address,name:str,criterion:str,opens_at:u256,closes_at:u256,amount:u256,evidence_json:str,outcomes_json:str):
  assert not self.transfer_active and recipient not in (self._zero(),gl.message.sender_address) and gl.message.value==amount and amount>0 and amount*BOND_BPS//u256(10000)>0 and 0<len(name)<=120 and 0<len(criterion)<=2400 and len(evidence_json)<=30000 and len(outcomes_json)<=5000 and opens_at<closes_at
  spec=self._validate_policy(evidence_json,outcomes_json);assert spec["observed_from"]>=int(opens_at) and u256(spec["observed_until"])+MIN_CLAIM_WINDOW<=closes_at
  i=self.next_id;self.next_id+=u256(1);self.rails[i]=Rail(gl.message.sender_address,recipient,name,criterion,evidence_json,json.dumps(spec["counterevidence"],sort_keys=True),outcomes_json,amount,amount,u256(0),u256(0),u8(DRAFT),opens_at,closes_at,u256(0),u8(0),u256(0),"",u256(0),u256(0),self._zero(),u256(0),u256(0),"","",u16(0),"");self.total_funded+=amount;self.total_locked+=amount

 @gl.public.write
 def lodge_claim(self,i:u256):
  assert not self.transfer_active,"transfer callback forbidden";r=self._get(i);spec=json.loads(r.evidence_json);assert r.status==u8(DRAFT) and gl.message.sender_address==r.recipient and self._now()>=u256(spec["observed_until"]) and self._now()<=r.closes_at;r.status=u8(CLAIMED);r.claimed_at=self._now();self.rails[i]=r
 @gl.public.write
 def review_claim(self,i:u256):
  assert not self.transfer_active,"transfer callback forbidden";r=self._get(i);assert r.status in (u8(CLAIMED),u8(REVIEWING)) and r.attempts<u8(MAX_ATTEMPTS) and self._now()<=r.claimed_at+REVIEW_WINDOW and (r.attempts==u8(0) or self._now()>=r.last_attempt+RETRY_INTERVAL);self._apply_review(i,False)
 @gl.public.write.payable
 def dispute(self,i:u256,reason:str,counterevidence_json:str):
  assert not self.transfer_active,"transfer callback forbidden";r=self._get(i);assert len(counterevidence_json)<=30000;bond=r.funded*BOND_BPS//u256(10000);base=json.loads(r.evidence_json);counter=json.loads(counterevidence_json)
  assert counter==json.loads(r.counterevidence_json),"counterevidence must match the pre-funded frozen panel"
  assert r.status==u8(PROVISIONAL) and self._now()<r.challenge_until and gl.message.sender_address in (r.issuer,r.recipient) and gl.message.value==bond and 0<len(reason)<=600;r.status=u8(DISPUTED);r.challenger=gl.message.sender_address;r.bond=bond;r.dispute_deadline=self._now()+DISPUTE_WINDOW;r.challenge_reason=reason;r.attempts=u8(0);self.bonds_locked+=bond;self.rails[i]=r
 @gl.public.write
 def review_dispute(self,i:u256):assert not self.transfer_active,"transfer callback forbidden";r=self._get(i);assert r.status==u8(DISPUTED) and r.attempts<u8(MAX_ATTEMPTS) and self._now()<=r.dispute_deadline and (r.attempts==u8(0) or self._now()>=r.last_attempt+RETRY_INTERVAL);self._apply_review(i,True)
 @gl.public.write
 def finalize(self,i:u256):assert not self.transfer_active,"transfer callback forbidden";r=self._get(i);assert r.status==u8(PROVISIONAL) and self._now()>=r.challenge_until;self._settle(i,r.provisional_code,"UNCHALLENGED")
 @gl.public.write
 def recover(self,i:u256):
  assert not self.transfer_active,"transfer callback forbidden";r=self._get(i)
  if r.status==u8(DISPUTED) and self._now()>r.dispute_deadline:
   self._settle_dispute(i,r.provisional_code,"DISPUTE_UNRESOLVABLE",r.challenger);return
  assert (r.status==u8(DRAFT) and self._now()>r.closes_at) or (r.status in (u8(CLAIMED),u8(REVIEWING)) and self._now()>r.claimed_at+REVIEW_WINDOW)
  refund=r.locked;assert not self.transfer_active,"transfer callback forbidden";self.transfer_active=True
  try:self._pay(r.issuer,refund)
  finally:self.transfer_active=False
  r.locked=u256(0);r.returned+=refund;r.status=u8(EXPIRED if r.claimed_at==0 else VOIDED);r.terminal_reason="WINDOW_EXPIRED";self.total_locked-=refund;self.total_returned+=refund;self.rails[i]=r
 @gl.public.view
 def get_rail(self,i:u256)->Rail:return self._get(i)
 @gl.public.view
 def get_receipt(self,i:u256,dispute:bool,round:u8)->Receipt:return self.receipts[self._receipt_key(i,dispute,round)]
 @gl.public.view
 def get_counter(self)->u256:return self.next_id-u256(1)
 @gl.public.view
 def list_rails(self,start:u256,limit:u8)->list:
  assert 0<limit<=u8(25);out=[]
  for i in range(start,min(self.next_id,start+u256(limit))):
   if i in self.rails:out.append(self.rails[i])
  return out
 @gl.public.view
 def accounting(self)->dict:return {"funded":self.total_funded,"locked":self.total_locked,"paid":self.total_paid,"returned":self.total_returned,"bonds_locked":self.bonds_locked}
 @gl.public.view
 def constants(self)->dict:return {"bond_bps":BOND_BPS,"challenge_window":CHALLENGE_WINDOW,"review_window":REVIEW_WINDOW,"dispute_window":DISPUTE_WINDOW,"retry_interval":RETRY_INTERVAL,"min_claim_window":MIN_CLAIM_WINDOW,"max_page_size":25,"dispute_mode":"AUTHENTICATED_COUNTEREVIDENCE","unresolved_bond_policy":"REFUND_CHALLENGER"}

