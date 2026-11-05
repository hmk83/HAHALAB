-- Read-only targeted metadata. No customer rows, credentials or settings changed.
begin transaction read only;
set local statement_timeout='15s';
select 'runtime_privileges' as section, jsonb_build_object('current_user',current_user,
  'superuser',(select rolsuper from pg_roles where rolname=current_user),
  'bypassrls',(select rolbypassrls from pg_roles where rolname=current_user),
  'can_set_replication_role',has_parameter_privilege(current_user,'session_replication_role','SET'),
  'can_assume_authenticated',pg_has_role(current_user,'authenticated','MEMBER')) as data
union all
select 'helper_and_trigger_definitions',coalesce(jsonb_agg(jsonb_build_object('schema',n.nspname,
  'name',p.proname,'identity',pg_get_function_identity_arguments(p.oid),'security_definer',p.prosecdef,
  'owner',pg_get_userbyid(p.proowner),'definition_md5',md5(pg_get_functiondef(p.oid)),
  'definition',pg_get_functiondef(p.oid))),'[]'::jsonb)
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where p.prokind='f' and n.nspname='public' and p.proname in
 ('security_auth_session_active','current_teacher_id','get_current_teacher_id','is_admin_user',
  'handle_new_auth_user','enforce_teacher_identity_uniqueness','guard_teacher_self_service_fields','nullify_legacy_teacher_password')
union all
select 'target_constraints',coalesce(jsonb_agg(jsonb_build_object('schema',n.nspname,'table',c.relname,
  'constraint',co.conname,'type',co.contype,'definition',pg_get_constraintdef(co.oid))),'[]'::jsonb)
from pg_constraint co join pg_class c on c.oid=co.conrelid join pg_namespace n on n.oid=c.relnamespace
where (n.nspname='auth' and c.relname in ('users','sessions'))
   or (n.nspname='public' and c.relname in ('teachers','clients','schedules','histories'));
rollback;
