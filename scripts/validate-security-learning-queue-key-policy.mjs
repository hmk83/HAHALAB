// Isolated Postgres security contracts; no external requests or operating keys.
// RNG/session-store adapters are fixtures. Production uses verified pgcrypto.
import fs from 'node:fs/promises';import path from 'node:path';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';
const {PGlite}=await import(pathToFileURL(path.resolve('output/production-release/atomic-rpc-runtime/package/dist/index.js')).href);
const sql=await fs.readFile('scripts/security-learning-queue-key-policy.sql','utf8');
const metadata=JSON.parse(await fs.readFile('output/production-release/security-remediation-20261104/live-metadata.json','utf8'));
const sessionDefinition=metadata.find(x=>x.section==='functions').data.find(x=>x.proname==='security_session_active').definition;
let expectedMetadata=[];const checks=[];const check=(name,pass)=>{checks.push({name,passed:pass===true});if(!pass)throw Error(name);};const db=new PGlite();
const a='10000000-0000-4000-8000-000000000001',b='10000000-0000-4000-8000-000000000002';
async function actor(uid,active=true,role='authenticated'){await db.exec(`reset role;select set_config('test.uid','${uid}',false),set_config('test.active','${active}',false);set role ${role};`);}
async function denied(name,statement){let denied=false;try{await db.query(statement);}catch(e){denied=e.code==='42501';}check(name,denied);}
try{
 await db.exec(`create role anon;create role authenticated;create role service_role;
 alter default privileges grant execute on functions to service_role;
 alter default privileges grant all on tables to service_role;create schema auth;create schema extensions;revoke create on schema public from public;
 create table public.teachers(id bigint generated always as identity,auth_user_id uuid,teacher_id text,status text,withdrawn_at timestamptz);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('test.uid',true),'')::uuid$$;
 create function public.security_auth_session_active() returns boolean language sql stable security definer as $$select coalesce(current_setting('test.active',true),'false')::boolean$$;
 create function extensions.gen_random_bytes(integer) returns bytea language sql volatile as $$select decode(md5(random()::text)||md5(random()::text),'hex')$$;
 insert into public.teachers(auth_user_id,teacher_id,status) values('${a}','fixture-A','normal'),('${b}','fixture-B','active');`);
 await db.exec(sessionDefinition);
 await db.exec(sql);
 expectedMetadata=(await db.query("select n.nspname as schema,p.proname as name,md5(pg_get_functiondef(p.oid)) as definition_md5,p.prosecdef as security_definer,p.proconfig as config,p.proacl::text as acl from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='hahalab_queue_crypto' or n.nspname='public' and p.proname='get_my_learning_queue_key' order by n.nspname,p.proname")).rows;
 check('public-facade-invoker',(await db.query("select not prosecdef as pass from pg_proc where oid='public.get_my_learning_queue_key()'::regprocedure")).rows[0].pass);
 check('private-helper-definer-empty-path',(await db.query("select prosecdef and proconfig @> array['search_path=\"\"'] as pass from pg_proc where oid='hahalab_queue_crypto.get_current_owner_key()'::regprocedure")).rows[0].pass);
 await actor(a);const first=(await db.query('select public.get_my_learning_queue_key() as result')).rows[0].result;
 check('response-shape-and-key-length',first.version===1&&first.algorithm==='xchacha20poly1305'&&first.auth_user_id===a&&first.teacher_id==='fixture-A'&&/^[a-f0-9]{64}$/.test(first.key_hex)&&/^[a-f0-9-]{36}$/.test(first.key_id)&&Object.keys(first).sort().join(',')==='algorithm,auth_user_id,key_hex,key_id,teacher_id,version');
 const second=(await db.query('select public.get_my_learning_queue_key() as result')).rows[0].result;
 check('stable-key-repeat',JSON.stringify(first)===JSON.stringify(second));
 await denied('authenticated-cannot-select-key-table','select key_bytes from hahalab_queue_crypto.owner_keys');
 await denied('authenticated-cannot-insert-key-table',`insert into hahalab_queue_crypto.owner_keys(auth_user_id,teacher_id,key_bytes) values('${b}','fixture-B',decode(repeat('00',32),'hex'))`);
 await denied('authenticated-cannot-update-key-table',`update hahalab_queue_crypto.owner_keys set teacher_id='spoof'`);
 await denied('authenticated-cannot-delete-key-table','delete from hahalab_queue_crypto.owner_keys');
 await actor(a,false);await denied('revoked-cannot-fetch-key','select public.get_my_learning_queue_key()');
 await actor(a,true);const relogin=(await db.query('select public.get_my_learning_queue_key() as result')).rows[0].result;check('stable-key-relogin',first.key_id===relogin.key_id&&first.key_hex===relogin.key_hex);
 await actor(b);const other=(await db.query('select public.get_my_learning_queue_key() as result')).rows[0].result;check('late-user-B-never-gets-A-key',other.auth_user_id===b&&other.teacher_id==='fixture-B'&&other.key_id!==first.key_id&&other.key_hex!==first.key_hex);
 let noArgsOnly=false;try{await db.query(`select public.get_my_learning_queue_key('${a}')`);}catch(e){noArgsOnly=e.code==='42883';}check('caller-cannot-supply-foreign-owner',noArgsOnly);
 await actor(a,true,'service_role');await denied('default-granted-service-role-facade-revoked','select public.get_my_learning_queue_key()');await denied('service-role-private-helper-revoked','select hahalab_queue_crypto.get_current_owner_key()');await denied('service-role-key-table-revoked','select key_bytes from hahalab_queue_crypto.owner_keys');
 await db.exec('reset role');check('preexisting-helper-service-role-grant-unchanged',(await db.query("select has_function_privilege('service_role','public.security_session_active()','EXECUTE') as pass")).rows[0].pass);
 check('new-service-role-rights-all-restricted',(await db.query("select not has_schema_privilege('service_role','hahalab_queue_crypto','USAGE') and not has_function_privilege('service_role','public.get_my_learning_queue_key()','EXECUTE') and not has_function_privilege('service_role','hahalab_queue_crypto.get_current_owner_key()','EXECUTE') and not has_table_privilege('service_role','hahalab_queue_crypto.owner_keys','SELECT,INSERT,UPDATE,DELETE') as pass")).rows[0].pass);
 await actor('',true,'anon');await denied('anonymous-facade-execute-denied','select public.get_my_learning_queue_key()');await denied('anonymous-private-schema-denied','select hahalab_queue_crypto.get_current_owner_key()');
 await actor('',true);await denied('missing-auth-uid-denied','select public.get_my_learning_queue_key()');
 await actor(a);await db.exec('reset role');await db.exec(`update public.teachers set status='pending' where auth_user_id='${a}'`);await db.exec('set role authenticated');await denied('pending-cannot-get-key-even-session-helper-allows-pending','select public.get_my_learning_queue_key()');
 await db.exec('reset role');await db.exec(`update public.teachers set status='normal',withdrawn_at=now() where auth_user_id='${a}'`);await db.exec('set role authenticated');await denied('withdrawn-owner-denied','select public.get_my_learning_queue_key()');
 await db.exec('reset role');await db.exec(`update public.teachers set withdrawn_at=null where auth_user_id='${a}';insert into public.teachers(auth_user_id,teacher_id,status)values('${a}','fixture-duplicate','terminated')`);await db.exec('set role authenticated');await denied('duplicate-mapping-including-inactive-denied','select public.get_my_learning_queue_key()');
 await db.exec('reset role');await db.exec(`delete from public.teachers where teacher_id='fixture-duplicate';delete from public.teachers where auth_user_id='${a}'`);await db.exec('set role authenticated');await denied('missing-owner-mapping-denied','select public.get_my_learning_queue_key()');
 await db.exec('reset role');check('mapping-deletion-does-not-cascade-key',(await db.query(`select count(*)::integer as n from hahalab_queue_crypto.owner_keys where auth_user_id='${a}'`)).rows[0].n===1);
 await db.exec(`insert into public.teachers(auth_user_id,teacher_id,status)values('${a}','fixture-A','normal')`);await db.exec('set role authenticated');const restored=(await db.query('select public.get_my_learning_queue_key() as result')).rows[0].result;check('mapping-restore-same-key-no-rotation',restored.key_id===first.key_id&&restored.key_hex===first.key_hex);
 await db.exec('reset role');check('key-table-no-cascade-or-direct-policy',(await db.query("select not exists(select 1 from pg_constraint where conrelid='hahalab_queue_crypto.owner_keys'::regclass and contype='f') and not exists(select 1 from pg_policy where polrelid='hahalab_queue_crypto.owner_keys'::regclass) as pass")).rows[0].pass);
 check('exact-owner-key-count-no-unauthorized-inserts',(await db.query('select count(*)::integer as n from hahalab_queue_crypto.owner_keys')).rows[0].n===2);
 let duplicateInstallDenied=false;try{await db.exec(sql);}catch(e){duplicateInstallDenied=e.message==='QUEUE_CRYPTO_EXISTING_OBJECT_REVIEW_REQUIRED';await db.exec('rollback');}check('existing-schema-install-aborts-without-overwrite',duplicateInstallDenied);
 check('no-existing-security-schema-mutation',!sql.includes('hahalab_security'));

}catch(e){checks.push({name:'contract-error',passed:false,sqlState:e.code||null,errorCode:/^[A-Z0-9_:-]{1,100}$/i.test(e.message||'')?e.message:'LOCAL_FIXTURE_ERROR'});}
finally{await db.close();}
const summary={passed:checks.every(x=>x.passed),checks:checks.length,passedChecks:checks.filter(x=>x.passed).length,realRequests:0,operatingKeysRead:0,expectedMetadata,sourceSha256:createHash('sha256').update(sql).digest('hex'),details:checks};
const out='output/harness/security-learning-queue-key-policy-contract';await fs.mkdir(out,{recursive:true,mode:0o700});await fs.writeFile(out+'/summary.json',JSON.stringify(summary,null,2)+'\n',{mode:0o600});console.log(JSON.stringify({...summary,expectedMetadata:undefined,details:summary.details.filter(x=>!x.passed)}));if(!summary.passed)process.exitCode=1;
