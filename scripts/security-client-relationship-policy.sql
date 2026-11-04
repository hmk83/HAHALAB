-- Candidate only: root must dry-run and review before COMMIT application.
-- Narrow INSERT/UPDATE ownership relationship checks; no customer rows are
-- migrated, deleted, selected or repaired. Existing read/delete scope is kept.
-- Old orphan/mismatched records remain intact; a subsequent write must link a
-- client from the same nominated teacher. AAL2 admin still needs a valid pair.
-- Also guard the schedule SECURITY DEFINER RPC, which otherwise bypasses RLS.
begin;
set local lock_timeout='2s';
set local statement_timeout='20s';
set local search_path=pg_catalog;

do $relationship_preflight$
declare t text;
begin
 if current_user<>'postgres' then raise exception 'VERIFIED_POSTGRES_OWNER_REQUIRED'; end if;
 foreach t in array array['clients','histories','schedules'] loop
  if not exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relname=t and c.relrowsecurity) then raise exception 'RLS_REQUIRED'; end if;
 end loop;
 if exists(select 1 from pg_policies where schemaname='public' and tablename in ('histories','schedules')
   and policyname in ('security_client_relation_insert','security_client_relation_update')) then
   raise exception 'RELATIONSHIP_POLICY_EXISTS_REVIEW_REQUIRED';
 end if;
 if (select jsonb_object_agg(table_name||'.'||column_name,data_type) from information_schema.columns
    where table_schema='public' and ((table_name='clients' and column_name in ('id','teacher_id'))
      or (table_name in ('histories','schedules') and column_name in ('teacher_id','client_id'))))
    is distinct from '{"clients.id":"bigint","clients.teacher_id":"text","histories.teacher_id":"text","histories.client_id":"text","schedules.teacher_id":"text","schedules.client_id":"text"}'::jsonb then
   raise exception 'CLIENT_RELATION_COLUMN_TYPES_CHANGED';
 end if;
end;
$relationship_preflight$;

create policy security_client_relation_insert on public.histories
 as restrictive for insert to authenticated
 with check(exists(select 1 from public.clients c where c.id::text=histories.client_id and c.teacher_id=histories.teacher_id));
create policy security_client_relation_update on public.histories
 as restrictive for update to authenticated using(true)
 with check(exists(select 1 from public.clients c where c.id::text=histories.client_id and c.teacher_id=histories.teacher_id));
create policy security_client_relation_insert on public.schedules
 as restrictive for insert to authenticated
 with check(exists(select 1 from public.clients c where c.id::text=schedules.client_id and c.teacher_id=schedules.teacher_id));
create policy security_client_relation_update on public.schedules
 as restrictive for update to authenticated using(true)
 with check(exists(select 1 from public.clients c where c.id::text=schedules.client_id and c.teacher_id=schedules.teacher_id));

do $schedule_relationship_rpc$
declare
 oid_before oid := to_regprocedure('public.apply_schedule_conflict_push(text,text,jsonb,jsonb)');
 before_definition text;
 after_definition text;
 before_acl text;
 anchor text := '  -- Move current conflicts first, but inside the same database transaction.';
 guard text := $guard$
  -- Row-level checks do not constrain this owner-executed mutator.
  if p_operation='insert' and not exists(
    select 1 from public.clients c
    where c.id::text=p_schedule->>'client_id' and c.teacher_id=p_teacher_id
  ) then raise exception 'CLIENT_TEACHER_MISMATCH' using errcode='42501'; end if;
  if p_operation='move' and not exists(
    select 1 from public.schedules s join public.clients c on c.id::text=s.client_id and c.teacher_id=s.teacher_id
    where s.id::text=p_schedule->>'id' and s.teacher_id=p_teacher_id
  ) then raise exception 'CLIENT_TEACHER_MISMATCH' using errcode='42501'; end if;
  if exists(select 1 from jsonb_array_elements(coalesce(p_updates,'[]'::jsonb)) u where not exists(
    select 1 from public.schedules s join public.clients c on c.id::text=s.client_id and c.teacher_id=s.teacher_id
    where s.id::text=u->>'id' and s.teacher_id=p_teacher_id
  )) then raise exception 'CLIENT_TEACHER_MISMATCH' using errcode='42501'; end if;
$guard$;
begin
 select pg_get_functiondef(p.oid),p.proacl::text into before_definition,before_acl
 from pg_proc p where p.oid=oid_before and p.prosecdef and pg_get_userbyid(p.proowner)='postgres';
 if before_definition is null or md5(before_definition)<>'fa81663cd6598f33c1145b3f8430d8b4' or strpos(before_definition,anchor)=0 then
   raise exception 'SCHEDULE_RPC_SNAPSHOT_CHANGED'; end if;
 after_definition := replace(before_definition,anchor,guard||E'\n'||anchor);
 if after_definition=before_definition or strpos(after_definition,'CLIENT_TEACHER_MISMATCH')=0 then
   raise exception 'SCHEDULE_RPC_GUARD_NOT_INSERTED'; end if;
 execute after_definition;
 if before_acl is distinct from (select proacl::text from pg_proc where oid=oid_before) then
   raise exception 'SCHEDULE_RPC_ACL_CHANGED'; end if;
end;
$schedule_relationship_rpc$;

-- Metadata only. Positive/negative assertions run separately inside a rollback
-- probe so the service is not changed merely by preparation of this candidate.
select schemaname,tablename,policyname,permissive,cmd
from pg_policies where schemaname='public' and tablename in ('histories','schedules')
 and policyname in ('security_client_relation_insert','security_client_relation_update')
order by tablename,policyname;
commit;
