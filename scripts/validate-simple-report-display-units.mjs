import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
const file=process.argv.find(v=>v.startsWith('--source='))?.slice(9)||'js/app.js',appSource=fs.readFileSync(file,'utf8');
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

const extract=extractFunction;
const blank=()=>'',container={innerHTML:''};let series;
const context=vm.createContext({Date,Map,console,document:{getElementById:()=>container},currentDetailReportMode:'teacher',DETAIL_REPORT_LIMIT:200,LAB_REPORT_SCOPE_NUMBERLAB:'numberlab',
 normalizeLabHistoryRow:r=>r,inferLabReportScopeFromHistoryRow:r=>r.details?.report_scope||'numberlab',parseLocalDateInput:v=>new Date(v),renderEmptyReport:blank,renderDetailReportPrintHeader:blank,renderDetailReportModeNotice:blank,renderGuardianShareChecklist:blank,renderDetailDualTrendChartShell:blank,renderDetailInsightCard:blank,mountDetailTrendChart:(_key,s)=>{series=s;},
 normalizeDetailReportMode:v=>v,buildGuardianHistoryNarrative:()=>({summary:'QA',synthesis:'QA',statusLabel:'QA',nextLabel:'QA'}),buildStoredReportOpinion:()=>({overview:'QA',synthesis:'QA',guidance:'QA'}),
 getNumberTimedDrillDetails:()=>null,renderNumberTimedDrillReportCard:blank,getLabReportRowTitle:()=> 'QA learning',getLabReportRowSubtitle:()=> 'QA source',getLabHistoryGuardianSummary:()=> 'QA guardian',getLabHistoryClinicalSummary:()=> 'QA teacher'});
const names=['parseMaybeJson','escapeHtml','getObservedReportNumber','readObservedReportNumber','getObservedReportAverage','formatObservedReportMetric','getReportDurationObservation','formatObservedReportDuration','getHistoryScore','getHistoryDurationMinutes','getHistoryAccuracyScore','getObservedReportSeriesAggregate','getWeekStartDate','buildDetailDualTrendSeries','formatDateTimeDisplay','renderDetailReportStatGrid','renderDetailReportHero','renderDetailTimelineCard','renderSimpleHistoryReport'];
const endings={escapeHtml:'escapeInlineJsString',formatDateTimeDisplay:'stripHtmlTags',renderDetailReportStatGrid:'renderDetailReportHero',renderDetailReportHero:'renderDetailInsightCard',renderDetailTimelineCard:'getNumberTimedDrillDetails',renderSimpleHistoryReport:'renderCardlabReport'};
const pieces=names.map(name=>{if(!endings[name])return extract(name);const a=appSource.indexOf('function '+name+'('),b=appSource.indexOf('function '+endings[name]+'(',a+1);assert(a>=0&&b>a);return appSource.slice(a,b);});
for(let i=0;i<pieces.length;i++){try{new vm.Script(pieces[i]);}catch(e){throw Error('Invalid extraction: '+names[i]+' '+e.message);}}
vm.runInContext(pieces.join('\n'),context);
function render(detailsList,{scope='numberlab',mode='teacher'}={}){series=null;context.currentDetailReportMode=mode;const rows=detailsList.map((details,i)=>({id:'qa-'+i,eventDatetime:'2026-11-05T07:00:00Z',details:{report_scope:scope,...details}}));context.renderSimpleHistoryReport('qa',rows,{scope,scopeLabel:'QA lab'});const html=container.innerHTML;const hero=html.match(/<p class="detail-report-stat-label">평균 시간<\/p>\s*<p class="detail-report-stat-value">([^<]*)<\/p>/)?.[1];const tableRows=[...html.matchAll(/<div class="detail-playlab-log-row is-report (?:is-guardian)?">([\s\S]*?)<\/div>/g)].map(m=>[...m[1].matchAll(/<span>([\s\S]*?)<\/span>/g)].map(c=>c[1].trim()));const aggregate=series?context.getObservedReportSeriesAggregate(series.month,'durationMinutes'):null;const scoreHero=html.match(/<p class="detail-report-stat-label">평균 점수<\/p>\s*<p class="detail-report-stat-value">([^<]*)<\/p>/)?.[1];return{html,hero,scoreHero,tableRows,series,chartLabel:series?context.formatObservedReportDuration(aggregate,series.month.some(x=>x.durationApproximate)):null};}
const checks=[];function test(name,fn){try{fn();checks.push({name,passed:true});}catch(e){if(process.argv.includes('--debug')&&checks.length===0)console.error(e.stack);checks.push({name,passed:false,reason:e.code==='ERR_ASSERTION'?'ASSERTION_FAILED':'EXECUTION_FAILED'});}}
test('actual generic report hero/table/chart agree on 32 seconds',()=>{const r=render([{duration_seconds:32,correct_count:6,total_questions:6}]);assert.equal(r.hero,'32초');assert.equal(r.tableRows[0][4],'32초');assert.equal(r.chartLabel,'32초');});
test('actual fractional source 31.79 seconds is not rounded to one minute',()=>{const r=render([{duration_seconds:31.791}]);assert.equal(r.hero,'31.79초');assert.equal(r.tableRows[0][4],'31.79초');assert.equal(r.chartLabel,'31.79초');});
test('explicit zero duration remains 0 seconds everywhere',()=>{const r=render([{duration_seconds:0}]);assert.equal(r.hero,'0초');assert.equal(r.tableRows[0][4],'0초');assert.equal(r.chartLabel,'0초');});
test('missing duration remains unavailable everywhere',()=>{const r=render([{}]);assert.equal(r.hero,'미기록');assert.equal(r.tableRows[0][4],'미기록');assert.equal(r.chartLabel,'미기록');assert.equal(r.series.month[0].metricCounts.durationMinutes,0);});
test('missing sample is excluded from average denominator',()=>{const r=render([{duration_seconds:32},{}]);assert.equal(r.hero,'32초');assert.equal(r.chartLabel,'32초');});
test('recorded zero and positive sample both contribute',()=>{const r=render([{duration_seconds:0},{duration_seconds:32},{}]);assert.equal(r.hero,'16초');assert.equal(r.chartLabel,'16초');});
test('mixed 20 and 60 second samples average 40 seconds',()=>{const r=render([{duration_seconds:20},{duration_seconds:60}]);assert.equal(r.hero,'40초');assert.equal(r.chartLabel,'40초');assert.equal(r.tableRows[1][4],'1분');});
test('elapsed milliseconds keep precedence including zero',()=>{const r=render([{elapsed_ms:0,duration_seconds:32}]);assert.equal(r.hero,'0초');assert.equal(r.tableRows[0][4],'0초');});
test('legacy minute observations retain approximate provenance in hero/table/chart',()=>{const r=render([{duration_minutes:1}]);assert.equal(r.hero,'약 1분 · 분단위 기록');assert.equal(r.tableRows[0][4],'약 1분 · 분단위 기록');assert.equal(r.chartLabel,'약 1분 · 분단위 기록');});
test('precise stored minutes are not marked approximate',()=>{const r=render([{duration_minutes:1,duration_precision:'reported-elapsed'}]);assert.equal(r.hero,'1분');assert.equal(r.tableRows[0][4],'1분');});
test('100 percent accuracy uses percent rather than score points',()=>{assert.equal(render([{correct_count:6,total_questions:6}]).tableRows[0][3],'100%');});
test('zero percent accuracy remains observed rather than missing',()=>{assert.equal(render([{correct_count:0,total_questions:6}]).tableRows[0][3],'0%');});
test('missing accuracy remains unavailable',()=>{assert.equal(render([{}]).tableRows[0][3],'미기록');});
test('explicit unavailable accuracy cannot derive a fabricated percent',()=>{assert.equal(render([{accuracy_source:'unavailable',correct_count:6,total_questions:6}]).tableRows[0][3],'미기록');});
test('explicit fractional accuracy retains percent unit',()=>{assert.equal(render([{accuracy_rate:12.5}]).tableRows[0][3],'12.5%');});
for(const scope of ['numberlab','playlab','musicartlab'])test('shared '+scope+' display uses the same precise time units',()=>{const r=render([{duration_seconds:32,correct_count:6,total_questions:6}],{scope});assert.equal(r.hero,'32초');assert.equal(r.tableRows[0][3],'100%');assert.equal(r.tableRows[0][4],'32초');});
test('guardian view still excludes expert numeric time/accuracy columns',()=>{const r=render([{duration_seconds:32,correct_count:6,total_questions:6}],{mode:'guardian'});assert.equal(r.hero,undefined);assert.equal(r.series,null);assert(!r.html.includes('32초'));assert(!r.html.includes('100%'));});
test('observed zero score and 100 with missing score average to 50 points',()=>{const r=render([{score:0},{score:100},{}]);assert.equal(r.scoreHero,'50점');assert.equal(context.getObservedReportSeriesAggregate(r.series.month,'primary'),50);assert.equal(r.tableRows[0][2],'0점');assert.equal(r.tableRows[1][2],'100점');assert.equal(r.tableRows[2][2],'미기록');});
test('all zero scores remain zero in average row and latest badge',()=>{const r=render([{score:0,correct_count:0,total_questions:6}]);assert.equal(r.scoreHero,'0점');assert.equal(r.tableRows[0][2],'0점');assert.equal(r.tableRows[0][3],'0%');assert(r.html.includes('통합 0점'));});
test('missing scores are not fabricated zeros',()=>{const r=render([{}]);assert.equal(r.scoreHero,'미기록');assert.equal(r.tableRows[0][2],'미기록');});
for(const [label,score]of [['negative',-1],['invalid','bad'],['null',null],['empty',''],['boolean',false],['infinite',Infinity]])test('unobserved '+label+' score does not change recorded mean',()=>{const r=render([{score},{score:100}]);assert.equal(r.scoreHero,'100점');assert.equal(r.tableRows[0][2],'미기록');});
const result={passed:checks.every(c=>c.passed),checks,sourceSha256:createHash('sha256').update(appSource).digest('hex'),productionRequests:0,scope:'Actual generic report, hero, table, observation helpers, duration/accuracy formatters and trend aggregation; unrelated narrative/timed-drill/DOM plumbing stubbed. Observed zero scores participate in averages; no score generation or clinical criteria changes.'};console.log(JSON.stringify(result,null,2));if(process.argv.includes('--assert')&&!result.passed)process.exitCode=1;
