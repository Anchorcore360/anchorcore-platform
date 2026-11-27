# Online learning verification and certificates — implementation gate

Database inspection confirms that online_course_assignments.course_id is a UUID referencing online_courses, whereas certificates.course_id is a bigint referencing courses. Never cast or equate these identifiers. A dedicated mapping or online certificate relation is required.

## Release sequence
1. Create a private, versioned question bank (replace the publicly distributed answer keys; do not reuse exposed questions for high-stakes assessment).
2. Create server-owned attempts with authenticated learner ID, assignment ID, immutable question order, expiry, and a one-time submission state. Only return questions and options, not correct answers. Enforce active account, learner permissions, assignment ownership and active course on both start and submit.
3. Score on the server using the attempt's exact question version; lock the attempt in a transaction, reject duplicate submission or expired attempts, preserve prior passes, and record score and completion atomically. Keep existing results labelled legacy/unverified until reconciled. Rate limit starts.
4. Remove learner direct writes to authoritative result fields, including self-enrol inserts containing result values; migrate SCORM to a separately scoped runtime path. Test admin assignment and provider callbacks before activating restrictive policies. Client-side SCORM completion is not independently verified evidence.
5. For certificates use an explicitly approved online_courses-to-courses mapping or a separate online certificate table with its own UUID foreign key. Use a unique attempt/assignment issuance key and immutable template version. Generate PDF in trusted backend and store privately; verify learner ownership and manager/admin permissions before issuing short-lived links. Never mint certificates from legacy client-reported passes.
6. Verify two independent test users cannot access or mutate each other's data, a disabled account cannot submit, an expired/replayed attempt is rejected, and a passing score issues exactly one certificate. Verify a failed attempt issues none and the learning matrix reads the verified completion.

## Deployment gate
No database schema, policies or live employee records are changed by this document. Existing learning is not yet approved for formal compliance evidence. Keep API secrets and private assessment banks outside the public repository. Before rollout, test with synthetic employees and confirm database backup and rollback.
