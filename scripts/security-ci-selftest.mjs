#!/usr/bin/env node
import assert from'node:assert/strict';import os from'node:os';import{randomBytes}from'node:crypto';import{spawnSync}from'node:child_process';import{ensureSecurityTool}from'./security-install-tools.mjs';import fs from'node:fs/promises';import path from'node:path';import{scannerSummary,buildDependencySbom,classifySecretReport}from'./security-ci.mjs';import{collectSecuritySources,exportSecuritySnapshot,verifySecuritySourceIndex}from'./security-source-snapshot.mjs';
const root=process.cwd(),checks=[];function check(name,value){assert.ok(value,name);checks.push(name);}
const selected=new Set(['js/app.js']);
const secret='unit-fixture-'+['never','publish','value'].join('-');
const leak=scannerSummary('gitleaks',[{RuleID:'fixture-rule',File:'js/app.js',StartLine:10,Secret:secret,Match:secret,Entropy:4,Commit:secret}],selected);
check('secret value and matched source are removed',!JSON.stringify(leak).includes(secret));
check('only safe finding fields retained',Object.keys(leak[0]).sort().join(',')==='file,line,rule');
check('non-snapshot paths are not published',scannerSummary('gitleaks',[{File:'private/student-record.json',Secret:secret}],selected)[0].file==='[non-snapshot file]');
const staticFinding=scannerSummary('semgrep',{results:[{check_id:'fixture-rule',path:'js/app.js',start:{line:4},extra:{message:secret,lines:secret,severity:'ERROR',metavars:{value:secret}}}]},selected);
check('Semgrep snippets/metavariables never published',!JSON.stringify(staticFinding).includes(secret));
const osv=scannerSummary('osv',{results:[{packages:[{package:{name:'fixture-package',version:'1.0.0'},vulnerabilities:[{id:'GHSA-test-test-test',summary:secret,aliases:['CVE-fixture','private-'+secret]}]}]}]});
check('OSV descriptions and unexpected aliases removed',!JSON.stringify(osv).includes(secret));
const review=JSON.parse(await fs.readFile('security/reviewed-legacy-verifiers.json','utf8'));
const known=review.fingerprints.map(f=>{const [Commit,File,RuleID,line]=f.split(':');return{Commit,File,RuleID,StartLine:Number(line),Fingerprint:f,Secret:secret,Match:secret};});
let classified=classifySecretReport(known,'git-history',selected,review,new Date('2026-11-04T00:00:00Z'));
check('only reviewed six immutable legacy findings classified separately',classified.findings.length===0&&classified.reviewedLegacyVerifierFindings.length===6);
check('reviewed legacy summaries contain no raw token',!JSON.stringify(classified).includes(secret));
check('review expiry makes historical findings blocking again',classifySecretReport(known,'git-history',selected,review,new Date('2027-02-01T00:00:00Z')).findings.length===6);
check('known fingerprints never exempt current source',classifySecretReport(known,'current',selected,review,new Date('2026-11-04T00:00:00Z')).findings.length===6);
const newCommit={...known[0],Commit:'a'.repeat(40)};newCommit.Fingerprint=`${newCommit.Commit}:${newCommit.File}:${newCommit.RuleID}:${newCommit.StartLine}`;
check('same legacy value on a new commit remains blocking',classifySecretReport([newCommit],'git-history',selected,review,new Date('2026-11-04T00:00:00Z')).findings.length===1);
const pat={...known[0],RuleID:'hahalab-supabase-personal-token'};pat.Fingerprint=`${pat.Commit}:${pat.File}:${pat.RuleID}:${pat.StartLine}`;
check('provider PAT findings never use legacy-verifier exception',classifySecretReport([pat],'git-history',selected,review,new Date('2026-11-04T00:00:00Z')).findings.length===1);
const changed={...known[0],Fingerprint:known[1].Fingerprint};
check('inconsistent immutable fingerprint is rejected',classifySecretReport([changed],'git-history',selected,review,new Date('2026-11-04T00:00:00Z')).findings.length===1);
const sources=await collectSecuritySources();
check('current authentication source included',sources.files.some(f=>f.path==='js/auth.js'));
check('current Worker included',sources.files.some(f=>f.path==='cloudflare-worker.js'));
check('current app included',sources.files.some(f=>f.path==='js/app.js'));
check('no env/customer/private/media/history output export',sources.files.every(f=>!/(^|\/)(?:\.env|private|output|artifacts|node_modules|\.git)(?:\.|\/|$)|\.(?:zip|wav|png|webp|pdf)$/.test(f.path)));
const snapshot=await exportSecuritySnapshot();
try{
 const valid=await verifySecuritySourceIndex(snapshot.directory);check('export index exactly matches copied source',valid.files===sources.files.length);
 const policyPath=path.join(snapshot.directory,'security/source-policy.json');const policyText=await fs.readFile(policyPath,'utf8');const badPolicy=JSON.parse(policyText);badPolicy.rootFiles.push('../outside-test.js');await fs.writeFile(policyPath,JSON.stringify(badPolicy));let traversal=false;try{await collectSecuritySources(snapshot.directory);}catch(e){traversal=e.message==='SNAPSHOT_FORBIDDEN_PATH';}check('manifest parent-path traversal is rejected',traversal);await fs.writeFile(policyPath,policyText);
 const jsRoot=path.join(snapshot.directory,'js'),originalJs=path.join(snapshot.directory,'js-original');await fs.rename(jsRoot,originalJs);await fs.symlink(originalJs,jsRoot,'dir');let rootSymlink=false;try{await collectSecuritySources(snapshot.directory);}catch(e){rootSymlink=e.message==='SNAPSHOT_SYMLINK_REJECTED';}check('root source tree symlink is rejected',rootSymlink);await fs.unlink(jsRoot);await fs.rename(originalJs,jsRoot);
 const appPath=path.join(snapshot.directory,'js/app.js'),appOriginal=path.join(snapshot.directory,'app-original.js');await fs.rename(appPath,appOriginal);await fs.symlink(appOriginal,appPath);let fileSymlink=false;try{await collectSecuritySources(snapshot.directory);}catch(e){fileSymlink=e.message==='SNAPSHOT_SYMLINK_REJECTED';}check('source file symlink is rejected',fileSymlink);await fs.unlink(appPath);await fs.rename(appOriginal,appPath);
 const sbRoot=path.join(snapshot.directory,'supabase'),sbOriginal=path.join(snapshot.directory,'supabase-original');await fs.rename(sbRoot,sbOriginal);await fs.symlink(sbOriginal,sbRoot,'dir');let ancestorSymlink=false;try{await collectSecuritySources(snapshot.directory);}catch(e){ancestorSymlink=e.message==='SNAPSHOT_SYMLINK_REJECTED';}check('ancestor of nested source tree symlink is rejected',ancestorSymlink);await fs.unlink(sbRoot);await fs.rename(sbOriginal,sbRoot);
 const file=path.join(snapshot.directory,'js/app.js');await fs.appendFile(file,'\n// selftest changed source\n');
 let rejected=false;try{await verifySecuritySourceIndex(snapshot.directory);}catch(e){rejected=e.message.startsWith('SECURITY_SOURCE_INDEX_STALE');}check('stale published source hash is rejected',rejected);
 let collision=false;try{await exportSecuritySnapshot(root,snapshot.directory);}catch(e){collision=e.message==='SNAPSHOT_DESTINATION_MUST_BE_NEW';}check('existing destination is not silently overwritten',collision);
}finally{await fs.rm(snapshot.directory,{recursive:true,force:true});}
const sbom=await buildDependencySbom();
check('CDN Supabase dependency inventoried',sbom.components.some(c=>c.name==='@supabase/supabase-js'&&c.version==='2.118.0'));
check('fixed vendor xlsx dependency inventoried',sbom.components.some(c=>c.name==='xlsx'&&c.version==='0.20.3'));
check('vulnerable old xlsx excluded from actual source inventory',!sbom.components.some(c=>c.name==='xlsx'&&c.version==='0.18.5'));
check('all inventory versions are exact',sbom.components.every(c=>/^\d+\.\d+\.\d+/.test(c.version)));
const workflow=await fs.readFile('.github/workflows/security.yml','utf8');
check('workflow has no privileged PR trigger',!workflow.includes('pull_request_target'));
check('workflow has no application credentials',!/\$\{\{\s*secrets\./.test(workflow));
check('workflow permissions default read only',workflow.includes('contents: read')&&!workflow.includes('write-all'));
check('all action dependencies SHA pinned',[...workflow.matchAll(/uses:\s*([^\s#]+)/g)].every(m=>/@[a-f0-9]{40}$/.test(m[1])));
check('artifacts capped at three days',[...workflow.matchAll(/retention-days:\s*(\d+)/g)].every(m=>m[1]==='3'));
check('ZAP execution is explicit dispatch only',workflow.includes("github.event_name == 'workflow_dispatch' && inputs.zap == true"));
const runnerSource=await fs.readFile('scripts/security-ci.mjs','utf8');check('repository ignore files cannot suppress scanner findings',runnerSource.includes("'--gitleaks-ignore-path',emptyIgnore"));
const zapSource=await fs.readFile('scripts/security-zap-baseline.mjs','utf8');check('ZAP disables GET and POST form submission explicitly',zapSource.includes('spider.processform=false')&&zapSource.includes('spider.postform=false'));
if(process.argv.includes('--gitleaks')){
 const temp=await fs.mkdtemp(path.join(os.tmpdir(),'hahalab-gitleaks-selftest-'));await fs.chmod(temp,0o700);
 try{
  const tool=await ensureSecurityTool('gitleaks');
  const pat='sbp_'+randomBytes(24).toString('hex'),api=randomBytes(32).toString('base64url');
  await fs.writeFile(path.join(temp,'fixture.js'),'const serviceCredential = '+JSON.stringify(pat)+'; // gitleaks:allow\nconst API_KEY = '+JSON.stringify(api)+';\n');
  const probeSource=await fs.readFile('scripts/security-tenant-transaction-probe.sql','utf8');const gitleaksConfig=await fs.readFile('security/gitleaks.toml','utf8');const reviewedHashes=new Set([...gitleaksConfig.matchAll(/\b[a-f0-9]{32}\b/g)].map(m=>m[0]));const digestRows=probeSource.split('\n').filter(line=>{const match=line.match(/^\s*\('[^']+','([a-f0-9]{32})'\)/);return match&&reviewedHashes.has(match[1]);});
  check('reviewed integrity-check fixture has the expected three public MD5 rows',digestRows.length===3);
  await fs.mkdir(path.join(temp,'scripts'));await fs.writeFile(path.join(temp,'scripts/security-tenant-transaction-probe.sql'),digestRows.join('\n')+'\nAPI_KEY = '+JSON.stringify(api)+';\n');
  await fs.writeFile(path.join(temp,'not-approved.sql'),digestRows.join('\n')+'\n');
  const report=path.join(temp,'redacted.json');const run=spawnSync(tool,['dir',temp,'--config',path.resolve('security/gitleaks.toml'),'--redact=100','--ignore-gitleaks-allow','--no-banner','--log-level=error','--report-format=json','--report-path',report],{encoding:'utf8',timeout:30000});
  check('real scanner blocks newly introduced credentials',run.status===1);
  const findings=JSON.parse(await fs.readFile(report,'utf8'));
  check('real PAT rule cannot be bypassed by inline allow comment',findings.some(f=>f.RuleID==='hahalab-supabase-personal-token'));
  check('real generic secret rule remains active',findings.some(f=>f.RuleID==='generic-api-key'));
  check('real scanner report redacts generated secret values',!JSON.stringify(findings).includes(pat)&&!JSON.stringify(findings).includes(api));
  check('only exact integrity hashes in the exact probe path are exempt',!findings.some(f=>String(f.File).endsWith('scripts/security-tenant-transaction-probe.sql')&&f.StartLine<=digestRows.length));
  check('new API secrets in the probe path still block',findings.some(f=>String(f.File).endsWith('scripts/security-tenant-transaction-probe.sql')&&f.RuleID==='generic-api-key'&&f.StartLine===digestRows.length+1));
  check('same integrity hashes in another path are not blanket-exempt',findings.filter(f=>String(f.File).endsWith('not-approved.sql')&&f.RuleID==='generic-api-key').length===3);

 }finally{await fs.rm(temp,{recursive:true,force:true});}
}
console.log(JSON.stringify({passed:true,checks:checks.length,names:checks}));
