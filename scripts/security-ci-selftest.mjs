#!/usr/bin/env node
import assert from'node:assert/strict';import fs from'node:fs/promises';import path from'node:path';import{scannerSummary,buildDependencySbom}from'./security-ci.mjs';import{collectSecuritySources,exportSecuritySnapshot,verifySecuritySourceIndex}from'./security-source-snapshot.mjs';
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
const sources=await collectSecuritySources();
check('current authentication source included',sources.files.some(f=>f.path==='js/auth.js'));
check('current Worker included',sources.files.some(f=>f.path==='cloudflare-worker.js'));
check('current app included',sources.files.some(f=>f.path==='js/app.js'));
check('no env/customer/private/media/history output export',sources.files.every(f=>!/(^|\/)(?:\.env|private|output|artifacts|node_modules|\.git)(?:\.|\/|$)|\.(?:zip|wav|png|webp|pdf)$/.test(f.path)));
const snapshot=await exportSecuritySnapshot();
try{
 const valid=await verifySecuritySourceIndex(snapshot.directory);check('export index exactly matches copied source',valid.files===sources.files.length);
 const policyPath=path.join(snapshot.directory,'security/source-policy.json');const policyText=await fs.readFile(policyPath,'utf8');const badPolicy=JSON.parse(policyText);badPolicy.rootFiles.push('../outside-test.js');await fs.writeFile(policyPath,JSON.stringify(badPolicy));let traversal=false;try{await collectSecuritySources(snapshot.directory);}catch(e){traversal=e.message==='SNAPSHOT_FORBIDDEN_PATH';}check('manifest parent-path traversal is rejected',traversal);await fs.writeFile(policyPath,policyText);
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
console.log(JSON.stringify({passed:true,checks:checks.length,names:checks}));
