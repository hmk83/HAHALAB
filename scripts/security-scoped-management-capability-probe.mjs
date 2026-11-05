// Inert, read-only capability check. Never returns API key/config values.
import fs from 'node:fs/promises';
import path from 'node:path';
export default async function run({managementToken,project,outputDirectory}) {
 const ref='gxungzlecmibgvykoiib';
 if(project!==ref||!managementToken||!path.resolve(outputDirectory).startsWith(path.resolve('output/production-release')+path.sep))throw Error('FIXED_PROBE_SCOPE_REQUIRED');
 const rows=[];
 for(const endpoint of ['api-keys','config/auth']){
  const response=await fetch(`https://api.supabase.com/v1/projects/${ref}/${endpoint}`,{headers:{Authorization:`Bearer ${managementToken}`},redirect:'error',signal:AbortSignal.timeout(30000)});
  let data;try{data=await response.json();}catch{}
  const permitted=response.ok&&(endpoint==='api-keys'?Array.isArray(data)&&['anon','service_role'].every(name=>data.some(row=>row.name===name&&typeof row.api_key==='string'&&row.api_key.length>50)):data&&typeof data==='object'&&!Array.isArray(data));
  rows.push({endpoint,status:response.status,permitted:Boolean(permitted),...(endpoint==='config/auth'?{
   customSmtpConfigured:Boolean(data?.smtp_host),
   smtpProvider:data?.smtp_host?(/(^|\.)resend\.com$/i.test(String(data.smtp_host))?'resend':'other'):'default',
   smtpPasswordConfigured:Boolean(data?.smtp_pass)
  }:{})});
  data=null;
 }
 const result={checkedAt:new Date().toISOString(),passed:rows.every(row=>row.permitted),checks:rows,readOnly:true,credentialValuesRetained:false};
 await fs.mkdir(outputDirectory,{recursive:true,mode:0o700});
 await fs.writeFile(path.join(outputDirectory,'capability-probe.json'),JSON.stringify(result,null,2)+'\n',{mode:0o600});
 return result;
}
