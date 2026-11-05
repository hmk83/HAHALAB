import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const old=globalThis.fetch;let realRequests=0;globalThis.fetch=async()=>{realRequests++;throw Error('FORBIDDEN');};
const {createAnonymousHelperDiagnostic}=await import('./security-advisor-anonymous-helper-diagnostic.mjs');
const checks=[];const check=(name,pass)=>{assert.ok(pass,name);checks.push(name);};
try{
 for(const mode of ['denied','false','wrong-function','wrong-code','raw-secret']){
  let calls=0,body='';
  const runner=createAnonymousHelperDiagnostic({fetchImpl:async(url,init)=>{
   calls++;check(mode+':no-redirect',init.redirect==='error');
   if(calls===1)return{ok:true,json:async()=>[{name:'anon',api_key:'FIXTURE_ANON_MEMORY_ONLY'}]};
   check(mode+':anonymous-no-bearer',!init.headers.Authorization&&init.method==='POST'&&init.body==='{}');
   const name=url.split('/').at(-1);
   return{ok:mode==='false',status:mode==='false'?200:401,json:async()=>mode==='false'?false:{code:mode==='wrong-code'?'PGRST000':'42501',message:mode==='wrong-function'?'permission denied for function OTHER':mode==='raw-secret'?'PRIVATE_RAW_VALUE':`permission denied for function ${name}`,details:'PRIVATE_RAW_VALUE'}};
  },mkdir:async()=>{},writeFile:async(p,b,o)=>{body=b;check(mode+':owner-only',o.mode===0o600);}});
  const r=await runner({managementToken:'FIXTURE_MANAGEMENT_MEMORY_ONLY',project:'gxungzlecmibgvykoiib',outputDirectory:path.resolve('output/production-release/inert-diagnostic')});
  check(mode+':two-fixed-helpers',calls===3&&r.checks.length===2);
  check(mode+':strict-classification',r.checks.every(x=>x.outcome===(mode==='denied'?'EXACT_FUNCTION_EXECUTE_DENIED':mode==='false'?'FALSE':'UNEXPECTED_REDACTED')));
  check(mode+':no-raw-content',!body.includes('PRIVATE_RAW_VALUE')&&!body.includes('FIXTURE_')&&!body.includes('Authorization'));
 }
 let calls=0;const invalid=createAnonymousHelperDiagnostic({fetchImpl:async()=>{calls++;}});
 await assert.rejects(invalid({managementToken:'fixture',project:'wrong',outputDirectory:'/tmp/unrestricted'}));check('invalid-scope-before-network',calls===0);
 check('inert-import-and-local-mocks-only',realRequests===0);
}finally{globalThis.fetch=old;}
const out='output/harness/security-advisor-anonymous-helper-diagnostic-contract';await fs.mkdir(out,{recursive:true,mode:0o700});const summary={passed:true,checks:checks.length,realRequests,names:checks,sourceSha256:createHash('sha256').update(await fs.readFile('scripts/security-advisor-anonymous-helper-diagnostic.mjs')).digest('hex')};await fs.writeFile(out+'/summary.json',JSON.stringify(summary,null,2)+'\n',{mode:0o600});console.log(JSON.stringify({...summary,names:undefined}));
