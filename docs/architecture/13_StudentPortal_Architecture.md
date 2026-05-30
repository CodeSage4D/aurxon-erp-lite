# AURXON ERP Lite - Module Architecture: 13_StudentPortal

## 1. Module Purpose
The `13_StudentPortal` module provides a personal workspace for students. It filters access strictly to their enrolled class context, enabling them to inspect class timetables, submit homework tasks, monitor attendance logs, read notices, and view published grades.

**Business Value:** It digitizes daily academic tasks and coordinates assignment collection. Auto-collecting homework files and showing real-time timetable schedules reduces teacher load, keeps students informed, and establishes a clear log of academic participation.
**User Value:** 
* **Students:** Can check their class schedule, read homework instructions, upload files for grading, check attendance meters, and review reports.

---

## 2. Submodules
* **StudentLogin:** Handles student account credentials, profile updates, and active device sessions.
* **Timetable:** Renders the student's section weekly class schedule (periods, times, subjects, rooms).
* **Homework:** Coordinates downloading assignments, submitting files, and checking teacher scores/remarks.
* **AttendanceView:** Renders monthly attendance summaries to help students monitor their compliance.
* **Results:** Shows published exam scores, CBSE grade letters, and hosts downloadable report card files.
* **Notices:** Shows notice boards and bulletins targeting the student's class section.

---

## 3. Folder Structure (Domain-Driven)
```text
13_StudentPortal/
├── StudentLogin/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── Timetable/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── Homework/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── AttendanceView/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── Results/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
└── Notices/
    ├── Controllers/
    └── Services/
```

---

## 4. Backend Files
* `StudentLogin/student-login.controller.ts`, `StudentLogin/student-login.service.ts`
* `Timetable/student-timetable.controller.ts`, `Timetable/student-timetable.service.ts`
* `Homework/student-homework.controller.ts`, `Homework/student-homework.service.ts`, `Homework/dto/submit-homework.dto.ts`
* `AttendanceView/student-attendance.controller.ts`, `AttendanceView/student-attendance.service.ts`
* `Results/student-result.controller.ts`, `Results/student-result.service.ts`
* `Notices/student-notice.controller.ts`

---

## 5. Frontend Files
* `src/13_StudentPortal/StudentDashboard.tsx` (Weekly timetable cards, notices feed, attendance gauges, and pending homework sheets)
* `src/13_StudentPortal/Homework/HomeworkSubmissionModal.tsx` (File uploader for assignments, text entries, and teacher grades views)
* `src/13_StudentPortal/Timetable/TimetableCalendar.tsx` (Structured calendar layout tracking daily class periods)

---

## 6. Database Entities (Prisma / SQL schema models)
*(This module leverages the core schema tables, tracking assignments and submissions):*

* **`HomeworkAssignment`**: id, branch_id, class_subject_mapping_id (foreign key to ClassSubjectMapping), title, description, attachments (JSON list of S3 file keys), issue_date, due_date, created_by (foreign key to User/Teacher)
* **`HomeworkSubmission`**: id, assignment_id (foreign key to HomeworkAssignment), student_id (foreign key to Student), submission_text (nullable), file_url (nullable), status (ENUM: SUBMITTED, GRADED, RESUBMIT_REQUESTED), score_obtained (decimal, nullable), remarks (nullable), submitted_at, graded_at

---

## 7. API Endpoints

### Profile & Schedules
* `GET /api/v1/student/profile` - Fetch authenticated student profile details
* `GET /api/v1/student/timetable` - Retrieve weekly timetable for the student's section

### Homework Assignments
* `GET /api/v1/student/homework` - Retrieve assigned homework tasks (filter by status)
* `POST /api/v1/student/homework/:id/submit` - Upload submission file and register answers

### Metrics & Bulletins
* `GET /api/v1/student/attendance` - Fetch daily/monthly attendance logs
* `GET /api/v1/student/results` - Fetch published exam scores and grades
* `GET /api/v1/student/notices` - Fetch notice board posts targeting child's class

---

## 8. Role Permissions

* **Super Admin / Institute Admin:** Manage student account records and configure classroom settings.
* **Student:** Access restricted to pages linking to their class section. Restricted from querying data of other students or administrative configuration routes.
* **Teacher:** Create assignments, grade submissions, and assign feedback remarks.
* **Parent:** Denied direct access (uses ParentPortal to track child performance).

---

## 9. Dashboard Widgets

* **Period Schedule Timeline:** Horizontal checklist showing today's class schedule.
* **Homework Checklist:** Displays cards showing homework assignments due today/tomorrow.
* **Attendance compliance indicator:** Gauge displaying active attendance percentage.
* **Notice Feed:** Scroll panel containing bulletins and announcements.

---

## 10. Reports
*(Self-assessment worksheets students can run directly):*
* **Personal Attendance Sheet:** Calendar view showing monthly attendance checkmarks.
* **Homework Completion Ledger:** Formatted PDF detailing completed vs missing homework tasks.

---

## 11. Audit Requirements

**Must Log Actions:**
* Portal login timestamps.
* Submission files uploaded for homework assignments.
* Password change logs.

**Tracked Fields:**
* `student_id`, `assignment_id`, `submission_id`, `actor_id` (Student User ID).
* `action_type` (e.g., `LOGIN`, `SUBMIT_HOMEWORK`, `UPDATE_PASSWORD`).
* `timestamp` and `ip_address`.

---

## 12. Security Requirements

* **Validation Rules:**
  * **File Constraints:** Uploaded homework files must not exceed 10MB. MIME verification must enforce PDF, DOCX, JPG, PNG formats only.
  * **Submission Deadlines:** Block submissions if current system date is past the `due_date` parameter of the homework assignment.
* **Authorization Checks:**
  * Enforce strict section validation. A student can only query timetables or submit homework for the section they are currently enrolled in. Cross-class submissions are blocked.
* **Tenant Isolation:**
  * Branch scope is checked using the student record branch registration.
* **Data Protection:**
  * Draft scores or grading results are kept hidden from portal APIs until report cards are set to `PUBLISHED` by the principal.
