-- Exact snapshot transfer hardening; root applies. No transfer is invoked.
-- Queue/execution require active learning-write; cancellation preserves full-session
-- pending-account self cancellation. Cross-account administrator paths require MFA.
begin;
set local lock_timeout='10s';
set local statement_timeout='30s';
set local search_path=pg_catalog;
do $transfer_preflight$
declare target jsonb; p record;
begin
  if current_user <> 'postgres' then raise exception 'VERIFIED_POSTGRES_OWNER_REQUIRED'; end if;
  if to_regprocedure('public.security_learning_write_allowed()') is null or to_regprocedure('public.security_admin_active()') is null then raise exception 'STRICT_WRITE_ADMIN_HELPERS_REQUIRED'; end if;
  if to_regnamespace('hahalab_security') is null or exists(select 1 from pg_namespace where nspname='hahalab_security' and pg_get_userbyid(nspowner)<>'postgres') then raise exception 'PRIVATE_OWNER_SCHEMA_REQUIRED'; end if;
  if has_schema_privilege('anon','hahalab_security','USAGE') or has_schema_privilege('authenticated','hahalab_security','USAGE') then raise exception 'PRIVATE_SCHEMA_EXPOSED'; end if;
  if to_regprocedure('hahalab_security.execute_due_teacher_transfers_internal(text)') is not null then raise exception 'PRIVATE_TRANSFER_EXISTS_REVIEW_REQUIRED'; end if;
  for target in select value from jsonb_array_elements($snapshots$[{"name": "cancel_teacher_transfer", "signature": "p_request_id bigint", "md5": "a193ea5d971acd53e08c0f45584b8a10", "acl": "{postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}"}, {"name": "execute_due_teacher_transfers", "signature": "p_teacher_id text", "md5": "25bfc7809b7ad053147646a62618a6ec", "acl": "{postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}"}, {"name": "queue_teacher_transfer", "signature": "p_client_id bigint, p_target_teacher_id text", "md5": "0473c2e2acc0984408fe942d522050ec", "acl": "{postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}"}]$snapshots$::jsonb)
  loop
    select pg_get_functiondef(f.oid) as definition, f.proacl::text as acl, pg_get_userbyid(f.proowner) as owner into p
      from pg_proc f join pg_namespace n on n.oid=f.pronamespace
      where n.nspname='public' and f.proname=target->>'name' and pg_get_function_identity_arguments(f.oid)=target->>'signature';
    if not found or p.owner <> 'postgres' or md5(p.definition) <> target->>'md5' or p.acl is distinct from target->>'acl' then raise exception 'TRANSFER_SNAPSHOT_MISMATCH'; end if;
  end loop;
end;
$transfer_preflight$;
CREATE OR REPLACE FUNCTION public.cancel_teacher_transfer(p_request_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
    v_current_teacher_id text := public.get_current_teacher_code();
    v_row record;
begin
    if public.security_session_active() is distinct from true then
        raise exception 'TRANSFER_SESSION_FORBIDDEN' using errcode = '42501';
    end if;
    select *
      into v_row
      from public.teacher_transfer_requests r
     where r.id = p_request_id
     limit 1;

    if not found then
        raise exception '이전 예약을 찾을 수 없습니다.';
    end if;

    if v_row.status <> 'pending' then
        raise exception '대기 중인 예약만 취소할 수 있습니다.';
    end if;

    if now() >= v_row.execute_after then
        raise exception '실행 시점이 지나 취소할 수 없습니다.';
    end if;

    if not public.security_admin_active()
       and coalesce(v_current_teacher_id, '') <> coalesce(v_row.source_teacher_id, '') then
        raise exception '취소 권한이 없습니다.';
    end if;

    update public.teacher_transfer_requests
    set status = 'cancelled',
        cancelled_at = now(),
        cancel_reason = 'source_teacher_cancelled'
    where id = p_request_id;

    return true;
end;
$function$
;
revoke all on function public.cancel_teacher_transfer(bigint) from public, anon;
CREATE OR REPLACE FUNCTION hahalab_security.execute_due_teacher_transfers_internal(p_teacher_id text DEFAULT NULL::text)
 RETURNS TABLE(executed_count integer, failed_count integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
    v_current_teacher_id text := public.get_current_teacher_code();
    v_is_admin boolean := public.security_admin_active();
    v_request record;
    v_executed integer := 0;
    v_failed integer := 0;
    v_client_status text;
    v_rowcount integer;
begin
    if coalesce(p_teacher_id, '') <> ''
       and not v_is_admin
       and coalesce(v_current_teacher_id, '') <> ''
       and p_teacher_id <> v_current_teacher_id then
        raise exception '다른 선생님의 이전 실행 권한이 없습니다.';
    end if;

    for v_request in
        select *
        from public.teacher_transfer_requests r
        where r.status = 'pending'
          and r.execute_after <= now()
          and (
                coalesce(p_teacher_id, '') = ''
                or r.source_teacher_id = p_teacher_id
                or r.target_teacher_id = p_teacher_id
          )
        order by r.execute_after asc, r.id asc
        for update skip locked
    loop
        begin
            v_client_status := case
                when v_request.entity_type = 'reserve' then 'paused'
                else 'terminated'
            end;

            update public.clients
            set teacher_id = v_request.target_teacher_id,
                status = v_client_status,
                updated_at = now()
            where id = v_request.client_id
              and teacher_id = v_request.source_teacher_id;

            get diagnostics v_rowcount = row_count;
            if v_rowcount = 0 then
                raise exception '이전 대상이 없거나 이미 다른 선생님에게 이동되었습니다.';
            end if;

            update public.schedules
            set teacher_id = v_request.target_teacher_id
            where client_id::text = v_request.client_id::text
              and teacher_id = v_request.source_teacher_id;

            update public.histories
            set teacher_id = v_request.target_teacher_id
            where client_id::text = v_request.client_id::text
              and teacher_id = v_request.source_teacher_id;

            update public.teacher_transfer_requests
            set status = 'executed',
                executed_at = now(),
                executed_by = auth.uid(),
                notes = coalesce(notes, '{}'::jsonb) || jsonb_build_object(
                    'executed_at', now(),
                    'result_status', v_client_status
                )
            where id = v_request.id;

            v_executed := v_executed + 1;
        exception
            when others then
                update public.teacher_transfer_requests
                set status = 'failed',
                    notes = coalesce(notes, '{}'::jsonb) || jsonb_build_object(
                        'last_error', sqlerrm,
                        'failed_at', now()
                    )
                where id = v_request.id;

                v_failed := v_failed + 1;
        end;
    end loop;

    return query select v_executed, v_failed;
end;
$function$
;
revoke all on function hahalab_security.execute_due_teacher_transfers_internal(text) from public, anon, authenticated;
grant execute on function hahalab_security.execute_due_teacher_transfers_internal(text) to service_role;
CREATE OR REPLACE FUNCTION public.execute_due_teacher_transfers(p_teacher_id text DEFAULT NULL::text)
RETURNS TABLE(executed_count integer, failed_count integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $safe_transfer$
declare
  v_own text;
  v_scope text;
begin
  if public.security_learning_write_allowed() is distinct from true then
    raise exception 'LEARNING_WRITE_FORBIDDEN' using errcode='42501';
  end if;
  v_own := public.get_current_teacher_code();
  v_scope := coalesce(nullif(trim(p_teacher_id), ''), nullif(v_own, ''));
  if v_scope is null then raise exception 'TEACHER_SCOPE_REQUIRED' using errcode='42501'; end if;
  if v_scope is distinct from v_own and public.security_admin_active() is distinct from true then
    raise exception 'TRANSFER_SCOPE_FORBIDDEN' using errcode='42501';
  end if;
  return query select * from hahalab_security.execute_due_teacher_transfers_internal(v_scope);
end;
$safe_transfer$;
revoke all on function public.execute_due_teacher_transfers(text) from public, anon;
CREATE OR REPLACE FUNCTION public.queue_teacher_transfer(p_client_id bigint, p_target_teacher_id text)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
    v_current_teacher_id text := public.get_current_teacher_code();
    v_client record;
    v_target record;
    v_source_teacher record;
    v_request_id bigint;
begin
    if public.security_learning_write_allowed() is distinct from true then
        raise exception 'TRANSFER_SESSION_FORBIDDEN' using errcode = '42501';
    end if;
    if coalesce(v_current_teacher_id, '') = '' and not public.security_admin_active() then
        raise exception '현재 선생님 정보를 확인할 수 없습니다.';
    end if;

    select *
      into v_client
      from public.clients c
     where c.id = p_client_id
       and c.teacher_id = v_current_teacher_id
       and coalesce(c.status, 'active') <> 'deleted'
     limit 1;

    if not found then
        raise exception '이전할 대상이 없거나 현재 선생님 소속이 아닙니다.';
    end if;

    if coalesce(v_client.type, 'client') not in ('client', 'reserve') then
        raise exception '이전 가능한 대상 유형이 아닙니다.';
    end if;

    if trim(coalesce(p_target_teacher_id, '')) = '' then
        raise exception '이전할 선생님을 선택해주세요.';
    end if;

    if p_target_teacher_id = v_current_teacher_id then
        raise exception '같은 선생님에게는 이전할 수 없습니다.';
    end if;

    select t.teacher_id, t.name, t.center, t.status
      into v_source_teacher
      from public.teachers t
     where t.teacher_id = v_current_teacher_id
       and coalesce(t.status, '') <> 'withdrawn'
     limit 1;

    select t.teacher_id, t.name, t.center, t.status
      into v_target
      from public.teachers t
     where t.teacher_id = p_target_teacher_id
       and coalesce(t.status, 'active') <> 'deleted'
       and coalesce(t.status, '') <> 'withdrawn'
     limit 1;

    if not found then
        raise exception '이전할 선생님 정보를 찾지 못했습니다.';
    end if;

    if exists (
        select 1
        from public.teacher_transfer_requests r
        where r.client_id = p_client_id
          and r.status = 'pending'
    ) then
        raise exception '이미 이전 예약이 존재합니다.';
    end if;

    if exists (
        select 1
        from public.teacher_transfer_requests r
        where r.client_id = p_client_id
          and r.status = 'executed'
          and coalesce(r.executed_at, r.created_at) >= now() - interval '30 days'
    ) then
        raise exception '이전 완료 후 30일이 지나야 다시 이동할 수 있습니다.';
    end if;

    insert into public.teacher_transfer_requests (
        entity_type,
        client_id,
        client_name,
        source_teacher_id,
        source_teacher_name,
        source_center,
        target_teacher_id,
        target_teacher_name,
        target_center,
        status,
        execute_after,
        requested_by,
        notes
    )
    values (
        coalesce(v_client.type, 'client'),
        v_client.id,
        coalesce(v_client.name, ''),
        v_current_teacher_id,
        coalesce(v_source_teacher.name, ''),
        coalesce(v_source_teacher.center, ''),
        v_target.teacher_id,
        coalesce(v_target.name, ''),
        coalesce(v_target.center, ''),
        'pending',
        now() + interval '30 minutes',
        auth.uid(),
        jsonb_build_object(
            'queued_from_status', coalesce(v_client.status, 'active'),
            'queued_at', now()
        )
    )
    returning id into v_request_id;

    return v_request_id;
end;
$function$
;
revoke all on function public.queue_teacher_transfer(bigint, text) from public, anon;
commit;
