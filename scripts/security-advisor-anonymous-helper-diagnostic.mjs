// Inert fixed-project read-only diagnostic. No SQL/business mutation, user lookup
// or credential output. Root invokes explicitly; transport is injectable locally.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),PROJECT='gxungzlecmibgvykoiib';
export function createAnonymousHelperDiagnostic({fetchImpl=globalThis.fetch,writeFile=fs.writeFile,mkdir=fs.mkdir}={}){
 return async({managementToken,project,outputDirectory}={})=>{
  const ref=typeof project==='string'?project:project?.ref||project?.id;
  const dir=typeof outputDirectory==='string'?path.resolve(outputDirectory):'';
  if(!managementToken||ref!==PROJECT||!dir.startsWith(path.join(ROOT,'output/production-release')+path.sep))throw Error('QA_SECURITY_DIAGNOSTIC_SCOPE_INVALID');
  let response;try{response=await fetchImpl(`https://api.supabase.com/v1/projects/${PROJECT}/api-keys`,{method:'GET',redirect:'error',signal:AbortSignal.timeout(45000),headers:{Authorization:`Bearer ${managementToken}`}});}catch{throw Error('QA_SECURITY_DIAGNOSTIC_KEY_LOOKUP_FAILED');}
  let keys;try{keys=await response.json();}catch{}const anonKey=Array.isArray(keys)?keys.find(x=>x.name==='anon')?.api_key:null;
  if(!response.ok||typeof anonKey!=='string'||!anonKey)throw Error('QA_SECURITY_DIAGNOSTIC_KEY_LOOKUP_FAILED');
  const checks=[];
  for(const name of ['security_auth_session_active','security_session_active']){
   let r;try{r=await fetchImpl(`https://${PROJECT}.supabase.co/rest/v1/rpc/${name}`,{method:'POST',redirect:'error',signal:AbortSignal.timeout(45000),headers:{apikey:anonKey,'Content-Type':'application/json'},body:'{}'});}catch{throw Error('QA_SECURITY_DIAGNOSTIC_REQUEST_FAILED');}
   let data;try{data=await r.json();}catch{}
   const exactPermissionDenied=!r.ok&&[401,403].includes(r.status)&&data?.code==='42501'&&data?.message===`permission denied for function ${name}`;
   checks.push({name,status:r.status,returnedFalse:r.ok&&data===false,exactPermissionDenied,sqlState:typeof data?.code==='string'&&/^[A-Z0-9]{5}$/.test(data.code)?data.code:null,outcome:exactPermissionDenied?'EXACT_FUNCTION_EXECUTE_DENIED':r.ok&&data===false?'FALSE':'UNEXPECTED_REDACTED'});
  }
  const result={projectRef:PROJECT,checks,scope:'Anonymous helper calls only. No JWT, credential, backend body, headers or customer rows persisted.'};
  await mkdir(dir,{recursive:true,mode:0o700});await writeFile(path.join(dir,'anonymous-helper-diagnostic.json'),JSON.stringify(result,null,2)+'\n',{mode:0o600});return result;
 };
}
export default async function run(args){return createAnonymousHelperDiagnostic()(args);}
