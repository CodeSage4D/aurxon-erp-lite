# AURXON ERP Lite - Module Architecture: 06_Exams

## 1. Module Purpose
The `06_Exams` module handles the configuration of exam cycles, registers student scores (theory and practical/internal marks), converts marks to standard grading scales (such as CBSE), compiles official progress report cards, and generates analytical views of student performance.

**Business Value:** It standardizes the evaluation cycle, automates the complex conversion of numeric marks to grades, compiles professional PDF report cards, and provides actionable performance analytics. This reduces the time teachers spend compiling grade reports and provides a digital record of student achievements.
**User Value:** 
* **Administrators / Teachers:** Easily schedule exams, populate marks rosters with split theory/practical parameters, automatically assign grades, and publish report cards.
* **Students / Parents:** View term-wise results, track subject-specific grade trends, and download finalized digital report cards.

---

## 2. Submodules
* **ExamSetup:** Configures exam schedules, types (e.g., Unit Test, Mid-term, Practical, Annual), subjects, dates, and maximum marks boundaries.
* **MarksEntry:** Provides teachers with grading sheets to record split scores (theory vs. practical/internal evaluation).
* **Grading:** Calculates academic grades (e.g., CBSE A1 to E scale) dynamically based on raw percentages.
* **Results:** State machine managing overall result compilation (Draft, Approved, Published status).
* **RankLists:** Compiles academic leaderboards grouped by subject, class, or overall branch performance.
* **ReportCards:** High-fidelity PDF generation engine for digital student progress report cards.
* **ResultAnalytics:** Compiles subject averages, pass/fail ratios, and class-wide performance metrics.

---

## 3. Folder Structure (Domain-Driven)
```text
06_Exams/
├── ExamSetup/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── MarksEntry/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── Grading/
│   ├── Services/
│   └── Rules/
├── Results/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── RankLists/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── ReportCards/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
└── ResultAnalytics/
    ├── Controllers/
    └── Services/
```

---

## 4. Backend Files
* `ExamSetup/exam.controller.ts`, `ExamSetup/exam.service.ts`, `ExamSetup/dto/schedule-exam.dto.ts`
* `MarksEntry/marks.controller.ts`, `MarksEntry/marks.service.ts`, `MarksEntry/dto/submit-marks.dto.ts`
* `Grading/cbse-grade.service.ts` (Calculates A1, A2, B1, B2, C1, C2, D, E grades)
* `Results/result.controller.ts`, `Results/result.service.ts`
* `RankLists/ranks.controller.ts`, `RankLists/ranks.service.ts`
* `ReportCards/report-card.controller.ts`, `ReportCards/pdf-generation.service.ts`
* `ResultAnalytics/analytics.controller.ts`, `ResultAnalytics/analytics.service.ts`

---

## 5. Frontend Files
* `src/06_Exams/ExamSetup/ExamsTab.tsx` (Exam scheduler, roster-based split theory/practical grading tables, and bulk results publisher)
* `src/06_Exams/ReportCards/ReportCardViewer.tsx` (Print-friendly annual progress card template and download action)
* `src/06_Exams/ResultAnalytics/ClassPerformanceDashboard.tsx` (Data visualization graphs detailing marks distribution, average grades, and pass ratios)

---

## 6. Database Entities (Prisma / SQL schema models)

* **`Exam`**: id, branch_id, name, exam_type (ENUM: UNIT_TEST, MID_TERM, ANNUAL, PRACTICAL), academic_year_id (foreign key to AcademicYear), class_id (foreign key to Class), subject_id (foreign key to Subject), exam_date, max_theory_marks, max_practical_marks, max_total_marks, status (ENUM: SCHEDULED, COMPLETED, CANCELLED)
* **`StudentExamResult`**: id, student_id (foreign key to Student), exam_id (foreign key to Exam), marks_theory, marks_practical, marks_total, grade_obtained (e.g. "A1"), status (ENUM: PRESENT, ABSENT, DETAINED, CHEATED), remarks (nullable), graded_by (foreign key to User), graded_at
* **`GradeScale`**: id, branch_id, grade_letter, min_percentage, max_percentage, grade_points, description
* **`ReportCardStatus`**: id, student_id (foreign key to Student), academic_year_id (foreign key to AcademicYear), class_id (foreign key to Class), term (ENUM: TERM_1, TERM_2, ANNUAL), status (ENUM: DRAFT, APPROVED, PUBLISHED), approved_by (foreign key to User)

---

## 7. API Endpoints

### Scheduling & Roster
* `GET /api/v1/exams` - Retrieve examinations list (scoped to branch, filter by class)
* `POST /api/v1/exams` - Schedule a new exam
* `GET /api/v1/exams/:id/roster` - Get student list with fields for split marks entry

### Marks & Grades
* `POST /api/v1/exams/:id/results` - Submit/save results sheet (grades calculated on backend)
* `GET /api/v1/exams/student/:studentId/report-card` - Fetch student's consolidated report card details
* `PATCH /api/v1/exams/report-cards/publish` - Set status to PUBLISHED for all report cards in a section

### Ranks & Analytics
* `GET /api/v1/exams/:id/analytics` - Fetch statistics (class averages, pass percentage, rank lists)

---

## 8. Role Permissions

* **Super Admin:** Modify default organization-wide grade scales. Override system-wide exam configurations.
* **Institute Admin:** Schedule exams, override teacher marks entries, compile final rankings, and authorize publishing of report cards to parent portals.
* **Teacher:** Can view scheduled exams. Read-write access to enter marks in sections where they teach the subject. Cannot edit grades once finalized/locked.
* **Student / Parent:** Read-only access to published exam marks, rank notifications, and downloadable report cards. Cannot access drafts.

---

## 9. Dashboard Widgets

* **Average Marks Scatter Plot:** Compares subject-wise performance averages across sections.
* **Pass Rate Ring:** Gauge showing the passing percentage of the latest exam cycle.
* **Grading Queue Status:** List of recently finished exam dates awaiting marks submission from teachers.
* **Top Rank Showcase:** Carousel highlights students achieving outstanding academic results.

---

## 10. Reports

* **Consolidated Marks Register:** Large worksheet style ledger showing all exams and grades for all students in a section.
* **Subject Remedial Candidates:** List of students scoring below the passing boundary to aid teachers in identifying pupils who need extra support.
* **Grade Distribution Frequency:** Graph/tabular report displaying how many students scored A1, A2, B1, etc.
* **Annual Progress Ledger:** Final ledger indicating pass, fail, or retention outcomes.

---

## 11. Audit Requirements

**Must Log Actions:**
* Updates to a student's `StudentExamResult.marks_theory` or `StudentExamResult.marks_practical` after they have been published.
* Cancellation of scheduled `Exam` entries.
* Direct status updates to `ReportCardStatus` (Publish actions).

**Tracked Fields:**
* `result_id`, `student_id`, `actor_id` (Teacher/Admin).
* `previous_marks_theory`, `new_marks_theory`, `previous_marks_practical`, `new_marks_practical`.
* `remarks` (Reason explanation required for modifications).
* `timestamp` and `ip_address`.

---

## 12. Security Requirements

* **Validation Rules:**
  * **Score Boundary:** Input marks must not exceed maximum theory and practical values defined in the parent `Exam` setup.
  * **Grade Integrity:** Grade evaluation letter must be assigned by the backend engine using immutable boundaries, not passed directly by the client.
* **Authorization Checks:**
  * Only teachers officially mapped to the subject-section (or Admins) can access marks entry endpoints.
  * Marks editing is locked after a result is published or 7 days post-evaluation date unless manually unlocked by an administrator.
* **Tenant Isolation:**
  * Direct `branch_id` check on all exam listings and report card access routes.
* **Data Protection:**
  * Parent/Student portals must receive an authorization rejection if attempting to query report cards that are still in `DRAFT` or `APPROVED` status. Only `PUBLISHED` states are visible.
