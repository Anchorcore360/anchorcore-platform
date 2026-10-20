# RRT LMS workforce and subcontractor implementation specification

Status: development branch only. No production database changes.

## Verified existing schema (20 October 2026)
- `people` already has `employment_type`, `person_type`, `default_company_id`, and `profile_id`.
- `person_relationships` already has `person_id`, `company_id`, `manager_profile_id`, `relationship_type`, and `active`.
- `external_customers` already stores company records, including `company_name`.
- A table named `assignments` exists, but its purpose and columns are not yet verified.
- The current `manage-people.html` uses `isExternalPerson` to classify people from company names. This must not determine whether a subcontractor is in the workforce.

## Agreed product rules
1. Main Manage People shows direct RRT employees and subcontractors delivering RRT contracts, including those not trained by the Academy.
2. External training-only delegates remain accessible separately; never delete historical bookings or accreditations.
3. A subcontractor retains a link to their actual employing company via existing company relationships.
4. A subcontractor also needs an accountable RRT manager and contract assignment. The company, RRT manager and contract are separate attributes.
5. The same person can have multiple concurrent contract assignments with different RRT managers. Never duplicate the person record.
6. Managers see their own direct reports and subcontractors assigned to them on relevant contracts. Compliance reporting must be contract- and job-role-specific.
7. Training bookings remain visible on each profile, read-only in the streamlined LMS, pending potential Dante integration.
8. Access control must be enforced by server-side RLS, not just hidden navigation or browser-side filters.

## Implementation sequence and safeguards
- Inspect actual values and constraints for `employment_type`, `person_type`, and `relationship_type` before changing classifications. Do not assume existing data is correctly labelled.
- Inspect `assignments` and existing contract/job-role schema; reuse compatible tables. Only propose a migration if required, and review RLS before any new table.
- Replace company-name-only `isExternalPerson` classification with explicit workforce engagement rules and a safe fallback for unclassified records. Add Direct Employees / Subcontractors filters.
- Make contract manager assignments visible on profiles and team views, then enforce the same scope in exports.
- Test direct employee, subcontractor, external delegate, unclassified person, and multi-contract cases using non-production data.
- Keep main branch and Netlify production untouched until tested and approved.
