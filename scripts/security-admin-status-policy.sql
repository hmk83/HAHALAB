-- Post-core exact-source status hardening. Keep four-status role/enrollment and
-- ordinary own read/billing/cancellation; global administration requires normal/active.
-- No customer rows or mutation RPC is invoked. Root applies after rollback dry-run.
begin;
set local lock_timeout='10s';
set local statement_timeout='30s';
set local search_path=pg_catalog;
do $admin_status_hardening$
declare
 target jsonb;
 p record;
 before_definition text;
 after_definition text;
 anchor text;
 replacement text;
 preserved jsonb := $preserved_admin_contracts$[{"schema": "clinical", "name": "current_teacher", "signature": "", "md5": "74934dd34d03da5f88379f115b9c099f", "acl": "{postgres=X/postgres}"}, {"schema": "clinical", "name": "require_teacher", "signature": "p_write boolean", "md5": "fb5b65f08460e98de33df9ac4eb6ed33", "acl": "{postgres=X/postgres}"}, {"schema": "hahalab_security", "name": "record_teacher_subscription_payment_internal", "signature": "p_teacher_id text, p_plan_code text, p_billing_cycle text, p_paid_at timestamp with time zone, p_amount_krw integer, p_note text, p_payment_request_id bigint, p_payment_source text", "md5": "f8cd1680a807d843c1dca9c712edf9ec", "acl": "{postgres=X/postgres}"}, {"schema": "public", "name": "is_admin_user", "signature": "", "md5": "412d586a4005f7ece865c8d8701beb6f", "acl": "{postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}"}]$preserved_admin_contracts$::jsonb;
 snapshots jsonb := $admin_status_snapshots$[
  {
    "schema": "public",
    "name": "admin_cancel_teacher_payment_order",
    "signature": "p_order_id bigint, p_note text",
    "md5": "293ee68fffafdbb15fc19cfafb2c990c",
    "acl": "{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}",
    "mode": "admin-entry"
  },
  {
    "schema": "public",
    "name": "admin_manage_teacher_subscription",
    "signature": "p_teacher_id text, p_action text, p_plan_code text, p_paid_at timestamp with time zone, p_note text",
    "md5": "f08ec56eb377031f61882586f1c8fbc9",
    "acl": "{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}",
    "mode": "admin-entry"
  },
  {
    "schema": "public",
    "name": "admin_manage_teacher_subscription",
    "signature": "p_teacher_pk bigint, p_action text, p_target_plan_code text, p_paid_at timestamp with time zone, p_note text, p_actor_label text",
    "md5": "6a6cbd925009543bdfc2e36527dd9450",
    "acl": "{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}",
    "mode": "admin-entry"
  },
  {
    "schema": "public",
    "name": "admin_process_teacher_billing_request",
    "signature": "p_request_id bigint, p_decision text, p_amount_krw integer, p_note text",
    "md5": "fa48b7155cc37639ede11e21fba8fb7d",
    "acl": "{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}",
    "mode": "admin-entry"
  },
  {
    "schema": "public",
    "name": "admin_record_teacher_payment",
    "signature": "p_teacher_pk bigint, p_plan_code text, p_billing_cycle text, p_paid_at timestamp with time zone, p_note text, p_order_id bigint, p_payment_method text",
    "md5": "fb8688cee956f411db6d9dd78f1fc817",
    "acl": "{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}",
    "mode": "admin-entry"
  },
  {
    "schema": "public",
    "name": "admin_record_teacher_subscription_payment",
    "signature": "p_teacher_id text, p_plan_code text, p_billing_cycle text, p_paid_at timestamp with time zone, p_amount_krw integer, p_note text, p_payment_request_id bigint, p_payment_source text",
    "md5": "68ad97eb98e9602128115d65c8de32bd",
    "acl": "{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}",
    "mode": "admin-entry"
  },
  {
    "schema": "public",
    "name": "admin_reset_dataset",
    "signature": "p_target text",
    "md5": "32864d2aabb2c628d961eb5ff67d17f4",
    "acl": "{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}",
    "mode": "admin-entry"
  },
  {
    "schema": "public",
    "name": "record_cardlab_asset_usage",
    "signature": "p_client_id text, p_teacher_id text, p_asset_id text, p_interaction text",
    "md5": "07bbd2551dddf58ee9df5b771795980d",
    "acl": "{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}",
    "mode": "cross-actor"
  },
  {
    "schema": "public",
    "name": "record_cardlab_learning_attempt",
    "signature": "p_client_id text, p_teacher_id text, p_curriculum_key text, p_stage_key text, p_stage_order integer, p_stage_title text, p_total_questions integer, p_correct_count integer, p_wrong_count integer, p_score integer, p_cleared boolean, p_duration_seconds integer, p_wrong_asset_ids text[], p_wrong_words text[], p_question_snapshot jsonb, p_result_snapshot jsonb",
    "md5": "34178aa0aeaf95196457ab08e1b3d89c",
    "acl": "{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}",
    "mode": "cross-actor"
  },
  {
    "schema": "public",
    "name": "security_admin_active",
    "signature": "",
    "md5": "ad98f096318b4971adb9f955acfa6161",
    "acl": "{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres,anon=X/postgres}",
    "mode": "admin-helper"
  }
]$admin_status_snapshots$::jsonb;
begin
 if current_user<>'postgres' then raise exception 'VERIFIED_POSTGRES_OWNER_REQUIRED'; end if;
 for target in select value from jsonb_array_elements(preserved) loop
  select pg_get_functiondef(f.oid) as definition,f.proacl::text as acl,pg_get_userbyid(f.proowner) as owner into p from pg_proc f join pg_namespace n on n.oid=f.pronamespace where n.nspname=target->>'schema' and f.proname=target->>'name' and pg_get_function_identity_arguments(f.oid)=target->>'signature';
  if not found or p.owner<>'postgres' or md5(p.definition)<>target->>'md5' or p.acl is distinct from target->>'acl' then raise exception 'PRESERVED_ROLE_BILLING_CLINICAL_CONTRACT_CHANGED'; end if;
 end loop;
 for target in select value from jsonb_array_elements(snapshots) loop
  select f.oid,pg_get_functiondef(f.oid) as definition,f.proacl::text as acl,pg_get_userbyid(f.proowner) as owner into p from pg_proc f join pg_namespace n on n.oid=f.pronamespace where n.nspname=target->>'schema' and f.proname=target->>'name' and pg_get_function_identity_arguments(f.oid)=target->>'signature';
  if not found or p.owner<>'postgres' or md5(p.definition)<>target->>'md5' or p.acl is distinct from target->>'acl' then raise exception 'ADMIN_STATUS_SOURCE_SNAPSHOT_MISMATCH: %.%',target->>'schema',target->>'name'; end if;
 end loop;
 for target in select value from jsonb_array_elements(snapshots) loop
  select f.oid,pg_get_functiondef(f.oid) as definition,f.proacl::text as acl into p from pg_proc f join pg_namespace n on n.oid=f.pronamespace where n.nspname=target->>'schema' and f.proname=target->>'name' and pg_get_function_identity_arguments(f.oid)=target->>'signature';
  if md5(p.definition)<>target->>'md5' or p.acl is distinct from target->>'acl' then raise exception 'ADMIN_STATUS_SOURCE_CHANGED_DURING_PATCH'; end if;
  before_definition:=p.definition;
  if target->>'mode'='admin-helper' then
   anchor:=$anchor$    and public.is_admin_user() is true
$anchor$;
   replacement:=anchor||$replacement$    and exists (select 1 from public.teachers t where t.auth_user_id=auth.uid()
      and lower(coalesce(t.role,'teacher'))='admin'
      and lower(coalesce(t.status,'')) in ('normal','active') and t.withdrawn_at is null)
$replacement$;
  elsif target->>'mode'='admin-entry' then
   anchor:=$anchor$    if (auth.jwt() ->> 'aal') is distinct from 'aal2' then
        raise exception 'MFA_REQUIRED' using errcode = '42501';
    end if;
$anchor$;
   replacement:=anchor||$replacement$    if public.security_admin_active() is distinct from true then
        raise exception 'ADMIN_ACTIVE_ACCOUNT_REQUIRED' using errcode = '42501';
    end if;
$replacement$;
  elsif target->>'mode'='cross-actor' then
   anchor:=$anchor$if public.is_admin_user() is distinct from true or (auth.jwt() ->> 'aal') is distinct from 'aal2' then$anchor$;
   replacement:='if public.security_admin_active() is distinct from true then';
  else raise exception 'UNKNOWN_ADMIN_STATUS_PATCH'; end if;
  if (length(before_definition)-length(replace(before_definition,anchor,'')))/length(anchor)<>1 then raise exception 'ADMIN_STATUS_ANCHOR_MISMATCH'; end if;
  after_definition:=replace(before_definition,anchor,replacement);
  execute after_definition;
  if (select proacl::text from pg_proc where oid=p.oid) is distinct from target->>'acl' then raise exception 'ADMIN_STATUS_ACL_CHANGED'; end if;
 end loop;
 for target in select value from jsonb_array_elements(preserved) loop
  select pg_get_functiondef(f.oid) as definition,f.proacl::text as acl,pg_get_userbyid(f.proowner) as owner into p from pg_proc f join pg_namespace n on n.oid=f.pronamespace where n.nspname=target->>'schema' and f.proname=target->>'name' and pg_get_function_identity_arguments(f.oid)=target->>'signature';
  if not found or p.owner<>'postgres' or md5(p.definition)<>target->>'md5' or p.acl is distinct from target->>'acl' then raise exception 'PRESERVED_ROLE_BILLING_CLINICAL_CONTRACT_CHANGED'; end if;
 end loop;
end;
$admin_status_hardening$;
commit;
