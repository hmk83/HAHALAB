"""Exact snapshot/source contracts only; no DB connection or business invocation."""
import json,hashlib,pathlib
root=pathlib.Path(__file__).resolve().parent.parent
read=lambda p:(root/p).read_text()
backup='output/production-release/rpc-backup/'
original=json.loads(read(backup+'all-before.json'))
trigger=next(x for x in json.loads(read(backup+'security-followup-before.json'))['teacher_triggers'] if x['name']=='guard_teacher_self_service_fields')
sql=read('scripts/security-teacher-trigger-policy.sql'); proposed=read(backup+'proposed/teacher-guard-self-service.sql').rstrip(';\n')
assert hashlib.md5(trigger['definition'].encode()).hexdigest() in sql
assert trigger['acl'] in sql
assert 'if public.security_admin_active() is true then' in proposed
assert 'v_status_transition_allowed := false;' in proposed
for clause in ["current_setting('hahalab.allow_teacher_binding', true) = '1'",'public.security_auth_session_active() is true','old.auth_user_id is null','new.auth_user_id = auth.uid()',"(to_jsonb(new) - 'auth_user_id') = (to_jsonb(old) - 'auth_user_id')",'lower(trim(old.email)) = lower(trim(coalesce(auth.jwt()']:
 assert clause in proposed
# Every existing protected field continues to fail if altered outside authorized context.
for field in ['role','auth_user_id','teacher_id','email','max_client_limit','free_trial_end','withdrawn_at','status']:
 assert ('new.'+field) in proposed and ('old.'+field) in proposed
transfersql=read('scripts/security-transfer-rpc-policy.sql')
for name in ['queue_teacher_transfer','cancel_teacher_transfer']:
 before=next(x for x in original if x['proname']==name)
 after=read(backup+'proposed/transfer-'+name+'.sql').rstrip(';\n')
 gate='security_learning_write_allowed' if name=='queue_teacher_transfer' else 'security_session_active'
 guard=f"    if public.{gate}() is distinct from true then\n        raise exception 'TRANSFER_SESSION_FORBIDDEN' using errcode = '42501';\n    end if;\n"
 assert after.replace(guard,'').replace('public.security_admin_active()', 'public.teacher_transfer_is_admin_user()')==before['definition'].rstrip('\n')
 assert hashlib.md5(before['definition'].encode()).hexdigest() in transfersql
before=next(x for x in original if x['proname']=='execute_due_teacher_transfers')
private=read(backup+'proposed/transfer-private-executor.sql').rstrip(';\n')
assert private.replace('hahalab_security.execute_due_teacher_transfers_internal(', 'public.execute_due_teacher_transfers(',1).replace('v_is_admin boolean := public.security_admin_active();','v_is_admin boolean := public.teacher_transfer_is_admin_user();')==before['definition'].rstrip('\n')
wrapper=read(backup+'proposed/transfer-execute_due_teacher_transfers.sql')
assert "v_scope := coalesce(nullif(trim(p_teacher_id), ''), nullif(v_own, ''));" in wrapper
assert 'v_scope is distinct from v_own and public.security_admin_active() is distinct from true' in wrapper
assert 'security_learning_write_allowed() is distinct from true' in wrapper
assert 'execute_due_teacher_transfers_internal(v_scope)' in wrapper
# Parameter-scope negative simulation mirrors wrapper authorization without mutations.
def allowed(write,own,target,admin):
 scope=(target or '').strip() or own
 return write is True and bool(scope) and (scope==own or admin is True)
for values,expected in [((False,'own',None,False),False),((True,'own',None,False),True),((True,'own','other',False),False),((True,'own','other',True),True),((True,None,None,True),False)]:assert allowed(*values)==expected
files=['scripts/security-teacher-trigger-policy.sql','scripts/security-transfer-rpc-policy.sql']
result={'passed':True,'scope':'Local original snapshot preservation, entry guards and scope-negative simulation only; no DB runtime/DDL claim','remoteMutationPerformed':False,'businessRpcInvocations':0,'files':{p:hashlib.sha256(read(p).encode()).hexdigest() for p in files},'triggerOtherFieldsImmutable':True,'transferOriginalBusinessBodiesPreserved':True,'postgresRollbackDryRunRequired':True}
(root/'output/production-release/security-followup-local-validation.json').write_text(json.dumps(result,indent=2)+'\n')
print('[security-followup] PASS exact trigger/transfer source contracts; server rollback dry run remains required')
