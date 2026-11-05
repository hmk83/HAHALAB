import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const sourceFile=process.argv.find(x=>x.startsWith('--source='))?.slice(9)||'js/auth.js';
const text=await fs.readFile(sourceFile,'utf8');
const source=text.slice(text.indexOf('async function _resolveTeacherProfile('),text.indexOf('async function _fallbackProfileQuery('));
function fixture({active=true,profileError=false,beforeProfileReturn,beforeBindingReturn}={}){
 const calls={auth:0,bind:0,profile:0,apply:0,load:0,lastSeen:0,clear:0,signOut:0,fallback:0};
 let release;const gate=new Promise(r=>release=r);
 const context=vm.createContext({console:{warn(){},error(){},log(){}},SIGNUP_ACCEPTANCE_ENABLED:false,_currentSession:{user:{id:'qa-user'},access_token:'qa-token-one'},window:{},
 _isCurrentAuthSessionActive:async options=>{if(options?.authOnly){calls.auth++;await gate;}return active;},
 _supabase:{rpc:async name=>{if(name==='bind_current_user_to_teacher'){calls.bind++;beforeBindingReturn?.(context);return{data:true};}if(name==='get_my_teacher_profile'){calls.profile++;beforeProfileReturn?.(context);return profileError?{error:{message:'qa-read-error'}}:{data:{id:'qa-teacher',status:'normal'}};}throw Error('unexpected');},auth:{signOut:async()=>calls.signOut++}},
 _applyResolvedProfile:profile=>{calls.apply++;context.window.currentProfile=profile;return profile;},_resolveAdminUserFlag:async()=>false,_persistTeacherSession:p=>p,_updateLastSeen:async()=>calls.lastSeen++,loadAppData:()=>calls.load++,
 _clearAuth:()=>calls.clear++,_showAuthError(){},_rejectUnregisteredSignup:async()=>{},_fallbackProfileQuery:async(_user,token)=>{calls.fallback++;calls.fallbackToken=token;}});
 vm.runInContext(source+';globalThis.resolve=_resolveTeacherProfile;',context);
 return{context,calls,release,run:()=>context.resolve({id:'qa-user'})};
}
const results=[];
async function test(name,fn){try{await fn();results.push({name,passed:true});}catch(e){results.push({name,passed:false,reason:e.code==='ERR_ASSERTION'?'ASSERTION_FAILED':'EXECUTION_FAILED'});}}
await test('concurrent same-session bootstrap binds/loads only once',async()=>{const f=fixture();const a=f.run(),b=f.run();f.release();await Promise.all([a,b]);assert.equal(f.calls.auth,1);assert.equal(f.calls.bind,1);assert.equal(f.calls.profile,1);assert.equal(f.calls.apply,1);assert.equal(f.calls.lastSeen,1);assert.equal(f.calls.load,1);});
await test('later bootstrap revalidates session rather than caching success',async()=>{const f=fixture();f.release();await f.run();await f.run();assert.equal(f.calls.auth,2);assert.equal(f.calls.load,2);});
await test('inactive concurrent session remains rejected',async()=>{const f=fixture({active:false});const a=f.run(),b=f.run();f.release();await Promise.all([a,b]);assert.equal(f.calls.load,0);assert.equal(f.calls.apply,0);assert.equal(f.calls.signOut,1);});
await test('replaced same-user token cannot apply stale profile or clear new session',async()=>{const f=fixture();const pending=f.run();f.context._currentSession={user:{id:'qa-user'},access_token:'qa-token-two'};f.release();await pending;assert.equal(f.calls.bind,0);assert.equal(f.calls.apply,0);assert.equal(f.calls.load,0);assert.equal(f.calls.clear,0);});
await test('same-user new session proceeds separately while old bootstrap is pending',async()=>{const f=fixture();const old=f.run();f.context._currentSession={user:{id:'qa-user'},access_token:'qa-token-two'};const current=f.run();f.release();await Promise.all([old,current]);assert.equal(f.calls.auth,2);assert.equal(f.calls.bind,1);assert.equal(f.calls.apply,1);assert.equal(f.calls.load,1);});
await test('session replacement during binding stops old bootstrap before tenant read',async()=>{const f=fixture({beforeBindingReturn:c=>{c._currentSession={user:{id:'qa-user'},access_token:'qa-token-two'};}});f.release();await f.run();assert.equal(f.calls.bind,1);assert.equal(f.calls.profile,0);assert.equal(f.calls.apply,0);assert.equal(f.calls.clear,0);});
await test('session replacement while profile read is pending cannot apply or fallback',async()=>{const f=fixture({beforeProfileReturn:c=>{c._currentSession={user:{id:'qa-user'},access_token:'qa-token-two'};}});f.release();await f.run();assert.equal(f.calls.profile,1);assert.equal(f.calls.apply,0);assert.equal(f.calls.fallback,0);assert.equal(f.calls.load,0);});
await test('current-session fallback carries exact session token',async()=>{const f=fixture({profileError:true});f.release();await f.run();assert.equal(f.calls.fallback,1);assert.equal(f.calls.fallbackToken,'qa-token-one');});
await test('stale-session profile error cannot trigger a fallback for newer session',async()=>{const f=fixture({profileError:true,beforeProfileReturn:c=>{c._currentSession={user:{id:'qa-user'},access_token:'qa-token-two'};}});f.release();await f.run();assert.equal(f.calls.fallback,0);assert.equal(f.calls.clear,0);});
const result={passed:results.every(x=>x.passed),checks:results};console.log(JSON.stringify(result,null,2));
if(process.argv.includes('--assert')&&!result.passed)process.exitCode=1;
