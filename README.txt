RRTA LEARNING PORTAL — DEMONSTRATION V1

PURPOSE
A clickable proof-of-concept showing two roles:
1. Trainer / Assessor: manage learners, assign Customer Service, view results, access F2F trainer resources.
2. Learner: see ONLY assigned learning, complete the randomised assessment, receive a result and certificate.

DEMO LOGINS
Trainer:
  trainer@rrta.demo
  Trainer123!

Learner:
  john.smith@rrta.demo
  Learner123!

Additional demo learners visible to the trainer:
  sarah.jones@rrta.demo / Learner123!
  mike.brown@rrta.demo / Learner123!

HOW TO DEMONSTRATE
1. Log in as trainer.
2. Go to Learners.
3. Remove or assign Customer Service to John Smith.
4. Sign out.
5. Log in as John Smith.
6. If assigned, open the course and take the assessment.
7. Complete the assessment and return to My Learning.
8. Sign out and log back in as trainer.
9. The result will now appear in Overview and Results.

IMPORTANT PROTOTYPE LIMITATION
This is NOT secure production authentication. Demo users, assignments and results are stored in browser localStorage.
It is designed to prove the workflow and visual concept before connecting real authentication and a database.
Clearing browser site data will reset local records.

ASSESSMENT
- Master bank: 60 questions.
- Candidate receives 20.
- Balanced blueprint: 3 ARRIVE, 4 CHECK, 4 AGREE, 3 PROTECT, 3 COMMUNICATE, 3 COMPLETE.
- Questions and answer positions are randomised.
- Pass mark: 16/20 (80%).
- Time allowed: 20 minutes.

NETLIFY
Unzip the package and deploy the RRTA_Learning_Portal_Demo_V1 folder manually.
