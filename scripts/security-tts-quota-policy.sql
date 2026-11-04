-- Independent candidate; root applies only after its own ROLLBACK trial.
-- Existing Google provider is unchanged. Reservation covers all three fallbacks.
-- No text or audio is sent externally by this SQL. No learning/customer rows read.
begin;
set local search_path=pg_catalog,public;
set local lock_timeout='10s';
do $preflight$
begin
  if current_user <> 'postgres' then raise exception 'VERIFIED_POSTGRES_OWNER_REQUIRED'; end if;
  if to_regprocedure('public.security_learning_write_allowed()') is null or to_regnamespace('hahalab_security') is null then raise exception 'STRICT_SECURITY_PREREQUISITES_REQUIRED'; end if;
  if exists(select 1 from pg_namespace where nspname='hahalab_security' and pg_get_userbyid(nspowner)<>'postgres')
     or has_schema_privilege('anon','hahalab_security','USAGE') or has_schema_privilege('authenticated','hahalab_security','USAGE') then raise exception 'OWNER_ONLY_PRIVATE_SCHEMA_REQUIRED'; end if;
  if to_regclass('hahalab_security.tts_quota_buckets') is not null or to_regclass('hahalab_security.tts_request_cache') is not null
     or to_regprocedure('public.security_reserve_tts_request(text,numeric)') is not null
     or to_regprocedure('public.security_complete_tts_request(uuid,text,text)') is not null then raise exception 'TTS_OBJECTS_ALREADY_EXIST_REVIEW_REQUIRED'; end if;
end;
$preflight$;
create table hahalab_security.tts_quota_buckets (
  bucket_key text primary key,
  expires_at timestamptz not null,
  request_count integer not null check(request_count>=0),
  reserved_characters integer not null check(reserved_characters>=0)
);
create table hahalab_security.tts_request_cache (
  auth_user_id uuid not null,
  content_key text not null,
  request_id uuid not null unique default gen_random_uuid(),
  status text not null check(status in ('pending','ready','failed')),
  lease_until timestamptz not null,
  expires_at timestamptz not null,
  audio_content text,
  primary key(auth_user_id,content_key)
);
alter table hahalab_security.tts_quota_buckets enable row level security;
alter table hahalab_security.tts_request_cache enable row level security;
revoke all on table hahalab_security.tts_quota_buckets,hahalab_security.tts_request_cache from public,anon,authenticated,service_role;

create function public.security_reserve_tts_request(p_text text,p_speaking_rate numeric)
returns jsonb language plpgsql security definer set search_path='' as $reserve$
declare
  actor uuid:=auth.uid(); now_at timestamptz:=clock_timestamp();
  v_content_key text; row_cache hahalab_security.tts_request_cache%rowtype;
  v_request_id uuid:=gen_random_uuid(); bucket record; current_count integer; current_chars integer;
  reserved_chars integer; utc_day text; utc_month text;
begin
  if public.security_learning_write_allowed() is distinct from true or actor is null then raise exception 'TTS_FORBIDDEN' using errcode='42501'; end if;
  if p_text is null or length(trim(p_text))=0 or length(p_text)>120 or p_text ~ '[<>{}\[\]]'
     or p_speaking_rate is null or p_speaking_rate<0.6 or p_speaking_rate>1.05 then raise exception 'INVALID_TTS_INPUT' using errcode='22023'; end if;
  v_content_key:=md5(jsonb_build_array('google-tts-v1',p_text,p_speaking_rate)::text);
  -- Global short transaction lock: cache claim and all quota buckets commit
  -- together. No provider call happens while a database lock is held.
  perform pg_advisory_xact_lock(11870041,732031);
  delete from hahalab_security.tts_quota_buckets q where q.expires_at<=now_at;
  delete from hahalab_security.tts_request_cache c where c.expires_at<=now_at;
  select c.* into row_cache from hahalab_security.tts_request_cache c where c.auth_user_id=actor and c.content_key=v_content_key;
  if found and row_cache.status='ready' then return jsonb_build_object('status','cached','audioContent',row_cache.audio_content); end if;
  if found and row_cache.status='pending' and row_cache.lease_until>now_at then return jsonb_build_object('status','pending'); end if;
  reserved_chars:=length(p_text)*3;
  utc_day:=to_char(now_at at time zone 'UTC','YYYY-MM-DD');
  utc_month:=to_char(now_at at time zone 'UTC','YYYY-MM');
  -- Conservative defaults are explicit and source-reviewed. Character quotas
  -- reserve the maximum three upstream attempts; failures are not refunded.
  for bucket in select * from (values
    ('user-minute:'||actor::text||':'||to_char(now_at at time zone 'UTC','YYYY-MM-DD-HH24-MI'),now_at+interval '2 minutes',10,3600),
    ('user-day:'||actor::text||':'||utc_day,(date_trunc('day',now_at at time zone 'UTC') at time zone 'UTC')+interval '1 day',60,21600),
    ('global-day:'||utc_day,(date_trunc('day',now_at at time zone 'UTC') at time zone 'UTC')+interval '1 day',300,60000),
    ('global-month:'||utc_month,(date_trunc('month',now_at at time zone 'UTC') at time zone 'UTC')+interval '1 month',2000,100000)
  ) as b(key,expiry,max_requests,max_characters) loop
    select q.request_count,q.reserved_characters into current_count,current_chars from hahalab_security.tts_quota_buckets q where q.bucket_key=bucket.key;
    if coalesce(current_count,0)+1>bucket.max_requests or coalesce(current_chars,0)+reserved_chars>bucket.max_characters then
      return jsonb_build_object('status','quota-exceeded');
    end if;
  end loop;
  for bucket in select * from (values
    ('user-minute:'||actor::text||':'||to_char(now_at at time zone 'UTC','YYYY-MM-DD-HH24-MI'),now_at+interval '2 minutes'),
    ('user-day:'||actor::text||':'||utc_day,(date_trunc('day',now_at at time zone 'UTC') at time zone 'UTC')+interval '1 day'),
    ('global-day:'||utc_day,(date_trunc('day',now_at at time zone 'UTC') at time zone 'UTC')+interval '1 day'),
    ('global-month:'||utc_month,(date_trunc('month',now_at at time zone 'UTC') at time zone 'UTC')+interval '1 month')
  ) as b(key,expiry) loop
    insert into hahalab_security.tts_quota_buckets as q(bucket_key,expires_at,request_count,reserved_characters) values(bucket.key,bucket.expiry,1,reserved_chars)
      on conflict(bucket_key) do update set request_count=q.request_count+1,reserved_characters=q.reserved_characters+excluded.reserved_characters;
  end loop;
  insert into hahalab_security.tts_request_cache as c(auth_user_id,content_key,request_id,status,lease_until,expires_at)
    values(actor,v_content_key,v_request_id,'pending',now_at+interval '2 minutes',now_at+interval '7 days')
    on conflict(auth_user_id,content_key) do update set request_id=excluded.request_id,status='pending',lease_until=excluded.lease_until,expires_at=excluded.expires_at,audio_content=null;
  return jsonb_build_object('status','reserved','requestId',v_request_id);
end;
$reserve$;
revoke all on function public.security_reserve_tts_request(text,numeric) from public,anon;
grant execute on function public.security_reserve_tts_request(text,numeric) to authenticated;

create function public.security_complete_tts_request(p_request_id uuid,p_audio_content text,p_outcome text)
returns boolean language plpgsql security definer set search_path='' as $complete$
declare affected integer;
begin
  -- Only the Edge service client may complete a claimed synthesis. The lease
  -- UUID is not a credential granting authenticated clients completion rights.
  if p_outcome not in ('ready','failed') or p_outcome is null then raise exception 'INVALID_TTS_OUTCOME'; end if;
  if p_outcome='ready' and (p_audio_content is null or length(p_audio_content)=0 or length(p_audio_content)>524288 or p_audio_content !~ '^[A-Za-z0-9+/]+={0,2}$') then raise exception 'INVALID_TTS_AUDIO'; end if;
  update hahalab_security.tts_request_cache set status=p_outcome,audio_content=case when p_outcome='ready' then p_audio_content else null end
    where request_id=p_request_id and status='pending' and lease_until>clock_timestamp();
  get diagnostics affected=row_count;
  return affected=1;
end;
$complete$;
revoke all on function public.security_complete_tts_request(uuid,text,text) from public,anon,authenticated;
grant execute on function public.security_complete_tts_request(uuid,text,text) to service_role;
do $tts_acl_smoke$
begin
  if has_function_privilege('anon','public.security_reserve_tts_request(text,numeric)','EXECUTE')
     or has_function_privilege('authenticated','public.security_complete_tts_request(uuid,text,text)','EXECUTE')
     or has_function_privilege('anon','public.security_complete_tts_request(uuid,text,text)','EXECUTE')
     or has_table_privilege('authenticated','hahalab_security.tts_request_cache','SELECT,INSERT,UPDATE,DELETE')
     or has_table_privilege('anon','hahalab_security.tts_request_cache','SELECT,INSERT,UPDATE,DELETE') then raise exception 'TTS_ACL_MUST_DENY_DIRECT_ACCESS'; end if;
  -- Inspect ACL only. No quota request is made with a real customer identity.
end;
$tts_acl_smoke$;
notify pgrst,'reload schema';
commit;
