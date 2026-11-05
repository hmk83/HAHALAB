// Fake transport only. No Management API request is sent by this test.
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import {createHash} from 'node:crypto';
let realRequests=0;const oldFetch=globalThis.fetch;globalThis.fetch=async()=>{realRequests++;throw new Error('No live API in contract test');};
const {createSecurityAdvisorsReader,sanitizeSecurityAdvisors}=await import('./security-production-advisors.mjs');
const token='FIXTURE_ADVISOR_MEMORY_ONLY',out=path.resolve('output/production-release/security-remediation-20261105/advisors-contract-fixture');let checks=0;
const check=(v,name)=>{checks++;assert.ok(v,name);};
const row={name:'rls_disabled_in_public',level:'WARN',facing:'EXTERNAL',categories:['SECURITY','UNTRUSTED'],metadata:{schema:'public',name:'fixture_table',type:'table',privateRaw:token},remediation:'https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public&private='+token,detail:token,description:'PRIVATE_ACTUAL_DETAIL',title:token};
try{
 check(realRequests===0,'import inert');
 for(const mode of ['warn','none','error','unknown-level','invalid-shape','invalid-json','access-denied','network-error']){
  let calls=0,writes=0;
  const read=createSecurityAdvisorsReader({fetchImpl:async(url,init)=>{
   calls++;check(url==='https://api.supabase.com/v1/projects/gxungzlecmibgvykoiib/advisors/security','fixed endpoint');check(init.method==='GET'&&init.redirect==='error'&&!init.body,'read-only request');check(init.headers.Authorization==='Bearer '+token,'memory bearer used only in request');
   if(mode==='network-error')throw new Error(token);
   if(mode==='access-denied')return new Response(token,{status:403});
   if(mode==='invalid-json')return new Response('not-json');
   const data=mode==='invalid-shape'?{details:token}:{lints:mode==='none'?[]:[{...row,level:mode==='error'?'ERROR':mode==='unknown-level'?'PRIVATE_LEVEL':'WARN'}]};return new Response(JSON.stringify(data));
  },mkdir:async()=>{},writeFile:async(_file,body,options)=>{writes++;check(!body.includes(token)&&!body.includes('PRIVATE_ACTUAL_DETAIL')&&!body.includes('privateRaw'),'raw values removed');check(options.mode===0o600,'owner-only evidence');}});
  const result=await read({managementToken:token,project:'gxungzlecmibgvykoiib',outputDirectory:out});check(calls===1&&writes===1,'one GET and one sanitized evidence file');
  check(result.passed===['warn','none'].includes(mode),'error and incomplete never pass');
  if(mode==='warn')check(result.findings[0].remediation==='https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public','only approved remediation URL parameter retained');
 }
 const safe=sanitizeSecurityAdvisors({lints:[{...row,name:'<script>',metadata:{schema:'private.dot',name:'x;drop',type:'UNRECOGNIZED'},remediation:'https://evil.invalid/?secret='+token}]});
 check(safe[0].name==='unknown_lint'&&safe[0].target.schema===null&&safe[0].target.name===null&&safe[0].remediation===null,'untrusted metadata and URL rejected');
 let touched=false;const guard=createSecurityAdvisorsReader({fetchImpl:async()=>{touched=true;throw new Error('No');}});
 for(const args of [{managementToken:token,project:'other',outputDirectory:out},{managementToken:'',project:'gxungzlecmibgvykoiib',outputDirectory:out},{managementToken:token,project:'gxungzlecmibgvykoiib',outputDirectory:'/tmp/arbitrary'}]){await assert.rejects(guard(args),/^Error: QA_SECURITY_ADVISORS_/);checks++;}
 check(!touched&&realRequests===0,'wrong scope never makes external request');
}finally{globalThis.fetch=oldFetch;}
const output=path.resolve('output/harness/security-production-advisors-contract');await fs.mkdir(output,{recursive:true});const summary={passed:true,checks,realRequests,sourceSha256:createHash('sha256').update(await fs.readFile('scripts/security-production-advisors.mjs')).digest('hex')};await fs.writeFile(path.join(output,'summary.json'),JSON.stringify(summary,null,2),{mode:0o600});console.log(JSON.stringify(summary));
