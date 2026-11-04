-- Additional exact-snapshot hardening candidate. Verified project only:
-- gxungzlecmibgvykoiib. Root owns application; this script is never auto-run.
-- Apply strict session, learning-write and privileged-RPC candidates first. Targets
-- do not overlap the nine definitions in security-privileged-rpc-policy.sql.
-- No customer rows, signup, destructive business RPC or transfer execution are
-- invoked. The independent priority-zero signup patch is in
-- security-signup-role-policy.sql. No signup trigger target is repeated here.
begin;
set local lock_timeout = '10s';
set local statement_timeout = '30s';
set local search_path = pg_catalog;

do $additional_rpc_hardening$
declare
  target record;
  function_oid oid;
  before_definition text;
  before_acl text;
  after_definition text;
  begin_marker text;
  entry_point integer;
  session_guard text := $guard$
    if public.security_session_active() is distinct from true then
        raise exception 'AUTH_SESSION_INACTIVE' using errcode = '42501';
    end if;
$guard$;
  admin_guard text := $guard$
    if public.is_admin_user() is distinct from true then
        raise exception 'ADMIN_ONLY' using errcode = '42501';
    end if;
    if (auth.jwt() ->> 'aal') is distinct from 'aal2' then
        raise exception 'MFA_REQUIRED' using errcode = '42501';
    end if;
$guard$;
  learning_owner_guard text := $guard$
    if public.security_learning_write_allowed() is distinct from true then
        raise exception 'LEARNING_WRITE_FORBIDDEN' using errcode = '42501';
    end if;
    if not exists (
      select 1 from public.clients c
      where c.id::text = trim(coalesce(p_client_id, ''))
        and c.teacher_id::text = trim(coalesce(p_teacher_id, ''))
    ) then
        raise exception 'CLIENT_TEACHER_MISMATCH' using errcode = '42501';
    end if;
    if not exists (
      select 1 from public.teachers t
      where t.auth_user_id = auth.uid()
        and t.teacher_id = trim(coalesce(p_teacher_id, ''))
    ) then
        if public.is_admin_user() is distinct from true or (auth.jwt() ->> 'aal') is distinct from 'aal2' then
            raise exception 'CLIENT_OWNER_REQUIRED' using errcode = '42501';
        end if;
    end if;
$guard$;
  snapshots jsonb := $snapshots$
[
 {"schema_name":"public","function_name":"admin_cancel_teacher_payment_order","identity_arguments":"p_order_id bigint, p_note text","expected_md5":"4750dd82cd330d2df13bfde2e2054719","expected_acl":"{postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}","mode":"admin"},
 {"schema_name":"public","function_name":"admin_record_teacher_payment","identity_arguments":"p_teacher_pk bigint, p_plan_code text, p_billing_cycle text, p_paid_at timestamp with time zone, p_note text, p_order_id bigint, p_payment_method text","expected_md5":"fd3b3768d3a072369a3c70fc2cf02332","expected_acl":"{postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}","mode":"admin"},
 {"schema_name":"public","function_name":"admin_reset_dataset","identity_arguments":"p_target text","expected_md5":"8053f3bc46085bf3ff50950f04eedbbe","expected_acl":"{=X/postgres,postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}","mode":"admin"},
 {"schema_name":"clinical","function_name":"require_teacher","identity_arguments":"p_write boolean","expected_md5":"56c7e90c4a4e28a6ef092b76a203f329","expected_acl":"{postgres=X/postgres}","mode":"clinical"},
 {"schema_name":"public","function_name":"check_teacher_exists","identity_arguments":"p_teacher_id text, p_email text, p_contact text","expected_md5":"6b1de9e4c6654051cf941a32b9a6bd1d","expected_acl":"{=X/postgres,postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}","mode":"revoke-unused-lookup"},
 {"schema_name":"public","function_name":"search_transfer_teachers","identity_arguments":"p_query text, p_limit integer","expected_md5":"22d2f62fe2235575d6988d5c0a593be3","expected_acl":"{postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}","mode":"session"},
 {"schema_name":"public","function_name":"record_cardlab_asset_usage","identity_arguments":"p_client_id text, p_teacher_id text, p_asset_id text, p_interaction text","expected_md5":"67566c9d8ff7402c936f391871c663db","expected_acl":"{postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}","mode":"learning-owner"},
 {"schema_name":"public","function_name":"record_cardlab_learning_attempt","identity_arguments":"p_client_id text, p_teacher_id text, p_curriculum_key text, p_stage_key text, p_stage_order integer, p_stage_title text, p_total_questions integer, p_correct_count integer, p_wrong_count integer, p_score integer, p_cleared boolean, p_duration_seconds integer, p_wrong_asset_ids text[], p_wrong_words text[], p_question_snapshot jsonb, p_result_snapshot jsonb","expected_md5":"7c3f8709edb9df6e7326adedf379ccb3","expected_acl":"{postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}","mode":"learning-owner"}
]
$snapshots$::jsonb;
begin
  if current_user <> 'postgres' then raise exception 'VERIFIED_POSTGRES_OWNER_REQUIRED'; end if;
  if to_regprocedure('public.security_session_active()') is null
     or to_regprocedure('public.security_learning_write_allowed()') is null then
    raise exception 'STRICT_ACCOUNT_AND_LEARNING_SESSION_RPCS_REQUIRED';
  end if;
  -- Validate every body, owner and ACL before replacing any function.
  for target in select * from jsonb_to_recordset(snapshots)
    as s(schema_name text, function_name text, identity_arguments text, expected_md5 text, expected_acl text, mode text)
  loop
    select p.oid, pg_get_functiondef(p.oid), p.proacl::text
      into function_oid, before_definition, before_acl
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = target.schema_name and p.proname = target.function_name
       and p.prokind = 'f' and pg_get_userbyid(p.proowner) = 'postgres'
       and pg_get_function_identity_arguments(p.oid) = target.identity_arguments;
    if function_oid is null or md5(before_definition) <> target.expected_md5
       or before_acl is distinct from target.expected_acl then
      raise exception 'ADDITIONAL_RPC_SNAPSHOT_MISMATCH: %.%(%)', target.schema_name, target.function_name, target.identity_arguments;
    end if;
  end loop;

  for target in select * from jsonb_to_recordset(snapshots)
    as s(schema_name text, function_name text, identity_arguments text, expected_md5 text, expected_acl text, mode text)
  loop
    select p.oid, pg_get_functiondef(p.oid), p.proacl::text
      into function_oid, before_definition, before_acl
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = target.schema_name and p.proname = target.function_name
       and pg_get_function_identity_arguments(p.oid) = target.identity_arguments;
    if md5(before_definition) <> target.expected_md5 or before_acl is distinct from target.expected_acl then
      raise exception 'ADDITIONAL_RPC_CHANGED_DURING_PATCH';
    end if;
    if target.mode = 'revoke-unused-lookup' then
      -- Current recovery uses the server mail/masked-ID Edge flow. Preserve the
      -- legacy definition for service-only callers while removing its PII oracle.
      execute format('revoke all on function %s from public, anon, authenticated', function_oid::regprocedure);
      execute format('grant execute on function %s to service_role', function_oid::regprocedure);
      if md5(pg_get_functiondef(function_oid)) <> target.expected_md5 then
        raise exception 'LOOKUP_BODY_MUST_REMAIN_UNCHANGED';
      end if;
      continue;
    end if;
      begin_marker := chr(10) || 'begin' || chr(10);
      entry_point := strpos(before_definition, begin_marker);
      if entry_point = 0 then
        begin_marker := chr(10) || 'BEGIN' || chr(10);
        entry_point := strpos(before_definition, begin_marker);
      end if;
      if entry_point = 0 then raise exception 'ADDITIONAL_RPC_ENTRY_NOT_FOUND'; end if;
      after_definition := overlay(before_definition placing begin_marker || session_guard ||
        case when target.mode = 'admin' then admin_guard when target.mode = 'learning-owner' then learning_owner_guard else '' end
        from entry_point for length(begin_marker));
      if target.function_name = 'search_transfer_teachers' then
        if strpos(after_definition, 'limit greatest(coalesce(p_limit, 8), 1);') = 0 then
          raise exception 'TRANSFER_SEARCH_LIMIT_SNAPSHOT_MISMATCH';
        end if;
        after_definition := replace(after_definition, 'limit greatest(coalesce(p_limit, 8), 1);',
          'limit least(25, greatest(coalesce(p_limit, 8), 1));');
      end if;
    if after_definition = before_definition then raise exception 'ADDITIONAL_RPC_PATCH_NOT_APPLIED'; end if;
    execute after_definition;
    if target.mode in ('admin', 'session', 'learning-owner') then
      execute format('revoke all on function %s from public, anon', function_oid::regprocedure);
      execute format('grant execute on function %s to authenticated', function_oid::regprocedure);
    elsif before_acl is distinct from (select p.proacl::text from pg_proc p where p.oid = function_oid) then
      raise exception 'TRIGGER_OR_CLINICAL_ACL_MUST_REMAIN_UNCHANGED';
    end if;
  end loop;
end;
$additional_rpc_hardening$;

-- Metadata only; no business or mutation RPC is called as a smoke test.
select n.nspname as schema_name, p.proname,
       pg_get_function_identity_arguments(p.oid) as identity_arguments,
       pg_get_userbyid(p.proowner) as owner,
       has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute,
       md5(pg_get_functiondef(p.oid)) as definition_md5
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where (n.nspname = 'public' and p.proname in ('admin_cancel_teacher_payment_order', 'admin_record_teacher_payment', 'admin_reset_dataset', 'check_teacher_exists', 'search_transfer_teachers', 'record_cardlab_asset_usage', 'record_cardlab_learning_attempt'))
   or (n.nspname = 'clinical' and p.proname = 'require_teacher')
order by schema_name, p.proname, identity_arguments;
commit;
