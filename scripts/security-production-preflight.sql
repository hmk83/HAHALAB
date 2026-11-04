-- HAHA LAB production preflight: READ ONLY, metadata only.
-- Run only after verifying the target project is gxungzlecmibgvykoiib.
-- This script does not read customer rows, JWTs, auth.sessions rows, credentials,
-- function bodies or raw policy expressions. A definition hash is not approval:
-- privileged function bodies still require a restricted manual security review.
begin transaction read only;
set local statement_timeout = '20s';

-- Server metadata and configured API schema hint (verify Data API settings too).
select current_database() as database_name,
       current_setting('server_version') as server_version,
       current_setting('pgrst.db_schemas', true) as api_schema_hint;

-- Required functions and overload identities; no invocation or body output.
with required(function_name) as (values
  ('security_session_active'), ('bind_current_user_to_teacher'),
  ('get_my_teacher_profile'), ('is_admin_user'), ('withdraw_teacher_account'),
  ('apply_schedule_conflict_push'), ('increment_worksheet_download'),
  ('admin_manage_teacher_subscription'),
  ('admin_process_teacher_billing_request'),
  ('admin_record_teacher_subscription_payment')
)
select r.function_name, p.oid is not null as exists_in_public,
       pg_get_function_identity_arguments(p.oid) as identity_arguments,
       p.prosecdef as security_definer,
       pg_get_userbyid(p.proowner) as owner_role,
       array(select split_part(setting, '=', 1) from unnest(p.proconfig) setting) as function_setting_names,
       array(select setting from unnest(p.proconfig) setting where setting like 'search_path=%') as search_path_settings,
       case when p.oid is not null then has_function_privilege('anon', p.oid, 'EXECUTE') end as anon_execute,
       case when p.oid is not null then has_function_privilege('authenticated', p.oid, 'EXECUTE') end as authenticated_execute,
       case when p.oid is not null then md5(pg_get_functiondef(p.oid)) end as definition_md5
from required r
left join pg_proc p on p.proname = r.function_name
  and p.pronamespace = 'public'::regnamespace and p.prokind = 'f'
order by r.function_name, identity_arguments;

-- All non-system SECURITY DEFINER functions, including private/custom schemas.
-- Text-presence flags are triage hints, never proof that a guard executes safely.
with privileged as (
  select n.nspname as schema_name, p.oid, p.proname, p.proowner, p.proconfig,
         lower(pg_get_functiondef(p.oid)) as definition
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where p.prosecdef and p.prokind = 'f'
    and n.nspname !~ '^pg_' and n.nspname <> 'information_schema'
)
select schema_name, proname,
       pg_get_function_identity_arguments(oid) as identity_arguments,
       pg_get_userbyid(proowner) as owner_role,
       array(select split_part(setting, '=', 1) from unnest(proconfig) setting) as function_setting_names,
       array(select setting from unnest(proconfig) setting where setting like 'search_path=%') as search_path_settings,
       has_schema_privilege('anon', schema_name, 'USAGE') as anon_schema_usage,
       has_schema_privilege('authenticated', schema_name, 'USAGE') as authenticated_schema_usage,
       has_function_privilege('anon', oid, 'EXECUTE') as anon_execute,
       has_function_privilege('authenticated', oid, 'EXECUTE') as authenticated_execute,
       position('security_session_active' in definition) > 0 as mentions_session_guard,
       position('auth.uid()' in definition) > 0 as mentions_auth_uid,
       position('teacher_id' in definition) > 0 as mentions_tenant_field,
       position('aal2' in definition) > 0 as mentions_aal2,
       position('user_metadata' in definition) > 0 as mentions_user_editable_metadata,
       md5(definition) as definition_md5
from privileged order by schema_name, proname, identity_arguments;

-- Execute ACLs for all non-system privileged functions and target public RPCs.
select n.nspname as schema_name, p.proname,
       pg_get_function_identity_arguments(p.oid) as identity_arguments,
       case when acl.grantee = 0 then 'PUBLIC' else pg_get_userbyid(acl.grantee) end as grantee_role,
       acl.privilege_type, acl.is_grantable
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
cross join lateral aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) acl
where p.prokind = 'f' and n.nspname !~ '^pg_' and n.nspname <> 'information_schema'
  and (p.prosecdef or n.nspname = 'public' and p.proname in
    ('security_session_active', 'get_my_teacher_profile', 'is_admin_user'))
order by schema_name, p.proname, identity_arguments, grantee_role;

-- Required tenant table existence/RLS and API role table privileges.
with required(table_name) as (values
  ('teachers'), ('clients'), ('schedules'), ('histories'),
  ('cardlab_learning_attempts'), ('cardlab_learning_stage_progress'),
  ('cardlab_learning_wrong_stats'), ('app_terms_agreements'),
  ('report_share_links'), ('report_share_audit')
)
select r.table_name, c.oid is not null as exists_in_public,
       c.relrowsecurity as rls_enabled, c.relforcerowsecurity as force_rls,
       case when c.oid is not null then has_table_privilege('anon', c.oid, 'SELECT') end as anon_select,
       case when c.oid is not null then has_table_privilege('authenticated', c.oid, 'SELECT') end as authenticated_select,
       case when c.oid is not null then has_table_privilege('authenticated', c.oid, 'INSERT') end as authenticated_insert,
       case when c.oid is not null then has_table_privilege('authenticated', c.oid, 'UPDATE') end as authenticated_update,
       case when c.oid is not null then has_table_privilege('authenticated', c.oid, 'DELETE') end as authenticated_delete
from required r left join pg_class c on c.relname = r.table_name
  and c.relnamespace = 'public'::regnamespace and c.relkind in ('r', 'p')
order by r.table_name;

-- All public/private/storage table RLS metadata; no table data.
select n.nspname as schema_name, c.relname as table_name,
       c.relrowsecurity as rls_enabled, c.relforcerowsecurity as force_rls,
       pg_get_userbyid(c.relowner) as owner_role
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname !~ '^pg_' and n.nspname not in ('information_schema', 'extensions')
  and c.relkind in ('r', 'p')
order by schema_name, table_name;

-- Policy identity and expression fingerprints avoid leaking hardcoded IDs.
select n.nspname as schema_name, c.relname as table_name, p.polname as policy_name,
       p.polpermissive as permissive, p.polcmd as command,
       array(select case when role_oid = 0 then 'PUBLIC' else pg_get_userbyid(role_oid) end
             from unnest(p.polroles) role_oid) as roles,
       p.polqual is not null as has_using,
       p.polwithcheck is not null as has_with_check,
       position('security_session_active' in coalesce(pg_get_expr(p.polqual, p.polrelid), '')) > 0 as using_mentions_session_guard,
       position('security_session_active' in coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '')) > 0 as check_mentions_session_guard,
       md5(coalesce(pg_get_expr(p.polqual, p.polrelid), '')) as using_md5,
       md5(coalesce(pg_get_expr(p.polwithcheck, p.polrelid), '')) as with_check_md5
from pg_policy p join pg_class c on c.oid = p.polrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname !~ '^pg_' and n.nspname <> 'information_schema'
order by schema_name, table_name, policy_name;

-- Report JSON/schema compatibility, names and data types only.
select table_schema, table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name in
  ('histories', 'report_share_links', 'report_share_audit')
order by table_name, ordinal_position;

select extname, extversion from pg_extension where extname = 'pg_cron';
-- Do not select cron.job commands: they may contain privileged SQL or secrets.
rollback;
