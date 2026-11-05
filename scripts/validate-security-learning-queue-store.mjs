// Independent, synthetic-only verification of the actual bundled AEAD store.
// No management API, production data, real credentials or external requests.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import http from 'node:http';
import {createHash, webcrypto} from 'node:crypto';
import {chromium} from 'playwright';

const root=process.cwd();
const out=path.resolve('output/harness/learning-queue-secure-store');
await fs.mkdir(out,{recursive:true});
const sourceFile='js/learning-queue-secure-store.js';
const vendorFile='js/vendor/noble-ciphers-2.4.0.js';
const source=await fs.readFile(sourceFile,'utf8');
const vendor=await fs.readFile(vendorFile,'utf8');
const provenance=JSON.parse(await fs.readFile('js/vendor/noble-ciphers-2.4.0.provenance.json','utf8'));
const sha=value=>createHash('sha256').update(value).digest('hex');
const results=[];
async function test(name,fn){try{await fn();results.push({name,passed:true});}catch(error){results.push({name,passed:false,error:String(error?.message||'failed').slice(0,300)});}}
const A={authUserId:'11111111-1111-4111-8111-111111111111',teacherId:'qa_teacher_A_text',sessionId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'};
const B={authUserId:'22222222-2222-4222-8222-222222222222',teacherId:'qa_teacher_B_text',sessionId:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'};
const KID_A='33333333-3333-4333-8333-333333333333';
const KID_B='44444444-4444-4444-8444-444444444444';
const fakeKey=owner=>Uint8Array.from({length:32},(_,i)=>(i+(owner.authUserId===A.authUserId?1:67))&255);
const hex=bytes=>Array.from(bytes,x=>x.toString(16).padStart(2,'0')).join('');
const reply=(owner,patch={})=>({data:{version:1,algorithm:'xchacha20poly1305',key_id:owner.authUserId===A.authUserId?KID_A:KID_B,
  auth_user_id:owner.authUserId,teacher_id:owner.teacherId,key_hex:hex(fakeKey(owner)),...patch}});
const value=(id='synthetic-job-1',teacher=A.teacherId)=>({id,authUserId:A.authUserId,history:{teacher_id:teacher,client_id:'synthetic-client-7',
  client_name:'독립 합성 학생',score:0,details:{session_id:'synthetic-learning-session',questionLogs:[{question:'합성 원자료 표식',correct:false,response:null,question_ms:null}],zero:0,unmeasured:null}},cardlabAttempt:null});
const identity=x=>x.id;
function storage(){
 const api={};
 const hooks={set:null,get:null,remove:null};
 const methods={getItem:key=>hooks.get?hooks.get(String(key),()=>Object.hasOwn(api,key)?api[key]:null):(Object.hasOwn(api,key)?api[key]:null),
  setItem:(key,val)=>{key=String(key);val=String(val);if(hooks.set)hooks.set(key,val);Object.defineProperty(api,key,{value:val,writable:true,enumerable:true,configurable:true});},
  removeItem:key=>{if(hooks.remove)hooks.remove(String(key));delete api[String(key)];},
  key:index=>Object.keys(api)[index]??null};
 for(const [key,method]of Object.entries(methods))Object.defineProperty(api,key,{value:method,configurable:true});
 Object.defineProperty(api,'length',{get:()=>Object.keys(api).length,configurable:true});
 return{api,hooks,all:()=>Object.keys(api).map(k=>[k,api.getItem(k)])};
}
function setup({withCodec=true,initialOwner=A}={}){
 const local=storage(),listeners=new Map(),requests=[],keyReferences=[],scripts=[];
 const state={owner:initialOwner};
 const context={console,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer,crypto:webcrypto,Event,setTimeout,clearTimeout,queueMicrotask,btoa,atob};
 context.window=context;context.localStorage=local.api;
 context.addEventListener=(name,fn)=>{const list=listeners.get(name)||[];list.push(fn);listeners.set(name,list);};
 context.dispatchEvent=event=>{for(const fn of listeners.get(event.type)||[])fn(event);};
 vm.createContext(context);
 function installCodec(){vm.runInContext(vendor,context,{filename:vendorFile});const actual=context.HahaLabQueueCipher.xchacha20poly1305;
  context.HahaLabQueueCipher={xchacha20poly1305:(...args)=>{keyReferences.push(args[0]);return actual(...args);}};}
 context.document={createElement:()=>({}),head:{appendChild(script){scripts.push(script);queueMicrotask(()=>{installCodec();script.onload();});}}};
 if(withCodec)installCodec();
 vm.runInContext(source,context,{filename:sourceFile});
 const store=context.HahaLabSecureQueueStore;
 const client={async rpc(name){assert.equal(name,'get_my_learning_queue_key');requests.push(name);return reply(state.owner);}};
 return{context,store,local,state,requests,keyReferences,scripts,client,getOwner:()=>state.owner,
  ensure:owner=>store.ensure(client,owner||state.owner,()=>state.owner)};
}
function plainStorageHas(local,needle){return local.all().some(([key,raw])=>key.includes(needle)||String(raw).includes(needle));}
const json=value=>JSON.parse(JSON.stringify(value));

await test('vendor bytes match pinned provenance and SRI',()=>{
 assert.equal(sha(vendor),provenance.bundleSha256);
 assert.equal('sha384-'+createHash('sha384').update(vendor).digest('base64'),provenance.sri);
});
await test('actual Noble cipher matches independent libsodium published vector',()=>{
 const e=setup();const key=Uint8Array.from({length:32},(_,i)=>0x80+i);
 const nonce=Uint8Array.from([7,0,0,0,...Array.from({length:20},(_,i)=>0x40+i)]);
 const aad=Uint8Array.from([80,81,82,83,192,193,194,195,196,197,198,199]);
 const message=new TextEncoder().encode("Ladies and Gentlemen of the class of '99: If I could offer you only one tip for the future, sunscreen would be it.");
 const expected=Uint8Array.from([248,235,234,72,117,4,64,102,252,22,42,6,4,225,113,254,236,251,61,32,66,82,72,86,59,207,213,161,85,220,196,123,189,167,11,134,229,171,155,85,0,43,209,39,76,2,219,53,50,26,205,122,248,178,226,210,80,21,225,54,183,103,148,88,233,244,50,67,191,113,157,99,155,173,181,254,172,3,248,10,25,169,110,241,12,177,209,83,51,168,55,185,9,70,186,56,84,238,116,218,63,37,133,239,199,225,225,112,225,126,21,229,99,231,118,1,244,248,92,175,168,229,135,118,20,225,67,230,132,32]);
 assert.deepEqual(e.context.HahaLabQueueCipher.xchacha20poly1305(key,nonce,aad).encrypt(message),expected);
});
await test('unprepared key cannot store plaintext or report durable success',()=>{
 const e=setup();assert.equal(e.store.ready(A),false);assert.throws(()=>e.store.put('history',value(),A,identity),/KEY_UNAVAILABLE/);assert.equal(e.local.api.length,0);
});
await test('dynamic codec uses pinned self-hosted script and integrity',async()=>{
 const e=setup({withCodec:false});assert.equal(await e.ensure(),true);assert.equal(e.scripts.length,1);
 assert.equal(e.scripts[0].src,'/js/vendor/noble-ciphers-2.4.0.js');assert.equal(e.scripts[0].integrity,provenance.sri);
});
await test('text teacher ID is valid and key/clinical fields never persist',async()=>{
 const e=setup();assert.equal(await e.ensure(),true);const input=value();const s=e.store.put('history',input,A,identity);
 assert.deepEqual(json(s.value),input);assert.deepEqual(json(e.store.list('history',A)[0].value),input);
 const envelope=JSON.parse(s.raw);assert.deepEqual(Object.keys(envelope).sort(),['alg','ciphertext','encoding','kid','nonce','v']);assert.equal(envelope.nonce.length,48);assert.equal(envelope.encoding,'base64');
 for(const secret of [hex(fakeKey(A)),A.authUserId,A.teacherId,'독립 합성 학생','합성 원자료 표식','synthetic-client-7'])assert.equal(plainStorageHas(e.local,secret),false);
});
await test('greater-than-1MiB raw source roundtrips without argument stack failure',async()=>{
 const e=setup();await e.ensure();const input=value('large-source');input.history.details.longRaw='Z'.repeat(1024*1024+257)+'한글 원자료 😀\u0000'.repeat(1000);
 const canonical=JSON.stringify(input),bytes=new TextEncoder().encode(canonical).length;assert.ok(bytes>1024*1024);
 const snapshot=e.store.put('history',input,A,identity);assert.deepEqual(json(e.store.list('history',A)[0].value),input);
 assert.equal(JSON.parse(snapshot.raw).ciphertext.length,4*Math.ceil((bytes+16)/3));
});
await test('same canonical job is stable and conflicting source is preserved',async()=>{
 const e=setup();await e.ensure();const first=e.store.put('history',value(),A,identity);const repeat=e.store.put('history',value(),A,identity);
 assert.equal(first.storageKey,repeat.storageKey);assert.equal(e.local.api.length,1);
 const changed=value();changed.history.score=1;assert.throws(()=>e.store.put('history',changed,A,identity),/PAYLOAD_MISMATCH/);
 assert.equal(e.local.api.getItem(first.storageKey),first.raw);
});
await test('new ciphertext records use independent opaque handles and nonces',async()=>{
 const e=setup();await e.ensure();const first=e.store.put('history',value('job-a'),A,identity),second=e.store.put('history',value('job-b'),A,identity);
 assert.notEqual(first.storageKey,second.storageKey);assert.notEqual(JSON.parse(first.raw).nonce,JSON.parse(second.raw).nonce);
 assert.equal(first.storageKey.includes(A.authUserId),false);assert.equal(first.storageKey.includes('job-a'),false);
});
for(const [name,change]of [
 ['ciphertext',x=>{x.ciphertext=(x.ciphertext[0]==='0'?'1':'0')+x.ciphertext.slice(1);}],
 ['nonce',x=>{x.nonce=(x.nonce[0]==='0'?'1':'0')+x.nonce.slice(1);}],
 ['key ID',x=>{x.kid=KID_B;}],['algorithm',x=>{x.alg='not-supported';}],['version',x=>{x.v=2;}],
 ['encoding',x=>{x.encoding='hex';}],['base64 padding',x=>{x.ciphertext='AAAA====';}]
])await test(`modified ${name} is hidden and retained`,async()=>{
 const e=setup();await e.ensure();const s=e.store.put('history',value(),A,identity);const changed=JSON.parse(s.raw);change(changed);
 e.local.api.setItem(s.storageKey,JSON.stringify(changed));assert.equal(e.store.list('history',A).length,0);assert.equal(e.store.removeExact('history',s,A),false);assert.equal(e.local.api.length,1);
});
await test('namespace and opaque storage handle are authenticated',async()=>{
 const e=setup();await e.ensure();const s=e.store.put('history',value(),A,identity);
 assert.equal(e.store.list('attempt',A).length,0);const forged=e.store.prefix+webcrypto.randomUUID();e.local.api.setItem(forged,s.raw);
 assert.equal(e.store.list('history',A).length,1);assert.notEqual(e.local.api.getItem(forged),null);
});
await test('exact ACK removes one record and preserves concurrent append',async()=>{
 const e=setup();await e.ensure();const first=e.store.put('history',value('first'),A,identity),second=e.store.put('history',value('second'),A,identity);
 assert.equal(e.store.removeExact('history',first,A),true);assert.equal(e.local.api.getItem(first.storageKey),null);assert.equal(e.local.api.getItem(second.storageKey),second.raw);
});
await test('foreign owner cannot read/remove and both owners retain separate ciphertext',async()=>{
 const e=setup();await e.ensure();const first=e.store.put('history',value(),A,identity);e.state.owner=B;
 assert.equal(e.store.list('history',A).length,0);assert.equal(await e.ensure(),true);assert.equal(e.store.list('history',B).length,0);
 assert.equal(e.store.removeExact('history',first,B),false);e.store.put('history',value('owner-b',B.teacherId),B,identity);assert.equal(e.local.api.length,2);
 e.state.owner={...A,sessionId:'cccccccc-cccc-4ccc-8ccc-cccccccccccc'};await e.ensure();assert.equal(e.store.list('history',e.state.owner).length,1);assert.equal(e.local.api.length,2);
});
await test('live SID change invalidates stale owner and zeroes primary key buffer',async()=>{
 const e=setup();await e.ensure();e.store.put('history',value(),A,identity);const key=e.keyReferences.at(-1);assert.ok(key.some(x=>x!==0));
 e.state.owner={...A,sessionId:'dddddddd-dddd-4ddd-8ddd-dddddddddddd'};
 assert.equal(e.store.ready(A),false);assert.equal(e.store.list('history',A).length,0);assert.ok(key.every(x=>x===0));
 assert.equal(await e.ensure(),true);assert.deepEqual(json(e.store.list('history',e.state.owner)[0].value),value());
});
await test('logout clears unlock state while pending ciphertext survives',async()=>{
 const e=setup();await e.ensure();const s=e.store.put('history',value(),A,identity);e.state.owner=null;e.context.dispatchEvent(new Event('hahalab-session-cleared'));
 assert.equal(e.store.ready(A),false);assert.equal(e.store.list('history',A).length,0);assert.equal(e.local.api.getItem(s.storageKey),s.raw);
});
await test('late key response after account switch cannot unlock old owner',async()=>{
 const e=setup();let settle,started;e.client.rpc=()=>{started?.();return new Promise(resolve=>{settle=resolve;});};
 const reached=new Promise(resolve=>{started=resolve;});const pending=e.ensure();await reached;e.state.owner=B;settle(reply(A));
 assert.equal(await pending,false);assert.equal(e.store.ready(A),false);assert.equal(e.store.ready(B),false);assert.equal(e.local.api.length,0);
});
await test('clear during key fetch invalidates its response',async()=>{
 const e=setup();let settle,started;e.client.rpc=()=>{started?.();return new Promise(resolve=>{settle=resolve;});};
 const reached=new Promise(resolve=>{started=resolve;});const pending=e.ensure();await reached;e.store.clear();settle(reply(A));assert.equal(await pending,false);assert.equal(e.store.ready(A),false);
});
await test('concurrent same-owner preload issues only one RPC',async()=>{
 const e=setup();const [first,second]=await Promise.all([e.ensure(),e.ensure()]);assert.equal(first,true);assert.equal(second,true);assert.equal(e.requests.length,1);
});
for(const [label,patch]of [['version',{version:2}],['algorithm',{algorithm:'aes-gcm'}],['owner',{auth_user_id:B.authUserId}],['teacher',{teacher_id:B.teacherId}],['short key',{key_hex:'00'}],['invalid key ID',{key_id:'-'.repeat(36)}]])await test(`malformed key ${label} does not unlock`,async()=>{
 const e=setup();e.client.rpc=async()=>reply(A,patch);assert.equal(await e.ensure(),false);assert.equal(e.store.ready(A),false);assert.equal(e.local.api.length,0);
});
await test('missing session stamp cannot unlock a valid owner key',async()=>{
 const e=setup({initialOwner:{...A,sessionId:''}});assert.equal(await e.ensure(),false);assert.equal(e.store.ready(e.state.owner),false);
});
await test('quota failure never evicts an existing pending record',async()=>{
 const e=setup();await e.ensure();const first=e.store.put('history',value(),A,identity);e.local.hooks.set=()=>{throw new Error('QuotaExceededError');};
 assert.throws(()=>e.store.put('history',value('second'),A,identity),/Quota/);assert.equal(e.local.api.getItem(first.storageKey),first.raw);assert.equal(e.local.api.length,1);
});
await test('migration moves only owned raw after verified roundtrip',async()=>{
 const e=setup();await e.ensure();const own=value(),foreign=value('other',B.teacherId);e.local.api.setItem('legacy',JSON.stringify([own,foreign]));
 e.store.migrateArray('history','legacy',A,x=>x.history.teacher_id===A.teacherId,identity);
 assert.deepEqual(JSON.parse(e.local.api.getItem('legacy')),[foreign]);assert.deepEqual(json(e.store.list('history',A)[0].value),own);
});
await test('migration storage failure preserves complete original bytes',async()=>{
 const e=setup();await e.ensure();const original=JSON.stringify([value()]);e.local.api.setItem('legacy',original);e.local.hooks.set=key=>{if(key.startsWith(e.store.prefix))throw Error('QuotaExceededError');};
 e.store.migrateArray('history','legacy',A,()=>true,identity);assert.equal(e.local.api.getItem('legacy'),original);assert.equal(e.local.api.length,1);
});
await test('migration does not delete a concurrently changed legacy array',async()=>{
 const e=setup();await e.ensure();const own=value(),appended=value('append');e.local.api.setItem('legacy',JSON.stringify([own]));let changed=false;
 e.local.hooks.set=key=>{if(key.startsWith(e.store.prefix)&&!changed){changed=true;e.local.api.setItem('legacy',JSON.stringify([own,appended]));}};
 e.store.migrateArray('history','legacy',A,()=>true,identity);assert.deepEqual(JSON.parse(e.local.api.getItem('legacy')),[own,appended]);assert.equal(e.store.list('history',A).length,1);
});

let browser,server,externalRequests=0;
await test('native browser encryption/reload/logout/relogin and real quota preservation',async()=>{
 server=http.createServer(async(req,res)=>{const p=new URL(req.url,'http://localhost').pathname;res.setHeader('Cache-Control','no-store');
  if(p==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><title>Queue crypto synthetic test</title><script src="/js/learning-queue-secure-store.js"></script>');return;}
  if(p==='/'+sourceFile||p==='/'+vendorFile){res.setHeader('Content-Type','application/javascript');res.end(p==='/'+sourceFile?source:vendor);return;}res.writeHead(404);res.end();});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE_PATH||'/Users/hahalab/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
 const context=await browser.newContext();await context.route('**/*',route=>{if(route.request().url().startsWith(base+'/'))return route.continue();externalRequests++;return route.abort();});
 const page=await context.newPage();await page.goto(base);
 const fixture={owner:A,key:reply(A).data,record:value()};
 const first=await page.evaluate(async({owner,key,record})=>{window.__fixtureOwner=owner;const s=window.HahaLabSecureQueueStore;const ready=await s.ensure({rpc:async()=>({data:key})},owner,()=>window.__fixtureOwner);const saved=s.put('history',record,owner,x=>x.id);window.__fixtureSaved=saved;
  const large={...record,id:'native-large',longRaw:'대형 원자료 😀'.repeat(12000)},largeBytes=new TextEncoder().encode(JSON.stringify(large)).length;
  const largeSaved=s.put('history',large,owner,x=>x.id),largeRoundtrip=JSON.stringify(s.list('history',owner).find(x=>x.value.id===large.id)?.value)===JSON.stringify(large);
  const largeAck=s.removeExact('history',largeSaved,owner);
  return{ready,roundtrip:JSON.stringify(s.list('history',owner)[0].value)===JSON.stringify(record),noPlain:Object.values(localStorage).every(raw=>!raw.includes(record.history.client_name)&&!raw.includes(key.key_hex)&&!raw.includes(owner.authUserId)),largeBytes,largeRoundtrip,largeAck};},fixture);
 assert.equal(first.ready,true);assert.equal(first.roundtrip,true);assert.equal(first.noPlain,true);assert.ok(first.largeBytes>65536);assert.equal(first.largeRoundtrip,true);assert.equal(first.largeAck,true);
 await page.reload();const fresh=await page.evaluate(()=>({locked:window.HahaLabSecureQueueStore.list('history',null).length===0,pending:Object.keys(localStorage).length}));assert.equal(fresh.locked,true);assert.equal(fresh.pending,1);
 const relog=await page.evaluate(async({owner,key,record})=>{owner={...owner,sessionId:'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'};window.__fixtureOwner=owner;const s=window.HahaLabSecureQueueStore;await s.ensure({rpc:async()=>({data:key})},owner,()=>window.__fixtureOwner);
  const same=JSON.stringify(s.list('history',owner)[0].value)===JSON.stringify(record);let quotaRejected=false;try{s.put('history',{id:'quota',blob:'Z'.repeat(6*1024*1024)},owner,x=>x.id);}catch(e){quotaRejected=e.name==='QuotaExceededError'||/quota/i.test(e.message);}
  const retained=s.list('history',owner).some(x=>x.value.id===record.id);window.__fixtureOwner=null;window.dispatchEvent(new Event('hahalab-session-cleared'));
  return{same,quotaRejected,retained,locked:s.list('history',owner).length===0,persistentCount:Object.keys(localStorage).length};},fixture);
 assert.deepEqual(relog,{same:true,quotaRejected:true,retained:true,locked:true,persistentCount:1});
 await page.screenshot({path:path.join(out,'native-browser.png')});await context.close();
});
await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));

const summary={generatedAt:new Date().toISOString(),passed:results.every(x=>x.passed)&&externalRequests===0,checks:results.length,results,externalRequests,
 productionRequests:0,sourceSha256:{[sourceFile]:sha(source),[vendorFile]:sha(vendor)},
 references:['https://github.com/paulmillr/noble-ciphers','https://raw.githubusercontent.com/jedisct1/libsodium/master/test/default/aead_xchacha20poly1305.c','https://raw.githubusercontent.com/jedisct1/libsodium/master/test/default/aead_xchacha20poly1305.exp'],
 scope:'Synthetic VM and native browser tests of actual Noble bundle and actual shared store. No deployment, key broker API, production account or source edit.',
 limits:['Legacy foreign raw remains until verified owner migration. AEAD protects stored content, not same-origin XSS while unlocked. These tests do not claim server exactly-once or cross-tab localStorage CAS.']};
await fs.writeFile(path.join(out,'summary.json'),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify({passed:summary.passed,checks:summary.checks,failed:results.filter(x=>!x.passed),externalRequests}));if(!summary.passed)process.exitCode=1;
