-- Independent followup after the frozen core transfer/RLS hardening.
-- No historical bulk repair. Only future successful source-owned transfers move
-- their CardLab rows, inside the original executor's same per-request transaction.
-- Root performs production rollback validation/application; this file invokes no RPC.
begin;
set local lock_timeout='10s';
set local statement_timeout='30s';
set local search_path=public,pg_catalog;
do $cardlab_transfer_preflight$
declare
 v_table text;
 p record;
 actual_triggers jsonb;
begin
 if current_user<>'postgres' then raise exception 'VERIFIED_POSTGRES_OWNER_REQUIRED'; end if;
 if to_regprocedure('public.security_admin_active()') is null or to_regprocedure('public.security_session_active()') is null then raise exception 'STRICT_CORE_HELPERS_REQUIRED'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('table_name',c.relname::text,'name',t.tgname::text,'definition',pg_get_triggerdef(t.oid),'function_md5',md5(pg_get_functiondef(f.oid)),'owner',pg_get_userbyid(f.proowner),'acl',f.proacl::text) order by c.relname,t.tgname),'[]'::jsonb) into actual_triggers
 from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace join pg_proc f on f.oid=t.tgfoid
 where not t.tgisinternal and n.nspname='public' and c.relname in ('cardlab_asset_usage','cardlab_learning_attempts','cardlab_learning_stage_progress','cardlab_learning_wrong_stats');
 if actual_triggers is distinct from $actual_touch_triggers$[{"table_name": "cardlab_asset_usage", "name": "trg_cardlab_asset_usage_touch", "definition": "CREATE TRIGGER trg_cardlab_asset_usage_touch BEFORE UPDATE ON public.cardlab_asset_usage FOR EACH ROW EXECUTE FUNCTION cardlab_asset_usage_touch_updated_at()", "function_md5": "9efed4ecccda0c9d452998e3ef2ee7fd", "owner": "postgres", "acl": "{=X/postgres,postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}"}, {"table_name": "cardlab_learning_attempts", "name": "trg_cardlab_learning_attempts_touch", "definition": "CREATE TRIGGER trg_cardlab_learning_attempts_touch BEFORE UPDATE ON public.cardlab_learning_attempts FOR EACH ROW EXECUTE FUNCTION cardlab_learning_touch_updated_at()", "function_md5": "e166d641c7fabb1d4f83cd4160314d70", "owner": "postgres", "acl": "{=X/postgres,postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}"}, {"table_name": "cardlab_learning_stage_progress", "name": "trg_cardlab_learning_stage_progress_touch", "definition": "CREATE TRIGGER trg_cardlab_learning_stage_progress_touch BEFORE UPDATE ON public.cardlab_learning_stage_progress FOR EACH ROW EXECUTE FUNCTION cardlab_learning_touch_updated_at()", "function_md5": "e166d641c7fabb1d4f83cd4160314d70", "owner": "postgres", "acl": "{=X/postgres,postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}"}, {"table_name": "cardlab_learning_wrong_stats", "name": "trg_cardlab_learning_wrong_stats_touch", "definition": "CREATE TRIGGER trg_cardlab_learning_wrong_stats_touch BEFORE UPDATE ON public.cardlab_learning_wrong_stats FOR EACH ROW EXECUTE FUNCTION cardlab_learning_touch_updated_at()", "function_md5": "e166d641c7fabb1d4f83cd4160314d70", "owner": "postgres", "acl": "{=X/postgres,postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}"}]$actual_touch_triggers$::jsonb then raise exception 'CARDLAB_TOUCH_TRIGGER_SNAPSHOT_MISMATCH'; end if;
 if to_regprocedure('public.security_cardlab_client_read_allowed(text,text)') is not null then raise exception 'CARDLAB_CLIENT_READ_HELPER_EXISTS_REVIEW_REQUIRED'; end if;
 foreach v_table in array array['cardlab_asset_usage','cardlab_learning_attempts','cardlab_learning_stage_progress','cardlab_learning_wrong_stats'] loop
  if not exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname=v_table and c.relrowsecurity and pg_get_userbyid(c.relowner)='postgres') then raise exception 'CARDLAB_RLS_OWNER_REQUIRED'; end if;
  if (select count(*) from information_schema.columns c where c.table_schema='public' and c.table_name=v_table and c.column_name in ('client_id','teacher_id') and c.data_type='text') <> 2 then raise exception 'CARDLAB_TEXT_OWNER_COLUMNS_REQUIRED'; end if;
  if exists(select 1 from pg_policies q where q.schemaname='public' and q.tablename=v_table and q.policyname='security_cardlab_current_client_read') then raise exception 'CARDLAB_READ_GATE_EXISTS_REVIEW_REQUIRED'; end if;
 end loop;
 select pg_get_functiondef(f.oid) as definition,f.proacl::text as acl,pg_get_userbyid(f.proowner) as owner into p from pg_proc f join pg_namespace n on n.oid=f.pronamespace where n.nspname='hahalab_security' and f.proname='execute_due_teacher_transfers_internal' and pg_get_function_identity_arguments(f.oid)='p_teacher_id text';
 if not found or p.owner<>'postgres' or md5(p.definition)<>'9c230f960984d933e5faa7d7dcc77b79' or p.acl is distinct from '{postgres=X/postgres,service_role=X/postgres}' then raise exception 'HARDENED_TRANSFER_EXECUTOR_SNAPSHOT_MISMATCH'; end if;
end;
$cardlab_transfer_preflight$;
create function public.security_cardlab_client_read_allowed(p_client_id text,p_teacher_id text)
returns boolean language sql stable security definer set search_path='' as $cardlab_read_gate$
 select coalesce(public.security_session_active() is true and (
  public.security_admin_active() is true or exists(
   select 1 from public.clients c join public.teachers t on t.teacher_id=c.teacher_id
   where c.id::text=p_client_id and c.teacher_id::text=p_teacher_id and t.auth_user_id=auth.uid()
  )),false);
$cardlab_read_gate$;
revoke all on function public.security_cardlab_client_read_allowed(text,text) from public,anon,service_role;
grant execute on function public.security_cardlab_client_read_allowed(text,text) to authenticated;
do $cardlab_read_policies$
declare v_table text;
begin
 foreach v_table in array array['cardlab_asset_usage','cardlab_learning_attempts','cardlab_learning_stage_progress','cardlab_learning_wrong_stats'] loop
  execute format('create policy security_cardlab_current_client_read on public.%I as restrictive for select to authenticated using (public.security_cardlab_client_read_allowed(client_id::text,teacher_id::text))',v_table);
 end loop;
end;
$cardlab_read_policies$;
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

            -- Keep raw learning ownership aligned with the successfully transferred client.
            update public.cardlab_asset_usage
            set teacher_id = v_request.target_teacher_id
            where client_id::text = v_request.client_id::text
              and teacher_id = v_request.source_teacher_id;

            update public.cardlab_learning_attempts
            set teacher_id = v_request.target_teacher_id
            where client_id::text = v_request.client_id::text
              and teacher_id = v_request.source_teacher_id;

            update public.cardlab_learning_stage_progress
            set teacher_id = v_request.target_teacher_id
            where client_id::text = v_request.client_id::text
              and teacher_id = v_request.source_teacher_id;

            update public.cardlab_learning_wrong_stats
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
commit;
