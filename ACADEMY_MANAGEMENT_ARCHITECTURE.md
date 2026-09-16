# RRTA Academy Management Architecture

## Purpose
Academy Management is a protected professional workspace and is separate from normal organisational job roles, reporting lines and operative tasks.

Normal employees/operatives do not receive Academy Management access merely because of their job role. A profile must explicitly be added to the RRTA Training Team.

## Access model
### Quality progression
- Trainee Assessor
- Assessor
- IQA
- Lead IQA

Rules:
- IQA requires Assessor status/history.
- Lead IQA requires IQA status/history.
- A member can retain multiple Academy roles.
- An IQA must not IQA their own sampled assessment decision.

### Additional Academy capabilities
- Trainer
- Academy Administrator

These are capabilities, not stages in the quality progression.

## Technical authorisation
Academy role does not automatically authorise work on every course.
Each Training Team member has course-specific authorisations for:
- Deliver
- Assess
- IQA

Authorisations should support status, evidence, valid-from/expiry and awarding-body restrictions.

## Awarding bodies
The quality framework must support at least:
- Smart Awards
- EUSR
- ProTrainings

Courses should be linked to an awarding body where applicable. QA records must retain awarding body, course/qualification, assessor, IQA, evidence, dates and audit history.

## Academy Management navigation
This protected group should sit at the bottom of the Academy menu and ultimately contain:
- My Academy / Academy Overview
- Training Team
- Quality Dashboard
- IQA & Sampling
- Observations
- Standardisation
- Actions & Improvements
- Awarding Bodies
- EQA / Audit

Navigation visibility and actions must be permission-driven.

## Individual Academy overview
The landing page for a Training Team member should show only Academy work, completely separate from their ordinary employment tasks.

Suggested widgets:
- Academy role badges
- Course authorisations
- Upcoming delivery
- Upcoming assessment work
- Upcoming IQA work
- Evidence/reviews awaiting action
- Observations due
- Sampling due
- QA actions
- Standardisation activity
- Awarding-body alerts

Assessors see their own professional workload and IQA feedback/actions. IQAs get wider quality oversight. Lead IQA gets governance/configuration controls.

## Booking integration
Bookings and inductions should use the Training Team authorisation model.
Selectors should be filtered by the selected course:
- Assigned Trainer: authorised to Deliver
- Assigned Assessor: authorised to Assess
- Assigned IQA: authorised to IQA

A person may occupy more than one delivery/assessment role where permitted, but IQA independence rules must be enforced for sampled assessment decisions.

## QA workflow
Booking -> Delivery -> Assessment -> Evidence -> Completion -> IQA activity when required -> QA sign-off

QA tasks should be generated from activity and the IQA strategy rather than relying on manual reminders.

Potential triggers include:
- new/trainee assessor
- assessor risk rating
- new course/qualification authorisation
- sampling due
- observation due
- previous IQA action
- assessment decision issue/overturn
- awarding-body/EQA action
- standardisation action

## Quality Dashboard
Shared IQA workload should include:
- samples due/overdue
- assessor observations due/overdue
- evidence awaiting IQA review
- open corrective/development actions
- standardisation actions
- EQA/audit actions
- awarding-body status

Any authorised IQA can manage shared QA work where technically authorised. Audit history records who performed each action.

## Governance permissions
Assessor:
- own courses/assessments/evidence
- submit assessment evidence and decisions
- receive IQA feedback/actions
- relevant standardisation

IQA:
- assessor/course quality records
- sampling and evidence review
- observations
- IQA reports/actions
- course QA/finalisation controls where permitted
- shared Quality Dashboard

Lead IQA:
- all IQA operational functions
- IQA strategy
- sampling/risk framework
- IQA allocation/oversight
- standardisation governance
- EQA/centre quality oversight
- manage Academy quality roles/authorisations

Academy Administrator:
- appropriate Academy administration, bookings and records
- does not automatically gain IQA authority

## Build sequence
1. Training Team membership and Academy roles
2. Course authorisations and awarding-body mapping
3. My Academy individual overview
4. Booking trainer/assessor/IQA assignments
5. Quality Dashboard and QA task model
6. Sampling and IQA reports
7. Observations
8. Standardisation
9. Awarding-body / EQA audit records
10. Quality registers (appeals, complaints, reasonable adjustments, conflicts, malpractice etc.)
