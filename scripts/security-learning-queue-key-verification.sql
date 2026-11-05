-- Metadata only. Never invoke key-returning RPC or select key/owner/ID values.
select 'routine_metadata' as section,jsonb_agg(jsonb_build_object(
 'schema',n.nspname,'name',p.proname,'args',pg_get_function_identity_arguments(p.oid),
 'definition_md5',md5(pg_get_functiondef(p.oid)),'security_definer',p.prosecdef,
 'owner',pg_get_userbyid(p.proowner),'config',p.proconfig,'acl',p.proacl::text,
 'anon_execute',has_function_privilege('anon',p.oid,'EXECUTE'),
 'authenticated_execute',has_function_privilege('authenticated',p.oid,'EXECUTE'),
 'service_role_execute',has_function_privilege('service_role',p.oid,'EXECUTE'),
 'public_execute',exists(select 1 from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a where a.grantee=0 and a.privilege_type='EXECUTE')) order by n.nspname,p.proname) as data
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where (n.nspname='hahalab_queue_crypto' and p.proname='get_current_owner_key')
 or (n.nspname='public' and p.proname='get_my_learning_queue_key')
union all
select 'private_storage_permissions',jsonb_build_object(
 'rls_enabled',(select relrowsecurity from pg_class where oid='hahalab_queue_crypto.owner_keys'::regclass),
 'anon_usage',has_schema_privilege('anon','hahalab_queue_crypto','USAGE'),
 'authenticated_usage',has_schema_privilege('authenticated','hahalab_queue_crypto','USAGE'),
 'service_role_usage',has_schema_privilege('service_role','hahalab_queue_crypto','USAGE'),
 'service_role_table_access',has_table_privilege('service_role','hahalab_queue_crypto.owner_keys','SELECT,INSERT,UPDATE,DELETE'),
 'anon_table_access',has_table_privilege('anon','hahalab_queue_crypto.owner_keys','SELECT,INSERT,UPDATE,DELETE'),
 'authenticated_table_access',has_table_privilege('authenticated','hahalab_queue_crypto.owner_keys','SELECT,INSERT,UPDATE,DELETE'),
 'policy_count',(select count(*) from pg_policy where polrelid='hahalab_queue_crypto.owner_keys'::regclass),
 'foreign_key_count',(select count(*) from pg_constraint where conrelid='hahalab_queue_crypto.owner_keys'::regclass and contype='f'));
