-- Read only: helper identity, ACL and effective EXECUTE. No user rows/bodies.
select p.proname as name,pg_get_function_identity_arguments(p.oid) as args,
 md5(pg_get_functiondef(p.oid)) as definition_md5,p.prosecdef as security_definer,
 pg_get_userbyid(p.proowner) as owner,p.proacl::text as acl,
 has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,
 has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_execute
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in ('security_auth_session_active','security_session_active')
order by p.proname;
