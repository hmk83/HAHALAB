// Local isolated PostgreSQL contract. Private reviewed definitions are read only
// from a caller-supplied local metadata fixture, never copied to test artifacts.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
const root=process.cwd();
const metadataPath=process.argv[2] || 'output/production-release/security-remediation-20261105/advisor-function-metadata-private.json';
const runtime=process.env.HAHALAB_PGLITE_RUNTIME || 'output/production-release/atomic-rpc-runtime/package/dist/index.js';
const {PGlite}=await import(pathToFileURL(path.resolve(runtime)).href);
const sections=JSON.parse(await fs.readFile(metadataPath,'utf8'));
const functions=sections.find(x=>x.section==='functions').data;
const sql=await fs.readFile('scripts/security-advisor-function-policy.sql','utf8');
const snapshots=JSON.parse(sql.match(/\$snapshots\$([\s\S]*?)\$snapshots\$::jsonb/)[1]);
const checks=[];let db;let expectedMetadata=[];
const check=(name,pass)=>{checks.push({name,pass:pass===true});if(!pass)throw new Error(name);};
const q=s=>'"'+s.replaceAll('"','""')+'"';
async function fixture(){
 const pg=new PGlite();
 await pg.exec(`create role anon;create role authenticated;create schema clinical;create schema auth;revoke create on schema public from public;set check_function_bodies=off;
 create function auth.uid() returns uuid language sql as 'select null::uuid';
 create function auth.jwt() returns jsonb language sql as 'select ''{}''::jsonb';
 create function public.security_auth_session_active() returns boolean language sql as 'select coalesce(current_setting(''test.active'',true),''false'')::boolean';
 create function public.security_session_active() returns boolean language sql as 'select public.security_auth_session_active()';`);
 const tables=new Map();
 for(const f of functions){
  for(const m of f.definition.matchAll(/(public\.\w+)%rowtype/gi))if(!tables.has(m[1]))tables.set(m[1],'id bigint');
  if(f.name==='get_my_teacher_payment_orders')tables.set('public.teacher_payment_orders',f.returnType.slice(6,-1));
  if(f.name==='teacher_list_my_billing_requests')tables.set('public.teacher_billing_requests',f.returnType.slice(6,-1)+',teacher_id text');
 }
 for(const [name,cols]of tables)await pg.exec(`create table ${name}(${cols})`);
 for(const f of functions)await pg.exec(f.definition);
 await pg.exec("create or replace function public.current_teacher_id() returns text language sql security definer as 'select null::text'");
 return pg;
}
const catalog=async pg=>(await pg.query(`select n.nspname as schema,p.proname as name,pg_get_function_identity_arguments(p.oid) as args,p.oid,p.prosrc,p.proacl::text as acl,p.proconfig,p.prosecdef,pg_get_userbyid(p.proowner) as owner,md5(pg_get_functiondef(p.oid)) as md5 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','clinical')`)).rows;
try{
 db=await fixture();
 const before=await catalog(db);
 for(const s of snapshots){const f=before.find(x=>x.schema===s.schema_name&&x.name===s.routine_name&&x.args===s.identity_arguments);check('fixture-exact-source:'+s.routine_name,f?.md5===s.definition_md5);}
 await db.exec(sql);
 const after=await catalog(db);
 expectedMetadata=snapshots.map(s=>{const f=after.find(x=>x.schema===s.schema_name&&x.name===s.routine_name&&x.args===s.identity_arguments);return {schema:s.schema_name,name:s.routine_name,args:s.identity_arguments,definitionMd5:f.md5,owner:f.owner,securityDefiner:f.prosecdef,config:f.proconfig};});
 for(const s of snapshots){
  const a=after.find(x=>x.schema===s.schema_name&&x.name===s.routine_name&&x.args===s.identity_arguments),b=before.find(x=>x.oid===a.oid);
  check('identity-acl-mode-preserved:'+s.routine_name,a.owner===b.owner&&a.acl===b.acl&&a.prosecdef===b.prosecdef);
  if(s.kind==='search-path-only')check('body-preserved-path-pinned:'+s.routine_name,a.prosrc===b.prosrc&&a.proconfig?.includes('search_path=pg_catalog, public, pg_temp'));
  else check('guard-added-original-retained:'+s.routine_name,a.prosrc.includes('public.'+s.helper+'()')&&(s.kind==='sql-guard'||a.prosrc.replace(/\n    if public\.\w+\(\) is distinct from true then\n        raise exception 'AUTH_SESSION_INACTIVE' using errcode = '42501';\n    end if;\n/,'')===b.prosrc));
 }
 const calls=[['increment_worksheet_download','null,null'],['request_teacher_payment_order','null,null,null'],['teacher_cancel_billing_request','null'],['teacher_create_billing_request','null,null,null'],['withdraw_teacher_account','null,null,false,false,false,false']];
 for(const [name,args]of calls){let denied=false;try{await db.query(`select public.${name}(${args})`);}catch(e){denied=e.code==='42501'&&e.message==='AUTH_SESSION_INACTIVE';}check('inactive-rejected-before-business-logic:'+name,denied);}
 await db.exec("create or replace function public.current_teacher_id() returns text language sql security definer as 'select ''fixture-own''::text'; insert into public.teacher_payment_orders(teacher_id) values ('fixture-own'),('fixture-foreign'); insert into public.teacher_billing_requests(teacher_id) values ('fixture-own'),('fixture-foreign');");
 for(const name of ['get_my_teacher_payment_orders','teacher_list_my_billing_requests']){
  await db.exec("set test.active='false'");
  check('inactive-list-empty:'+name,(await db.query(`select * from public.${name}()`)).rows.length===0);
  await db.exec("set test.active='true'");
  check('active-list-tenant-filter-preserved:'+name,(await db.query(`select * from public.${name}()`)).rows.length===1);
 }
 check('no-paid-plan-or-acl-mutations',!/(?:revoke\s|grant\s|alter\s+role|alter\s+table|drop\s+function)/i.test(sql.replace(/^--.*$/gm,'')));
 await db.close();db=await fixture();
 await db.exec(`alter function public.billing_cycle_months(text) set search_path to public`);
 let rejected=false;try{await db.exec(sql);}catch(e){rejected=e.message==='ADVISOR_ROUTINE_SNAPSHOT_CHANGED';await db.exec('rollback');}
 check('drift-rejected-before-first-target-change',rejected);
 const drift=await catalog(db);
 check('preflight-atomicity',drift.find(x=>x.schema==='clinical'&&x.name==='prevent_mutation').proconfig===null);
}catch(e){checks.push({name:'contract-completed',pass:false,errorCode:/^[A-Z0-9_:-]{1,100}$/i.test(e.message||'')?e.message:'LOCAL_FIXTURE_ERROR',sqlState:e.code||null});}
finally{await db?.close();}
const summary={pass:checks.every(x=>x.pass),checks:checks.length,passed:checks.filter(x=>x.pass).length,realRequests:0,productionOrdersCreated:0,expectedMetadata,sourceSha256:crypto.createHash('sha256').update(sql).digest('hex'),details:checks};
const out=path.join(root,'output/harness/security-advisor-function-policy-contract');await fs.mkdir(out,{recursive:true,mode:0o700});await fs.writeFile(path.join(out,'summary.json'),JSON.stringify(summary,null,2)+'\n',{mode:0o600});
console.log(JSON.stringify({...summary,expectedMetadata:undefined,details:summary.details.filter(x=>!x.pass)}));if(!summary.pass)process.exitCode=1;
