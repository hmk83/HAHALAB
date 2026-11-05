// Import is inert. Explicit root invocation only; fixed read-only Management GET.
// Official endpoint: https://supabase.com/docs/reference/api/v1-get-security-advisors
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const PROJECT='gxungzlecmibgvykoiib';
const reject=code=>{throw new Error(code);};
const identifier=value=>typeof value==='string'&&/^[A-Za-z_][A-Za-z0-9_]{0,120}$/.test(value)?value:null;
function remediation(value){
 try{
  const url=new URL(value);
  if(url.origin!=='https://supabase.com'||!['/docs/guides/database/database-linter','/docs/guides/observability/advisors'].includes(url.pathname))return null;
  const safe=new URL(url.origin+url.pathname),lint=url.searchParams.get('lint');
  if(lint&&/^\d{4}_[a-z0-9_]+$/.test(lint))safe.searchParams.set('lint',lint);
  return safe.href;
 }catch{return null;}
}
export function sanitizeSecurityAdvisors(data){
 if(!data||!Array.isArray(data.lints))reject('QA_SECURITY_ADVISORS_RESPONSE_SHAPE');
 return data.lints.map(row=>({name:identifier(row?.name)||'unknown_lint',
  level:['ERROR','WARN','INFO'].includes(row?.level)?row.level:'UNKNOWN',
  facing:['EXTERNAL','INTERNAL'].includes(row?.facing)?row.facing:null,
  categories:(Array.isArray(row?.categories)?row.categories:[]).filter(value=>['SECURITY','PERFORMANCE'].includes(value)),
  target:{schema:identifier(row?.metadata?.schema),name:identifier(row?.metadata?.name),type:['table','view','materialized_view','function','bucket','policy','schema','extension'].includes(row?.metadata?.type)?row.metadata.type:null},
  remediation:remediation(row?.remediation)}));
}
export function createSecurityAdvisorsReader({fetchImpl=globalThis.fetch,writeFile=fs.writeFile,mkdir=fs.mkdir}={}){
 return async function read({managementToken,project,outputDirectory}={}){
  const ref=typeof project==='string'?project:project?.ref||project?.id;
  if(typeof managementToken!=='string'||!managementToken||ref!==PROJECT||typeof outputDirectory!=='string'||!outputDirectory)reject('QA_SECURITY_ADVISORS_ARGUMENTS_REQUIRED');
  const directory=path.resolve(outputDirectory);
  if(!directory.startsWith(path.join(ROOT,'output/production-release')+path.sep))reject('QA_SECURITY_ADVISORS_OUTPUT_PATH_REQUIRED');
  let response,summary;
  try{response=await fetchImpl(`https://api.supabase.com/v1/projects/${PROJECT}/advisors/security`,{
   method:'GET',redirect:'error',headers:{Authorization:`Bearer ${managementToken}`},signal:AbortSignal.timeout(45000)});}catch{summary={passed:false,readSuccessful:false,incomplete:true,error:'QA_SECURITY_ADVISORS_NETWORK_FAILED'};}
  if(response){
   if(!response.ok){await response.body?.cancel();summary={passed:false,readSuccessful:false,incomplete:true,httpStatus:response.status,error:'QA_SECURITY_ADVISORS_ACCESS_OR_SERVER_ERROR'};}
   else{
    try{
     const findings=sanitizeSecurityAdvisors(await response.json()),counts={ERROR:0,WARN:0,INFO:0,UNKNOWN:0};
     for(const row of findings)counts[row.level]++;
     summary={passed:counts.ERROR===0&&counts.UNKNOWN===0,readSuccessful:true,httpStatus:response.status,findings,counts};
    }catch{summary={passed:false,readSuccessful:false,incomplete:true,httpStatus:response.status,error:'QA_SECURITY_ADVISORS_RESPONSE_INVALID'};}
   }
  }
  summary={checkedAt:new Date().toISOString(),projectRef:PROJECT,scope:'Fixed read-only security-advisors GET. Advisory metadata only; no raw detail/description/SQL bodies/credentials retained.',...summary,
   limits:['This experimental Management API endpoint may change; access or response errors are incomplete checks, never passing results.','passed means the read succeeded with no ERROR/unknown-level advisories; warnings remain listed and still require review.','Advisor output does not replace signed-token isolation, revocation and policy behavior tests.'],
   references:['https://supabase.com/docs/reference/api/v1-get-security-advisors']};
  const body=JSON.stringify(summary,null,2)+'\n';if(body.includes(managementToken))reject('QA_SECURITY_ADVISORS_SECRET_OUTPUT');
  await mkdir(directory,{recursive:true,mode:0o700});await writeFile(path.join(directory,'security-advisors-sanitized-summary.json'),body,{mode:0o600});
  return summary;
 };
}
export default async function run(args){return createSecurityAdvisorsReader()(args);}
