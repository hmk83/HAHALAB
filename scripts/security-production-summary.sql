-- Read-only production metadata. Does not select customer rows or credentials.
select 'rpc' as category, p.proname as name,
       jsonb_build_object('signature', pg_get_function_identity_arguments(p.oid),
         'security_definer', p.prosecdef,
         'active_session_check', pg_get_functiondef(p.oid) ilike '%security_session_active%',
         'tenant_check', pg_get_functiondef(p.oid) ilike '%auth.uid%',
         'aal2_check', pg_get_functiondef(p.oid) ilike '%aal2%',
         'acl', p.proacl::text) as detail
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in ('security_session_active','get_my_teacher_profile','bind_current_user_to_teacher','is_admin_user','withdraw_teacher_account','apply_schedule_conflict_push','admin_manage_teacher_subscription','admin_process_teacher_billing_request','admin_record_teacher_subscription_payment')
union all
select 'table', c.relname,
       jsonb_build_object('rls',c.relrowsecurity,'force_rls',c.relforcerowsecurity,
         'policies',(select count(*) from pg_policies x where x.schemaname=n.nspname and x.tablename=c.relname),
         'active_session_policies',(select count(*) from pg_policies x where x.schemaname=n.nspname and x.tablename=c.relname and (coalesce(x.qual,'')||coalesce(x.with_check,'')) ilike '%security_session_active%'))
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in ('teachers','clients','schedules','histories','cardlab_learning_attempts','cardlab_learning_stage_progress','cardlab_learning_wrong_stats','app_terms_agreements','report_share_links','report_share_audit') and c.relkind in ('r','p')
order by category,name;
