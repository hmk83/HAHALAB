#!/usr/bin/env node
// Explicitly invoked only. Fixed unauthenticated target, GET crawl, passive scan.
import fs from'node:fs/promises';import path from'node:path';import os from'node:os';import{spawnSync}from'node:child_process';import{fileURLToPath}from'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const lock=JSON.parse(await fs.readFile(path.join(ROOT,'security/tools.lock.json'),'utf8'));
const out=path.join(ROOT,'output/security-ci');await fs.mkdir(out,{recursive:true});
const temp=await fs.mkdtemp(path.join(os.tmpdir(),'hahalab-zap-'));let summary;
try{
 const context='<?xml version="1.0" encoding="UTF-8"?><configuration><context><name>HAHALAB public passive baseline</name><desc>Fixed public website. No authentication or active scan.</desc><inscope>true</inscope><incregexes>https://thehahalab\\.com/.*</incregexes><excregexes>https://thehahalab\\.com/(?:api|auth|rest|functions|private|admin|class-new|playlab|report-share|logout).*|.*\\?.*</excregexes></context></configuration>';
 await fs.writeFile(path.join(temp,'scope.context'),context);
 const args=['run','--rm','--cap-drop=ALL','--security-opt=no-new-privileges','--user',`${process.getuid?.()??1000}:${process.getgid?.()??1000}`,'-e','HOME=/tmp','--tmpfs','/tmp','-v',temp+':/zap/wrk:rw',lock.zap.image,'zap-baseline.py','-t','https://thehahalab.com/','-n','scope.context','-m','1','-T','5','-I','-J','zap.raw.json'];
 const run=spawnSync('docker',args,{cwd:ROOT,encoding:'utf8',maxBuffer:8*1024*1024,timeout:7*60*1000});
 if(run.error||![0,1,2].includes(run.status))throw new Error('ZAP_BASELINE_INCOMPLETE');
 const data=JSON.parse(await fs.readFile(path.join(temp,'zap.raw.json'),'utf8'));
 const alerts=(data.site||[]).flatMap(site=>site.alerts||[]).map(a=>({pluginId:String(a.pluginid||''),risk:String(a.riskcode||''),instances:Number(a.count)||0}));
 summary={passed:run.status===0,mode:'bounded-passive-baseline',target:'https://thehahalab.com/',maxSpiderMinutes:1,maxStartupAndPassiveMinutes:5,alerts,limits:'Unauthenticated fixed-scope crawl only. No active attack scan, logged-in session or database isolation assertion.'};
}catch(e){summary={passed:false,incomplete:true,error:e.message};}finally{await fs.rm(temp,{recursive:true,force:true});}
await fs.writeFile(path.join(out,'zap.json'),JSON.stringify({checkedAt:new Date().toISOString(),...summary},null,2)+'\n',{mode:0o600});console.log(JSON.stringify(summary));if(!summary.passed)process.exitCode=1;
