import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
process.env.TZ='Asia/Seoul';
const sourceFile=process.argv.find(x=>x.startsWith('--source='))?.slice(9)||'js/app.js';const source=fs.readFileSync(sourceFile,'utf8');const start=source.indexOf('function formatDateTimeDisplay('),end=source.indexOf('\nfunction stripHtmlTags(',start);assert(start>=0&&end>start);const context=vm.createContext({Date});vm.runInContext(source.slice(start,end),context);
const checks=[];const table=value=>context.formatDateTimeDisplay(value).replace('오전 ','').replace('오후 ','');function test(name,fn){try{fn();checks.push({name,passed:true});}catch(e){checks.push({name,passed:false,reason:e.code==='ERR_ASSERTION'?'ASSERTION_FAILED':'EXECUTION_FAILED'});}}
test('afternoon UTC input prints actual KST 16:17',()=>{assert(context.formatDateTimeDisplay('2026-11-05T07:17:00Z').endsWith('16:17'));});
test('report removal of AMPM cannot turn afternoon into morning',()=>{assert(table('2026-11-05T07:17:00Z').endsWith('16:17'));});
test('KST morning remains distinct 04:17',()=>{assert(table('2026-11-04T19:17:00Z').endsWith('04:17'));assert.notEqual(table('2026-11-04T19:17:00Z'),table('2026-11-05T07:17:00Z'));});
test('midnight is 00:00 rather than 12:00 or 24:00',()=>{assert(table('2026-11-04T15:00:00Z').endsWith('00:00'));});
test('noon is 12:00',()=>{assert(table('2026-11-05T03:00:00Z').endsWith('12:00'));});
test('end of day is 23:59',()=>{assert(table('2026-11-05T14:59:00Z').endsWith('23:59'));});
test('explicit KST offsets preserve wall-clock time',()=>{assert(table('2026-11-05T16:17:00+09:00').endsWith('16:17'));});
for(const value of ['',null,undefined,'not-a-date'])test('missing/invalid timestamps still use placeholder '+String(value),()=>assert.equal(context.formatDateTimeDisplay(value),'-'));
console.log(JSON.stringify({passed:checks.every(c=>c.passed),checks,sourceSha256:createHash('sha256').update(source).digest('hex'),productionRequests:0,scope:'Unmodified real formatDateTimeDisplay invoked in isolated VM; test process TZ=Asia/Seoul. Only wall-clock formatting, no timestamp rewriting.'},null,2));if(process.argv.includes('--assert')&&!checks.every(c=>c.passed))process.exitCode=1;
