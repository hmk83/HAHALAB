-- Read-only function metadata, no routine invocation or customer rows.
select n.nspname as schema,p.proname as name,
 pg_get_function_identity_arguments(p.oid) as args,
 md5(pg_get_functiondef(p.oid)) as "definitionMd5",
 pg_get_userbyid(p.proowner) as owner,p.prosecdef as "securityDefiner",
 p.proconfig as config,p.proacl::text as acl
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname in ('public','clinical') and p.proname in ('prevent_mutation','billing_cycle_months','calculate_billing_period_end','card_play_touch_updated_at','cardlab_asset_usage_touch_updated_at','cardlab_categories_touch_updated_at','cardlab_learning_touch_updated_at','cardlab_motion_assets_touch_updated_at','cardlab_motion_categories_touch_updated_at','get_client_stats','get_my_teacher_payment_orders','get_schedules_by_date','get_session_time_stats','increment_worksheet_download','playlab_webp_assets_audit','playlab_webp_assets_touch_updated_at','request_teacher_payment_order','set_app_terms_updated_at','set_faq_updated_at','set_row_updated_at','set_teacher_transfer_updated_at','set_worksheet_updated_at','teacher_cancel_billing_request','teacher_create_billing_request','teacher_list_my_billing_requests','teacher_subscription_cycle_months','teacher_subscription_limit','update_notice_timestamp','withdraw_teacher_account')
order by n.nspname,p.proname,pg_get_function_identity_arguments(p.oid);
