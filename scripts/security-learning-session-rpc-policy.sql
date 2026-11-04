-- New atomic learning-session endpoint. Apply only after guarded learning mutators.
-- Root owns rollback dry-run/application; no customer rows or business RPC smoke.
begin;
set local lock_timeout='10s';
set local statement_timeout='30s';
set local search_path=pg_catalog;
do $atomic_session_preflight$
begin
  if current_user <> 'postgres' then raise exception 'VERIFIED_POSTGRES_OWNER_REQUIRED'; end if;
  if to_regprocedure('pg_catalog.pg_input_is_valid(text,text)') is null or to_regprocedure('pg_catalog.sha256(bytea)') is null then raise exception 'POSTGRES_SAFE_JSON_AND_SHA256_REQUIRED'; end if;
  if to_regprocedure('public.security_learning_write_allowed()') is null or to_regprocedure('public.security_admin_active()') is null then raise exception 'STRICT_LEARNING_ADMIN_GATES_REQUIRED'; end if;
  if to_regnamespace('hahalab_security') is null or exists(select 1 from pg_namespace where nspname='hahalab_security' and pg_get_userbyid(nspowner)<>'postgres') then raise exception 'PRIVATE_OWNER_SCHEMA_REQUIRED'; end if;
  if has_schema_privilege('anon','hahalab_security','USAGE') or has_schema_privilege('authenticated','hahalab_security','USAGE') then raise exception 'PRIVATE_SCHEMA_EXPOSED'; end if;
  if to_regclass('hahalab_security.learning_session_receipts') is not null or to_regprocedure('public.record_learning_session(text,jsonb,jsonb)') is not null then raise exception 'ATOMIC_SESSION_OBJECT_EXISTS_REVIEW_REQUIRED'; end if;
  if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='histories' and column_name='id' and data_type='bigint' and is_identity='YES') then raise exception 'HISTORY_IDENTITY_REQUIRED'; end if;
  if (select jsonb_object_agg(column_name,data_type) from information_schema.columns where table_schema='public' and table_name='histories' and column_name in ('teacher_id','client_id','client_name','type','category','action','action_type','event_datetime','start_datetime','end_datetime','duration','duration_minutes','details','metadata','memo')) is distinct from '{"teacher_id": "text", "client_id": "text", "client_name": "text", "type": "text", "category": "text", "action": "text", "event_datetime": "text", "start_datetime": "text", "end_datetime": "text", "duration_minutes": "integer", "details": "text", "memo": "text", "action_type": "text", "duration": "interval", "metadata": "jsonb"}'::jsonb then raise exception 'HISTORY_INSERT_COLUMN_TYPES_CHANGED'; end if;
  if not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='record_cardlab_learning_attempt' and pg_get_userbyid(p.proowner)='postgres' and pg_get_functiondef(p.oid) like '%public.security_learning_write_allowed() is distinct from true%' and pg_get_functiondef(p.oid) like '%CLIENT_TEACHER_MISMATCH%') then raise exception 'GUARDED_ATTEMPT_RPC_REQUIRED'; end if;
end;
$atomic_session_preflight$;
create table hahalab_security.learning_session_receipts (
 teacher_id text not null,
 client_id text not null,
 session_id text not null,
 payload_sha256 text not null check(length(payload_sha256)=64),
 history_id bigint not null,
 committed_at timestamptz not null default now(),
 primary key(teacher_id,client_id,session_id)
);
create index learning_session_receipts_client_session on hahalab_security.learning_session_receipts(client_id,session_id);
alter table hahalab_security.learning_session_receipts enable row level security;
revoke all on hahalab_security.learning_session_receipts from public,anon,authenticated,service_role;

create function public.record_learning_session(p_session_id text,p_history jsonb,p_cardlab_attempt jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $atomic_session$
declare
 v_history public.histories;
 v_details jsonb;
 v_canonical jsonb;
 v_session text:=trim(coalesce(p_session_id,''));
 v_teacher text;
 v_client text;
 v_sha text;
 v_receipt hahalab_security.learning_session_receipts;
 v_history_id bigint;
 v_key text;
begin
 if public.security_learning_write_allowed() is distinct from true then raise exception 'LEARNING_WRITE_FORBIDDEN' using errcode='42501'; end if;
 if v_session='' or length(v_session)>512 then raise exception 'INVALID_SESSION_ID' using errcode='22023'; end if;
 if jsonb_typeof(p_history) is distinct from 'object' then raise exception 'INVALID_HISTORY_PAYLOAD' using errcode='22023'; end if;
 -- Never accept id/created_at, profile/billing fields or arbitrary table columns.
 if exists(select 1 from jsonb_object_keys(p_history) k where k not in ('teacher_id','client_id','client_name','type','category','action','action_type','event_datetime','start_datetime','end_datetime','duration','duration_minutes','details','metadata','memo')) then raise exception 'HISTORY_FIELD_NOT_ALLOWED' using errcode='22023'; end if;
 if jsonb_typeof(p_history->'details')='string' then
   v_details:=(p_history->>'details')::jsonb;
 else v_details:=p_history->'details'; end if;
 if jsonb_typeof(v_details) is distinct from 'object' then raise exception 'INVALID_SESSION_DETAILS' using errcode='22023'; end if;
 if v_details ? 'session_id' and v_details ? 'sessionId' and trim(v_details->>'session_id') is distinct from trim(v_details->>'sessionId') then raise exception 'SESSION_ID_MISMATCH' using errcode='22023'; end if;
 if coalesce(nullif(trim(v_details->>'session_id'),''),nullif(trim(v_details->>'sessionId'),'')) is distinct from v_session then raise exception 'SESSION_ID_MISMATCH' using errcode='22023'; end if;
 v_teacher:=trim(coalesce(p_history->>'teacher_id',''));
 v_client:=trim(coalesce(p_history->>'client_id',''));
 if v_teacher='' or v_client='' or v_client='local-client' then raise exception 'SESSION_OWNER_REQUIRED' using errcode='22023'; end if;
 -- A client transfer cannot race this session's owner check and insert.
 perform 1 from public.clients c where c.id::text=v_client and c.teacher_id::text=v_teacher for update;
 if not found then raise exception 'CLIENT_TEACHER_MISMATCH' using errcode='42501'; end if;
 if not exists(select 1 from public.teachers t where t.auth_user_id=auth.uid() and t.teacher_id=v_teacher) and public.security_admin_active() is distinct from true then raise exception 'CLIENT_OWNER_REQUIRED' using errcode='42501'; end if;
 if p_history->>'category' is distinct from 'session_history' or p_history->>'action' is distinct from '게임 완료' then raise exception 'LEARNING_COMPLETION_ONLY' using errcode='22023'; end if;
 if jsonb_typeof(p_history->'metadata') is distinct from 'object' then raise exception 'INVALID_HISTORY_METADATA' using errcode='22023'; end if;
 v_canonical:=jsonb_set(p_history,'{details}',v_details);
 -- JSONB canonical ordering makes differently ordered detail-object keys equal.
 v_sha:=encode(sha256(convert_to(jsonb_build_object('history',v_canonical,'attempt',p_cardlab_attempt)::text,'UTF8')),'hex');
 perform pg_advisory_xact_lock(hashtextextended(v_teacher||chr(31)||v_client||chr(31)||v_session,0));
 select * into v_receipt from hahalab_security.learning_session_receipts r where r.teacher_id=v_teacher and r.client_id=v_client and r.session_id=v_session;
 if found then
   if v_receipt.payload_sha256 is distinct from v_sha then raise exception 'SESSION_PAYLOAD_CONFLICT' using errcode='23505'; end if;
   if not exists(select 1 from public.histories h where h.id=v_receipt.history_id and h.teacher_id=v_teacher and h.client_id=v_client) then raise exception 'SESSION_RECEIPT_HISTORY_CONFLICT' using errcode='23505'; end if;
   return jsonb_build_object('status','already_committed','session_id',v_session,'history_id',v_receipt.history_id::text);
 end if;
 -- A transfer changes row ownership; its old receipt must never authorize a
 -- new actor to append the same client/session again, even if history was deleted.
 if exists(select 1 from hahalab_security.learning_session_receipts r where r.client_id=v_client and r.session_id=v_session and r.teacher_id<>v_teacher) then
   raise exception 'SESSION_OWNERSHIP_CHANGED_REQUIRES_REVIEW' using errcode='23505';
 end if;
 -- Old two-request writes may have a history with uncertain attempt completion.
 -- Hold for review: never infer success, append another attempt or repair silently.
 if exists(select 1 from public.histories h where h.teacher_id=v_teacher and h.client_id=v_client and (
   case when pg_input_is_valid(h.details,'jsonb') then h.details::jsonb else '{}'::jsonb end ->> 'session_id'=v_session
   or case when pg_input_is_valid(h.details,'jsonb') then h.details::jsonb else '{}'::jsonb end ->> 'sessionId'=v_session
 )) then raise exception 'LEGACY_SESSION_REQUIRES_REVIEW' using errcode='23505'; end if;
 v_history:=jsonb_populate_record(null::public.histories,jsonb_set(v_canonical,'{details}',to_jsonb(v_details::text)));
 if v_history.duration_minutes is null or v_history.duration_minutes<1 or nullif(v_history.event_datetime,'') is null or nullif(v_history.start_datetime,'') is null or nullif(v_history.end_datetime,'') is null then raise exception 'SESSION_TIMING_REQUIRED' using errcode='22023'; end if;
 if p_cardlab_attempt is not null then
   if jsonb_typeof(p_cardlab_attempt) is distinct from 'object' then raise exception 'INVALID_ATTEMPT_PAYLOAD' using errcode='22023'; end if;
   if exists(select 1 from jsonb_object_keys(p_cardlab_attempt) k where k not in ('client_id','teacher_id','curriculum_key','stage_key','stage_order','stage_title','completed_at','score','correct_count','wrong_count','total_questions','duration_seconds','cleared','wrong_words','wrong_asset_ids','question_snapshot','result_snapshot')) then raise exception 'ATTEMPT_FIELD_NOT_ALLOWED' using errcode='22023'; end if;
   if p_cardlab_attempt->>'teacher_id' is distinct from v_teacher or p_cardlab_attempt->>'client_id' is distinct from v_client then raise exception 'ATTEMPT_OWNER_MISMATCH' using errcode='42501'; end if;
   if nullif(trim(p_cardlab_attempt->>'curriculum_key'),'') is null or nullif(trim(p_cardlab_attempt->>'stage_key'),'') is null then raise exception 'ATTEMPT_STAGE_REQUIRED' using errcode='22023'; end if;
   foreach v_key in array array['stage_order','score','correct_count','wrong_count','total_questions','duration_seconds'] loop
     if jsonb_typeof(p_cardlab_attempt->v_key) is distinct from 'number' or (p_cardlab_attempt->>v_key)::integer<0 then raise exception 'INVALID_ATTEMPT_COUNT' using errcode='22023'; end if;
   end loop;
   if jsonb_typeof(p_cardlab_attempt->'cleared') is distinct from 'boolean' then raise exception 'INVALID_ATTEMPT_CLEAR_FLAG' using errcode='22023'; end if;
   foreach v_key in array array['wrong_words','wrong_asset_ids','question_snapshot','result_snapshot'] loop
     if jsonb_typeof(p_cardlab_attempt->v_key) is distinct from 'array' then raise exception 'INVALID_ATTEMPT_ARRAY' using errcode='22023'; end if;
   end loop;
   if exists(select 1 from jsonb_array_elements(p_cardlab_attempt->'wrong_words') e where jsonb_typeof(e)<>'string') or exists(select 1 from jsonb_array_elements(p_cardlab_attempt->'wrong_asset_ids') e where jsonb_typeof(e)<>'string') then raise exception 'INVALID_ATTEMPT_WORD_ASSET' using errcode='22023'; end if;
 end if;
 insert into public.histories(teacher_id,client_id,client_name,type,category,action,action_type,event_datetime,start_datetime,end_datetime,duration,duration_minutes,details,metadata,memo)
 values(v_teacher,v_client,v_history.client_name,v_history.type,v_history.category,v_history.action,v_history.action_type,v_history.event_datetime,v_history.start_datetime,v_history.end_datetime,v_history.duration,v_history.duration_minutes,v_history.details,v_history.metadata,v_history.memo)
 returning id into v_history_id;
 if p_cardlab_attempt is not null then
   -- Preserve existing progress/wrong-statistics aggregation in the same transaction.
   perform public.record_cardlab_learning_attempt(
     p_client_id=>v_client,p_teacher_id=>v_teacher,
     p_curriculum_key=>p_cardlab_attempt->>'curriculum_key',p_stage_key=>p_cardlab_attempt->>'stage_key',
     p_stage_order=>(p_cardlab_attempt->>'stage_order')::integer,p_stage_title=>p_cardlab_attempt->>'stage_title',
     p_total_questions=>(p_cardlab_attempt->>'total_questions')::integer,p_correct_count=>(p_cardlab_attempt->>'correct_count')::integer,
     p_wrong_count=>(p_cardlab_attempt->>'wrong_count')::integer,p_score=>(p_cardlab_attempt->>'score')::integer,
     p_cleared=>(p_cardlab_attempt->>'cleared')::boolean,p_duration_seconds=>(p_cardlab_attempt->>'duration_seconds')::integer,
     p_wrong_asset_ids=>array(select jsonb_array_elements_text(p_cardlab_attempt->'wrong_asset_ids')),
     p_wrong_words=>array(select jsonb_array_elements_text(p_cardlab_attempt->'wrong_words')),
     p_question_snapshot=>p_cardlab_attempt->'question_snapshot',p_result_snapshot=>p_cardlab_attempt->'result_snapshot');
 end if;
 insert into hahalab_security.learning_session_receipts(teacher_id,client_id,session_id,payload_sha256,history_id) values(v_teacher,v_client,v_session,v_sha,v_history_id);
 return jsonb_build_object('status','committed','session_id',v_session,'history_id',v_history_id::text);
end;
$atomic_session$;
revoke all on function public.record_learning_session(text,jsonb,jsonb) from public,anon,service_role;
grant execute on function public.record_learning_session(text,jsonb,jsonb) to authenticated;
commit;
