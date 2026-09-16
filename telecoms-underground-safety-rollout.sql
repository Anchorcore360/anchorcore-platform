-- Apply when compliance-equivalence.js is published, not before.
-- Keep existing requirement IDs, status and notes; civils requirements are untouched.
begin;
update public.job_role_requirements q
set compliance_item_id=55
from public.job_roles r
where q.job_role_id=r.id and r.division='Telecoms' and q.compliance_item_id=3
and not exists(select 1 from public.job_role_requirements existing where existing.job_role_id=q.job_role_id and existing.compliance_item_id=55);
commit;
