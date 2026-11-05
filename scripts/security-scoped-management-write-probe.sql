-- Temporary DDL only; no customer table, record, function or setting persists.
begin;
set local statement_timeout='5s';
create temporary table hahalab_scoped_maint_write_probe (verified boolean) on commit drop;
insert into hahalab_scoped_maint_write_probe values(true);
select bool_and(verified) as scoped_management_write_verified
from hahalab_scoped_maint_write_probe;
rollback;
