-- Minimal response to confirmed authenticated57014 on id-only canonical reads.
-- Narrow source branches and cache3verifiedSTABLEreadhelpers through2policies.
-- Full grouping, fields/counts, security_invoker, authorization truth conditions,
-- WITH CHECK, all other policies/functions and SELECT-only ACL stay intact.
begin;
set local lock_timeout='10s';
set local statement_timeout='30s';
set local search_path=public,pg_catalog;
do $history_view_performance_preflight$
declare v record;helpers jsonb;policies jsonb;
begin
 if current_user<>'postgres' then raise exception 'VERIFIED_POSTGRES_OWNER_REQUIRED'; end if;
 select md5(pg_get_viewdef(c.oid,false)) as md5,pg_get_userbyid(c.relowner) as owner,c.relacl::text as acl,c.reloptions as options into v from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='histories_report_exact' and c.relkind='v';
 if not found or v.md5<>'f6c25c539fdb3a4c44d262c57d01cc8d' or v.owner<>'postgres' or v.acl is distinct from '{postgres=arwdDxtm/postgres,authenticated=r/postgres}' or not ('security_invoker=true'=any(v.options)) then raise exception 'HISTORY_VIEW_BEFORE_SNAPSHOT_MISMATCH'; end if;
 select jsonb_agg(jsonb_build_object('name',p.proname,'md5',md5(pg_get_functiondef(p.oid)),'owner',pg_get_userbyid(p.proowner),'acl',p.proacl::text,'volatility',p.provolatile,'security_definer',p.prosecdef) order by p.proname) into helpers from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('current_teacher_id','security_admin_active','security_session_active') and pg_get_function_identity_arguments(p.oid)='';
 select jsonb_agg(jsonb_build_object('name',policyname,'cmd',cmd,'roles',roles::text,'permissive',permissive,'qual',qual,'with_check',with_check) order by policyname) into policies from pg_policies where schemaname='public' and tablename='histories';
 if helpers is distinct from $helpers$[{"name": "current_teacher_id", "md5": "f58eda5e472610372b9c08bc1f041614", "owner": "postgres", "acl": "{postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}", "volatility": "s", "security_definer": true}, {"name": "security_admin_active", "md5": "c69ecbe2c19cb3fc465c5811e283c44b", "owner": "postgres", "acl": "{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres,anon=X/postgres}", "volatility": "s", "security_definer": true}, {"name": "security_session_active", "md5": "8c8180f7b0f3b24b5c47a97a0c96b4f9", "owner": "postgres", "acl": "{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}", "volatility": "s", "security_definer": true}]$helpers$::jsonb then raise exception 'HISTORY_CURRENT_AUTHORIZATION_HELPER_MISMATCH'; end if;
 if policies is distinct from $policies$[{"cmd": "DELETE", "name": "histories_delete_scope", "qual": "(security_admin_active() OR (teacher_id = current_teacher_id()))", "roles": "{authenticated}", "permissive": "PERMISSIVE", "with_check": null}, {"cmd": "INSERT", "name": "histories_insert_scope", "qual": null, "roles": "{authenticated}", "permissive": "PERMISSIVE", "with_check": "(security_admin_active() OR (teacher_id = current_teacher_id()))"}, {"cmd": "SELECT", "name": "histories_select_scope", "qual": "(security_admin_active() OR (teacher_id = current_teacher_id()))", "roles": "{authenticated}", "permissive": "PERMISSIVE", "with_check": null}, {"cmd": "UPDATE", "name": "histories_update_scope", "qual": "(security_admin_active() OR (teacher_id = current_teacher_id()))", "roles": "{authenticated}", "permissive": "PERMISSIVE", "with_check": "(security_admin_active() OR (teacher_id = current_teacher_id()))"}, {"cmd": "ALL", "name": "security_active_session", "qual": "security_session_active()", "roles": "{authenticated}", "permissive": "RESTRICTIVE", "with_check": "security_session_active()"}, {"cmd": "DELETE", "name": "security_learning_delete", "qual": "security_learning_write_allowed()", "roles": "{authenticated}", "permissive": "RESTRICTIVE", "with_check": null}, {"cmd": "INSERT", "name": "security_learning_insert", "qual": null, "roles": "{authenticated}", "permissive": "RESTRICTIVE", "with_check": "security_learning_write_allowed()"}, {"cmd": "UPDATE", "name": "security_learning_update", "qual": "security_learning_write_allowed()", "roles": "{authenticated}", "permissive": "RESTRICTIVE", "with_check": "security_learning_write_allowed()"}]$policies$::jsonb then raise exception 'HISTORY_CURRENT_RLS_POLICY_MISMATCH'; end if;
end;
$history_view_performance_preflight$;
create or replace view public.histories_report_exact with (security_invoker=true) as
with actor_scope as materialized (
 select current_user::text as sql_role,
  (select public.current_teacher_id()) as own_teacher,
  (select public.security_admin_active()) as global_admin
), scoped_history as (
 -- The ordinary-account branch has an explicit indexed owner predicate before
 -- grouping. The global branch is a one-time strict-admin gate, never executed
 -- for ordinary, AAL1 or pending administrators. Underlying RLS still applies.
 select h.* from public.histories h
 where (select sql_role from actor_scope)='authenticated'
   and h.teacher_id=(select own_teacher from actor_scope)
 union all
 select h.* from public.histories h
 where (select sql_role from actor_scope)='authenticated'
   and (select global_admin from actor_scope) is true
   and h.teacher_id is distinct from (select own_teacher from actor_scope)
 union all
 -- Preserve baseline invoker/RLS behavior for trusted SQL management roles.
 -- This branch adds no grants; anon/service view SELECT remains revoked.
 select h.* from public.histories h
 where (select sql_role from actor_scope)<>'authenticated'
), canonical as (
 select h.*,
  case when h.action='게임 완료' and pg_input_is_valid(h.details,'jsonb') then
   jsonb_build_array('canonical-full',(to_jsonb(h)-'id'-'created_at'-'details')||jsonb_build_object('details',h.details::jsonb))
  else jsonb_build_array('source-id',h.id) end as storage_group_key
 from scoped_history h
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
-- These no-argument helpers are verified STABLE above. Reuse their result
-- within each statement; retain all owner/admin/session truth conditions and
-- existing WITH CHECK expressions. No permission or RLS bypass is introduced.
alter policy histories_select_scope on public.histories
 using ((select public.security_admin_active()) or teacher_id=(select public.current_teacher_id()));
alter policy security_active_session on public.histories
 using ((select public.security_session_active()));
do $history_view_preservation$
declare v record;policies jsonb;
begin
 select pg_get_userbyid(c.relowner) as owner,c.relacl::text as acl,c.reloptions as options into v from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='histories_report_exact';
 if v.owner<>'postgres' or v.acl is distinct from '{postgres=arwdDxtm/postgres,authenticated=r/postgres}' or not ('security_invoker=true'=any(v.options)) then raise exception 'HISTORY_VIEW_SECURITY_OR_ACL_CHANGED'; end if;
 if has_table_privilege('anon','public.histories_report_exact','SELECT') or has_table_privilege('authenticated','public.histories_report_exact','INSERT,UPDATE,DELETE') then raise exception 'HISTORY_VIEW_PRIVILEGE_REGRESSION'; end if;
 select jsonb_agg(jsonb_build_object('name',policyname,'cmd',cmd,'roles',roles::text,'permissive',permissive,'qual',qual,'with_check',with_check) order by policyname) into policies from pg_policies where schemaname='public' and tablename='histories';
 if policies is distinct from $expected_read_policies$[{"cmd": "DELETE", "name": "histories_delete_scope", "qual": "(security_admin_active() OR (teacher_id = current_teacher_id()))", "roles": "{authenticated}", "permissive": "PERMISSIVE", "with_check": null}, {"cmd": "INSERT", "name": "histories_insert_scope", "qual": null, "roles": "{authenticated}", "permissive": "PERMISSIVE", "with_check": "(security_admin_active() OR (teacher_id = current_teacher_id()))"}, {"cmd": "SELECT", "name": "histories_select_scope", "qual": "(( SELECT security_admin_active() AS security_admin_active) OR (teacher_id = ( SELECT current_teacher_id() AS current_teacher_id)))", "roles": "{authenticated}", "permissive": "PERMISSIVE", "with_check": null}, {"cmd": "UPDATE", "name": "histories_update_scope", "qual": "(security_admin_active() OR (teacher_id = current_teacher_id()))", "roles": "{authenticated}", "permissive": "PERMISSIVE", "with_check": "(security_admin_active() OR (teacher_id = current_teacher_id()))"}, {"cmd": "ALL", "name": "security_active_session", "qual": "( SELECT security_session_active() AS security_session_active)", "roles": "{authenticated}", "permissive": "RESTRICTIVE", "with_check": "security_session_active()"}, {"cmd": "DELETE", "name": "security_learning_delete", "qual": "security_learning_write_allowed()", "roles": "{authenticated}", "permissive": "RESTRICTIVE", "with_check": null}, {"cmd": "INSERT", "name": "security_learning_insert", "qual": null, "roles": "{authenticated}", "permissive": "RESTRICTIVE", "with_check": "security_learning_write_allowed()"}, {"cmd": "UPDATE", "name": "security_learning_update", "qual": "security_learning_write_allowed()", "roles": "{authenticated}", "permissive": "RESTRICTIVE", "with_check": "security_learning_write_allowed()"}]$expected_read_policies$::jsonb then raise exception 'HISTORY_READ_POLICY_INITPLAN_OR_PRESERVATION_MISMATCH'; end if;
end;
$history_view_preservation$;
notify pgrst,'reload schema';
commit;
