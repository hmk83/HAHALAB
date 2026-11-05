import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
const sourceFile=process.argv.find(x=>x.startsWith('--source='))?.slice(9)||'js/app.js';
const appSource=fs.readFileSync(sourceFile,'utf8'),sha=createHash('sha256').update(appSource).digest('hex');
const between=(a,b)=>{const start=appSource.indexOf(a),end=appSource.indexOf(b,start+a.length);assert(start>=0&&end>start);return appSource.slice(start,end);};
function extractFunction(name) {
  const match = new RegExp(`(?:async\\s+)?function\\s+${name}\\s*\\(`).exec(appSource);
  if (!match) throw new Error(`Missing production function: ${name}`);
  const start = match.index;
  let index = appSource.indexOf('(', start);
  let parameters = 0;
  for (; index < appSource.length; index += 1) {
    if (appSource[index] === '(') parameters += 1;
    if (appSource[index] === ')') {
      parameters -= 1;
      if (parameters === 0) break;
    }
  }
  const bodyStart = appSource.indexOf('{', index);
  let depth = 0;
  let state = 'code';
  let escaped = false;
  for (index = bodyStart; index < appSource.length; index += 1) {
    const char = appSource[index];
    const next = appSource[index + 1];
    if (state === 'line') { if (char === '\n') state = 'code'; continue; }
    if (state === 'block') { if (char === '*' && next === '/') { state = 'code'; index += 1; } continue; }
    if (state !== 'code') {
      if (escaped) { escaped = false; continue; }
      if (char === '\\') { escaped = true; continue; }
      if (char === state) state = 'code';
      continue;
    }
    if (char === '/' && next === '/') { state = 'line'; index += 1; continue; }
    if (char === '/' && next === '*') { state = 'block'; index += 1; continue; }
    if (char === "'" || char === '"' || char === '`') { state = char; continue; }
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return appSource.slice(start, index + 1);
    }
  }
  throw new Error(`Unterminated production function: ${name}`);
}

const extractor=extractFunction;
const blank=()=>'',container={innerHTML:''},detail={histories:[],cardlabAttempts:[],cardlabWrongStats:[],cardlabProgress:[]};let series;
const context=vm.createContext({Date,Map,console,document:{getElementById:()=>container},currentDetailData:detail,currentDetailReportMode:'teacher',DETAIL_REPORT_LIMIT:200,
 normalizeLabHistoryRow:x=>x,inferLabReportScopeFromHistoryRow:()=> 'cardlab',getLabHistoryDateMs:()=>0,
 parseLocalDateInput:v=>new Date(v),getCardlabCurriculumLabel:()=> 'QA card',isCardlabProgressCompleted:()=>false,
 renderEmptyReport:blank,renderDetailReportPrintHeader:blank,renderDetailReportModeNotice:blank,renderGuardianShareChecklist:blank,
 renderDetailReportHero:blank,renderDetailDualTrendChartShell:blank,renderDetailInsightCard:blank,mountDetailTrendChart:(_key,value)=>{series=value;},
 buildStoredReportOpinion:()=>({overview:'',synthesis:'',guardianOverview:'',guidance:''}),normalizeDetailReportMode:()=> 'teacher',buildGuardianTrendNarrative:()=>({statusLabel:'QA',nextLabel:'check',synthesis:''}),formatDateTimeDisplay:()=> 'QA date'});
vm.runInContext([between('function getObservedReportNumber','function getObservedReportAverage'),between('function escapeHtml','function escapeInlineJsString'),between('function renderDetailTimelineCard','function getNumberTimedDrillDetails'),between('function formatReportSeconds','function renderSimpleHistoryReport'),between('function renderCardlabReport','function renderDetailReports'),...['getObservedReportAverage','formatObservedReportDuration','getObservedReportSeriesAggregate','getWeekStartDate','buildDetailDualTrendSeries'].map(extractor)].join('\n'),context);
function render(attempts){series=null;detail.cardlabAttempts=attempts.map((a,i)=>({completedAt:'2026-11-05T01:00:00Z',score:100,totalQuestions:3,correctCount:3,wrongCount:0,...a}));context.renderCardlabReport();assert(series);const bucket=series.month;const average=context.getObservedReportSeriesAggregate(bucket,'durationMinutes');return{average,label:context.formatObservedReportDuration(average),bucket};}
const checks=[];function test(name,fn){try{fn();checks.push({name,passed:true});}catch(e){if(process.argv.includes('--debug')&&checks.length===0)console.error(e.stack);checks.push({name,passed:false,reason:e.code==='ERR_ASSERTION'?'ASSERTION_FAILED':'EXECUTION_FAILED'});}}
test('actual renderer and trend preserve a 20-second average',()=>{const r=render([{duration_seconds:20}]);assert.equal(r.label,'20초');assert(Math.abs(r.average-20/60)<0.000001);});
test('observed zero remains 0 seconds instead of unavailable',()=>{const r=render([{duration_seconds:0}]);assert.equal(r.label,'0초');assert.equal(r.average,0);assert.equal(r.bucket[0].metricCounts.durationMinutes,1);});
test('canonical camel zero wins over conflicting legacy alias',()=>{assert.equal(render([{durationSeconds:0,duration_seconds:60}]).label,'0초');});
test('missing duration remains null and unavailable',()=>{const r=render([{}]);assert.equal(r.average,null);assert.equal(r.bucket[0].durationMinutes,null);assert.equal(r.bucket[0].metricCounts.durationMinutes,0);assert.equal(r.label,'미기록');});
test('missing durations do not lower the recorded average',()=>{const r=render([{duration_seconds:20},{}]);assert.equal(r.label,'20초');assert.equal(r.bucket[0].metricCounts.durationMinutes,1);assert.equal(r.bucket[0].count,2);});
test('60 seconds retains one minute units',()=>{assert.equal(render([{duration_seconds:60}]).label,'1분');});
test('mixed 20 and 60 second observations average to 40 seconds',()=>{assert.equal(render([{duration_seconds:20},{duration_seconds:60}]).label,'40초');});
test('zero and positive observations are both counted',()=>{const r=render([{duration_seconds:0},{duration_seconds:20},{}]);assert.equal(r.label,'10초');assert.equal(r.bucket[0].metricCounts.durationMinutes,2);});
test('weighted month aggregation excludes missing samples',()=>{const r=render([{duration_seconds:20},{duration_seconds:40},{duration_seconds:60,completedAt:'2026-12-05T01:00:00Z'},{completedAt:'2026-12-05T01:00:00Z'}]);assert.equal(r.label,'40초');assert.equal(r.bucket.length,2);});
test('null camel value can use observed legacy seconds',()=>{assert.equal(render([{durationSeconds:null,duration_seconds:20}]).label,'20초');});
for(const [label,value]of [['empty',''],['negative',-1],['invalid','bad'],['null',null],['boolean',false],['infinite',Infinity]])test('unobserved '+label+' duration is not a fabricated zero',()=>{const r=render([{duration_seconds:value}]);assert.equal(r.average,null);assert.equal(r.label,'미기록');});
const result={passed:checks.every(x=>x.passed),checks,sourceSha256:sha,productionRequests:0,scope:'Actual renderCardlabReport, period trend aggregator, weighted series aggregator and duration formatter; unrelated narrative/DOM rendering is stubbed. No scoring or clinical interpretation changes.'};console.log(JSON.stringify(result,null,2));if(process.argv.includes('--assert')&&!result.passed)process.exitCode=1;
