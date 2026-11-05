-- NEW isolated key broker. Root must review metadata, rollback-trial, then apply.
-- No existing key/schema is replaced; no rotation, cascade or automatic deletion.
-- Do not invoke the key RPC in a logged SQL console: its result is secret.
begin;
set local lock_timeout='2s';
set local statement_timeout='20s';
set local search_path=pg_catalog;
do $preflight$
begin
 if current_user<>'postgres' then raise exception 'QUEUE_CRYPTO_POSTGRES_REQUIRED'; end if;
 if exists(select 1 from pg_namespace where nspname='hahalab_queue_crypto')
 or exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='get_my_learning_queue_key') then
  raise exception 'QUEUE_CRYPTO_EXISTING_OBJECT_REVIEW_REQUIRED'; end if;
 if to_regprocedure('extensions.gen_random_bytes(integer)') is null
 or to_regprocedure('pg_catalog.gen_random_uuid()') is null then raise exception 'QUEUE_CRYPTO_VERIFIED_CSPRNG_REQUIRED'; end if;
 if not has_function_privilege('postgres','extensions.gen_random_bytes(integer)','EXECUTE') then raise exception 'QUEUE_CRYPTO_CSPRNG_EXECUTE_REQUIRED'; end if;
 if to_regprocedure('public.security_session_active()') is null
 or (select md5(pg_get_functiondef(to_regprocedure('public.security_session_active()'))))<>'8c8180f7b0f3b24b5c47a97a0c96b4f9' then raise exception 'QUEUE_CRYPTO_SESSION_HELPER_CHANGED'; end if;
 if has_schema_privilege('anon','public','CREATE') or has_schema_privilege('authenticated','public','CREATE') then raise exception 'QUEUE_CRYPTO_PUBLIC_CREATE_MUST_BE_RESTRICTED'; end if;
end;
$preflight$;
create schema hahalab_queue_crypto authorization postgres;
revoke all on schema hahalab_queue_crypto from public,anon,authenticated,service_role;
create table hahalab_queue_crypto.owner_keys (
 auth_user_id uuid not null,
 teacher_id text not null check (btrim(teacher_id)<>''),
 key_id uuid not null default pg_catalog.gen_random_uuid(),
 key_bytes bytea not null check (octet_length(key_bytes)=32),
 created_at timestamptz not null default pg_catalog.now(),
 primary key(auth_user_id,teacher_id),
 unique(key_id)
);
alter table hahalab_queue_crypto.owner_keys enable row level security;
revoke all on table hahalab_queue_crypto.owner_keys from public,anon,authenticated,service_role;
create function hahalab_queue_crypto.get_current_owner_key()
returns jsonb language plpgsql security definer set search_path=''
as $function$
declare
 v_uid uuid;
 v_teacher text;
 v_mapping_count bigint;
 v_eligible_count bigint;
 v_key_id uuid;
 v_key_bytes bytea;
begin
 if public.security_session_active() is distinct from true then
  raise exception 'QUEUE_CRYPTO_SESSION_INACTIVE' using errcode='42501';
 end if;
 v_uid:=auth.uid();
 if v_uid is null then raise exception 'QUEUE_CRYPTO_OWNER_REQUIRED' using errcode='42501'; end if;
 -- Count ALL links for this UID, so a second inactive link is not ignored.
 select count(*),count(*) filter(where lower(coalesce(t.status,'')) in ('normal','active')
   and t.withdrawn_at is null and nullif(btrim(t.teacher_id),'') is not null),min(t.teacher_id)
 into v_mapping_count,v_eligible_count,v_teacher
 from public.teachers t where t.auth_user_id=v_uid;
 if v_mapping_count<>1 or v_eligible_count<>1 or v_teacher is null then
  raise exception 'QUEUE_CRYPTO_OWNER_MAPPING_INVALID' using errcode='42501';
 end if;
 -- The ONLY insert address is derived above; no caller-supplied owner arguments.
 -- Concurrent first requests converge on the PK winner. Existing bytes never change.
 insert into hahalab_queue_crypto.owner_keys(auth_user_id,teacher_id,key_bytes)
 values(v_uid,v_teacher,extensions.gen_random_bytes(32))
 on conflict(auth_user_id,teacher_id) do nothing;
 select k.key_id,k.key_bytes into v_key_id,v_key_bytes
 from hahalab_queue_crypto.owner_keys k where k.auth_user_id=v_uid and k.teacher_id=v_teacher;
 if v_key_id is null or octet_length(v_key_bytes)<>32 then
  raise exception 'QUEUE_CRYPTO_KEY_INTEGRITY_INVALID' using errcode='42501';
 end if;
 return jsonb_build_object('version',1,'algorithm','xchacha20poly1305','key_id',v_key_id,
  'auth_user_id',v_uid,'teacher_id',v_teacher,'key_hex',encode(v_key_bytes,'hex'));
end;
$function$;
revoke all on function hahalab_queue_crypto.get_current_owner_key() from public,anon,authenticated,service_role;
grant usage on schema hahalab_queue_crypto to authenticated;
grant execute on function hahalab_queue_crypto.get_current_owner_key() to authenticated;
create function public.get_my_learning_queue_key()
returns jsonb language sql security invoker set search_path=''
as $function$ select hahalab_queue_crypto.get_current_owner_key(); $function$;
revoke all on function public.get_my_learning_queue_key() from public,anon,authenticated,service_role;
grant execute on function public.get_my_learning_queue_key() to authenticated;
-- Metadata booleans only. Never select key bytes, key IDs, owner IDs or RPC output.
select 'queue_crypto_minimal_permissions' as check_name,
 not has_table_privilege('authenticated','hahalab_queue_crypto.owner_keys','SELECT,INSERT,UPDATE,DELETE') as authenticated_table_denied,
 not has_schema_privilege('anon','hahalab_queue_crypto','USAGE') as anonymous_schema_denied,
 not has_schema_privilege('service_role','hahalab_queue_crypto','USAGE') as service_role_schema_denied,
 not has_table_privilege('service_role','hahalab_queue_crypto.owner_keys','SELECT,INSERT,UPDATE,DELETE') as service_role_table_denied,
 not has_function_privilege('service_role','public.get_my_learning_queue_key()','EXECUTE') as service_role_facade_denied,
 not has_function_privilege('service_role','hahalab_queue_crypto.get_current_owner_key()','EXECUTE') as service_role_private_helper_denied,
 not has_function_privilege('anon','public.get_my_learning_queue_key()','EXECUTE') as anonymous_facade_denied,
 (select relrowsecurity from pg_class where oid='hahalab_queue_crypto.owner_keys'::regclass) as rls_enabled;
commit;
