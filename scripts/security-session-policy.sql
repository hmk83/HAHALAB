-- Apply only to the verified HAHA LAB project after inspecting the read-only
-- queries below. This file is intentionally not marked as an applied migration.
-- Supabase access tokens may outlive signOut; the live auth.sessions row is the
-- server-side revocation boundary. No user_metadata authorization is used.
begin;

-- Strict authentication boundary used before a teacher record is linked.
-- No profile/account permission is inferred from this bootstrap predicate.
create or replace function public.security_auth_session_active()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select auth.uid() is not null
    and exists (
      select 1 from auth.sessions s
      where s.id::text = auth.jwt()->>'session_id'
        and s.user_id = auth.uid()
        and (s.not_after is null or s.not_after > now())
    );
$$;

revoke all on function public.security_auth_session_active() from public, anon;
grant execute on function public.security_auth_session_active() to authenticated;

create or replace function public.security_session_active()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.security_auth_session_active()
    and exists (
      select 1 from public.teachers t
      where t.auth_user_id = auth.uid()
        -- Account/session access is separate from permission to launch learning.
        -- Pending teachers retain their existing registered-client report access.
        and lower(coalesce(t.status, '')) in ('normal', 'active', 'pending', 'pending_teacher')
        and t.withdrawn_at is null
    );
$$;

revoke all on function public.security_session_active() from public, anon;
grant execute on function public.security_session_active() to authenticated;

-- Restrictive policies supplement existing tenant policies rather than replacing
-- them. Missing RLS or a missing table aborts this transaction for review.
do $$
declare relation_name text;
begin
  foreach relation_name in array array[
    'teachers', 'clients', 'schedules', 'histories',
    'cardlab_learning_attempts', 'cardlab_learning_stage_progress',
    'cardlab_learning_wrong_stats', 'app_terms_agreements'
  ] loop
    if not exists (
      select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = relation_name and c.relrowsecurity
    ) then
      raise exception 'RLS_REQUIRED_FOR_%', relation_name;
    end if;
    execute format('drop policy if exists security_active_session on public.%I', relation_name);
    execute format(
      'create policy security_active_session on public.%I as restrictive for all to authenticated using (public.security_session_active()) with check (public.security_session_active())',
      relation_name
    );
  end loop;
end;
$$;

-- New RPC signatures must become visible to PostgREST after this transaction.
notify pgrst, 'reload schema';
commit;

-- Read-only post-apply inspection. Cross-user ownership policies remain required.
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, policyname;

select n.nspname as schema_name, c.relname, c.relrowsecurity, c.relforcerowsecurity
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname in ('public', 'storage') and c.relkind in ('r', 'p')
order by n.nspname, c.relname;
