# AURXON ERP Lite - Module Architecture: 09_Reports

## 1. Module Purpose
The `09_Reports` module serves as the centralized reporting, query builder, and document export engine of AURXON ERP Lite. It groups data collection from other modules (admissions, financials, attendance, HR, exams) into standardized, filterable ledger views and schedules automated file deliveries (PDF/Excel) to target recipients.

**Business Value:** Instead of scattered database query builders, it consolidates report layouts, ensures data exports are formatted uniformly, monitors which employees download PII data, and automates scheduled email reports, saving hours of manual Excel work.
**User Value:** 
* **Administrators / Principals:** Generate high-level status spreadsheets, audit override activities, and schedule weekly fee due reports directly to their inboxes.
* **Accountants / Teachers:** Export tax logs, daily cash books, student registers, and class average worksheets in a few clicks.

---

## 2. Submodules
* **StudentReports:** Exports student registers, contacts sheets, PIN-code demographic lists, and sibling mappings.
* **StaffReports:** Compiles employee details sheets, active contract listings, and payroll summary sheets.
* **AcademicReports:** Generates class rosters, master timetables, syllabus completion charts, and exam result registers.
* **FeeReports:** Produces outstanding defaulter registers, daily receipts collections journals, and profit & loss logs.
* **AttendanceReports:** Renders student registers, chronic absenteeism lists, and employee timesheets.
* **AuditReports:** Audits administrative adjustments, login histories, and bulk export logs for compliance checking.

---

## 3. Folder Structure (Domain-Driven)
```text
09_Reports/
├── StudentReports/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── StaffReports/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── AcademicReports/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── FeeReports/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── AttendanceReports/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
└── AuditReports/
    ├── Controllers/
    ├── Services/
    └── DTOs/
```

---

## 4. Backend Files
* `StudentReports/student-report.controller.ts`, `StudentReports/student-report.service.ts`
* `StaffReports/staff-report.controller.ts`, `StaffReports/staff-report.service.ts`
* `AcademicReports/academic-report.controller.ts`, `AcademicReports/academic-report.service.ts`
* `FeeReports/fee-report.controller.ts`, `FeeReports/fee-report.service.ts`
* `AttendanceReports/attendance-report.controller.ts`, `AttendanceReports/attendance-report.service.ts`
* `AuditReports/audit-report.controller.ts`, `AuditReports/audit-report.service.ts`
* `common/report-exporter.ts` (Shared utility file to compile data into standard Excel/PDF formats)

---

## 5. Frontend Files
* `src/09_Reports/ReportDashboard.tsx` (Central search hub categorizing reports, managing active filter cards, and linking run commands)
* `src/09_Reports/ReportSchedulerModal.tsx` (UI modal setting recurring schedule triggers, email addresses, and templates)
* `src/09_Reports/ReportViewerFrame.tsx` (Tabular data representation screen containing Excel/PDF download buttons)

---

## 6. Database Entities (Prisma / SQL schema models)

* **`ReportTemplate`**: id, branch_id, name, category (ENUM: STUDENT, STAFF, ACADEMIC, FEE, ATTENDANCE, AUDIT), configuration (JSON layout of columns, filter parameters, and sorts), created_by (foreign key to User), is_system (boolean)
* **`ReportSchedule`**: id, branch_id, template_id (foreign key to ReportTemplate), frequency (ENUM: DAILY, WEEKLY, MONTHLY), email_recipients (JSON array of emails), last_run_at (nullable), next_run_at, status (ENUM: ACTIVE, PAUSED)
* **`ReportExecutionQueue`**: id, branch_id, template_id (foreign key to ReportTemplate), status (ENUM: PENDING, RUNNING, COMPLETED, FAILED), file_url (nullable), error_log (nullable), executed_by (foreign key to User), created_at, completed_at

---

## 7. API Endpoints

### Template Management
* `GET /api/v1/reports/templates` - Retrieve reporting templates (scoped to branch, filter by category)
* `POST /api/v1/reports/templates` - Save a customized report template definition

### Execution & Deliveries
* `POST /api/v1/reports/run` - Queue a report execution job (generates downloadable XLSX or PDF file link)
* `GET /api/v1/reports/queue/:queueId` - Poll status details of a background report export job
* `POST /api/v1/reports/schedules` - Establish recurring report email schedules
* `GET /api/v1/reports/schedules` - Retrieve active automated report schedules

---

## 8. Role Permissions

* **Super Admin:** Global capability to compile organization-wide audit logs. Access all system reports.
* **Institute Admin / Principal:** Full CRUD on all reports, schedules, and custom templates. Can view financial registers and operational logs.
* **Accountant (Staff):** Read-write for FeeReports and StudentReports. Can schedule cash books. Blocked from academic details and HR payroll structures.
* **Teacher:** Read-write for AcademicReports and AttendanceReports. Access student contacts rosters. Blocked from financial records.
* **Student / Parent:** No access to the Reports module.

---

## 9. Dashboard Widgets

* **Recent Downloads Box:** Timeline logging recently exported files and status checks.
* **Pending Schedule List:** Displays names and next delivery timings of automated emails.
* **Database Query Performance:** Monitors long-running reports that may impact database CPU logs.
* **Quick Access Links:** Icons jumping straight to the defaulter list or class registers.

---

## 10. Reports
*(Since this module is the reporting generator itself, we detail the compiled master reports):*
* **Consolidated School Metrics:** Combined dashboard layout indicating current admissions, overall attendance percentage, daily fees credit, and active tickets.
* **Administrative Change Auditor:** A comprehensive changelog sheet listing manual record overrides and deleted entities.

---

## 11. Audit Requirements

**Must Log Actions:**
* Running/downloading any report containing sensitive employee/student information (Aadhaar, contact, banking parameters).
* Deleting/creating active recurring `ReportSchedule` configurations.
* Manual execution of `AuditReports`.

**Tracked Fields:**
* `template_id`, `queue_id`, `actor_id` (User who downloaded the report).
* `format` (e.g., `PDF`, `CSV`, `XLSX`).
* `row_count` of exported file.
* `filter_parameters` (JSON filters used).
* `timestamp` and `ip_address`.

---

## 12. Security Requirements

* **Validation Rules:**
  * **Execution Date Ceiling:** Range filters must prevent runs spanning more than 1 fiscal year per query (prevents thread execution timeouts).
  * **Dynamic Query Safety:** Query filters must use parameterized binding parameters (Prisma model inputs) to block SQL injections. Executing raw string-concatenated SQL queries is prohibited.
* **Authorization Checks:**
  * Endpoint routers must verify category scopes: an Accountant requesting `/reports/run` with category `AUDIT` must get immediate `403 Forbidden` responses.
* **Tenant Isolation:**
  * Multi-branch separation isolates reporting queries (`WHERE branch_id = :branchId`). Output XLSX and PDF binaries are saved inside isolated S3 paths matching branch scopes.
* **Data Protection:**
  * Output files are stored in private cloud buckets using pre-signed link structures carrying a maximum duration of 10 minutes.
