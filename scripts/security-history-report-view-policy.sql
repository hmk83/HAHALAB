-- Exact operating-schema candidate. Source histories are never changed.
-- A grouping means identical full stored content, not a proved real-world trial.
-- security_invoker preserves underlying caller session/tenant/admin-two-status RLS.
begin;
set local lock_timeout='10s';
set local statement_timeout='60s';
set local search_path=public,pg_catalog;
do $history_report_view_preflight$
declare actual_columns jsonb;actual_policies jsonb;actual_helpers jsonb;actual_table jsonb;
begin
 if current_user<>'postgres' then raise exception 'VERIFIED_POSTGRES_OWNER_REQUIRED'; end if;
 if to_regclass('public.histories_report_exact') is not null then raise exception 'HISTORY_REPORT_VIEW_EXISTS_REVIEW_REQUIRED'; end if;
 select jsonb_agg(jsonb_build_object('name',column_name,'type',data_type,'udt',udt_name,'nullable',is_nullable,'identity',is_identity) order by ordinal_position) into actual_columns from information_schema.columns where table_schema='public' and table_name='histories';
 select jsonb_build_object('owner',pg_get_userbyid(c.relowner),'rls',c.relrowsecurity,'force_rls',c.relforcerowsecurity,'acl',c.relacl::text) into actual_table from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='histories';
 select jsonb_agg(jsonb_build_object('name',policyname,'cmd',cmd,'roles',roles::text,'permissive',permissive,'qual',qual,'with_check',with_check) order by policyname) into actual_policies from pg_policies where schemaname='public' and tablename='histories';
 select jsonb_agg(jsonb_build_object('name',p.proname,'md5',md5(pg_get_functiondef(p.oid)),'acl',p.proacl::text,'owner',pg_get_userbyid(p.proowner)) order by p.proname) into actual_helpers from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('security_session_active','security_admin_active') and pg_get_function_identity_arguments(p.oid)='';
 if actual_columns is distinct from $snapshot$[{"udt": "int8", "name": "id", "type": "bigint", "identity": "YES", "nullable": "NO"}, {"udt": "timestamptz", "name": "created_at", "type": "timestamp with time zone", "identity": "NO", "nullable": "YES"}, {"udt": "text", "name": "teacher_id", "type": "text", "identity": "NO", "nullable": "NO"}, {"udt": "text", "name": "client_id", "type": "text", "identity": "NO", "nullable": "NO"}, {"udt": "text", "name": "client_name", "type": "text", "identity": "NO", "nullable": "NO"}, {"udt": "text", "name": "type", "type": "text", "identity": "NO", "nullable": "NO"}, {"udt": "text", "name": "category", "type": "text", "identity": "NO", "nullable": "NO"}, {"udt": "text", "name": "action", "type": "text", "identity": "NO", "nullable": "NO"}, {"udt": "text", "name": "event_datetime", "type": "text", "identity": "NO", "nullable": "YES"}, {"udt": "text", "name": "start_datetime", "type": "text", "identity": "NO", "nullable": "YES"}, {"udt": "text", "name": "end_datetime", "type": "text", "identity": "NO", "nullable": "YES"}, {"udt": "text", "name": "noshow_datetime", "type": "text", "identity": "NO", "nullable": "YES"}, {"udt": "text", "name": "delete_datetime", "type": "text", "identity": "NO", "nullable": "YES"}, {"udt": "text", "name": "reschedule_datetime", "type": "text", "identity": "NO", "nullable": "YES"}, {"udt": "text", "name": "original_datetime", "type": "text", "identity": "NO", "nullable": "YES"}, {"udt": "text", "name": "changed_datetime", "type": "text", "identity": "NO", "nullable": "YES"}, {"udt": "int4", "name": "duration_minutes", "type": "integer", "identity": "NO", "nullable": "YES"}, {"udt": "text", "name": "details", "type": "text", "identity": "NO", "nullable": "YES"}, {"udt": "text", "name": "memo", "type": "text", "identity": "NO", "nullable": "YES"}, {"udt": "text", "name": "action_type", "type": "text", "identity": "NO", "nullable": "YES"}, {"udt": "interval", "name": "duration", "type": "interval", "identity": "NO", "nullable": "YES"}, {"udt": "jsonb", "name": "metadata", "type": "jsonb", "identity": "NO", "nullable": "YES"}]$snapshot$::jsonb then raise exception 'HISTORY_FULL_COLUMN_SNAPSHOT_MISMATCH'; end if;
 if actual_table is distinct from $snapshot${"acl": "{postgres=arwdDxtm/postgres,anon=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres}", "rls": true, "owner": "postgres", "force_rls": true}$snapshot$::jsonb then raise exception 'HISTORY_OWNER_RLS_SNAPSHOT_MISMATCH'; end if;
 if actual_policies is distinct from $snapshot$[{"cmd": "DELETE", "name": "histories_delete_scope", "qual": "(security_admin_active() OR (teacher_id = current_teacher_id()))", "roles": "{authenticated}", "permissive": "PERMISSIVE", "with_check": null}, {"cmd": "INSERT", "name": "histories_insert_scope", "qual": null, "roles": "{authenticated}", "permissive": "PERMISSIVE", "with_check": "(security_admin_active() OR (teacher_id = current_teacher_id()))"}, {"cmd": "SELECT", "name": "histories_select_scope", "qual": "(security_admin_active() OR (teacher_id = current_teacher_id()))", "roles": "{authenticated}", "permissive": "PERMISSIVE", "with_check": null}, {"cmd": "UPDATE", "name": "histories_update_scope", "qual": "(security_admin_active() OR (teacher_id = current_teacher_id()))", "roles": "{authenticated}", "permissive": "PERMISSIVE", "with_check": "(security_admin_active() OR (teacher_id = current_teacher_id()))"}, {"cmd": "ALL", "name": "security_active_session", "qual": "security_session_active()", "roles": "{authenticated}", "permissive": "RESTRICTIVE", "with_check": "security_session_active()"}, {"cmd": "DELETE", "name": "security_learning_delete", "qual": "security_learning_write_allowed()", "roles": "{authenticated}", "permissive": "RESTRICTIVE", "with_check": null}, {"cmd": "INSERT", "name": "security_learning_insert", "qual": null, "roles": "{authenticated}", "permissive": "RESTRICTIVE", "with_check": "security_learning_write_allowed()"}, {"cmd": "UPDATE", "name": "security_learning_update", "qual": "security_learning_write_allowed()", "roles": "{authenticated}", "permissive": "RESTRICTIVE", "with_check": "security_learning_write_allowed()"}]$snapshot$::jsonb then raise exception 'HISTORY_POLICY_SNAPSHOT_MISMATCH'; end if;
 if actual_helpers is distinct from $snapshot$[{"name": "security_admin_active", "md5": "c69ecbe2c19cb3fc465c5811e283c44b", "acl": "{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres,anon=X/postgres}", "owner": "postgres"}, {"name": "security_session_active", "md5": "8c8180f7b0f3b24b5c47a97a0c96b4f9", "acl": "{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}", "owner": "postgres"}]$snapshot$::jsonb then raise exception 'HISTORY_CURRENT_HELPER_SNAPSHOT_MISMATCH'; end if;
end;
$history_report_view_preflight$;
create view public.histories_report_exact with (security_invoker=true) as
with canonical as (
 select h.*,
  case when h.action='게임 완료' and pg_input_is_valid(h.details,'jsonb') then
   jsonb_build_array('canonical-full',(to_jsonb(h)-'id'-'created_at'-'details')||jsonb_build_object('details',h.details::jsonb))
  else jsonb_build_array('source-id',h.id) end as storage_group_key
 from public.histories h
), ranked as (
 select c.*,
  count(*) over(partition by teacher_id,client_id,category,action,storage_group_key) as report_storage_copy_count,
  row_number() over(partition by teacher_id,client_id,category,action,storage_group_key order by id) as storage_group_position
 from canonical c
)
select r."id",
 r."created_at",
 r."teacher_id",
 r."client_id",
 r."client_name",
 r."type",
 r."category",
 r."action",
 r."event_datetime",
 r."start_datetime",
 r."end_datetime",
 r."noshow_datetime",
 r."delete_datetime",
 r."reschedule_datetime",
 r."original_datetime",
 r."changed_datetime",
 r."duration_minutes",
 r."details",
 r."memo",
 r."action_type",
 r."duration",
 r."metadata",r.report_storage_copy_count
from ranked r where r.storage_group_position=1;
revoke all on public.histories_report_exact from public,anon,authenticated,service_role;
grant select on public.histories_report_exact to authenticated;
comment on view public.histories_report_exact is 'Read-only identical-full-content storage groups; source preserved. Counts do not prove historical real-world repeat trials.';
do $history_view_acl_smoke$
begin
 if not exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='histories_report_exact' and c.relkind='v' and 'security_invoker=true'=any(c.reloptions) and pg_get_userbyid(c.relowner)='postgres') then raise exception 'SECURITY_INVOKER_VIEW_REQUIRED'; end if;
 if has_table_privilege('anon','public.histories_report_exact','SELECT') or has_table_privilege('authenticated','public.histories_report_exact','INSERT,UPDATE,DELETE') or not has_table_privilege('authenticated','public.histories_report_exact','SELECT') then raise exception 'HISTORY_VIEW_SELECT_ONLY_ACL_REQUIRED'; end if;
end;
$history_view_acl_smoke$;
notify pgrst,'reload schema';
commit;
