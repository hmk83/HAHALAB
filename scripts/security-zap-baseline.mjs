#!/usr/bin/env node
// Explicitly invoked only. Fixed unauthenticated target, GET crawl, passive scan.
import fs from'node:fs/promises';import path from'node:path';import os from'node:os';import{spawnSync}from'node:child_process';import{fileURLToPath}from'node:url';
export function safeZapDiagnostics(run) {
 const output=String(run.stderr||'')+'\n'+String(run.stdout||'')+'\n'+String(run.startupOutput||'');
 const categories=[];
 if(run.error?.code==='ETIMEDOUT')categories.push('runner-timeout');
 if(/permission denied|accessdeniedexception|operation not permitted/i.test(output))categories.push('filesystem-permission');
 if(/cannot connect to the docker daemon|docker.*not found/i.test(output)||run.error?.code==='ENOENT')categories.push('docker-unavailable');
 if(/manifest unknown|pull access denied|unauthorized|failed to resolve reference/i.test(output))categories.push('image-pull-failed');
 if(/zap.*failed to start|unable to start zap|failed to start zap/i.test(output))categories.push('zap-startup-failed');
 if(/403 forbidden|cloudflare.*challenge|access denied|target.*not accessible/i.test(output))categories.push('target-access-blocked');
 if(/home.*(?:not.*writ|invalid)|directory.*not.*writ|unable to create.*directory/i.test(output))categories.push('home-directory-not-writable');
 if(/unsupportedclassversionerror|could not create.*virtual machine|outofmemoryerror|unable.*access.*jarfile/i.test(output))categories.push('java-runtime-failure');
 if(/invalid option|unrecognized argument|context.*(invalid|error)|syntaxerror/i.test(output))categories.push('configuration-rejected');
 return {dockerExitStatus:Number.isInteger(run.status)?run.status:null,terminationSignal:['SIGTERM','SIGKILL'].includes(run.signal)?run.signal:null,categories:categories.length?categories:['unclassified-failure'],stdoutBytes:Buffer.byteLength(String(run.stdout||'')),stderrBytes:Buffer.byteLength(String(run.stderr||'')),startupLogBytes:Buffer.byteLength(String(run.startupOutput||''))};
}
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const lock=JSON.parse(await fs.readFile(path.join(ROOT,'security/tools.lock.json'),'utf8'));
const out=path.join(ROOT,'output/security-ci');await fs.mkdir(out,{recursive:true});
const temp=await fs.mkdtemp(path.join(os.tmpdir(),'hahalab-zap-'));let summary;let diagnostics;
try{
 const context='<?xml version="1.0" encoding="UTF-8"?><configuration><context><name>HAHALAB public passive baseline</name><desc>Fixed public website. No authentication or active scan.</desc><inscope>true</inscope><incregexes>https://thehahalab\\.com/$</incregexes><excregexes>https://thehahalab\\.com/(?:api|auth|rest|functions|private|admin|class-new|playlab|report-share|logout).*|.*\\?.*</excregexes></context></configuration>';
 await fs.writeFile(path.join(temp,'scope.context'),context);
 const args=['run','--rm','--cap-drop=ALL','--security-opt=no-new-privileges','--user',`${process.getuid?.()??1000}:${process.getgid?.()??1000}`,'-e','HOME=/tmp','--workdir','/zap/wrk','--tmpfs','/tmp','-v',temp+':/zap/wrk:rw',lock.zap.image,'zap-baseline.py','-t','https://thehahalab.com/','-n','scope.context','-m','1','-T','5','-z','-dir /tmp/hahalab-zap-home -config spider.processform=false -config spider.postform=false -config network.connection.defaultUserAgent=HAHALAB-Security-Baseline/1.0','-J','zap.raw.json'];
 const run=spawnSync('docker',args,{cwd:ROOT,encoding:'utf8',maxBuffer:8*1024*1024,timeout:7*60*1000});
 const startupOutput=await fs.readFile(path.join(temp,'zap.out'),'utf8').catch(()=> '');
 diagnostics=safeZapDiagnostics({...run,startupOutput});
 if(run.error||![0,1,2].includes(run.status))throw new Error('ZAP_BASELINE_INCOMPLETE');
 let data;try{data=JSON.parse(await fs.readFile(path.join(temp,'zap.raw.json'),'utf8'));}catch{throw new Error('ZAP_REPORT_UNAVAILABLE_OR_INVALID');}
 const alerts=(data.site||[]).flatMap(site=>site.alerts||[]).map(a=>({pluginId:String(a.pluginid||''),risk:String(a.riskcode||''),instances:Number(a.count)||0}));
 summary={passed:run.status===0,mode:'bounded-passive-baseline',target:'https://thehahalab.com/',maxSpiderMinutes:1,maxStartupAndPassiveMinutes:5,userAgent:'HAHALAB-Security-Baseline/1.0',scope:'Exact anonymous homepage URL; forms disabled',alerts,limits:'Unauthenticated fixed-scope crawl only. No active attack scan, logged-in session or database isolation assertion.'};
}catch(e){summary={passed:false,incomplete:true,error:['ZAP_BASELINE_INCOMPLETE','ZAP_REPORT_UNAVAILABLE_OR_INVALID'].includes(e.message)?e.message:'ZAP_RUNNER_ERROR',...(diagnostics?{diagnostics}:{})};}finally{await fs.rm(temp,{recursive:true,force:true});}
await fs.writeFile(path.join(out,'zap.json'),JSON.stringify({checkedAt:new Date().toISOString(),...summary},null,2)+'\n',{mode:0o600});console.log(JSON.stringify(summary));if(!summary.passed)process.exitCode=1;
