-- Restore API access for the existing Academy policy; employee login remains optional.
-- No anon grant and no changes to the is_trainer() row-level policy.
alter table public.person_job_roles enable row level security;
grant select, insert, update, delete on table public.person_job_roles to authenticated;
