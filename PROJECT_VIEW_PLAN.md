# RRTA Platform Project View

Working branch: `project-view`

This branch is the staging area for agreed platform changes. Do not deploy to production until the full navigation and core workflows have been reviewed together.

## Navigation

### Academy Administration
1. Dashboard
2. Manage
   - Manage People
   - Manage Companies
3. Compliance
4. Training
5. Reports
6. Courses
7. Tools & Uploads

### Navigation presentation
- Restore a consistent icon beside every main navigation item.
- Keep Dashboard first.
- Keep Manage directly below Dashboard.
- Use fly-out/submenus for grouped areas so the sidebar remains compact.

## Manage People

Purpose: one place to manage every person record without creating separate databases for each relationship type.

Required capabilities:
- Add a person.
- Search/filter people.
- Profile details including name, DOB, employee number, email, phone, organisation/company and job title.
- Direct staff, subcontractor and external delegate relationship types.
- Assign primary/secondary job roles.
- Assign managers/reporting lines.
- Accreditations and certificates.
- Training record and bookings.
- Documents/evidence.
- Profile photo and QR identity area.
- Active/inactive/archive status.
- Hidden History tab that opens only when selected.

## History

Read-only audit timeline on a person's record.

Track:
- Profile changes.
- Manager changes.
- Job-role changes.
- Accreditation and certificate changes.
- Training/assessment changes.
- Booking/attendance changes.
- Evidence and profile-change requests.
- Documents and notes.

Display:
- Who changed it.
- Date/time.
- Previous value.
- New value.
- Optional reason/note.
- Filters for Profile, Accreditations, Training, Bookings, Requests and Notes.

History remains hidden until the History tab is clicked.

## Manage Companies

Purpose: one company record can support RRT subcontractor management, RRTA customers, or both.

Required capabilities:
- Add/edit/archive company.
- Company type/relationship: RRT subcontractor, RRTA customer, or both.
- Address and postcode.
- Main contacts.
- Billing email and phone.
- Payment/invoice information area.
- Company booking history and future bookings.
- People linked to the company.
- Add/remove/reassign people from the company.
- For RRT subcontractor companies, assign the responsible RRT manager/contract owner.
- Show subcontractor operatives linked to the company.
- Show RRTA delegates linked to the company.
- Company notes and future company history/audit trail.

## Access Principles
- Learners see their own record only.
- Managers see their linked team and relevant compliance information.
- Trainers/assessors can manage operational training information.
- Super Users retain full administrative control.
- Managers do not automatically gain permission to edit official evidence or accreditation records.

## Deployment Rule
All work in this branch remains a project/staging version. Production deployment happens only after the agreed visual design and core workflow tests are complete.
