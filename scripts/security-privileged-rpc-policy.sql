-- HAHA LAB exact-snapshot privileged RPC hardening candidate (9 existing RPCs).
-- Target: gxungzlecmibgvykoiib. Root reviews/applies; this file is not auto-run.
-- Run scripts/security-session-policy.sql first (strict auth-only bootstrap plus
-- account/session gate and restrictive tenant RLS). Actual DB backups are under
-- Then run scripts/security-learning-write-policy.sql (normal/active writes).
-- output/production-release/rpc-backup. Any snapshot drift aborts all changes.
-- Existing self-service/no-module instant checkout is intentionally preserved.
-- The old payment business body moves to an owner-only non-public schema; the
-- public payment signature/OID/defaults remain but require admin AAL2. Checkout
-- calls the private business body, preserving its existing own-account checks.
-- This is NOT the complete 41-function audit; other privileged APIs need review.

begin;
set local lock_timeout = '10s';
set local statement_timeout = '30s';
-- Keep public return types visible exactly as in the captured pg_get_functiondef
-- snapshot, while resolving built-in catalog functions before application names.
set local search_path = pg_catalog, public;

do $hahalab_rpc_hardening$
declare
  target record;
  function_oid oid;
  before_definition text;
  after_definition text;
  payment_definition text;
  private_definition text;
  payment_oid oid;
  entry_point integer;
  entry_guard text;
  session_guard text := $session_guard$
    -- SECURITY DEFINER owner bypass must still require a live account session.
    if public.security_session_active() is distinct from true then
        raise exception 'AUTH_SESSION_INACTIVE' using errcode = '42501';
    end if;
$session_guard$;
  bootstrap_guard text := $bootstrap_guard$
    -- Validates auth.sessions before linking an existing teacher profile.
    if public.security_auth_session_active() is distinct from true then
        raise exception 'AUTH_SESSION_INACTIVE' using errcode = '42501';
    end if;
$bootstrap_guard$;
  learning_write_guard text := $learning_write_guard$
    if public.security_learning_write_allowed() is distinct from true then
        raise exception 'AUTH_SESSION_INACTIVE' using errcode = '42501';
    end if;
$learning_write_guard$;
  admin_guard text := $admin_guard$
    if public.is_admin_user() is distinct from true then
        raise exception 'ADMIN_ONLY' using errcode = '42501';
    end if;
    if (auth.jwt() ->> 'aal') is distinct from 'aal2' then
        raise exception 'MFA_REQUIRED' using errcode = '42501';
    end if;
$admin_guard$;
  account_guard text := $account_guard$
    if public.security_session_active() is distinct from true then
        raise exception 'AUTH_ACCOUNT_INACTIVE' using errcode = '42501';
    end if;
$account_guard$;
  payment_return text := $payment_return$
    return hahalab_security.record_teacher_subscription_payment_internal(
      p_teacher_id => p_teacher_id,
      p_plan_code => p_plan_code,
      p_billing_cycle => p_billing_cycle,
      p_paid_at => p_paid_at,
      p_amount_krw => p_amount_krw,
      p_note => p_note,
      p_payment_request_id => p_payment_request_id,
      p_payment_source => p_payment_source
    );
end;
$payment_return$;
  checkout_context_start text := $checkout_context_start$
    -- Own checkout is available without global administrator privileges/MFA.
    -- Do not let the narrow billing trigger context target another teacher.
    if v_teacher.auth_user_id is distinct from auth.uid()
       or v_teacher.teacher_id is distinct from v_teacher_id then
        raise exception 'CHECKOUT_OWNER_REQUIRED' using errcode = '42501';
    end if;
    v_previous_billing_context := current_setting('hahalab.allow_teacher_billing_update', true);
    perform set_config('hahalab.allow_teacher_billing_update', '1', true);
    begin
$checkout_context_start$;
  checkout_context_end text := $checkout_context_end$
    exception when others then
        perform set_config('hahalab.allow_teacher_billing_update', coalesce(v_previous_billing_context, ''), true);
        raise;
    end;
    perform set_config('hahalab.allow_teacher_billing_update', coalesce(v_previous_billing_context, ''), true);
$checkout_context_end$;
  binding_context_start text := $binding_context_start$
    v_previous_binding_context := current_setting('hahalab.allow_teacher_binding', true);
    perform set_config('hahalab.allow_teacher_binding', '1', true);
    begin
$binding_context_start$;
  binding_context_end text := $binding_context_end$
    exception when others then
        perform set_config('hahalab.allow_teacher_binding', coalesce(v_previous_binding_context, ''), true);
        raise;
    end;
    perform set_config('hahalab.allow_teacher_binding', coalesce(v_previous_binding_context, ''), true);
$binding_context_end$;
  snapshots jsonb := $snapshots$
[
  {
    "function_name": "admin_manage_teacher_subscription",
    "identity_arguments": "p_teacher_id text, p_action text, p_plan_code text, p_paid_at timestamp with time zone, p_note text",
    "expected_md5": "d1a21967a76156ac3a47594978b1b6e7",
    "guard_mode": "admin"
  },
  {
    "function_name": "admin_manage_teacher_subscription",
    "identity_arguments": "p_teacher_pk bigint, p_action text, p_target_plan_code text, p_paid_at timestamp with time zone, p_note text, p_actor_label text",
    "expected_md5": "47afdc6634f10357dd9569392d8507de",
    "guard_mode": "admin"
  },
  {
    "function_name": "admin_process_teacher_billing_request",
    "identity_arguments": "p_request_id bigint, p_decision text, p_amount_krw integer, p_note text",
    "expected_md5": "a0cc06127ebe59fd7732b5089169b779",
    "guard_mode": "admin"
  },
  {
    "function_name": "admin_record_teacher_subscription_payment",
    "identity_arguments": "p_teacher_id text, p_plan_code text, p_billing_cycle text, p_paid_at timestamp with time zone, p_amount_krw integer, p_note text, p_payment_request_id bigint, p_payment_source text",
    "expected_md5": "3eb74b599470aa5a3049674f10acddb8",
    "guard_mode": "payment-wrapper"
  },
  {
    "function_name": "apply_schedule_conflict_push",
    "identity_arguments": "p_teacher_id text, p_operation text, p_schedule jsonb, p_updates jsonb",
    "expected_md5": "70cb83ae0c1fef9d6c1f8c0b4639f24d",
    "guard_mode": "learning-write"
  },
  {
    "function_name": "is_admin_user",
    "identity_arguments": "",
    "expected_md5": "89c64acce134ee51a86256c736981f83",
    "guard_mode": "role"
  },
  {
    "function_name": "bind_current_user_to_teacher",
    "identity_arguments": "",
    "expected_md5": "71cc238eaac43993ea9d30169f55a5f3",
    "guard_mode": "bootstrap"
  },
  {
    "function_name": "get_my_teacher_profile",
    "identity_arguments": "",
    "expected_md5": "428093eabe824872af6e162bff4806f4",
    "guard_mode": "profile"
  },
  {
    "function_name": "teacher_checkout_subscription",
    "identity_arguments": "p_plan_code text, p_billing_cycle text, p_request_note text",
    "expected_md5": "1ece43e91a1b03a280add3b77f12706d",
    "guard_mode": "checkout"
  }
]
$snapshots$::jsonb;
begin
  if current_user <> 'postgres' then raise exception 'VERIFIED_POSTGRES_OWNER_REQUIRED'; end if;
  if to_regprocedure('public.security_auth_session_active()') is null
     or to_regprocedure('public.security_session_active()') is null
     or to_regprocedure('public.security_learning_write_allowed()') is null then
    raise exception 'STRICT_SESSION_RPCS_REQUIRED';
  end if;
  if has_function_privilege('anon', 'public.security_auth_session_active()', 'EXECUTE')
     or has_function_privilege('anon', 'public.security_session_active()', 'EXECUTE') then
    raise exception 'STRICT_SESSION_RPC_ACL_NOT_READY';
  end if;
  if to_regnamespace('hahalab_security') is not null then
    raise exception 'SECURITY_SCHEMA_ALREADY_EXISTS_REVIEW_REQUIRED';
  end if;

  -- Validate the complete snapshot before creating the private boundary.
  for target in select * from jsonb_to_recordset(snapshots)
    as s(function_name text, identity_arguments text, expected_md5 text, guard_mode text)
  loop
    select p.oid, pg_get_functiondef(p.oid)
      into function_oid, before_definition
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname = target.function_name
       and p.prokind = 'f'
       and pg_get_function_identity_arguments(p.oid) = target.identity_arguments
       and pg_get_userbyid(p.proowner) = 'postgres';
    if function_oid is null or md5(before_definition) <> target.expected_md5 then
      raise exception 'RPC_SNAPSHOT_MISMATCH: %(%)', target.function_name, target.identity_arguments;
    end if;
    if target.guard_mode = 'payment-wrapper' then
      payment_definition := before_definition;
    end if;
  end loop;
  if payment_definition is null then raise exception 'PAYMENT_SNAPSHOT_REQUIRED'; end if;

  execute 'create schema hahalab_security authorization postgres';
  execute 'revoke all on schema hahalab_security from public, anon, authenticated, service_role';
  private_definition := replace(payment_definition,
    'CREATE OR REPLACE FUNCTION public.admin_record_teacher_subscription_payment(',
    'CREATE FUNCTION hahalab_security.record_teacher_subscription_payment_internal(');
  if private_definition = payment_definition then raise exception 'PRIVATE_PAYMENT_HEADER_MISMATCH'; end if;
  entry_point := strpos(private_definition, chr(10) || 'begin' || chr(10));
  if entry_point = 0 then raise exception 'PRIVATE_PAYMENT_ENTRY_NOT_FOUND'; end if;
  private_definition := overlay(private_definition placing
    chr(10) || 'begin' || chr(10) || session_guard
    from entry_point for length(chr(10) || 'begin' || chr(10)));
  execute private_definition;
  payment_oid := to_regprocedure('hahalab_security.record_teacher_subscription_payment_internal(text,text,text,timestamp with time zone,integer,text,bigint,text)');
  if payment_oid is null then raise exception 'PRIVATE_PAYMENT_CREATE_FAILED'; end if;
  execute format('revoke all on function %s from public, anon, authenticated, service_role', payment_oid::regprocedure);

  for target in select * from jsonb_to_recordset(snapshots)
    as s(function_name text, identity_arguments text, expected_md5 text, guard_mode text)
  loop
    select p.oid, pg_get_functiondef(p.oid)
      into function_oid, before_definition
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname = target.function_name
       and p.prokind = 'f'
       and pg_get_function_identity_arguments(p.oid) = target.identity_arguments;
    if function_oid is null or md5(before_definition) <> target.expected_md5 then
      raise exception 'RPC_SNAPSHOT_CHANGED_DURING_PATCH';
    end if;
    if target.guard_mode = 'role' then
      entry_point := strpos(before_definition, 'SELECT EXISTS (');
      if entry_point = 0 then raise exception 'ROLE_ENTRY_POINT_NOT_FOUND'; end if;
      after_definition := overlay(before_definition placing
        'SELECT public.security_session_active() AND EXISTS ('
        from entry_point for length('SELECT EXISTS ('));
    elsif target.guard_mode = 'payment-wrapper' then
      entry_point := strpos(before_definition, 'AS $function$');
      if entry_point = 0 then raise exception 'PUBLIC_PAYMENT_BODY_BOUNDARY_NOT_FOUND'; end if;
      after_definition := left(before_definition, entry_point + length('AS $function$') - 1)
        || chr(10) || 'begin' || chr(10) || session_guard || admin_guard
        || payment_return || '$function$' || chr(10);
    else
      entry_point := strpos(before_definition, chr(10) || 'begin' || chr(10));
      if entry_point = 0 then raise exception 'RPC_ENTRY_POINT_NOT_FOUND'; end if;
      entry_guard := case
        when target.guard_mode in ('bootstrap', 'profile') then bootstrap_guard
        when target.guard_mode = 'learning-write' then learning_write_guard
        else session_guard end;
      if target.guard_mode = 'admin' then entry_guard := entry_guard || admin_guard; end if;
      after_definition := overlay(before_definition placing
        chr(10) || 'begin' || chr(10) || entry_guard
        from entry_point for length(chr(10) || 'begin' || chr(10)));
      if target.guard_mode = 'checkout' then
        if (length(after_definition) - length(replace(after_definition,
          'public.admin_record_teacher_subscription_payment(', '')))
          / length('public.admin_record_teacher_subscription_payment(') <> 1 then
          raise exception 'CHECKOUT_PAYMENT_CALL_COUNT_MISMATCH';
        end if;
        after_definition := replace(after_definition,
          'public.admin_record_teacher_subscription_payment(',
          'hahalab_security.record_teacher_subscription_payment_internal(');
        if strpos(after_definition, chr(10) || 'declare' || chr(10)) = 0
           or strpos(after_definition, '    v_payment_result := hahalab_security.record_teacher_subscription_payment_internal(') = 0
           or strpos(after_definition, '    v_effective_start := nullif(v_payment_result') = 0 then
          raise exception 'CHECKOUT_CONTEXT_BOUNDARY_NOT_FOUND';
        end if;
        after_definition := replace(after_definition,
          chr(10) || 'declare' || chr(10),
          chr(10) || 'declare' || chr(10) || '    v_previous_billing_context text;' || chr(10));
        after_definition := replace(after_definition,
          '    v_payment_result := hahalab_security.record_teacher_subscription_payment_internal(',
          checkout_context_start || '    v_payment_result := hahalab_security.record_teacher_subscription_payment_internal(');
        after_definition := replace(after_definition,
          '    v_effective_start := nullif(v_payment_result',
          checkout_context_end || '    v_effective_start := nullif(v_payment_result');
      elsif target.guard_mode = 'bootstrap' then
        if strpos(after_definition, chr(10) || 'declare' || chr(10)) = 0
           or strpos(after_definition, '    update public.teachers') = 0
           or strpos(after_definition, '    return exists (') = 0 then
          raise exception 'BINDING_CONTEXT_BOUNDARY_NOT_FOUND';
        end if;
        after_definition := replace(after_definition,
          chr(10) || 'declare' || chr(10),
          chr(10) || 'declare' || chr(10) || '    v_previous_binding_context text;' || chr(10));
        after_definition := replace(after_definition,
          '    update public.teachers', binding_context_start || '    update public.teachers');
        after_definition := replace(after_definition,
          '    return exists (', binding_context_end || '    return exists (');
      elsif target.guard_mode = 'profile' then
        entry_point := strpos(after_definition, '    return query');
        if entry_point = 0 then raise exception 'PROFILE_RETURN_GATE_NOT_FOUND'; end if;
        after_definition := overlay(after_definition placing
          account_guard || '    return query'
          from entry_point for length('    return query'));
      end if;
    end if;
    if after_definition = before_definition then raise exception 'RPC_PATCH_NOT_APPLIED'; end if;
    execute after_definition;
    -- Four verified public/anon SELECT policies call this pure role predicate.
    -- Its anon result remains false; retaining its ACL avoids breaking those
    -- public reads. Mutation/profile/bootstrap entrypoints deny anon directly.
    if target.guard_mode <> 'role' then
      execute format('revoke all on function %s from public, anon', function_oid::regprocedure);
    end if;
    execute format('grant execute on function %s to authenticated', function_oid::regprocedure);
  end loop;
end;
$hahalab_rpc_hardening$;

-- Smoke-test denial before any business row access or mutation. This checks the
-- database guard, not a real JWT/API or MFA login. Customer records are untouched.
do $hahalab_rpc_denial_smoke$
declare
  invocation text;
  denial_message text;
  previous_claims text := current_setting('request.jwt.claims', true);
begin
  perform set_config('request.jwt.claims', '{}', true);
  if public.is_admin_user() is distinct from false then
    raise exception 'EMPTY_SESSION_ROLE_CHECK_MUST_BE_FALSE';
  end if;
  foreach invocation in array array[
    $call$select public.admin_manage_teacher_subscription(''::text, ''::text, null::text, now(), ''::text)$call$,
    $call$select public.admin_manage_teacher_subscription(0::bigint, ''::text, null::text, now(), ''::text, ''::text)$call$,
    $call$select public.admin_process_teacher_billing_request(0::bigint, ''::text, null::integer, ''::text)$call$,
    $call$select public.admin_record_teacher_subscription_payment(''::text, ''::text, ''::text, now(), null::integer, ''::text, null::bigint, ''::text)$call$,
    $call$select public.apply_schedule_conflict_push(''::text, ''::text, '{}'::jsonb, '[]'::jsonb)$call$,
    $call$select public.teacher_checkout_subscription(''::text, ''::text, ''::text)$call$,
    $call$select public.bind_current_user_to_teacher()$call$,
    $call$select public.get_my_teacher_profile()$call$
  ] loop
    begin
      execute invocation;
      raise exception 'MISSING_RPC_SESSION_DENIAL';
    exception when insufficient_privilege then
      get stacked diagnostics denial_message = message_text;
      if denial_message <> 'AUTH_SESSION_INACTIVE' then
        raise exception 'UNEXPECTED_RPC_DENIAL: %', denial_message;
      end if;
    end;
  end loop;
  if has_schema_privilege('anon', 'hahalab_security', 'USAGE')
     or has_schema_privilege('authenticated', 'hahalab_security', 'USAGE')
     or has_function_privilege('anon', 'hahalab_security.record_teacher_subscription_payment_internal(text,text,text,timestamp with time zone,integer,text,bigint,text)', 'EXECUTE')
     or has_function_privilege('authenticated', 'hahalab_security.record_teacher_subscription_payment_internal(text,text,text,timestamp with time zone,integer,text,bigint,text)', 'EXECUTE') then
    raise exception 'PRIVATE_PAYMENT_BOUNDARY_NOT_PRIVATE';
  end if;
  perform set_config('request.jwt.claims', coalesce(previous_claims, '{}'), true);
end;
$hahalab_rpc_denial_smoke$;

-- Metadata only: no function body, JWT, secret or customer row is output.
select n.nspname as schema_name, p.proname,
       pg_get_function_identity_arguments(p.oid) as identity_arguments,
       has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute,
       md5(pg_get_functiondef(p.oid)) as definition_md5
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname in ('public', 'hahalab_security') and p.proname in
  ('admin_manage_teacher_subscription', 'admin_process_teacher_billing_request',
   'admin_record_teacher_subscription_payment', 'apply_schedule_conflict_push',
   'is_admin_user', 'teacher_checkout_subscription', 'bind_current_user_to_teacher',
   'get_my_teacher_profile', 'record_teacher_subscription_payment_internal')
order by schema_name, p.proname, identity_arguments;

notify pgrst, 'reload schema';
commit;
