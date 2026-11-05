begin transaction read only;
set local statement_timeout='10s';
select pg_get_function_identity_arguments(p.oid) as args,pg_get_function_result(p.oid) as result_type,md5(pg_get_functiondef(p.oid)) as definition_md5,pg_get_functiondef(p.oid) as definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='record_cardlab_learning_attempt';
rollback;
