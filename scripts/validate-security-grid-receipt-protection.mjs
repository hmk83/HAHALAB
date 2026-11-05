import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const file = 'playlab/playlab-grid-color-arithmetic.js';
const source = fs.readFileSync(path.join(root,file),'utf8');
let passed = 0; const cases=[];
function check(name,fn){fn();passed++;cases.push(name);}
const input={total:5,correct:4,wrong:1,accuracy:80,averageResponse:1.5,attempts:6,stage:1};
function fixture({embedded=false,harness,rpc,search='?teacherId=teacher-a&clientId=client-a'}={}) {
  const foreign=JSON.stringify([{teacherId:'teacher-b',clientId:'client-b',sessionId:'other',curriculumKey:'other'}, {teacherId:'teacher-a',clientId:'client-a',sessionId:'other-run',curriculumKey:'playlab-grid-color-arithmetic'}]);
  const store = new Map([['learning_harness_sync_queue_v1',foreign]]); const events=[]; let writes=0;
  const ctx={URLSearchParams,Uint8Array,crypto:crypto.webcrypto,performance:{now:()=>100},setTimeout,clearTimeout,
    console:{warn(){},error(){},log(){}},document:{readyState:'loading',addEventListener(){}},location:{search},
    localStorage:{getItem:k=>store.get(k)||null,setItem(k,v){writes++;store.set(k,v);},removeItem(k){writes++;store.delete(k);}},
    sessionStorage:{getItem(){return null;}},CustomEvent:class{constructor(type,opts){this.type=type;this.detail=opts.detail;}},
    dispatchEvent(event){events.push(event);},HahaLabLearningHarness:harness,
    supabase:{createClient(){return {rpc:rpc||(()=>{throw Error('unexpected direct writer');}),from(){throw Error('non-atomic INSERT forbidden');}};}}};
  ctx.window=ctx;ctx.parent=embedded?{}:ctx;
  const instrumented=source.replace(/\}\)\(\);\s*$/,`renderQuestion=()=>{};setScreen=()=>{};window.__grid={state,els,startStage,saveResult,saveSupabaseReport,pruneSyncedHarnessQueue,buildResultPayload};})();`);
  vm.runInNewContext(instrumented,ctx,{filename:file});
  ctx.__grid.els.resultSummary={textContent:'완료'};
  return {ctx,g:ctx.__grid,store,foreign,events,get writes(){return writes;}};
}
const settle=async()=>{for(let i=0;i<5;i++)await new Promise(r=>setImmediate(r));};
let records=[],flushes=0;
const normal=fixture({harness:{recordSession(p){records.push(p);return {id:p.sessionId,pendingDurable:true};},flushSyncQueue(){flushes++;return Promise.resolve({failed:1});}}});
normal.g.startStage(1); const first=normal.g.state.reportSessionId; normal.g.saveResult(input);normal.g.saveResult(input);await settle();
check('same completed run produces one common-harness writer',()=>assert.equal(records.length,1));
check('per-run session included in canonical detail',()=>assert.equal(records[0].details.session_id,first));
check('failed/revoked common flush cannot delete any foreign pending queue',()=>{assert.equal(normal.store.get('learning_harness_sync_queue_v1'),normal.foreign);assert.equal(normal.writes,0);assert.equal(flushes,1);});
normal.g.startStage(1);const second=normal.g.state.reportSessionId;normal.g.saveResult(input);await settle();
check('retry learning stage starts distinct UUID without collapsing runs',()=>{assert.notEqual(first,second);assert.equal(records.length,2);assert.match(second,/^[0-9a-f-]{36}$/);});
let quota=true,created=0,requeues=[];const failed=fixture({harness:{recordSession(p){created++;return {id:p.sessionId,pendingDurable:false,raw:p};},queueSyncRecord(r){requeues.push(r);if(quota)throw Error('quota');return {id:r.id};},flushSyncQueue:async()=>({})}});
failed.g.startStage(2);failed.g.saveResult(input);const retained=failed.g.state.pendingRecord;const retainedPayload=JSON.stringify(retained.raw);const stableId=failed.g.state.reportSessionId;
check('quota failure keeps original record and exposes pending status',()=>{assert.equal(failed.g.state.savedRunId,'');assert.match(failed.g.els.resultSummary.textContent,/기록 저장 대기 중/);assert.equal(failed.writes,0);});
quota=false;failed.g.saveResult(input);failed.g.saveResult(input);await settle();
check('quota retry reuses byte-identical original raw record and session',()=>{assert.equal(created,1);assert.equal(requeues.length,2);assert.strictEqual(requeues[1],retained);assert.equal(JSON.stringify(retained.raw),retainedPayload);assert.equal(failed.g.state.reportSessionId,stableId);assert.equal(retained.pendingDurable,true);});
const embedded=fixture({embedded:true});embedded.g.startStage(1);embedded.g.saveResult(input);embedded.g.saveResult(input);await settle();
check('embedded missing harness delegates once to parent without direct RPC',()=>{assert.equal(embedded.events.length,1);assert.equal(embedded.events[0].detail.type,'study-complete');assert.equal(embedded.events[0].detail.detail.sessionId,embedded.g.state.reportSessionId);assert.equal(embedded.writes,0);});
let mode='revoked',calls=[],db=new Map();
const standalone=fixture({rpc:async(name,args)=>{calls.push({name,args:JSON.parse(JSON.stringify(args))});if(mode==='revoked')return {error:{code:'42501'}};if(mode==='mismatch')return {data:{status:'committed',session_id:'wrong',history_id:'1'}};const existed=db.has(args.p_session_id);db.set(args.p_session_id,args.p_history);return {data:{status:existed?'already_committed':'committed',session_id:args.p_session_id,history_id:'test-history'}};}});
standalone.g.startStage(1);standalone.g.saveResult(input);await settle();const canonical=JSON.stringify(calls[0].args);
check('revoked standalone RPC leaves pending record visible, unrelated queue intact',()=>{assert.equal(standalone.g.state.savedRunId,'');assert.match(standalone.g.els.resultSummary.textContent,/기록 저장 대기 중/);assert.equal(standalone.writes,0);});
mode='mismatch';standalone.g.saveResult(input);await settle();check('mismatched server receipt is rejected',()=>assert.equal(standalone.g.state.savedRunId,''));
mode='ok';standalone.g.saveResult(input);await settle();standalone.g.saveResult(input);await settle();
check('standalone retries preserve canonical bytes, atomic session exactly once',()=>{assert.equal(calls.length,3);for(const call of calls){assert.equal(call.name,'record_learning_session');assert.equal(JSON.stringify(call.args),canonical);}assert.equal(db.size,1);assert.equal(standalone.g.state.savedRunId,standalone.g.state.reportSessionId);});
check('degraded atomic DTO contains required owner/session/completion/timing fields',()=>{const {p_history:row,p_session_id:id,p_cardlab_attempt:attempt}=calls[0].args;assert.equal(row.teacher_id,'teacher-a');assert.equal(row.client_id,'client-a');assert.equal(row.action,'게임 완료');assert.equal(row.category,'session_history');assert.equal(JSON.parse(row.details).session_id,id);for(const key of ['event_datetime','start_datetime','end_datetime'])assert.ok(Number.isFinite(Date.parse(row[key])));assert.ok(row.duration_minutes>=1);assert.equal(attempt,null);assert.deepEqual(Object.keys(row).sort(),['teacher_id','client_id','client_name','type','category','action','action_type','event_datetime','start_datetime','end_datetime','duration','duration_minutes','details','metadata','memo'].sort());});
standalone.g.startStage(1);standalone.g.saveResult(input);await settle();check('new standalone stage creates second distinct committed session',()=>assert.equal(db.size,2));
const offline=fixture();offline.ctx.supabase=undefined;offline.g.startStage(1);offline.g.saveResult(input);await settle();check('detached missing SDK offline failure is explicit, no false saved status',()=>{assert.equal(offline.g.state.savedRunId,'');assert.match(offline.g.els.resultSummary.textContent,/기록 저장 대기 중/);});
const noOwner=fixture({search:''});noOwner.g.startStage(1);noOwner.g.saveResult(input);await settle();check('missing owner context cannot silently count as saved',()=>assert.equal(noOwner.g.state.savedRunId,''));
for(const outcome of ['ack','reject']){let release;const racing=fixture({rpc:()=>new Promise((resolve,reject)=>{release=()=>outcome==='ack'?resolve({data:{status:'committed',session_id:oldId,history_id:'old'}}):reject(Error('old-request'));})});racing.g.startStage(1);const oldId=racing.g.state.reportSessionId;racing.g.saveResult(input);await settle();racing.g.startStage(2);const newId=racing.g.state.reportSessionId;release();await settle();check(`old detached ${outcome} cannot overwrite newer stage save state`,()=>{assert.equal(racing.g.state.reportSessionId,newId);assert.equal(racing.g.state.savedRunId,'');assert.equal(racing.g.els.resultSummary.textContent,'완료');});}
const html=fs.readFileSync(path.join(root,'private/playlab/playlab-grid-color-arithmetic.html'),'utf8');check('normal HTML loads common harness before game producer',()=>assert.ok(html.indexOf('learning-report-harness.js')<html.indexOf('playlab-grid-color-arithmetic.js')));
check('producer cannot directly mutate or prune common queue',()=>{assert.ok(!/localStorage\.(setItem|removeItem)|\.from\(['"]histories['"]\)|\.insert\(/.test(source));});
const baselinePath=path.join(root,'output/security-codeql-triage/grid-queue-baseline.js');
if(fs.existsSync(baselinePath)){const baseline=fs.readFileSync(baselinePath,'utf8'); const gameplay=txt=>txt.slice(txt.indexOf('  function paintCell('),txt.indexOf('  function parseMaybeJson('));check('gameplay answer/painting/completion/scoring functions unchanged',()=>assert.equal(gameplay(source),gameplay(baseline)));const questionDesign=txt=>txt.slice(txt.indexOf('  const COLORS ='),txt.indexOf('  const state ='));check('all twelve stage difficulty and question design settings unchanged',()=>assert.equal(questionDesign(source),questionDesign(baseline)));}
const report={passed,cases,scope:'Synthetic production-function protocol regression tests; no real student/DB write. Does not claim real game completion.',limitations:['Normal entry loads common harness before producer. Standalone degraded missing-harness + missing SDK cannot persist on a closed tab; explicit pending status preserves honesty, not durable storage.','Generic harness receipt owner remains responsible for actual queue ACK, owner isolation and retry; tested separately.'],sha256:crypto.createHash('sha256').update(source).digest('hex')};
fs.mkdirSync(path.join(root,'output/security-codeql-triage'),{recursive:true});fs.writeFileSync(path.join(root,'output/security-codeql-triage/grid-receipt-protection.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
