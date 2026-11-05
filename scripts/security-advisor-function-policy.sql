-- Reviewed advisor follow-up candidate. Root owns rollback trial/application.
-- Does NOT revoke EXECUTE rights, alter business guards, read customer rows,
-- create orders, send email, delete records or invoke these mutators.
-- 22 invokers: only pin search_path; keep source/ACL/identity unchanged.
-- 7 definer APIs: prepend strict session freshness, retaining all old checks.
-- Auth-only freshness for billing/withdrawal preserves their existing status
-- rules (e.g. cancellation by pending accounts); resource download uses the
-- existing authenticated-teacher session gate. Public anonymous downloads are
-- not an application flow: current call site is the authenticated app library.
begin;
set local lock_timeout='2s';
set local statement_timeout='20s';
set local search_path=pg_catalog;

do $advisor_followup$
declare
 item record;
 target record;
 before_source text;
 before_definition text;
 before_acl text;
 after_source text;
 after_definition text;
 guard text;
 where_at integer;
 order_at integer;
 path_count integer:=0;
 guard_count integer:=0;
 snapshots jsonb := $snapshots$
[
  {
    "schema_name": "clinical",
    "routine_name": "prevent_mutation",
    "identity_arguments": "",
    "definition_md5": "18a736aa9900318b226acac7e7acfc61",
    "owner": "postgres",
    "security_definer": false,
    "kind": "search-path-only",
    "helper": null
  },
  {
    "schema_name": "public",
    "routine_name": "billing_cycle_months",
    "identity_arguments": "p_billing_cycle text",
    "definition_md5": "9c8cb57b685519c742f7909663b380b2",
    "owner": "postgres",
    "security_definer": false,
    "kind": "search-path-only",
    "helper": null
  },
  {
    "schema_name": "public",
    "routine_name": "calculate_billing_period_end",
    "identity_arguments": "p_started_at timestamp with time zone, p_billing_months integer",
    "definition_md5": "47bee82c905cd5e3de00010f537208cf",
    "owner": "postgres",
    "security_definer": false,
    "kind": "search-path-only",
    "helper": null
  },
  {
    "schema_name": "public",
    "routine_name": "card_play_touch_updated_at",
    "identity_arguments": "",
    "definition_md5": "24f22f8dbade81efa3bce18fc41f4ce6",
    "owner": "postgres",
    "security_definer": false,
    "kind": "search-path-only",
    "helper": null
  },
  {
    "schema_name": "public",
    "routine_name": "cardlab_asset_usage_touch_updated_at",
    "identity_arguments": "",
    "definition_md5": "9efed4ecccda0c9d452998e3ef2ee7fd",
    "owner": "postgres",
    "security_definer": false,
    "kind": "search-path-only",
    "helper": null
  },
  {
    "schema_name": "public",
    "routine_name": "cardlab_categories_touch_updated_at",
    "identity_arguments": "",
    "definition_md5": "eb2c2d22a5e075ff0239e75109af601e",
    "owner": "postgres",
    "security_definer": false,
    "kind": "search-path-only",
    "helper": null
  },
  {
    "schema_name": "public",
    "routine_name": "cardlab_learning_touch_updated_at",
    "identity_arguments": "",
    "definition_md5": "e166d641c7fabb1d4f83cd4160314d70",
    "owner": "postgres",
    "security_definer": false,
    "kind": "search-path-only",
    "helper": null
  },
  {
    "schema_name": "public",
    "routine_name": "cardlab_motion_assets_touch_updated_at",
    "identity_arguments": "",
    "definition_md5": "a6f12909aad9e5f42c4ea8027ce77ee5",
    "owner": "postgres",
    "security_definer": false,
    "kind": "search-path-only",
    "helper": null
  },
  {
    "schema_name": "public",
    "routine_name": "cardlab_motion_categories_touch_updated_at",
    "identity_arguments": "",
    "definition_md5": "ce66800da8f93f066a7e6cdc5c527c6f",
    "owner": "postgres",
    "security_definer": false,
    "kind": "search-path-only",
    "helper": null
  },
  {
    "schema_name": "public",
    "routine_name": "get_client_stats",
    "identity_arguments": "p_teacher_id text",
    "definition_md5": "5ad803567f77b57cbf78385b089ead40",
    "owner": "postgres",
    "security_definer": false,
    "kind": "search-path-only",
    "helper": null
  },
  {
    "schema_name": "public",
    "routine_name": "get_my_teacher_payment_orders",
    "identity_arguments": "",
    "definition_md5": "7b0a5aae3b2b74d87d6480bb8a205a1b",
    "owner": "postgres",
    "security_definer": true,
    "kind": "sql-guard",
    "helper": "security_auth_session_active"
  },
  {
    "schema_name": "public",
    "routine_name": "get_schedules_by_date",
    "identity_arguments": "p_teacher_id text, p_date text",
    "definition_md5": "c8fe87544e37a87c882eff5179115865",
    "owner": "postgres",
    "security_definer": false,
    "kind": "search-path-only",
    "helper": null
  },
  {
    "schema_name": "public",
    "routine_name": "get_session_time_stats",
    "identity_arguments": "p_client_id text",
    "definition_md5": "c1eb3f99b2895a7c27e322bfb3373ce1",
    "owner": "postgres",
    "security_definer": false,
    "kind": "search-path-only",
    "helper": null
  },
  {
    "schema_name": "public",
    "routine_name": "increment_worksheet_download",
    "identity_arguments": "p_worksheet_id bigint, p_downloaded_count integer",
    "definition_md5": "789e429b7fe806985f19c3faa0cd319a",
    "owner": "postgres",
    "security_definer": true,
    "kind": "plpgsql-guard",
    "helper": "security_session_active"
  },
  {
    "schema_name": "public",
    "routine_name": "playlab_webp_assets_audit",
    "identity_arguments": "",
    "definition_md5": "cd845646fa925fb5bd44a96a35280d34",
    "owner": "postgres",
    "security_definer": false,
    "kind": "search-path-only",
    "helper": null
  },
  {
    "schema_name": "public",
    "routine_name": "playlab_webp_assets_touch_updated_at",
    "identity_arguments": "",
    "definition_md5": "a54be9b2360ac32a6fa6a9bfdbc7cda8",
    "owner": "postgres",
    "security_definer": false,
    "kind": "search-path-only",
    "helper": null
  },
  {
    "schema_name": "public",
    "routine_name": "request_teacher_payment_order",
    "identity_arguments": "p_plan_code text, p_billing_cycle text, p_note text",
    "definition_md5": "b1650bcb18e8f8ca419b164abe399c77",
    "owner": "postgres",
    "security_definer": true,
    "kind": "plpgsql-guard",
    "helper": "security_auth_session_active"
  },
  {
    "schema_name": "public",
    "routine_name": "set_app_terms_updated_at",
    "identity_arguments": "",
    "definition_md5": "c455333590a0369c6ec48d449850797f",
    "owner": "postgres",
    "security_definer": false,
    "kind": "search-path-only",
    "helper": null
  },
  {
    "schema_name": "public",
    "routine_name": "set_faq_updated_at",
    "identity_arguments": "",
    "definition_md5": "6f47c359eeb75b1876485bcae28e6365",
    "owner": "postgres",
    "security_definer": false,
    "kind": "search-path-only",
    "helper": null
  },
  {
    "schema_name": "public",
    "routine_name": "set_row_updated_at",
    "identity_arguments": "",
    "definition_md5": "536eedc8a587073b6be42a4e8a29ff56",
    "owner": "postgres",
    "security_definer": false,
    "kind": "search-path-only",
    "helper": null
  },
  {
    "schema_name": "public",
    "routine_name": "set_teacher_transfer_updated_at",
    "identity_arguments": "",
    "definition_md5": "2ac831af22f16b9c5d9831c0bde70eb3",
    "owner": "postgres",
    "security_definer": false,
    "kind": "search-path-only",
    "helper": null
  },
  {
    "schema_name": "public",
    "routine_name": "set_worksheet_updated_at",
    "identity_arguments": "",
    "definition_md5": "78f9d4477dfe1d595abf9401748c2714",
    "owner": "postgres",
    "security_definer": false,
    "kind": "search-path-only",
    "helper": null
  },
  {
    "schema_name": "public",
    "routine_name": "teacher_cancel_billing_request",
    "identity_arguments": "p_request_id bigint",
    "definition_md5": "98edb722824e6ea2a3b384d92226f03b",
    "owner": "postgres",
    "security_definer": true,
    "kind": "plpgsql-guard",
    "helper": "security_auth_session_active"
  },
  {
    "schema_name": "public",
    "routine_name": "teacher_create_billing_request",
    "identity_arguments": "p_plan_code text, p_billing_cycle text, p_request_note text",
    "definition_md5": "3aaacc8339d8e04259153c374a507bb9",
    "owner": "postgres",
    "security_definer": true,
    "kind": "plpgsql-guard",
    "helper": "security_auth_session_active"
  },
  {
    "schema_name": "public",
    "routine_name": "teacher_list_my_billing_requests",
    "identity_arguments": "",
    "definition_md5": "782e6f4a121f88b1200663c507c78f31",
    "owner": "postgres",
    "security_definer": true,
    "kind": "sql-guard",
    "helper": "security_auth_session_active"
  },
  {
    "schema_name": "public",
    "routine_name": "teacher_subscription_cycle_months",
    "identity_arguments": "p_billing_cycle text",
    "definition_md5": "b89a19f7a2561db0d5145c1a3f2f2fef",
    "owner": "postgres",
    "security_definer": false,
    "kind": "search-path-only",
    "helper": null
  },
  {
    "schema_name": "public",
    "routine_name": "teacher_subscription_limit",
    "identity_arguments": "p_plan_code text",
    "definition_md5": "d8847ebfbb1da7523d009fc157f4e9e9",
    "owner": "postgres",
    "security_definer": false,
    "kind": "search-path-only",
    "helper": null
  },
  {
    "schema_name": "public",
    "routine_name": "update_notice_timestamp",
    "identity_arguments": "",
    "definition_md5": "4fa7818c137bd29ee2abfd0d697b8da0",
    "owner": "postgres",
    "security_definer": false,
    "kind": "search-path-only",
    "helper": null
  },
  {
    "schema_name": "public",
    "routine_name": "withdraw_teacher_account",
    "identity_arguments": "p_confirmation_text text, p_reason text, p_confirm_delete boolean, p_confirm_retention boolean, p_confirm_irreversible boolean, p_confirm_force_cleanup boolean",
    "definition_md5": "bbce753eaca01b36fd92e7ca6d94dab9",
    "owner": "postgres",
    "security_definer": true,
    "kind": "plpgsql-guard",
    "helper": "security_auth_session_active"
  }
]
$snapshots$::jsonb;
begin
 if current_user<>'postgres' then raise exception 'VERIFIED_POSTGRES_OWNER_REQUIRED'; end if;
 if has_schema_privilege('anon','public','CREATE') or has_schema_privilege('authenticated','public','CREATE') then
  raise exception 'PUBLIC_SCHEMA_CREATE_MUST_BE_RESTRICTED'; end if;
 if to_regprocedure('public.security_auth_session_active()') is null or to_regprocedure('public.security_session_active()') is null then
  raise exception 'STRICT_SESSION_HELPERS_REQUIRED'; end if;
 -- Match every target before the first metadata change.
 for item in select * from jsonb_to_recordset(snapshots) as x(schema_name text,routine_name text,identity_arguments text,definition_md5 text,owner text,security_definer boolean,kind text,helper text) loop
  select p.oid,p.prosecdef,pg_get_userbyid(p.proowner) as owner,p.proconfig,pg_get_functiondef(p.oid) as definition
   into target from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname=item.schema_name and p.proname=item.routine_name and p.prokind='f'
     and pg_get_function_identity_arguments(p.oid)=item.identity_arguments;
  if target.oid is null or target.owner<>item.owner or target.prosecdef is distinct from item.security_definer
    or md5(target.definition)<>item.definition_md5 then raise exception 'ADVISOR_ROUTINE_SNAPSHOT_CHANGED'; end if;
  if item.kind='search-path-only' and (target.prosecdef or target.proconfig is not null) then
   raise exception 'SEARCH_PATH_TARGET_MUST_BE_UNCONFIGURED_INVOKER'; end if;
 end loop;
 for item in select * from jsonb_to_recordset(snapshots) as x(schema_name text,routine_name text,identity_arguments text,definition_md5 text,owner text,security_definer boolean,kind text,helper text) loop
  select p.oid,p.prosrc,pg_get_functiondef(p.oid) as definition,p.proacl::text as acl
   into target from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname=item.schema_name and p.proname=item.routine_name and p.prokind='f'
     and pg_get_function_identity_arguments(p.oid)=item.identity_arguments;
  before_source:=target.prosrc;before_definition:=target.definition;before_acl:=target.acl;
  if item.kind='search-path-only' then
   -- pg_temp is explicit last so a caller's temporary table cannot shadow public
   -- relations; pg_catalog is first for builtins. No extension references or
   -- dynamic SQL occur in these exact reviewed 22 bodies.
   execute format('alter function %I.%I(%s) set search_path to pg_catalog, public, pg_temp',item.schema_name,item.routine_name,item.identity_arguments);
   if (select prosrc from pg_proc where oid=target.oid) is distinct from before_source then
    raise exception 'SEARCH_PATH_CHANGE_MUST_PRESERVE_BODY'; end if;
   path_count:=path_count+1;
  else
   if item.kind='plpgsql-guard' then
    if strpos(before_source,E'\nbegin\n')=0 then raise exception 'OUTER_BLOCK_ANCHOR_CHANGED'; end if;
    guard:=format(E'\n    if public.%I() is distinct from true then\n        raise exception ''AUTH_SESSION_INACTIVE'' using errcode = ''42501'';\n    end if;\n',item.helper);
    after_source:=replace(before_source,E'\nbegin\n',E'\nbegin\n'||guard);
   elsif item.kind='sql-guard' then
    -- Both exact SQL bodies have one owner-filter WHERE and one ORDER BY.
    -- Parentheses preserve the original filter independent of operator order.
    if (select count(*) from regexp_matches(before_source,'\mwhere\M','gi'))<>1
      or (select count(*) from regexp_matches(before_source,'\morder\s+by\M','gi'))<>1 then
      raise exception 'SQL_OWNER_FILTER_SHAPE_CHANGED'; end if;
    where_at:=strpos(lower(before_source),'where');order_at:=strpos(lower(before_source),'order by');
    if where_at<1 or order_at<=where_at then raise exception 'SQL_OWNER_FILTER_ANCHOR_CHANGED'; end if;
    after_source:=substring(before_source from 1 for where_at-1)
      ||'WHERE public.security_auth_session_active() IS TRUE AND ('
      ||substring(before_source from where_at+5 for order_at-where_at-5)
      ||') '||substring(before_source from order_at);
   else raise exception 'UNKNOWN_ADVISOR_PATCH_KIND'; end if;
   if after_source=before_source or strpos(after_source,'AUTH_SESSION_INACTIVE')=0 and item.kind='plpgsql-guard' then
    raise exception 'SESSION_GUARD_NOT_ADDED'; end if;
   after_definition:=replace(before_definition,before_source,after_source);
   execute after_definition;
   guard_count:=guard_count+1;
  end if;
  if before_acl is distinct from (select proacl::text from pg_proc where oid=target.oid)
    or (select pg_get_userbyid(proowner) from pg_proc where oid=target.oid)<>item.owner
    or (select prosecdef from pg_proc where oid=target.oid) is distinct from item.security_definer then
    raise exception 'ADVISOR_PATCH_CHANGED_OWNER_ACL_OR_SECURITY_MODE'; end if;
 end loop;
 if path_count<>22 or guard_count<>7 then raise exception 'ADVISOR_PATCH_INCOMPLETE'; end if;
end;
$advisor_followup$;
-- Metadata only, no routine invocation or customer data.
select 'search_path_pinned_invokers' as check_name,count(*)::integer as checked
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where not p.prosecdef and n.nspname in ('public','clinical') and p.proconfig @> array['search_path=pg_catalog, public, pg_temp']
union all
select 'strict_freshness_guarded_definers',count(*)::integer
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in ('increment_worksheet_download','request_teacher_payment_order','teacher_cancel_billing_request','teacher_create_billing_request','withdraw_teacher_account','get_my_teacher_payment_orders','teacher_list_my_billing_requests')
 and (p.prosrc like '%public.security_auth_session_active()%' or p.prosrc like '%public.security_session_active()%');
commit;
