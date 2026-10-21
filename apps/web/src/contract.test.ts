import {describe,expect,it} from "vitest";import {assertSuccessfulReceipt,confirmRailState} from "./contract";

describe("finalized GenVM receipt guard",()=>{
 it("accepts an explicit execution success when the chain does report one",()=>expect(assertSuccessfulReceipt({result_name:"MAJORITY_AGREE",tx_execution_result_name:"FINISHED_WITH_RETURN"})).toBe(true));
 it("accepts the only signal Studionet actually provides in practice: majority consensus plus a finalized execution hash",()=>expect(assertSuccessfulReceipt({result_name:"MAJORITY_AGREE"},{statusName:"FINALIZED",tx_execution_hash:"0xabc"})).toBe(true));
 it("rejects an unresolved transaction state: consensus reached but no execution hash and no explicit result",()=>expect(()=>assertSuccessfulReceipt({result_name:"MAJORITY_AGREE"})).toThrow(/unresolved/));
 it("rejects a finalized transaction with no execution hash at all (not just a missing explicit result)",()=>expect(()=>assertSuccessfulReceipt({result_name:"MAJORITY_AGREE"},{statusName:"FINALIZED"})).toThrow(/unresolved/));
 it("rejects failed consensus even when an execution hash is present",()=>expect(()=>assertSuccessfulReceipt({result_name:"MINORITY_DISAGREE"},{statusName:"FINALIZED",tx_execution_hash:"0xabc"})).toThrow(/Consensus failed/));
 it("rejects an explicit GenVM execution failure outright, never falling back to the hash-presence signal",()=>expect(()=>assertSuccessfulReceipt({result_name:"MAJORITY_AGREE",tx_execution_result_name:"FINISHED_WITH_ERROR"},{statusName:"FINALIZED",tx_execution_hash:"0xabc"})).toThrow(/FINISHED_WITH_ERROR/));
});

describe("independent rail-state confirmation (confirmRailState)",()=>{
 it("passes when the independently re-fetched rail satisfies the expected postcondition",async()=>{
  const rail=await confirmRailState(2,r=>r.status===1,"Lodge claim",async()=>({status:1} as any));
  expect(rail.status).toBe(1);
 });
 it("rejects when the on-chain rail does not show the expected state change, even though the caller believes the transaction finalized",async()=>{
  await expect(confirmRailState(2,r=>r.status===1,"Lodge claim",async()=>({status:0} as any))).rejects.toThrow(/did not change as expected/);
 });
 it("surfaces the action label in the unresolved-state error so the UI can say what specifically failed to confirm",async()=>{
  await expect(confirmRailState(2,r=>r.status===4,"Dispute result",async()=>({status:3} as any))).rejects.toThrow(/Dispute result/);
 });
});
