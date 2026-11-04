-- Priority-zero exact-snapshot signup role fix. Verified project only:
-- gxungzlecmibgvykoiib. No existing user or teacher row is changed or created.
-- Does not depend on the new session RPCs; root may dry-run/apply independently.
-- Actual signup creation must NOT be used as an attack test.
begin;
set local lock_timeout = '10s';
set local statement_timeout = '30s';
set local search_path = pg_catalog;
do $signup_role_hardening$
declare
  function_oid oid;
  before_definition text;
  after_definition text;
  before_acl text;
  role_input text := $role_input$v_role := lower(coalesce(new.raw_user_meta_data ->> 'app_role', 'teacher'));$role_input$;
  master_assignment text := $master_assignment$if v_is_master_admin then
        v_role := 'admin';
    end if;$master_assignment$;
  role_update text := $role_update$role = case
            when v_is_master_admin then 'admin'
            else coalesce(role, v_role)
        end$role_update$;
  signup_status text := $signup_status$v_status := case when v_role = 'admin' then 'normal' else 'request' end;$signup_status$;
begin
  if current_user <> 'postgres' then raise exception 'VERIFIED_POSTGRES_OWNER_REQUIRED'; end if;
  select p.oid, pg_get_functiondef(p.oid), p.proacl::text
    into function_oid, before_definition, before_acl
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'handle_new_auth_user'
     and pg_get_function_identity_arguments(p.oid) = '' and p.prokind = 'f'
     and pg_get_userbyid(p.proowner) = 'postgres';
  if function_oid is null or md5(before_definition) <> '1da022b8e907a44c0ab20e4119d1019c'
     or before_acl is distinct from '{=X/postgres,postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}' then
    raise exception 'SIGNUP_ROLE_FUNCTION_SNAPSHOT_MISMATCH';
  end if;
  if strpos(before_definition, role_input) = 0 or strpos(before_definition, master_assignment) = 0
     or strpos(before_definition, role_update) = 0 or strpos(before_definition, signup_status) = 0 then
    raise exception 'SIGNUP_ROLE_ASSIGNMENT_SNAPSHOT_MISMATCH';
  end if;
  after_definition := replace(before_definition, role_input, 'v_role := ''teacher'';');
  after_definition := replace(after_definition, master_assignment, '-- New signups cannot nominate an administrator.');
  after_definition := replace(after_definition, signup_status, 'v_status := ''request'';');
  after_definition := replace(after_definition, role_update, 'role = role');
  if strpos(after_definition, 'new.raw_user_meta_data ->> ''app_role''') > 0
     or strpos(after_definition, 'v_role := ''admin''') > 0
     or strpos(after_definition, 'role = role') = 0
     or after_definition = before_definition then
    raise exception 'SIGNUP_ROLE_FIX_INCOMPLETE';
  end if;
  execute after_definition;
  if before_acl is distinct from (select p.proacl::text from pg_proc p where p.oid = function_oid)
     or (select pg_get_userbyid(p.proowner) from pg_proc p where p.oid = function_oid) <> 'postgres' then
    raise exception 'SIGNUP_ROLE_OWNER_OR_ACL_CHANGED';
  end if;
end;
$signup_role_hardening$;
-- Metadata only: no source body, hard-coded identities or customer rows returned.
select p.proname, pg_get_userbyid(p.proowner) as owner,
       md5(pg_get_functiondef(p.oid)) as definition_md5
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'handle_new_auth_user'
  and pg_get_function_identity_arguments(p.oid) = '';
commit;
