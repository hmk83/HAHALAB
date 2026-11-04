-- Read this file before execution. SQL Editor / verified postgres owner only.
-- Real database RLS under SET LOCAL ROLE authenticated, not a signed JWT/API test.
-- No passwords, tokens, emails to real recipients, schema/policy changes or real
-- customer rows are used. Every data predicate is scoped to fresh fixture IDs.
-- Bootstrap disables row triggers only in this backend, then restores origin
-- BEFORE testing. Explicit negative bigint identities avoid nontransactional
-- nextval effects. If unreviewed side-effect triggers exist, preflight aborts.
-- The inner exception subtransaction rolls back ALL fixture rows before summary;
-- the final outer ROLLBACK also restores every transaction-local setting.
begin;
set local lock_timeout = '2s';
set local statement_timeout = '25s';
set local idle_in_transaction_session_timeout = '30s';
set local search_path = pg_catalog, public;

do $tenant_probe$
declare
  v_tag text := 'security_tx_probe_' || replace(gen_random_uuid()::text, '-', '');
  v_users uuid[] := array[gen_random_uuid(), gen_random_uuid()];
  v_sessions uuid[] := array[gen_random_uuid(), gen_random_uuid()];
  v_teachers text[];
  v_base bigint;
  v_teacher_ids bigint[];
  v_client_ids bigint[];
  v_history_ids bigint[];
  v_schedule_ids bigint[];
  v_checks jsonb := '[]'::jsonb;
  v_result jsonb;
  v_phase text := 'preflight';
  v_table text;
  v_index integer;
  v_other integer;
  v_count bigint;
  v_rows bigint;
  v_ok boolean;
  v_denied boolean;
  v_error_code text;
  v_failed_phase text;
  v_claims jsonb;
  v_insert_id bigint;
  v_leftovers bigint;
begin
  if current_user <> 'postgres' then raise exception 'VERIFIED_POSTGRES_OWNER_REQUIRED'; end if;
  if current_setting('session_replication_role') <> 'origin' then raise exception 'ORIGIN_REPLICATION_ROLE_REQUIRED'; end if;
  if to_regprocedure('public.security_session_active()') is null
     or to_regprocedure('public.security_admin_active()') is null
     or to_regprocedure('public.security_learning_write_allowed()') is null then
    raise exception 'STRICT_SECURITY_HELPERS_REQUIRED';
  end if;
  if not exists (select 1 from pg_roles where rolname='authenticated' and not rolbypassrls and not rolsuper) then
    raise exception 'AUTHENTICATED_MUST_NOT_BYPASS_RLS';
  end if;
  foreach v_table in array array['teachers','clients','histories','schedules'] loop
    if not exists (select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
       where n.nspname='public' and c.relname=v_table and c.relkind='r' and c.relrowsecurity) then
      raise exception 'RLS_REQUIRED_FOR_TARGET';
    end if;
    if not exists (select 1 from information_schema.columns where table_schema='public' and table_name=v_table
       and column_name='id' and data_type='bigint') then raise exception 'BIGINT_ID_REQUIRED_FOR_TARGET'; end if;
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name=v_table
       and column_name<>'id' and column_default ilike '%nextval%') then raise exception 'UNREVIEWED_SEQUENCE_DEFAULT'; end if;
  end loop;
  -- UPDATE/INSERT trigger code is not bypassed in the policy tests. Refuse
  -- enabled user triggers whose bodies can plainly dispatch writes or helpers.
  -- This conservative preflight may require manual source review before running.
  if exists (
    select 1 from pg_trigger t join pg_class c on c.oid=t.tgrelid
    join pg_namespace n on n.oid=c.relnamespace join pg_proc p on p.oid=t.tgfoid
    where n.nspname='public' and c.relname in ('clients','histories','schedules')
      and not t.tgisinternal and t.tgenabled in ('O','A')
      and lower(pg_get_functiondef(p.oid)) ~ '\m(nextval|setval|insert|delete|perform|execute)\M'
  ) then raise exception 'SIDE_EFFECT_TRIGGER_REVIEW_REQUIRED'; end if;

  v_base := -(abs(hashtextextended(v_tag,0) % 900000000000000) + 1000000000000);
  v_teacher_ids := array[v_base-1,v_base-2];
  v_client_ids := array[v_base-11,v_base-12];
  v_history_ids := array[v_base-21,v_base-22];
  v_schedule_ids := array[v_base-31,v_base-32];
  v_teachers := array[v_tag || '_a',v_tag || '_b'];
  foreach v_table in array array['teachers','clients','histories','schedules'] loop
    execute format('select count(*) from public.%I where id between $1 and $2',v_table)
      into v_count using v_base-100,v_base;
    if v_count <> 0 then raise exception 'FIXTURE_ID_COLLISION_NO_MUTATION'; end if;
  end loop;
  if exists (select 1 from auth.users where id=any(v_users))
     or exists (select 1 from auth.sessions where id=any(v_sessions)) then raise exception 'AUTH_FIXTURE_ID_COLLISION'; end if;

  -- Any failure from here is caught after the complete data subtransaction rolls
  -- back. Only SQLSTATE and phase are returned; no raw error/customer data.
  begin
    v_phase := 'bootstrap';
    perform set_config('session_replication_role','replica',true);
    for v_index in 1..2 loop
      insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,
        raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
      values(v_users[v_index],'00000000-0000-0000-0000-000000000000'::uuid,'authenticated','authenticated',
        v_teachers[v_index] || '@example.invalid',null,now(),
        '{"provider":"email","providers":["email"]}'::jsonb,'{}'::jsonb,now(),now());
      insert into auth.sessions(id,user_id,created_at,updated_at,aal,not_after)
      values(v_sessions[v_index],v_users[v_index],now(),now(),'aal1',now()+interval '10 minutes');
      insert into public.teachers(id,teacher_id,auth_user_id,name,email,status,role,max_client_limit)
        overriding system value
      values(v_teacher_ids[v_index],v_teachers[v_index],v_users[v_index],'격리 SQL 합성 교사',
        v_teachers[v_index] || '@example.invalid','normal','teacher',40);
      insert into public.clients(id,teacher_id,name,type,status) overriding system value
      values(v_client_ids[v_index],v_teachers[v_index],'격리 SQL 합성 내담자','client','active');
      insert into public.histories(id,teacher_id,client_id,client_name,type,category,action,details,metadata,memo)
        overriding system value
      values(v_history_ids[v_index],v_teachers[v_index],v_client_ids[v_index]::text,
        '격리 SQL 합성 내담자','client','session_history','게임 완료','{}','{}'::jsonb,v_tag);
      insert into public.schedules(id,teacher_id,client_id,client_name,type,date,start_time,end_time,status,memo)
        overriding system value
      select x.id,x.teacher_id,x.client_id,x.client_name,x.type,x.date,x.start_time,x.end_time,x.status,x.memo
      from jsonb_populate_record(null::public.schedules,jsonb_build_object('id',v_schedule_ids[v_index],
        'teacher_id',v_teachers[v_index],'client_id',v_client_ids[v_index],'client_name','격리 SQL 합성 내담자',
        'type','client','date','2099-11-04','start_time','10:00','end_time','10:50','status','scheduled','memo',v_tag)) x;
    end loop;
    perform set_config('session_replication_role','origin',true);
    if current_setting('session_replication_role') <> 'origin' then raise exception 'TEST_TRIGGER_RESTORE_REQUIRED'; end if;
    v_checks := v_checks || jsonb_build_array(jsonb_build_object('name','fixture-bootstrap-origin-restored','passed',true));

    for v_index in 1..2 loop
      v_other := 3-v_index;
      v_phase := 'tenant-' || v_index || '-session';
      v_claims := jsonb_build_object('sub',v_users[v_index]::text,'session_id',v_sessions[v_index]::text,
        'role','authenticated','aal','aal1','email',v_teachers[v_index] || '@example.invalid');
      perform set_config('request.jwt.claims',v_claims::text,true);
      perform set_config('role','authenticated',true);
      v_ok := current_user='authenticated' and public.security_session_active() is true
        and public.security_learning_write_allowed() is true and public.security_admin_active() is false;
      v_checks := v_checks || jsonb_build_array(jsonb_build_object('name','tenant-' || v_index || '-ordinary-active-session','passed',v_ok));
      if not v_ok then raise exception using errcode='ZX002',message='PROBE_ASSERTION_FAILED'; end if;

      foreach v_table in array array['clients','histories','schedules'] loop
        v_phase := 'tenant-' || v_index || '-' || v_table;
        execute format('select count(*) from public.%I where teacher_id=$1',v_table)
          into v_count using v_teachers[v_index];
        v_ok := v_count=1;
        v_checks := v_checks || jsonb_build_array(jsonb_build_object('name',v_phase || '-own-read-one','passed',v_ok));
        if not v_ok then raise exception using errcode='ZX002',message='PROBE_ASSERTION_FAILED'; end if;
        execute format('select count(*) from public.%I where teacher_id=$1',v_table)
          into v_count using v_teachers[v_other];
        v_ok := v_count=0;
        v_checks := v_checks || jsonb_build_array(jsonb_build_object('name',v_phase || '-foreign-read-zero','passed',v_ok));
        if not v_ok then raise exception using errcode='ZX002',message='PROBE_ASSERTION_FAILED'; end if;

        -- Cross-tenant changes may return 0 rows or an explicit permission error.
        v_rows := 0; v_denied := false;
        begin
          execute format('update public.%I set %I=$1 where teacher_id=$2',v_table,
            case when v_table='clients' then 'name' else 'memo' end)
            using v_tag || '_forbidden_update',v_teachers[v_other];
          get diagnostics v_rows=row_count;
        exception when insufficient_privilege then v_denied := true; end;
        v_ok := v_denied or v_rows=0;
        v_checks := v_checks || jsonb_build_array(jsonb_build_object('name',v_phase || '-foreign-update-denied','passed',v_ok));
        if not v_ok then raise exception using errcode='ZX002',message='PROBE_ASSERTION_FAILED'; end if;
        v_rows := 0; v_denied := false;
        begin
          execute format('delete from public.%I where teacher_id=$1',v_table) using v_teachers[v_other];
          get diagnostics v_rows=row_count;
        exception when insufficient_privilege then v_denied := true; end;
        v_ok := v_denied or v_rows=0;
        v_checks := v_checks || jsonb_build_array(jsonb_build_object('name',v_phase || '-foreign-delete-denied','passed',v_ok));
        if not v_ok then raise exception using errcode='ZX002',message='PROBE_ASSERTION_FAILED'; end if;

        v_insert_id := v_base-40-(v_index*10)-case v_table when 'clients' then 1 when 'histories' then 2 else 3 end;
        v_denied := false;
        begin
          if v_table='clients' then
            insert into public.clients(id,teacher_id,name,type,status) overriding system value
            values(v_insert_id,v_teachers[v_other],'격리 SQL 위조 소유자','client','active');
          elsif v_table='histories' then
            insert into public.histories(id,teacher_id,client_id,client_name,type,category,action,details,metadata,memo)
              overriding system value
            values(v_insert_id,v_teachers[v_other],v_client_ids[v_other]::text,'격리 SQL 위조 소유자',
              'client','session_history','게임 완료','{}','{}'::jsonb,v_tag);
          else
            insert into public.schedules(id,teacher_id,client_id,client_name,type,date,start_time,end_time,status,memo)
              overriding system value
            select x.id,x.teacher_id,x.client_id,x.client_name,x.type,x.date,x.start_time,x.end_time,x.status,x.memo
            from jsonb_populate_record(null::public.schedules,jsonb_build_object('id',v_insert_id,
              'teacher_id',v_teachers[v_other],'client_id',v_client_ids[v_other],'client_name','격리 SQL 위조 소유자',
              'type','client','date','2099-11-04','start_time','11:00','end_time','11:50','status','scheduled','memo',v_tag)) x;
          end if;
        exception when insufficient_privilege then v_denied := true; end;
        v_checks := v_checks || jsonb_build_array(jsonb_build_object('name',v_phase || '-foreign-insert-denied','passed',v_denied));
        if not v_denied then raise exception using errcode='ZX002',message='PROBE_ASSERTION_FAILED'; end if;

        -- Matching teacher_id alone must not authorize linking somebody else's
        -- client. This checks the ownership relationship, not just table tenancy.
        if v_table in ('histories','schedules') then
          v_denied := false;
          begin
            if v_table='histories' then
              insert into public.histories(id,teacher_id,client_id,client_name,type,category,action,details,metadata,memo)
                overriding system value
              values(v_base-80-v_index*3,v_teachers[v_index],v_client_ids[v_other]::text,
                '격리 SQL 타 교사 내담자','client','session_history','게임 완료','{}','{}'::jsonb,v_tag);
            else
              insert into public.schedules(id,teacher_id,client_id,client_name,type,date,start_time,end_time,status,memo)
                overriding system value
              select x.id,x.teacher_id,x.client_id,x.client_name,x.type,x.date,x.start_time,x.end_time,x.status,x.memo
              from jsonb_populate_record(null::public.schedules,jsonb_build_object('id',v_base-80-v_index*3,
                'teacher_id',v_teachers[v_index],'client_id',v_client_ids[v_other],'client_name','격리 SQL 타 교사 내담자',
                'type','client','date','2099-11-04','start_time','12:00','end_time','12:50','status','scheduled','memo',v_tag)) x;
            end if;
          exception
            when insufficient_privilege or foreign_key_violation then v_denied := true;
            when raise_exception then
              if sqlerrm in ('CLIENT_TEACHER_MISMATCH','CLIENT_SCOPE_FORBIDDEN') then v_denied := true; else raise; end if;
          end;
          v_checks := v_checks || jsonb_build_array(jsonb_build_object('name',v_phase || '-foreign-client-link-denied','passed',v_denied));
          if not v_denied then raise exception using errcode='ZX002',message='PROBE_ASSERTION_FAILED'; end if;
        end if;

        -- Positive own UPDATE/INSERT/DELETE proves the negative tests are not
        -- merely failing because the actor has no write privileges at all.
        execute format('update public.%I set %I=$1 where teacher_id=$2',v_table,
          case when v_table='clients' then 'name' else 'memo' end)
          using v_tag || '_own_update',v_teachers[v_index];
        get diagnostics v_rows=row_count;
        v_ok := v_rows=1;
        v_checks := v_checks || jsonb_build_array(jsonb_build_object('name',v_phase || '-own-update-one','passed',v_ok));
        if not v_ok then raise exception using errcode='ZX002',message='PROBE_ASSERTION_FAILED'; end if;
        if v_table='clients' then
          insert into public.clients(id,teacher_id,name,type,status) overriding system value
          values(v_insert_id,v_teachers[v_index],'격리 SQL 소유자 검증','client','active');
        elsif v_table='histories' then
          insert into public.histories(id,teacher_id,client_id,client_name,type,category,action,details,metadata,memo)
            overriding system value
          values(v_insert_id,v_teachers[v_index],v_client_ids[v_index]::text,'격리 SQL 소유자 검증',
            'client','session_history','게임 완료','{}','{}'::jsonb,v_tag);
        else
          insert into public.schedules(id,teacher_id,client_id,client_name,type,date,start_time,end_time,status,memo)
            overriding system value
          select x.id,x.teacher_id,x.client_id,x.client_name,x.type,x.date,x.start_time,x.end_time,x.status,x.memo
          from jsonb_populate_record(null::public.schedules,jsonb_build_object('id',v_insert_id,
            'teacher_id',v_teachers[v_index],'client_id',v_client_ids[v_index],'client_name','격리 SQL 소유자 검증',
            'type','client','date','2099-11-04','start_time','11:00','end_time','11:50','status','scheduled','memo',v_tag)) x;
        end if;
        get diagnostics v_rows=row_count;
        v_ok := v_rows=1;
        v_checks := v_checks || jsonb_build_array(jsonb_build_object('name',v_phase || '-own-insert-one','passed',v_ok));
        if not v_ok then raise exception using errcode='ZX002',message='PROBE_ASSERTION_FAILED'; end if;
        execute format('delete from public.%I where id=$1 and teacher_id=$2',v_table)
          using v_insert_id,v_teachers[v_index];
        get diagnostics v_rows=row_count;
        v_ok := v_rows=1;
        v_checks := v_checks || jsonb_build_array(jsonb_build_object('name',v_phase || '-own-delete-one','passed',v_ok));
        if not v_ok then raise exception using errcode='ZX002',message='PROBE_ASSERTION_FAILED'; end if;
      end loop;
      perform set_config('role','none',true);
    end loop;

    v_phase := 'revoked-session';
    delete from auth.sessions where id=v_sessions[1] and user_id=v_users[1];
    perform set_config('request.jwt.claims',jsonb_build_object('sub',v_users[1]::text,'session_id',v_sessions[1]::text,
      'role','authenticated','aal','aal1')::text,true);
    perform set_config('role','authenticated',true);
    v_ok := public.security_session_active() is false and public.security_learning_write_allowed() is false;
    v_checks := v_checks || jsonb_build_array(jsonb_build_object('name','revoked-session-helper-false','passed',v_ok));
    if not v_ok then raise exception using errcode='ZX002',message='PROBE_ASSERTION_FAILED'; end if;
    foreach v_table in array array['clients','histories','schedules'] loop
      execute format('select count(*) from public.%I where teacher_id=$1',v_table)
        into v_count using v_teachers[1];
      v_ok := v_count=0;
      v_checks := v_checks || jsonb_build_array(jsonb_build_object('name','revoked-session-' || v_table || '-read-zero','passed',v_ok));
      if not v_ok then raise exception using errcode='ZX002',message='PROBE_ASSERTION_FAILED'; end if;
    end loop;
    perform set_config('role','none',true);
    v_phase := 'completed';
    raise exception using errcode='ZX001',message='ROLLBACK_FIXTURES_BEFORE_REPORT';
  exception
    when sqlstate 'ZX001' then null;
    when others then
      get stacked diagnostics v_error_code=returned_sqlstate;
      v_failed_phase := v_phase;
  end;

  -- This runs as the original postgres role after the subtransaction rollback.
  -- Count only randomly generated fixtures, never enumerate customer records.
  v_leftovers := (select count(*) from auth.users where id=any(v_users))
    + (select count(*) from auth.sessions where id=any(v_sessions))
    + (select count(*) from public.teachers where teacher_id=any(v_teachers))
    + (select count(*) from public.clients where teacher_id=any(v_teachers))
    + (select count(*) from public.histories where teacher_id=any(v_teachers))
    + (select count(*) from public.schedules where teacher_id=any(v_teachers));
  v_ok := v_phase='completed' and v_error_code is null and v_leftovers=0
    and current_user='postgres' and current_setting('session_replication_role')='origin';
  v_result := jsonb_build_object('passed',v_ok,'checks',v_checks,'checkCount',jsonb_array_length(v_checks),
    'fixtureRowsAfterRollback',v_leftovers,'fixtureRollbackVerified',v_leftovers=0,
    'errorSqlState',v_error_code,'failedPhase',v_failed_phase,
    'foreignKeyMetadata',(select coalesce(jsonb_agg(jsonb_build_object('table',c.relname,'constraint',co.conname,
      'referencedTable',rc.relname)),'[]'::jsonb) from pg_constraint co join pg_class c on c.oid=co.conrelid
      join pg_namespace n on n.oid=c.relnamespace join pg_class rc on rc.oid=co.confrelid
      where co.contype='f' and n.nspname='public' and c.relname in ('clients','histories','schedules')),
    'foreignKeyScope','Foreign-client relationship denial is tested regardless of whether enforced by RLS, a native composite FK, or a guarded trigger.',
    'scope','Real database authenticated-role/RLS transaction test; not signed-token or HTTP session verification',
    'limitations',jsonb_build_array('No actual access or refresh tokens issued; GoTrue and Worker transport are not tested.',
      'Bootstrap bypasses triggers only for synthetic rows; origin mode restored before all policy tests.',
      'Identity values are explicit negative bigint values; production sequences are never invoked by this script.',
      'Only clients/histories/schedules RLS and foreign-client link checks are exercised; other tables and RPCs require separate verification.'));
  perform set_config('hahalab_security_probe.result',v_result::text,true);
end;
$tenant_probe$;

select current_setting('hahalab_security_probe.result')::jsonb as security_tenant_transaction_probe;
rollback;
