-- Private read-only advisor triage. Definitions remain in local output only.
-- Never publish response JSON, which could contain legacy implementation details.
-- No function is invoked and no customer row, privilege or object is changed.
begin transaction read only;
set local statement_timeout='15s';
set local search_path=pg_catalog;
with targets(schema_name,function_name) as (values
('clinical','prevent_mutation'),
 ('public','billing_cycle_months'),
 ('public','calculate_billing_period_end'),
 ('public','card_play_touch_updated_at'),
 ('public','cardlab_asset_usage_touch_updated_at'),
 ('public','cardlab_categories_touch_updated_at'),
 ('public','cardlab_learning_touch_updated_at'),
 ('public','cardlab_motion_assets_touch_updated_at'),
 ('public','cardlab_motion_categories_touch_updated_at'),
 ('public','current_teacher_id'),
 ('public','get_client_stats'),
 ('public','get_current_teacher_code'),
 ('public','get_current_teacher_id'),
 ('public','get_my_teacher_payment_orders'),
 ('public','get_schedules_by_date'),
 ('public','get_session_time_stats'),
 ('public','guard_teacher_self_service_fields'),
 ('public','handle_new_auth_user'),
 ('public','increment_worksheet_download'),
 ('public','is_admin_user'),
 ('public','is_current_teacher_paid'),
 ('public','playlab_webp_assets_audit'),
 ('public','playlab_webp_assets_touch_updated_at'),
 ('public','request_teacher_payment_order'),
 ('public','security_admin_active'),
 ('public','set_app_terms_updated_at'),
 ('public','set_faq_updated_at'),
 ('public','set_row_updated_at'),
 ('public','set_teacher_transfer_updated_at'),
 ('public','set_worksheet_updated_at'),
 ('public','teacher_cancel_billing_request'),
 ('public','teacher_create_billing_request'),
 ('public','teacher_list_my_billing_requests'),
 ('public','teacher_subscription_cycle_months'),
 ('public','teacher_subscription_limit'),
 ('public','teacher_transfer_is_admin_user'),
 ('public','update_notice_timestamp'),
 ('public','withdraw_teacher_account')
), routines as (
 select p.*,n.nspname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 join targets t on t.schema_name=n.nspname and t.function_name=p.proname
 where p.prokind='f'
)
select 'functions' as section,coalesce(jsonb_agg(jsonb_build_object(
 'schema',p.nspname,'name',p.proname,'identity',pg_get_function_identity_arguments(p.oid),
 'securityDefiner',p.prosecdef,'owner',pg_get_userbyid(p.proowner),
 'language',(select lanname from pg_language where oid=p.prolang),
 'config',p.proconfig,'acl',p.proacl::text,
 'anonExecute',has_function_privilege('anon',p.oid,'EXECUTE'),
 'authenticatedExecute',has_function_privilege('authenticated',p.oid,'EXECUTE'),
 'returnType',pg_get_function_result(p.oid),'definitionMd5',md5(pg_get_functiondef(p.oid)),
 'definition',pg_get_functiondef(p.oid),
 'triggerUsage',(select coalesce(jsonb_agg(jsonb_build_object('schema',ns.nspname,'table',c.relname,'trigger',tr.tgname,'enabled',tr.tgenabled)),'[]'::jsonb)
  from pg_trigger tr join pg_class c on c.oid=tr.tgrelid join pg_namespace ns on ns.oid=c.relnamespace where tr.tgfoid=p.oid),
 'policyUsage',(select coalesce(jsonb_agg(jsonb_build_object('schema',ns.nspname,'table',c.relname,'policy',pol.polname)),'[]'::jsonb)
  from pg_depend dep join pg_policy pol on dep.classid='pg_policy'::regclass and dep.objid=pol.oid
  join pg_class c on c.oid=pol.polrelid join pg_namespace ns on ns.oid=c.relnamespace
  where dep.refclassid='pg_proc'::regclass and dep.refobjid=p.oid)
 )),'[]'::jsonb) as data from routines p
union all
select 'schema_and_temp_privileges',jsonb_build_object(
 'anonPublicCreate',has_schema_privilege('anon','public','CREATE'),
 'authenticatedPublicCreate',has_schema_privilege('authenticated','public','CREATE'),
 'anonPublicUsage',has_schema_privilege('anon','public','USAGE'),
 'authenticatedClinicalUsage',case when to_regnamespace('clinical') is null then null else has_schema_privilege('authenticated','clinical','USAGE') end,
 'authenticatedTemp',has_database_privilege('authenticated',current_database(),'TEMP'));
rollback;
