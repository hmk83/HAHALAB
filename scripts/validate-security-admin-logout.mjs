import fs from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),source=await fs.readFile('admin.html','utf8'),checks=[],skippedChecks=[];
// The before-fix snapshot is local evidence, not a required public-repository file.
// Set HAHALAB_ADMIN_LOGOUT_BASELINE to a snapshot path, or to an empty string to skip it.
const explicitBaseline=Object.hasOwn(process.env,'HAHALAB_ADMIN_LOGOUT_BASELINE');
const baselinePath=explicitBaseline?process.env.HAHALAB_ADMIN_LOGOUT_BASELINE:'output/production-release/service-fixes-20261105/admin-logout-before.html';
const baseline=baselinePath?await fs.readFile(baselinePath,'utf8').catch(error=>{if(!explicitBaseline&&error.code==='ENOENT')return null;throw error;}):null;
const check=(name,fn)=>{fn();checks.push({name,passed:true});};
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve};};
const flush=async()=>{for(let i=0;i<35;i++)await Promise.resolve();};
function fixture({old=false,pause=null,stageError=null}={}){
 const text=old?baseline:source,gate=deferred(),calls=[],views=[],adminStates=[],toasts=[],timers=[];let mountedCheck=null,listener=null;
 const defaults={getSession:{data:{session:{user:{id:'fixture-admin'}}},error:null},getUser:{data:{user:{id:'fixture-admin'}},error:null},security_session_active:{data:true,error:null},is_admin_user:{data:true,error:null},bind_current_user_to_teacher:{data:true,error:null},get_my_teacher_profile:{data:[{teacher_id:'fixture-teacher',status:'normal',role:'admin'}],error:null},assurance:{data:{currentLevel:'aal2'},error:null},signOut:{error:null}};
 const invoke=async name=>{calls.push(name);if(pause===name)await gate.promise;return stageError?.at===name?{data:null,error:stageError.error}:defaults[name];};
 const context=vm.createContext({Date,Error,supabase:{auth:{getSession:()=>invoke('getSession'),getUser:()=>invoke('getUser'),signOut:()=>invoke('signOut'),mfa:{getAuthenticatorAssuranceLevel:()=>invoke('assurance')},onAuthStateChange:fn=>{listener=fn;return{data:{subscription:{unsubscribe(){}}}};}},rpc:name=>invoke(name)},getFirstRow:x=>Array.isArray(x)?x[0]:x,keysToCamel:x=>x,localStorage:{setItem(){},removeItem(){}},setAdmin:value=>adminStates.push(value),setView:value=>{views.push(value);if(value==='login')mountedCheck=context.require();},showToast:value=>toasts.push(value),useEffect:fn=>fn(),setTimeout:fn=>timers.push(fn)});
 const start=text.indexOf(old?'const fetchMyTeacherProfile = async () => {':'let adminAuthGeneration = 0;'),end=text.indexOf('// [NEW] 2:1 Ratio Image Cropper',start);
 const hs=text.indexOf('const handleLogin = '),he=text.indexOf('\n            useEffect(() => {',hs);
 vm.runInContext(text.slice(start,end)+'\n'+text.slice(hs,he)+'\nglobalThis.require=requireAdminSession;globalThis.profile=fetchMyTeacherProfile;globalThis.logout=handleLogout;globalThis.login=handleLogin;'+(!old?'globalThis.invalidate=invalidateAdminAuth;globalThis.begin=beginAdminLoginAttempt;globalThis.generation=()=>adminAuthGeneration;globalThis.current=isAdminAuthCurrent;':'')+'\nglobalThis.mount=()=>{'+text.slice(he,text.indexOf('// [SECURITY v1.0.0] Inactivity Timeout',he))+'};',context);
 return{context,gate,calls,views,adminStates,toasts,defaults,mounted:()=>mountedCheck,fire:event=>listener(event),runTimers:async()=>{const pending=timers.splice(0);for(const fn of pending)await fn();}};
}
if(baseline){
 const f=fixture({old:true,pause:'signOut'}),pending=f.context.logout();await flush();const result=await f.mounted();check('baseline-reproduces-new-login-view-using-old-session-during-signOut',()=>{assert.ok(f.calls.includes('getUser')&&f.calls.includes('bind_current_user_to_teacher'));assert.ok(result.ok);});f.gate.resolve();await pending;
}else{skippedChecks.push({name:'baseline-reproduces-new-login-view-using-old-session-during-signOut',reason:'Optional before-fix snapshot not supplied; all current-source checks remain enabled.'});}
{
 const f=fixture({pause:'signOut'}),pending=f.context.logout();await flush();const result=await f.mounted();check('logout-invalidates-before-login-view-mounts',()=>{assert.ok(result.cancelled);assert.deepEqual(f.calls,['signOut']);assert.deepEqual(f.views,['login']);});
 const req=await f.context.require(),profile=await f.context.profile();check('logout-in-progress-starts-no-session-or-profile-request',()=>{assert.ok(req.cancelled&&profile.cancelled);assert.deepEqual(f.calls,['signOut']);});
 let resumed=false;const begun=f.context.begin().then(x=>{resumed=true;return x;});await flush();check('explicit-new-login-waits-for-signOut',()=>{assert.equal(resumed,false);assert.deepEqual(f.calls,['signOut']);});f.gate.resolve();await pending;const generation=await begun;check('explicit-new-login-resets-guard-only-after-signOut-settles',()=>assert.ok(f.context.current(generation)));const valid=await f.context.require(generation);check('new-generation-still-runs-complete-auth-role-profile-MFA-gates',()=>{assert.ok(valid.ok);assert.deepEqual(f.calls.slice(1),['getSession','getUser','security_session_active','is_admin_user','bind_current_user_to_teacher','get_my_teacher_profile','assurance']);});
}
for(const stage of ['getSession','getUser','security_session_active','is_admin_user','bind_current_user_to_teacher','get_my_teacher_profile','assurance']){
 const f=fixture({pause:stage}),pending=f.context.require();await flush();assert.equal(f.calls.at(-1),stage);const before=f.calls.length;f.context.invalidate();f.gate.resolve();const result=await pending;check('logout-during-'+stage+'-prevents-any-following-request-or-success',()=>{assert.ok(result.cancelled);assert.equal(f.calls.length,before);assert.equal(result.ok,false);});
}
{
 const f=fixture(),generation=f.context.generation();f.context.invalidate();await f.context.begin();f.context.login({email:'fixture@example.invalid'},generation);check('stale-success-cannot-reopen-workspace-after-new-generation',()=>{assert.equal(f.adminStates.length,0);assert.equal(f.views.length,0);});const valid=await f.context.require();f.context.login(valid.profile,valid.generation);check('current-verified-success-opens-workspace',()=>assert.deepEqual(f.views,['admin']));
}
{
 const error={message:'FIXTURE_SIGNOUT_FAILED'},f=fixture({stageError:{at:'signOut',error}});await f.context.logout();check('signOut-error-is-visible-not-silently-swallowed',()=>{assert.ok(f.toasts[0].includes('완료하지 못했습니다'));assert.deepEqual(f.calls,['signOut']);});
}
{
 const error={message:'FIXTURE_BIND_DENIED'},f=fixture({stageError:{at:'bind_current_user_to_teacher',error}});const r=await f.context.require();check('profile-bind-failure-propagates-without-profile-read-or-MFA',()=>{assert.equal(r.error,error);assert.ok(!f.calls.includes('get_my_teacher_profile'));assert.ok(!f.calls.includes('assurance'));});
}
{
 const f=fixture();f.context.mount();await flush();f.fire('SIGNED_IN');const before=f.calls.length;f.context.invalidate();await f.context.begin();await f.runTimers();check('queued-prior-generation-auth-event-starts-no-new-validation',()=>assert.equal(f.calls.length,before));
 f.fire('SIGNED_OUT');await f.context.begin();const views=f.views.length;await f.runTimers();check('queued-old-SIGNED_OUT-does-not-clear-new-login-generation',()=>assert.equal(f.views.length,views));
}
const esbuild=require(process.env.HAHALAB_ESBUILD_TEST_MODULE||path.resolve('scripts/codex-free-tools/node_modules/esbuild/lib/main.js'));let jsx=0;for(const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(/text\/babel/.test(match[1])){await esbuild.transform(match[2],{loader:'jsx',jsxFactory:'React.createElement',jsxFragment:'React.Fragment',target:'es2020'});jsx++;}}check('complete-admin-JSX-parses',()=>assert.ok(jsx));
const result={passed:true,checkedAt:new Date().toISOString(),checks,skippedChecks,productionRequests:0,sourceSha256:createHash('sha256').update(source).digest('hex'),baselineSha256:baseline?createHash('sha256').update(baseline).digest('hex'):null,limits:['Actual-source VM regression with fixture SDK calls; root must verify actual operating administrator logout flow.','An already-started HTTP request cannot be undone; guards prevent subsequent requests and stale workspace restoration.']};const outputPath=process.env.HAHALAB_ADMIN_LOGOUT_OUTPUT||'output/production-release/service-fixes-20261105/admin-logout-contract-summary.json';await fs.mkdir(path.dirname(outputPath),{recursive:true});await fs.writeFile(outputPath,JSON.stringify(result,null,2));console.log(JSON.stringify({passed:true,checks:checks.length,skippedChecks:skippedChecks.length,sourceSha256:result.sourceSha256}));
