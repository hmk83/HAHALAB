-- Read-only post-apply metadata. No customer rows or function body printed.
begin transaction read only;
set local statement_timeout='10s';
set local search_path=pg_catalog;
with expected(tablename,policyname,cmd) as (values
 ('histories','security_client_relation_insert','INSERT'),
 ('histories','security_client_relation_update','UPDATE'),
 ('schedules','security_client_relation_insert','INSERT'),
 ('schedules','security_client_relation_update','UPDATE')
), policies as (
 select e.tablename,e.policyname,e.cmd,p.permissive,p.roles,p.with_check,p.qual,
   p.policyname is not null and p.permissive='RESTRICTIVE' and p.cmd=e.cmd
   and p.roles=array['authenticated']::name[]
   and coalesce(p.with_check,'') ilike '%NULLIF%btrim%client_id%'
   and coalesce(p.with_check,'') ilike '%EXISTS%clients%teacher_id%'
   and (e.cmd='INSERT' or p.qual='true') as metadata_matches
 from expected e left join pg_policies p on p.schemaname='public' and p.tablename=e.tablename and p.policyname=e.policyname
), rpc as (
 select p.oid,md5(pg_get_functiondef(p.oid)) as digest,p.prosecdef,pg_get_userbyid(p.proowner) as owner
 from pg_proc p where p.oid=to_regprocedure('public.apply_schedule_conflict_push(text,text,jsonb,jsonb)')
)
select jsonb_build_object(
 'expectedPolicyCount',4,'actualPolicyCount',(select count(*) from policies where permissive is not null),
 'policyMetadataMatches',(select bool_and(metadata_matches) from policies),
 'policies',(select jsonb_agg(jsonb_build_object('table',tablename,'policy',policyname,'command',cmd,
   'restrictive',permissive='RESTRICTIVE','authenticatedOnly',roles=array['authenticated']::name[],
   'matches',metadata_matches,'checkDefinitionMd5',md5(coalesce(with_check,'')))) from policies),
 'scheduleRpc',(select jsonb_build_object('exists',true,'definitionMd5',digest,'matchesExpectedDefinition',digest='49f0e83060f683f5d5af0dd8c62de3a0',
   'securityDefiner',prosecdef,'ownerIsPostgres',owner='postgres') from rpc),
 'scope','Metadata only. Actual transaction and signed-token tests are separate evidence.'
) as relationship_security_postapply_metadata;
rollback;
