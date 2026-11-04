-- Exact operating RLS snapshot: require AAL2 only for global administrator paths.
-- Ordinary owner and intended public-read alternatives are preserved bytewise.
-- The legacy app_terms ALL authenticated policy otherwise bypasses admin writes;
-- it is narrowed to the same verified administrator gate, with public SELECTs kept.
-- Root dry-runs/applies. No business mutation RPC or customer row is queried.
begin;
set local lock_timeout = '10s';
set local statement_timeout = '30s';
-- pg_policies deparsing must use the same public visibility as the captured snapshot.
set local search_path = public, pg_catalog;
do $direct_admin_rls_preflight$
begin
  if current_user <> 'postgres' then raise exception 'VERIFIED_POSTGRES_OWNER_REQUIRED'; end if;
  if to_regprocedure('public.security_session_active()') is null or to_regprocedure('public.is_admin_user()') is null then
    raise exception 'STRICT_SESSION_AND_ROLE_GATES_REQUIRED';
  end if;
  if to_regprocedure('public.security_admin_active()') is not null then
    raise exception 'ADMIN_ACTIVE_HELPER_ALREADY_EXISTS_REVIEW_REQUIRED';
  end if;
end;
$direct_admin_rls_preflight$;
create function public.security_admin_active()
returns boolean language sql stable security definer set search_path = ''
as $admin_active$
  select coalesce(public.security_session_active() is true
    and public.is_admin_user() is true
    and (auth.jwt() ->> 'aal') = 'aal2', false);
$admin_active$;
-- Anonymous permission is required by existing public SELECT policies, and only
-- yields false: an absent account/session/AAL2 never receives administrator access.
revoke all on function public.security_admin_active() from public, anon;
grant execute on function public.security_admin_active() to anon, authenticated;
do $direct_admin_rls_hardening$
declare
  target jsonb;
  actual record;
  actual_md5 text;
  new_using text;
  new_check text;
  statement text;
  changed integer := 0;
  snapshots jsonb := $policy_snapshots$
[
  {
    "cmd": "DELETE",
    "name": "activity_logs_delete_admin_only",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "activity_logs",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "b925aff4b0b15a62c9f61cca4e5a63ca",
    "mode": "admin-branch"
  },
  {
    "cmd": "INSERT",
    "name": "activity_logs_insert_admin_or_self",
    "qual": null,
    "roles": [
      "authenticated"
    ],
    "table": "activity_logs",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "(is_admin_user() OR ((teacher_name IS NOT NULL) AND (teacher_name = ( SELECT t.name\n   FROM teachers t\n  WHERE (t.auth_user_id = auth.uid())\n LIMIT 1))))",
    "expected_md5": "9e1ea6c2844b1b1765a25b5d1867064c",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "activity_logs_select_admin_only",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "activity_logs",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "32fe06479bb69b37d626718a8db7b8ca",
    "mode": "admin-branch"
  },
  {
    "cmd": "UPDATE",
    "name": "activity_logs_update_admin_only",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "activity_logs",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "29c2f735edf74e3df4e554de53df102c",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "app_message_categories_admin_manage",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "app_message_categories",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "b320e8ff838cdee148ce12af4b435f73",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "app_message_categories_public_select",
    "qual": "(is_admin_user() OR (is_active = true))",
    "roles": [
      "anon",
      "authenticated"
    ],
    "table": "app_message_categories",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "e03ae96fe606765267325f0cb58280ce",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "app_message_reads_admin_manage",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "app_message_reads",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "17f541e34aa2f58edc7ba0db00037508",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "app_message_targets_admin_manage",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "app_message_targets",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "f289e7ce4730e09b0c8a21f971e801ba",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "app_messages_admin_manage",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "app_messages",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "e037be5d17438b3f350e3ff7bef6bd33",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "app_messages_public_select",
    "qual": "(is_admin_user() OR ((is_hidden = false) AND (COALESCE(scheduled_at, created_at) <= now()) AND ((delivery_scope = 'public'::text) OR ((delivery_scope = 'teacher'::text) AND (auth.role() = 'authenticated'::text) AND ((recipient_scope = 'all_members'::text) OR ((recipient_scope = 'paid_members'::text) AND is_current_teacher_paid()) OR ((recipient_scope = 'selected_users'::text) AND (EXISTS ( SELECT 1\n   FROM app_message_targets target\n  WHERE ((target.message_id = app_messages.id) AND (target.teacher_id = get_current_teacher_id()))))))))))",
    "roles": [
      "anon",
      "authenticated"
    ],
    "table": "app_messages",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "d93f7cbb526fed33732f6630725d38c8",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "app_settings_all_admin",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "app_settings",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "4e61a748055cc7d3fbdd50b69d98fa6d",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "app_settings_select_admin",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "app_settings",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "165d3fb56f84bbd0ffc5e19d4370b45d",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "Allow authenticated full access",
    "qual": "(auth.role() = 'authenticated'::text)",
    "roles": [
      "public"
    ],
    "table": "app_terms",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "8c64a0109dd1772580ad686d304035c0",
    "mode": "legacy-authenticated-all"
  },
  {
    "cmd": "ALL",
    "name": "app_terms_write_admin_only",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "app_terms",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "94ebe632fb9a14494895e3a358b032bb",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "app_terms_agreements_select_admin_only",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "app_terms_agreements",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "03d6b27ca66ac024e592634eb793a786",
    "mode": "admin-branch"
  },
  {
    "cmd": "DELETE",
    "name": "audit_logs_delete_admin_only",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "audit_logs",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "068445065b6a2e56a92cd1d5c2273aee",
    "mode": "admin-branch"
  },
  {
    "cmd": "INSERT",
    "name": "audit_logs_insert_admin_only",
    "qual": null,
    "roles": [
      "authenticated"
    ],
    "table": "audit_logs",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "2aec1823f24d32969c24d8f64a70aefe",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "audit_logs_select_admin_only",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "audit_logs",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "1e72b84d7d31db5736ae71729248796a",
    "mode": "admin-branch"
  },
  {
    "cmd": "UPDATE",
    "name": "audit_logs_update_admin_only",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "audit_logs",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "decd17d4830d94a1148a13821c898223",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "card_play_categories_admin_all",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "card_play_categories",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "eeaa1502020cd84c92e6b59d83023458",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "card_play_contents_admin_all",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "card_play_contents",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "d96d70faacce6ce20fe8052d861b3ee5",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "cardlab_asset_usage_admin_all",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "cardlab_asset_usage",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "327d0668a31e63be97877f527921d1e3",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "cardlab_asset_usage_select_own",
    "qual": "(is_admin_user() OR (EXISTS ( SELECT 1\n   FROM teachers\n  WHERE ((teachers.auth_user_id = auth.uid()) AND (teachers.teacher_id = cardlab_asset_usage.teacher_id)))))",
    "roles": [
      "authenticated"
    ],
    "table": "cardlab_asset_usage",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "a4b468014663c77d03c985436cec1df0",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "cardlab_categories_admin_all",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "cardlab_categories",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "6e4568f5c441a163c01518bedea95dbe",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "cardlab_learning_attempts_admin_all",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "cardlab_learning_attempts",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "a783ea58c02b623354e04f60c67430f0",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "cardlab_learning_attempts_select_own",
    "qual": "(is_admin_user() OR (EXISTS ( SELECT 1\n   FROM teachers\n  WHERE ((teachers.auth_user_id = auth.uid()) AND (teachers.teacher_id = cardlab_learning_attempts.teacher_id)))))",
    "roles": [
      "authenticated"
    ],
    "table": "cardlab_learning_attempts",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "523687b480a73d4f5d63272c3da2c4c4",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "cardlab_learning_stage_progress_admin_all",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "cardlab_learning_stage_progress",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "e7f14ac6db79679cec3af40912137b6c",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "cardlab_learning_stage_progress_select_own",
    "qual": "(is_admin_user() OR (EXISTS ( SELECT 1\n   FROM teachers\n  WHERE ((teachers.auth_user_id = auth.uid()) AND (teachers.teacher_id = cardlab_learning_stage_progress.teacher_id)))))",
    "roles": [
      "authenticated"
    ],
    "table": "cardlab_learning_stage_progress",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "6eabd7b68c247dde158662247ca67b10",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "cardlab_learning_wrong_stats_admin_all",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "cardlab_learning_wrong_stats",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "a90ab7abbe4ab06897331300d49691de",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "cardlab_learning_wrong_stats_select_own",
    "qual": "(is_admin_user() OR (EXISTS ( SELECT 1\n   FROM teachers\n  WHERE ((teachers.auth_user_id = auth.uid()) AND (teachers.teacher_id = cardlab_learning_wrong_stats.teacher_id)))))",
    "roles": [
      "authenticated"
    ],
    "table": "cardlab_learning_wrong_stats",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "922628dbda30546d9cdb546e7c68630c",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "cardlab_motion_assets_admin_all",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "cardlab_motion_assets",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "2a6442a31b201495652fc870a8c90547",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "cardlab_motion_assets_select_public",
    "qual": "((COALESCE(is_active, true) = true) OR is_admin_user())",
    "roles": [
      "anon",
      "authenticated"
    ],
    "table": "cardlab_motion_assets",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "7eacd18e73dd91924332d81394d1e539",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "cardlab_motion_categories_admin_all",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "cardlab_motion_categories",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "b692257e4853286fe4bccac497190da7",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "cardlab_motion_categories_select_public",
    "qual": "((COALESCE(is_active, true) = true) OR is_admin_user())",
    "roles": [
      "anon",
      "authenticated"
    ],
    "table": "cardlab_motion_categories",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "00406e8c883987697bf2a26aa11662a9",
    "mode": "admin-branch"
  },
  {
    "cmd": "DELETE",
    "name": "clients_delete_scope",
    "qual": "(is_admin_user() OR (teacher_id = current_teacher_id()))",
    "roles": [
      "authenticated"
    ],
    "table": "clients",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "46aa8dc3877a520f96ce51363fa84b32",
    "mode": "admin-branch"
  },
  {
    "cmd": "INSERT",
    "name": "clients_insert_scope",
    "qual": null,
    "roles": [
      "authenticated"
    ],
    "table": "clients",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "(is_admin_user() OR (teacher_id = current_teacher_id()))",
    "expected_md5": "15aa5173be5196980a9ad1527c0348c4",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "clients_select_scope",
    "qual": "(is_admin_user() OR (teacher_id = current_teacher_id()))",
    "roles": [
      "authenticated"
    ],
    "table": "clients",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "1ca7fdc2c0ecde1fab3aaa5af27a25ef",
    "mode": "admin-branch"
  },
  {
    "cmd": "UPDATE",
    "name": "clients_update_scope",
    "qual": "(is_admin_user() OR (teacher_id = current_teacher_id()))",
    "roles": [
      "authenticated"
    ],
    "table": "clients",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "(is_admin_user() OR (teacher_id = current_teacher_id()))",
    "expected_md5": "f494cfb738d614e4918c7be99213811a",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "faq_categories_admin_all",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "faq_categories",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "75c11ee8d3a7d9360dbbf5bca34df249",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "faq_items_admin_all",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "faq_items",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "c4b032ab4f25337776ddcb911b88feb3",
    "mode": "admin-branch"
  },
  {
    "cmd": "DELETE",
    "name": "histories_delete_scope",
    "qual": "(is_admin_user() OR (teacher_id = current_teacher_id()))",
    "roles": [
      "authenticated"
    ],
    "table": "histories",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "342f38a5310a0df9bd96d9c1367bb183",
    "mode": "admin-branch"
  },
  {
    "cmd": "INSERT",
    "name": "histories_insert_scope",
    "qual": null,
    "roles": [
      "authenticated"
    ],
    "table": "histories",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "(is_admin_user() OR (teacher_id = current_teacher_id()))",
    "expected_md5": "17c6b8d12c7c60a49044f0ec435b2d1e",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "histories_select_scope",
    "qual": "(is_admin_user() OR (teacher_id = current_teacher_id()))",
    "roles": [
      "authenticated"
    ],
    "table": "histories",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "d7cb134796528bb1f48bad5cf6d14d8b",
    "mode": "admin-branch"
  },
  {
    "cmd": "UPDATE",
    "name": "histories_update_scope",
    "qual": "(is_admin_user() OR (teacher_id = current_teacher_id()))",
    "roles": [
      "authenticated"
    ],
    "table": "histories",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "(is_admin_user() OR (teacher_id = current_teacher_id()))",
    "expected_md5": "e0bff11c1b8c873c33d8ef441d711dac",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "notices_write_admin_only",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "notices",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "eee8136d3f8078248433bf079a47c310",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "play_categories_write_admin_only",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "play_categories",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "a6183992f134ef8d8c6995460c3ce12d",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "play_contents_write_admin_only",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "play_contents",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "0e899e8fdaa3f38cc52b5d6b3b090ec3",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "playlab_webp_asset_logs_admin_all",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "playlab_webp_asset_logs",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "624a825d0eebab2ffb9798a68efc8869",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "playlab_webp_assets_admin_all",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "playlab_webp_assets",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "76afdf37d0bacf5ff602d5c8296572d9",
    "mode": "admin-branch"
  },
  {
    "cmd": "DELETE",
    "name": "schedules_delete_scope",
    "qual": "(is_admin_user() OR (teacher_id = current_teacher_id()))",
    "roles": [
      "authenticated"
    ],
    "table": "schedules",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "a73828f33de0444f5f8163408d720394",
    "mode": "admin-branch"
  },
  {
    "cmd": "INSERT",
    "name": "schedules_insert_scope",
    "qual": null,
    "roles": [
      "authenticated"
    ],
    "table": "schedules",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "(is_admin_user() OR (teacher_id = current_teacher_id()))",
    "expected_md5": "49edd7b348efd6df6704d3e18f196c1d",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "schedules_select_scope",
    "qual": "(is_admin_user() OR (teacher_id = current_teacher_id()))",
    "roles": [
      "authenticated"
    ],
    "table": "schedules",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "5d7c0a3cc76f5575e667eea88c9328ee",
    "mode": "admin-branch"
  },
  {
    "cmd": "UPDATE",
    "name": "schedules_update_scope",
    "qual": "(is_admin_user() OR (teacher_id = current_teacher_id()))",
    "roles": [
      "authenticated"
    ],
    "table": "schedules",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "(is_admin_user() OR (teacher_id = current_teacher_id()))",
    "expected_md5": "73adc8b61f6632e3b7182549fd4ca010",
    "mode": "admin-branch"
  },
  {
    "cmd": "DELETE",
    "name": "teacher_billing_requests_admin_delete",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "teacher_billing_requests",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "bc77e7110179ad19338bdc1b23b80e27",
    "mode": "admin-branch"
  },
  {
    "cmd": "INSERT",
    "name": "teacher_billing_requests_admin_insert",
    "qual": null,
    "roles": [
      "authenticated"
    ],
    "table": "teacher_billing_requests",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "fd71fb82ad8faf0da5dbd31856697d20",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "teacher_billing_requests_admin_select",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "teacher_billing_requests",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "7b4dabdd32c150c418d7d9b718426101",
    "mode": "admin-branch"
  },
  {
    "cmd": "UPDATE",
    "name": "teacher_billing_requests_admin_update",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "teacher_billing_requests",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "5a37ac83b60aa0384e6024171f297c67",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "teacher_payment_order_events_select_admin",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "teacher_payment_order_events",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "09fbd7e0db5c69b841c13967492549f0",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "teacher_payment_orders_select_admin",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "teacher_payment_orders",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "39f6bba7d0e79b462d4f6a76343ec1f0",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "teacher_subscription_logs_select_admin",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "teacher_subscription_logs",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "550594a7a10fcc38008968ba0178b5a8",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "teacher_subscription_logs_write_admin",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "teacher_subscription_logs",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "e6e7f7b47b0f61a6f90860c63957bd2e",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "teacher_transfer_requests_select",
    "qual": "((source_teacher_id = get_current_teacher_code()) OR (target_teacher_id = get_current_teacher_code()) OR teacher_transfer_is_admin_user())",
    "roles": [
      "authenticated"
    ],
    "table": "teacher_transfer_requests",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "4c6138d3afac73b40c5e183f28070fb7",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "teacher_withdrawal_archives_admin_all",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "teacher_withdrawal_archives",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "ee539ae4f355572fb104f2a702d66e66",
    "mode": "admin-branch"
  },
  {
    "cmd": "DELETE",
    "name": "teachers_delete_admin",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "teachers",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "4fa58fdf73376c4ed0640d3de7f37fc4",
    "mode": "admin-branch"
  },
  {
    "cmd": "DELETE",
    "name": "teachers_delete_admin_only",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "teachers",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "7a3c9de8677b96a53b4c94e16d3b2df1",
    "mode": "admin-branch"
  },
  {
    "cmd": "INSERT",
    "name": "teachers_insert_admin",
    "qual": null,
    "roles": [
      "authenticated"
    ],
    "table": "teachers",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "f2dab6c9e3a59081ec6ec8cdcfd69901",
    "mode": "admin-branch"
  },
  {
    "cmd": "INSERT",
    "name": "teachers_insert_self_or_admin",
    "qual": null,
    "roles": [
      "authenticated"
    ],
    "table": "teachers",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "(is_admin_user() OR ((auth.uid() = auth_user_id) AND (lower(COALESCE(role, 'teacher'::text)) = 'teacher'::text) AND (email IS NOT NULL) AND (lower(email) = lower(COALESCE((auth.jwt() ->> 'email'::text), ''::text)))))",
    "expected_md5": "d48cde01789992f218e5057ca8bf0f9c",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "teachers_select_admin",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "teachers",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "44274003126d4edefbdb2050997f895f",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "teachers_select_self_or_admin",
    "qual": "(is_admin_user() OR (auth.uid() = auth_user_id) OR ((auth_user_id IS NULL) AND (email IS NOT NULL) AND (lower(email) = lower(COALESCE((auth.jwt() ->> 'email'::text), ''::text)))))",
    "roles": [
      "authenticated"
    ],
    "table": "teachers",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "3729b63ea944445e54cbda7ae0942472",
    "mode": "admin-branch"
  },
  {
    "cmd": "UPDATE",
    "name": "teachers_update_admin",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "teachers",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "1f1b798f47d02dbbaa6ae60e78c920ae",
    "mode": "admin-branch"
  },
  {
    "cmd": "UPDATE",
    "name": "teachers_update_self_or_admin",
    "qual": "(is_admin_user() OR (auth.uid() = auth_user_id) OR ((auth_user_id IS NULL) AND (email IS NOT NULL) AND (lower(email) = lower(COALESCE((auth.jwt() ->> 'email'::text), ''::text)))))",
    "roles": [
      "authenticated"
    ],
    "table": "teachers",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "(is_admin_user() OR (auth.uid() = auth_user_id) OR ((auth_user_id IS NULL) AND (email IS NOT NULL) AND (lower(email) = lower(COALESCE((auth.jwt() ->> 'email'::text), ''::text)))))",
    "expected_md5": "0e2bff412b6b1db3de0f2f65db26c78b",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "worksheet_categories_admin_all",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "worksheet_categories",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "1ccddcd98467ffdfc9db0ff7c09d7d2c",
    "mode": "admin-branch"
  },
  {
    "cmd": "SELECT",
    "name": "worksheet_download_logs_admin_select",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "worksheet_download_logs",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": null,
    "expected_md5": "434c7d3b34383c9cb3e7f5faf9f17dd2",
    "mode": "admin-branch"
  },
  {
    "cmd": "ALL",
    "name": "worksheets_admin_all",
    "qual": "is_admin_user()",
    "roles": [
      "authenticated"
    ],
    "table": "worksheets",
    "schema": "public",
    "permissive": "PERMISSIVE",
    "with_check": "is_admin_user()",
    "expected_md5": "918ea7eca956158d0dd3be9167e88180",
    "mode": "admin-branch"
  }
]
$policy_snapshots$::jsonb;
begin
  -- Validate all affected policies before replacing any. Added restrictive
  -- session/write policies are intentionally not modified or counted as drift.
  for target in select value from jsonb_array_elements(snapshots) loop
    select p.*, c.relrowsecurity, pg_get_userbyid(c.relowner) as table_owner into actual
      from pg_policies p join pg_namespace n on n.nspname = p.schemaname
      join pg_class c on c.relnamespace = n.oid and c.relname = p.tablename
     where p.schemaname = target->>'schema' and p.tablename = target->>'table'
       and p.policyname = target->>'name';
    if not found or actual.table_owner <> 'postgres' or not actual.relrowsecurity then
      raise exception 'RLS_POLICY_OWNER_OR_RLS_MISMATCH: %.%:%', target->>'schema', target->>'table', target->>'name';
    end if;
    actual_md5 := md5(array_to_string(array[actual.schemaname::text, actual.tablename::text, actual.policyname::text,
      actual.cmd::text, actual.permissive::text, actual.roles::text, coalesce(actual.qual, '<NULL>'), coalesce(actual.with_check, '<NULL>')]::text[], chr(31)));
    if actual_md5 <> target->>'expected_md5' then
      raise exception 'RLS_POLICY_SNAPSHOT_MISMATCH: %.%:%', target->>'schema', target->>'table', target->>'name'
        using detail = jsonb_build_object('actual_md5',actual_md5,'expected_md5',target->>'expected_md5',
          'roles',actual.roles::text,'qual_md5',md5(actual.qual),'check_md5',md5(actual.with_check),
          'search_path',current_setting('search_path'))::text;
    end if;
  end loop;
  for target in select value from jsonb_array_elements(snapshots) loop
    select p.* into actual from pg_policies p
     where p.schemaname = target->>'schema' and p.tablename = target->>'table'
       and p.policyname = target->>'name';
    if not found then raise exception 'RLS_POLICY_DISAPPEARED_DURING_PATCH'; end if;
    actual_md5 := md5(array_to_string(array[actual.schemaname::text, actual.tablename::text, actual.policyname::text,
      actual.cmd::text, actual.permissive::text, actual.roles::text, coalesce(actual.qual, '<NULL>'), coalesce(actual.with_check, '<NULL>')]::text[], chr(31)));
    if actual_md5 <> target->>'expected_md5' then
      raise exception 'RLS_POLICY_CHANGED_DURING_PATCH: %.%:%', target->>'schema', target->>'table', target->>'name';
    end if;
    new_using := target->>'qual';
    new_check := target->>'with_check';
    if target->>'mode' = 'legacy-authenticated-all' then
      new_using := 'security_admin_active()';
      new_check := 'security_admin_active()';
    else
      -- Replace the longer alias first; its suffix contains is_admin_user().
      new_using := replace(replace(new_using, 'teacher_transfer_is_admin_user()', 'security_admin_active()'), 'is_admin_user()', 'security_admin_active()');
      new_check := replace(replace(new_check, 'teacher_transfer_is_admin_user()', 'security_admin_active()'), 'is_admin_user()', 'security_admin_active()');
    end if;
    statement := format('alter policy %I on %I.%I', target->>'name', target->>'schema', target->>'table');
    if new_using is not null then statement := statement || format(' using (%s)', new_using); end if;
    if new_check is not null then statement := statement || format(' with check (%s)', new_check); end if;
    execute statement;
    changed := changed + 1;
  end loop;
  if changed <> 74 then raise exception 'RLS_POLICY_REPLACEMENT_COUNT_MISMATCH'; end if;
  if public.security_admin_active() is distinct from false and auth.uid() is null then
    raise exception 'ANONYMOUS_ADMIN_GATE_MUST_BE_FALSE';
  end if;
end;
$direct_admin_rls_hardening$;
-- Metadata only. is_admin_user remains a plain role flag for MFA enrollment.
select p.schemaname, p.tablename, p.policyname, p.cmd, p.roles,
       (coalesce(p.qual, '') like '%security_admin_active()%'
        or coalesce(p.with_check, '') like '%security_admin_active()%') as admin_mfa_gate
from pg_policies p where p.schemaname = 'public'
  and (coalesce(p.qual, '') like '%security_admin_active()%'
       or coalesce(p.with_check, '') like '%security_admin_active()%')
order by p.tablename, p.policyname;
commit;
