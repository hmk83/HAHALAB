-- Independent exact operating-trigger candidate. Root owns application.
-- Requires session/bootstrap and direct-admin-RLS helpers first.
-- No customer data or business function is invoked.
begin;
set local lock_timeout = '10s';
set local statement_timeout = '30s';
set local search_path = pg_catalog;
do $teacher_guard_patch$
declare
  oid_before oid;
  definition_before text;
  acl_before text;
begin
  if current_user <> 'postgres' then raise exception 'VERIFIED_POSTGRES_OWNER_REQUIRED'; end if;
  if to_regprocedure('public.security_admin_active()') is null or to_regprocedure('public.security_auth_session_active()') is null then
    raise exception 'STRICT_ADMIN_AND_AUTH_HELPERS_REQUIRED';
  end if;
  select p.oid, pg_get_functiondef(p.oid), p.proacl::text into oid_before, definition_before, acl_before
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.proname='guard_teacher_self_service_fields'
     and pg_get_function_identity_arguments(p.oid)='' and pg_get_userbyid(p.proowner)='postgres';
  if oid_before is null or md5(definition_before) <> '2368394d9e1560d163e570261da89051' or acl_before is distinct from '{=X/postgres,postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}' then
    raise exception 'TEACHER_GUARD_SNAPSHOT_MISMATCH';
  end if;
  execute $replacement$
CREATE OR REPLACE FUNCTION public.guard_teacher_self_service_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
    v_status_transition_allowed boolean := false;
begin
    if tg_op <> 'UPDATE' then
        return new;
    end if;

    if auth.uid() is null then
        return new;
    end if;

    if public.security_admin_active() is true then
        return new;
    end if;

    if current_setting('hahalab.allow_teacher_billing_update', true) = '1' then
        return new;
    end if;

    -- Only the verified binding RPC may establish this first identity link.
    if current_setting('hahalab.allow_teacher_binding', true) = '1'
       and public.security_auth_session_active() is true
       and old.auth_user_id is null
       and new.auth_user_id = auth.uid()
       and nullif(trim(coalesce(old.email, '')), '') is not null
       and lower(trim(old.email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
       and (to_jsonb(new) - 'auth_user_id') = (to_jsonb(old) - 'auth_user_id') then
        return new;
    end if;

    -- Account activation is an authorized admin/billing operation, not self-service.
    v_status_transition_allowed := false;

    if new.role is distinct from old.role then
        raise exception 'ROLE_CHANGE_NOT_ALLOWED';
    end if;

    if new.auth_user_id is distinct from old.auth_user_id then
        raise exception 'AUTH_LINK_CHANGE_NOT_ALLOWED';
    end if;

    if new.teacher_id is distinct from old.teacher_id then
        raise exception 'TEACHER_ID_CHANGE_NOT_ALLOWED';
    end if;

    if lower(coalesce(new.email, '')) is distinct from lower(coalesce(old.email, '')) then
        raise exception 'EMAIL_CHANGE_NOT_ALLOWED';
    end if;

    if new.max_client_limit is distinct from old.max_client_limit then
        raise exception 'MAX_CLIENT_LIMIT_CHANGE_NOT_ALLOWED';
    end if;

    if new.free_trial_end is distinct from old.free_trial_end then
        raise exception 'TRIAL_WINDOW_CHANGE_NOT_ALLOWED';
    end if;

    if new.withdrawn_at is distinct from old.withdrawn_at then
        raise exception 'WITHDRAWN_AT_CHANGE_NOT_ALLOWED';
    end if;

    if new.status is distinct from old.status and not v_status_transition_allowed then
        raise exception 'STATUS_CHANGE_NOT_ALLOWED';
    end if;

    return new;
end;
$function$

$replacement$;
  if (select proacl::text from pg_proc where oid=oid_before) is distinct from acl_before then raise exception 'TEACHER_GUARD_ACL_CHANGED'; end if;
end;
$teacher_guard_patch$;
commit;
