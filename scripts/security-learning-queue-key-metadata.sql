-- Read-only prerequisite inventory. No key generation, key values or user rows.
select 'rng_functions' as section,coalesce(jsonb_agg(jsonb_build_object(
 'schema',n.nspname,'name',p.proname,'args',pg_get_function_identity_arguments(p.oid),
 'return_type',pg_get_function_result(p.oid),'owner',pg_get_userbyid(p.proowner),
 'postgres_execute',has_function_privilege('postgres',p.oid,'EXECUTE'))),'[]'::jsonb) as data
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where (n.nspname='extensions' and p.proname='gen_random_bytes')
 or (n.nspname='pg_catalog' and p.proname='gen_random_uuid')
union all
select 'existing_queue_crypto_objects',jsonb_build_object(
 'schema_exists',exists(select 1 from pg_namespace where nspname='hahalab_queue_crypto'),
 'facade_exists',exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='get_my_learning_queue_key'),
 'strict_helper_exists',to_regprocedure('public.security_session_active()') is not null,
 'public_create_anon',has_schema_privilege('anon','public','CREATE'),
 'public_create_authenticated',has_schema_privilege('authenticated','public','CREATE'));
