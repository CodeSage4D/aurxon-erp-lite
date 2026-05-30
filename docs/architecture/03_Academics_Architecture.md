# AURXON ERP Lite - Module Architecture: 03_Academics

## 1. Module Purpose
The `03_Academics` module serves as the structural engine of AURXON ERP Lite. It defines the core educational framework of the institution—including class structures, subjects, grading authorities, schedules, and lesson plans—and governs how students progress through their academic journey.

**Business Value:** It digitizes and automates class schedules, teacher workloads, syllabus completion logs, and end-of-year class migrations. This dramatically reduces administrative overhead, ensures teaching standards are met, and prevents schedule conflicts (double-booking of teachers or rooms).
**User Value:** 
* **Administrators:** Can easily assign teachers, map subjects to classes, set up multiple academic years or boards, and execute bulk promotions/migrations with a few clicks.
* **Teachers:** Gain access to an automated timetable builder and an intuitive syllabus tracker to log chapter coverage, lesson plan details, and completion percentages.
* **Students/Parents:** Access real-time class timetables and clear visual status indicators of syllabus progress per subject.

---

## 2. Submodules
* **Academic Year Management:** Configuration and control of school sessions (e.g., active vs. historical academic years), start/end dates, and operational terms.
* **Streams & Boards:** Setup of educational authorities (e.g., CBSE, ICSE, State Board) and high school streams (e.g., Science, Commerce, Arts) to support complex secondary school curricula.
* **Class & Section Config:** Hierarchical definition of grades (e.g., Grade 9, Grade 10) and multiple divisions or sections (e.g., Section A, Section B) within each grade.
* **Subject Mapping:** Linking subjects to specific classes, including the designation of subject types (Theory vs. Practical) and weekly hour requirements.
* **Teacher-Subject Assignment:** Associating teachers as the official instructors for specific subjects in specific class sections.
* **Timetable Scheduler:** A conflict-free scheduling engine that maps subjects, teachers, and rooms to weekly time/period slots, with support for automated rule-based draft generation.
* **Lesson Planner & Syllabus Tracker:** Tools for teachers to input lesson plans, define chapters, and track real-time completion status with sliders.
* **Promotion & Migration Rules:** A state engine defining how students advance to the next grade or how entire classes/sections migrate between academic years.

---

## 3. Folder Structure (Domain-Driven)
```text
03_Academics/
├── AcademicYear/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── Board/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── Stream/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── Class/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── Section/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── Subject/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── LessonPlan/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── SyllabusTracker/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
└── PromotionHistory/
    ├── Controllers/
    ├── Services/
    └── DTOs/
```

---

## 4. Backend Files
* `AcademicYear/academic-year.controller.ts`, `AcademicYear/academic-year.service.ts`, `AcademicYear/dto/create-year.dto.ts`
* `Board/board.controller.ts`, `Board/board.service.ts`
* `Stream/stream.controller.ts`, `Stream/stream.service.ts`
* `Class/class.controller.ts`, `Class/class.service.ts`, `Class/dto/create-class.dto.ts`
* `Section/section.controller.ts`, `Section/section.service.ts`
* `Subject/subject.controller.ts`, `Subject/subject.service.ts`
* `LessonPlan/lesson-plan.controller.ts`, `LessonPlan/lesson-plan.service.ts`
* `SyllabusTracker/syllabus.controller.ts`, `SyllabusTracker/syllabus.service.ts`
* `PromotionHistory/promotion.controller.ts`, `PromotionHistory/promotion.service.ts`, `PromotionHistory/dto/promotion-request.dto.ts`

---

## 5. Frontend Files
* `src/03_Academics/Class/AcademicTab.tsx` (Timetable matrix view, auto-generator panel, and syllabus sliders)
* `src/03_Academics/Class/ClassList.tsx`, `src/03_Academics/Class/SectionModal.tsx` (Manage class levels and section boundaries)
* `src/03_Academics/Subject/SubjectMappingGrid.tsx` (Interactive table mapping subjects and teachers to class sections)
* `src/03_Academics/AcademicYear/AcademicYearManager.tsx` (Select active school session, manage holidays/terms)
* `src/03_Academics/PromotionHistory/StudentPromotionWizard.tsx` (Step-by-step UI to transition students to the next grade)
* `src/03_Academics/LessonPlan/LessonPlanEditor.tsx` (CRUD interface for lesson units and syllabus milestones)

---

## 6. Database Entities (Prisma / SQL schema models)

* **`AcademicYear`**: id, branch_id, name (e.g., "2026-2027"), start_date, end_date, is_active (boolean), status (ENUM: UPCOMING, ACTIVE, ARCHIVED)
* **`Board`**: id, branch_id, name (e.g., "CBSE", "ICSE", "Cambridge"), description
* **`Stream`**: id, branch_id, name (e.g., "Science", "Commerce", "Humanities"), description
* **`Class`**: id, branch_id, board_id (nullable), stream_id (nullable), name (e.g., "Grade 10"), display_order (integer, for UI sorting)
* **`Section`**: id, class_id, name (e.g., "Section A"), class_teacher_id (foreign key to Staff/User), capacity (integer)
* **`Subject`**: id, branch_id, name (e.g., "Mathematics"), subject_code (unique code), type (ENUM: THEORY, PRACTICAL, VOCATIONAL, DUAL)
* **`ClassSubjectMapping`**: id, section_id, subject_id, teacher_id (foreign key to Staff/User, links teacher as instructor), hours_per_week
* **`TimetableSlot`**: id, section_id, subject_id, teacher_id, day_of_week (ENUM: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY), period_number, start_time, end_time, room_number (nullable)
* **`LessonPlan`**: id, class_subject_mapping_id, title, content (chapter syllabus overview), estimated_hours, created_by
* **`SyllabusTracker`**: id, lesson_plan_id, status (ENUM: PENDING, IN_PROGRESS, COMPLETED), syllabus_percent (integer, 0 to 100), actual_completion_date (nullable), updated_by
* **`PromotionHistory`**: id, student_id (foreign key to Student), from_academic_year_id, to_academic_year_id, from_section_id, to_section_id (nullable if student left/retained), promoted_by (foreign key to User), promoted_at, status (ENUM: PROMOTED, RETAINED, FAILED, TRANSFERRED)
* **`ClassMigrationRule`**: id, branch_id, source_class_id, target_class_id, auto_promote (boolean, if true, students migrate automatically on year end unless flagged)

---

## 7. API Endpoints

### Academic Structure & Years
* `GET /api/v1/academics/years` - List academic years (scoped to branch)
* `POST /api/v1/academics/years` - Create a new academic year
* `PATCH /api/v1/academics/years/:id/activate` - Activate an academic year (deactivates others in branch context)

### Class, Sections & Subject Mappings
* `GET /api/v1/academics/classes` - List all classes and sections
* `POST /api/v1/academics/classes` - Create a class
* `POST /api/v1/academics/classes/:id/sections` - Add section to a class
* `POST /api/v1/academics/mappings` - Map subject, section, and teacher together
* `GET /api/v1/academics/mappings/teacher/:teacherId` - List class assignments for a specific teacher

### Timetable Scheduler
* `GET /api/v1/academics/timetable/:sectionId` - Retrieve the active weekly timetable for a section
* `POST /api/v1/academics/timetable/generate` - Generate conflict-free weekly timetable draft (auto-scheduler algorithm preview)
* `POST /api/v1/academics/timetable/save` - Publish/save a generated timetable draft to active state

### Lesson Plan & Syllabus Tracker
* `GET /api/v1/academics/lessons` - Retrieve lesson plans for mapped subjects
* `POST /api/v1/academics/lessons` - Create a new chapter/lesson plan
* `PATCH /api/v1/academics/lessons/:id/progress` - Update syllabus completion percentage and status

### Promotions & Migrations
* `POST /api/v1/academics/promotions/bulk` - Transition a batch of student records to new sections/academic years
* `GET /api/v1/academics/promotions/history/:studentId` - Fetch the migration and promotion log of a single student

---

## 8. Role Permissions

* **Super Admin:** Global configurations of Boards & Streams. Can perform system-wide class structural overrides.
* **Institute Admin:** Full CRUD on Academic Years, Classes, Sections, Subjects, and mappings. Performs student promotion processes and edits master timetable patterns.
* **Teacher:** Read-only access to academic structures. Read-write access to Lesson Plans, Syllabus Trackers, and Timetables for classes where they are assigned. Designated "Class Incharges" can trigger and edit timetables for their designated class.
* **Student / Parent:** Read-only access to their assigned section's timetable, subjects, and current syllabus tracker progress.

---

## 9. Dashboard Widgets

* **Syllabus Progress Ring:** Displays the average syllabus completion percentage across all classes or sections (Admin view) / assigned subjects (Teacher/Student view).
* **My Day Schedule:** Horizontal timeline showing the logged-in teacher's or student's timetable slots for the current day.
* **Teacher Load Chart:** Bar graph illustrating period counts and teaching hours per week for all active teachers.
* **Class Enrollment Capacity Gauge:** Shows actual students vs. capacity limits across class sections.

---

## 10. Reports

* **Syllabus Deficit Ledger:** Flags subjects/chapters lagging behind the expected completion date based on lesson plan estimates.
* **Teacher Utilization Report:** Shows detailed teaching workloads, free periods, and subject allocations (useful for optimizing faculty hire).
* **End-of-Year Promotion Summary:** Detailed report showing which students were promoted, retained, or exited during the year-end transition.
* **Timetable Audit Registry:** List of all scheduled hours vs. actual class sessions conducted.

---

## 11. Audit Requirements

**Must Log Actions:**
* Modifications to the status of an `AcademicYear` (Archive/Activate).
* Reassignment of a teacher in `ClassSubjectMapping`.
* Manual changes made to a student's `PromotionHistory` (e.g., correcting an incorrect promotion).
* Generation and publishing of a new weekly `Timetable`.

**Tracked Fields:**
* `entity_id` (e.g., `class_subject_mapping_id`, `student_id`).
* `actor_id` (Staff/User triggering the action).
* `action_type` (e.g., `REASSIGN_TEACHER`, `PROMOTE_STUDENT`, `PUBLISH_TIMETABLE`).
* `previous_state` & `new_state` (stored as JSON diffs).
* `timestamp` and `ip_address`.

---

## 12. Security Requirements

* **Validation Rules:**
  * **Timetable Conflict Validation:** Backend must validate that no teacher or classroom is booked twice for the same period/day (collision prevention).
  * **Range Boundaries:** Syllabus coverage percentage must strictly fall between 0 and 100.
* **Authorization Checks:**
  * Endpoints for bulk promotions (`/promotions/bulk`) and active year change must require `Institute Admin` or `Super Admin` roles.
  - Verification that the logged-in teacher is mapped to the subject-section before accepting `LessonPlan` or `SyllabusTracker` modifications.
* **Tenant Isolation:**
  * Every academic query must filter by `branch_id` from the decoded JWT. A user from Branch A cannot view or manipulate classes, subjects, or timetables of Branch B.
* **Data Integrity & Safety:**
  * Database transaction isolation levels must prevent race conditions on parallel bulk promotion actions.
  * Strict database cascades: deleting a Class is prohibited if there are active Sections, and deleting a Section is prohibited if there are enrolled students.
