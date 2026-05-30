# AURXON ERP Lite - Module Architecture: 12_ParentPortal

## 1. Module Purpose
The `12_ParentPortal` module serves as the primary digital checkpoint for parents and guardians. It limits access strictly to records linked to their specific children, allowing them to track daily attendance registers, check outstanding fees, view academic grades, and read target bulletins.

**Business Value:** It digitizes school-to-home interactions, decreasing front-desk phone inquiry overhead. Providing self-service fee statement exports, report card downloads, and online payment gates reduces school administrative costs and increases payment timeliness.
**User Value:** 
* **Parents:** Can track multiple children (siblings) in the same school from a single login, oversee daily presence, verify report card grades, and make secure fee payments.

---

## 2. Submodules
* **ParentLogin:** Handles parent portal authentication settings, contact detail verification, and multi-child sibling switching.
* **ChildOverview:** Displays the master dashboard showing class details, class teacher contacts, and basic warning signals.
* **AttendanceView:** Renders monthly attendance grids and color-coded calendars indicating present/absent days.
* **FeeView:** Displays invoice status lists, payment histories, and processes online UPI/card payments.
* **Results:** Shows published exam scores, CBSE grade letters, and hosts downloadable report card files.
* **Notices:** Shows bulletins and circular downloads filtered specifically to the child's class level.

---

## 3. Folder Structure (Domain-Driven)
```text
12_ParentPortal/
├── ParentLogin/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── ChildOverview/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── AttendanceView/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── FeeView/
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
* `ParentLogin/parent-login.controller.ts`, `ParentLogin/parent-login.service.ts`
* `ChildOverview/child.controller.ts`, `ChildOverview/child.service.ts`
* `AttendanceView/parent-attendance.controller.ts`, `AttendanceView/parent-attendance.service.ts`
* `FeeView/parent-fee.controller.ts`, `FeeView/parent-fee.service.ts`
* `Results/parent-result.controller.ts`, `Results/parent-result.service.ts`
* `Notices/parent-notice.controller.ts`

---

## 5. Frontend Files
* `src/12_ParentPortal/ParentDashboard.tsx` (Child picker sidebar, attendance summary bars, due bills lists, and class calendar schedules)
* `src/12_ParentPortal/ChildSelector.tsx` (Profile cards allowing switching between siblings in a parent session)
* `src/12_ParentPortal/ParentPaymentsCard.tsx` (UPI checkout widgets and transaction history download buttons)

---

## 6. Database Entities (Prisma / SQL schema models)
*(This module leverages the core schema tables, tracking relationships via mapping keys):*

* **`ParentProfile`**: id, user_id (foreign key to User), primary_phone, primary_email, address, secondary_phone (nullable), occupation (nullable), annual_income (nullable)
* **`ParentStudentLink`**: parent_id (foreign key to ParentProfile), student_id (foreign key to Student), relationship (ENUM: FATHER, MOTHER, GUARDIAN), is_authorized_picker (boolean, for school exit logs)

---

## 7. API Endpoints

### Sibling Context
* `GET /api/v1/parent/siblings` - Retrieve list of student profiles linked to the logged-in parent
* `GET /api/v1/parent/sibling/:studentId/overview` - Fetch current metrics (class, teacher, fees status)

### Child Specific Sheets
* `GET /api/v1/parent/sibling/:studentId/attendance` - Fetch daily/monthly attendance list
* `GET /api/v1/parent/sibling/:studentId/fees` - Fetch fee structures, outstanding balances, and invoices
* `GET /api/v1/parent/sibling/:studentId/results` - Fetch published exam scores and grades
* `GET /api/v1/parent/sibling/:studentId/notices` - Fetch notice board announcements targeting child's class

---

## 8. Role Permissions

* **Super Admin / Institute Admin:** Manage parent account records and configure `ParentStudentLink` matches.
* **Parent:** Access restricted to pages linking to their children. Restricted from querying data of students not mapped to their profile.
* **Teacher / Student / Accountant:** Denied access to parent portal endpoints.

---

## 9. Dashboard Widgets

* **Child Profile Switcher:** Simple cards selector to shift views between siblings.
* **Outstanding Fee Banner:** Alert card showing unpaid fee counts and due date parameters.
* **Attendance Ring Gauge:** Circle metric tracking attendance percentage (warns red if below 75%).
* **Circular Board Feed:** Scroll list displaying latest notice letters published to the child's class section.

---

## 10. Reports
*(Self-service PDF files parent accounts can download directly):*
* **Academic Term Report Card:** Formatted PDF download of published student evaluation outcomes.
* **Tax-Exemption Fee Ledger:** Printable statement of payments made during the academic year for local tax filing.

---

## 11. Audit Requirements

**Must Log Actions:**
* Portal login timestamps.
* Sibling context switching events in the parent session.
* Initiation of fee payment actions.
* Download actions of report cards or fee ledger files.

**Tracked Fields:**
* `parent_id`, `student_id` (selected child ID), `actor_id` (Parent User ID).
* `action_type` (e.g., `SWITCH_CHILD_CONTEXT`, `DOWNLOAD_REPORT_CARD`, `INITIATE_PAYMENT`).
* `timestamp` and `ip_address`.

---

## 12. Security Requirements

* **Validation Rules:**
  * **Link Validation Check:** Prior to returning data, backend middleware must verify that the requested student ID maps to an active relationship with the authenticated parent User ID.
* **Authorization Checks:**
  * Enforce the `ParentSiblingGuard` on all portal APIs to prevent URL manipulation attacks (e.g., trying to view another student's fee details by altering the ID in the request parameters).
* **Tenant Isolation:**
  * Branch scope is checked using child student files. If a parent has kids in different branch locations, the token dynamically maps context per child branch.
* **Data Protection:**
  * Bank account and sensitive parent details are stored encrypted at rest.
  * PDF report card S3 paths are kept private, generated only on-the-fly using secure pre-signed links valid for 5 minutes.
