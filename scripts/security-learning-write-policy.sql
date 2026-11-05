-- Pending teachers may read their registered-client reports, but cannot create,
-- change or delete learning/client/schedule records through the authenticated API.
-- Apply after security-session-policy.sql, before privileged RPC hardening.
-- This narrows existing ownership policies; it never grants access on its own.
-- SECURITY DEFINER learning mutators need the same helper explicitly, because
-- owner execution can bypass RLS. Teacher profile/legal terms/billing workflows
-- are intentionally outside this learning-write policy.
begin;
set local lock_timeout = '10s';
set local statement_timeout = '30s';

do $learning_write_preconditions$
declare relation_name text;
begin
  if current_user <> 'postgres' then raise exception 'VERIFIED_POSTGRES_OWNER_REQUIRED'; end if;
  if to_regprocedure('public.security_session_active()') is null then
    raise exception 'ACCOUNT_SESSION_GATE_REQUIRED';
  end if;
  if to_regprocedure('public.security_learning_write_allowed()') is not null then
    raise exception 'LEARNING_WRITE_HELPER_ALREADY_EXISTS_REVIEW_REQUIRED';
  end if;
  foreach relation_name in array array[
    'clients', 'schedules', 'histories', 'cardlab_learning_attempts',
    'cardlab_learning_stage_progress', 'cardlab_learning_wrong_stats'
  ] loop
    if not exists (
      select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = relation_name
        and c.relkind in ('r', 'p') and c.relrowsecurity
    ) then raise exception 'RLS_REQUIRED_FOR_%', relation_name; end if;
    if exists (
      select 1 from pg_policy p join pg_class c on c.oid = p.polrelid
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = relation_name
        and p.polname in ('security_learning_insert', 'security_learning_update', 'security_learning_delete')
    ) then raise exception 'LEARNING_WRITE_POLICY_ALREADY_EXISTS_FOR_%', relation_name; end if;
  end loop;
end;
$learning_write_preconditions$;

create function public.security_learning_write_allowed()
returns boolean
language sql
stable
security definer
set search_path = ''
as $learning_write_gate$
  select public.security_session_active()
    and exists (
      select 1 from public.teachers t
      where t.auth_user_id = auth.uid()
        and lower(coalesce(t.status, '')) in ('normal', 'active')
    );
$learning_write_gate$;

revoke all on function public.security_learning_write_allowed() from public, anon;
grant execute on function public.security_learning_write_allowed() to authenticated;

do $learning_write_policies$
declare relation_name text;
begin
  foreach relation_name in array array[
    'clients', 'schedules', 'histories', 'cardlab_learning_attempts',
    'cardlab_learning_stage_progress', 'cardlab_learning_wrong_stats'
  ] loop
    execute format(
      'create policy security_learning_insert on public.%I as restrictive for insert to authenticated with check (public.security_learning_write_allowed())', relation_name);
    execute format(
      'create policy security_learning_update on public.%I as restrictive for update to authenticated using (public.security_learning_write_allowed()) with check (public.security_learning_write_allowed())', relation_name);
    execute format(
      'create policy security_learning_delete on public.%I as restrictive for delete to authenticated using (public.security_learning_write_allowed())', relation_name);
  end loop;
end;
$learning_write_policies$;

-- Empty JWT must never grant learning writes. No customer rows are touched.
do $learning_write_denial_smoke$
declare previous_claims text := current_setting('request.jwt.claims', true);
begin
  perform set_config('request.jwt.claims', '{}', true);
  if public.security_learning_write_allowed() is distinct from false then
    raise exception 'EMPTY_SESSION_MUST_NOT_WRITE_LEARNING';
  end if;
  perform set_config('request.jwt.claims', coalesce(previous_claims, '{}'), true);
end;
$learning_write_denial_smoke$;

-- Metadata only; ownership policy expressions/customer data are not output.
select schemaname, tablename, policyname, permissive, roles, cmd
from pg_policies
where schemaname = 'public'
  and policyname in ('security_learning_insert', 'security_learning_update', 'security_learning_delete')
order by tablename, cmd;

notify pgrst, 'reload schema';
commit;
