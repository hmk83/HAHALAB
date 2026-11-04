#!/usr/bin/env node
// Free security gates. Raw scanner output stays in a private temp directory.
import fs from 'node:fs/promises';import path from 'node:path';import os from 'node:os';import{spawnSync}from'node:child_process';import{createHash}from'node:crypto';import{fileURLToPath}from'node:url';
import{ensureSecurityTool}from'./security-install-tools.mjs';import{collectSecuritySources,exportSecuritySnapshot,verifySecuritySourceIndex}from'./security-source-snapshot.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const OUT=path.resolve(ROOT,'output/security-ci');
export function scannerSummary(tool,data,allowedPaths=new Set()){
 const safePath=f=>{const relative=String(f||'').replace(ROOT+'/','').replace(/^\.\//,'');if(allowedPaths.has(relative))return relative;for(const allowed of allowedPaths)if(relative.endsWith('/'+allowed))return allowed;return '[non-snapshot file]';};
 if(tool==='gitleaks')return (Array.isArray(data)?data:[]).map(f=>({rule:String(f.RuleID||'unknown'),file:safePath(f.File),line:Number(f.StartLine)||0}));
 if(tool==='semgrep')return (data.results||[]).map(f=>({rule:String(f.check_id||'unknown'),file:safePath(f.path),line:Number(f.start?.line)||0,severity:String(f.extra?.severity||'unknown')}));
 if(tool==='osv')return (data.results||[]).flatMap(r=>(r.packages||[]).flatMap(p=>(p.vulnerabilities||[]).map(v=>({id:String(v.id||'unknown'),package:String(p.package?.name||'unknown'),version:String(p.package?.version||''),aliases:(v.aliases||[]).filter(a=>/^(?:CVE-|GHSA-)/.test(a))}))));
 return [];
}
function run(command,args,options={}){const r=spawnSync(command,args,{cwd:ROOT,encoding:'utf8',maxBuffer:32*1024*1024,timeout:12*60*1000,...options});if(r.error)throw new Error('SECURITY_TOOL_EXECUTION_FAILED');return r;}
async function readJson(file){try{return JSON.parse(await fs.readFile(file,'utf8'));}catch{throw new Error('SECURITY_TOOL_REPORT_INVALID');}}
export async function buildDependencySbom(root=ROOT){
 const index=await collectSecuritySources(root),packages=new Map(),unversioned=[];
 for(const file of index.files){
  if(!/\.(?:html|js|jsx|ts)$/.test(file.path)||file.path.startsWith('js/vendor/'))continue;
  const content=await fs.readFile(path.join(root,file.path),'utf8');
  const regex=/(?:unpkg\.com\/|cdn\.jsdelivr\.net\/npm\/|esm\.sh\/)(@[^/\s"'`]+\/[^@/\s?"'`]+|[^@/\s?"'`]+)@(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)/g;
  for(const match of content.matchAll(regex)){const name=match[1],version=match[2];packages.set(name+'@'+version,{name,version,purl:'pkg:npm/'+encodeURIComponent(name).replace('%2F','/')+'@'+version});}
 }
 const inventory=JSON.parse(await fs.readFile(path.join(root,'security/dependency-inventory.json'),'utf8'));
 for(const item of inventory.packages){const content=await fs.readFile(path.join(root,item.source),'utf8');if(item.sha256&&createHash('sha256').update(content).digest('hex')!==item.sha256)throw new Error('VENDORED_DEPENDENCY_HASH_MISMATCH');if(!content.includes(item.versionMarker))throw new Error('VENDORED_DEPENDENCY_VERSION_MISMATCH');packages.set(item.name+'@'+item.version,{name:item.name,version:item.version,purl:item.purl});}
 if(!packages.size)throw new Error('NO_DEPENDENCIES_IN_SECURITY_INVENTORY');
 return {bomFormat:'CycloneDX',specVersion:'1.5',version:1,components:[...packages.values()].sort((a,b)=>(a.name+a.version).localeCompare(b.name+b.version)).map(p=>({type:'library',...p}))};
}
async function policy(){
 const index=await collectSecuritySources();
 const lock=JSON.parse(await fs.readFile(path.join(ROOT,'security/tools.lock.json'),'utf8'));
 const workflow=await fs.readFile(path.join(ROOT,'.github/workflows/security.yml'),'utf8');
 if(/pull_request_target|\$\{\{\s*secrets\.|permissions:\s*write-all/.test(workflow))throw new Error('UNSAFE_SECURITY_WORKFLOW');
 const actions=[...workflow.matchAll(/uses:\s*([^\s#]+)/g)].map(m=>m[1]);if(actions.some(a=>!/@[a-f0-9]{40}$/.test(a)))throw new Error('WORKFLOW_ACTION_NOT_SHA_PINNED');
 if(!lock.semgrep.image.includes('@sha256:')||!lock.zap.image.includes('@sha256:'))throw new Error('CONTAINER_NOT_DIGEST_PINNED');
 let verifiedSourceIndex=false;try{await fs.access(path.join(ROOT,'security/source-index.json'));await verifySecuritySourceIndex();verifiedSourceIndex=true;}catch(e){if(e.code!=='ENOENT')throw e;if(process.env.CI==='true')throw new Error('SECURITY_SOURCE_INDEX_REQUIRED_IN_CI');}
 const sbom=await buildDependencySbom();return {passed:true,sourceFiles:index.files.length,verifiedSourceIndex,inventoryPackages:sbom.components.length,sourceScope:'Explicit current application source; no customer records or private learning HTML'};
}
async function scanSecrets(temp,allowed){
 const tool=await ensureSecurityTool('gitleaks'),reports=[];
 const snapshot=await exportSecuritySnapshot();
 try{
  const jobs=[{kind:'current',args:['dir',snapshot.directory]}];
  try{await fs.access(path.join(ROOT,'.git'));jobs.push({kind:'git-history',args:['git',ROOT,'--log-opts=--all']});}catch{}
  for(const job of jobs){const file=path.join(temp,'gitleaks-'+job.kind+'.json');const result=run(tool,[...job.args,'--config',path.join(ROOT,'security/gitleaks.toml'),'--redact=100','--ignore-gitleaks-allow','--no-banner','--no-color','--log-level=error','--timeout=300','--max-archive-depth=2','--report-format=json','--report-path',file]);if(![0,1].includes(result.status))throw new Error('GITLEAKS_SCAN_INCOMPLETE');const findings=scannerSummary('gitleaks',await readJson(file),allowed);reports.push({scope:job.kind,findings});}
 }finally{await fs.rm(snapshot.directory,{recursive:true,force:true});}
 return {passed:reports.every(r=>r.findings.length===0),reports,redaction:'100%; only rule/path/line summaries retained'};
}
async function scanStatic(temp,allowed){
 const lock=JSON.parse(await fs.readFile(path.join(ROOT,'security/tools.lock.json'),'utf8'));
 const snapshot=await exportSecuritySnapshot();let result;
 const flags=['scan','--config=security/semgrep.yml','--metrics=off','--disable-version-check','--no-git-ignore','--error','--json','--exclude=js/vendor','--exclude=*.min.js','.'];
 try{
  if(process.env.HAHALAB_SEMGREP_BIN){const version=run(process.env.HAHALAB_SEMGREP_BIN,['--version'],{env:{...process.env,SEMGREP_SEND_METRICS:'off',SEMGREP_ENABLE_VERSION_CHECK:'0'}});if(!version.stdout.includes(lock.semgrep.version))throw new Error('SEMGREP_VERSION_MISMATCH');result=run(process.env.HAHALAB_SEMGREP_BIN,flags,{cwd:snapshot.directory,env:{...process.env,SEMGREP_SEND_METRICS:'off',SEMGREP_ENABLE_VERSION_CHECK:'0'}});}
  else result=run('docker',['run','--rm','--network=none','--read-only','--cap-drop=ALL','--security-opt=no-new-privileges','--tmpfs','/tmp','--user',`${process.getuid?.()??1000}:${process.getgid?.()??1000}`,'-e','HOME=/tmp','-e','SEMGREP_SETTINGS_FILE=/tmp/semgrep-settings.yml','-e','SEMGREP_SEND_METRICS=off','-e','SEMGREP_ENABLE_VERSION_CHECK=0','-v',snapshot.directory+':/src:ro','-w','/src',lock.semgrep.image,'semgrep',...flags]);
  if(![0,1].includes(result.status))throw new Error('SEMGREP_SCAN_INCOMPLETE');let data;try{data=JSON.parse(result.stdout);}catch{throw new Error('SEMGREP_REPORT_INVALID');}
  if((data.errors||[]).length)throw new Error('SEMGREP_PARSE_OR_RULE_ERRORS');
  const findings=scannerSummary('semgrep',data,allowed);return {passed:findings.length===0,findings,rules:'Project-owned high-confidence checks; not a complete application penetration test'};
 }finally{await fs.rm(snapshot.directory,{recursive:true,force:true});}
}
async function scanDependencies(temp){
 const tool=await ensureSecurityTool('osv-scanner');
 const sbom=await buildDependencySbom();const bom=path.join(temp,'application.cdx.json');await fs.writeFile(bom,JSON.stringify(sbom));
 const file=path.join(temp,'osv.json'),args=['scan','source','--no-resolve','--no-call-analysis=go,rust','--format=json','--verbosity=error','--output-file',file,'--sbom',bom];
 try{await fs.access(path.join(ROOT,'package-lock.json'));args.push('--lockfile',path.join(ROOT,'package-lock.json'));}catch{if(process.env.CI==='true')throw new Error('ROOT_PACKAGE_LOCK_REQUIRED');}
 const result=run(tool,args);if(![0,1].includes(result.status))throw new Error('OSV_SCAN_INCOMPLETE');const findings=scannerSummary('osv',await readJson(file));
 const inventory=JSON.parse(await fs.readFile(path.join(ROOT,'security/dependency-inventory.json'),'utf8'));
 const classified=[];const blocking=[];
 for(const finding of findings){
  let exception=null;
  for(const candidate of inventory.vendorAdvisoryExceptions||[]){
   if(candidate.package!==finding.package||candidate.version!==finding.version||!candidate.advisories.includes(finding.id))continue;
   const digest=createHash('sha256').update(await fs.readFile(path.join(ROOT,candidate.source))).digest('hex');
   if(digest===candidate.sha256&&candidate.references?.length)exception=candidate;
  }
  if(exception)classified.push({...finding,classification:'upstream-fixed-official-vendor',artifactSha256:exception.sha256,references:exception.references});else blocking.push(finding);
 }
 return {passed:blocking.length===0,packages:sbom.components.length,findings:blocking,upstreamFixedVendorFindings:classified,scope:'Pinned browser CDN/vendor inventory and root package-lock. Package metadata only; no source upload.'};
}
export async function securityGate(mode){
 if(!['policy','secrets','static','dependencies'].includes(mode))throw new Error('SECURITY_MODE_REQUIRED');
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'hahalab-security-raw-'));await fs.chmod(temp,0o700);
 let result;try{const index=await collectSecuritySources(),allowed=new Set(index.files.map(f=>f.path));result=mode==='policy'?await policy():mode==='secrets'?await scanSecrets(temp,allowed):mode==='static'?await scanStatic(temp,allowed):await scanDependencies(temp);}
 catch(e){result={passed:false,incomplete:true,error:e.message};}finally{await fs.rm(temp,{recursive:true,force:true});}
 await fs.mkdir(OUT,{recursive:true});const summary={mode,checkedAt:new Date().toISOString(),...result};await fs.writeFile(path.join(OUT,mode+'.json'),JSON.stringify(summary,null,2)+'\n',{mode:0o600});return summary;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const result=await securityGate(process.argv[2]);console.log(JSON.stringify(result));if(!result.passed)process.exitCode=1;}catch(e){console.error(e.message);process.exitCode=1;}
}
