# AURXON ERP Lite - Module Architecture: 07_Staff

## 1. Module Purpose
The `07_Staff` module provides Human Resource Management (HRM) capabilities to manage the institution's employee lifecycle. It covers onboarding profiles, employment contracts, verification documents, leave applications, and monthly salary slip processing.

**Business Value:** It standardizes employee records, tracks legal compliance documents (PAN, identity, contracts), automates the leave approval workflow, and generates accurate monthly payroll slip vouchers. This ensures regulatory compliance, prevents payment errors, and streamlines staff retention.
**User Value:** 
* **HR Managers / Admins:** Onboard teachers, review leave requests, verify certifications, and run monthly payroll.
* **Accountants:** Calculate salaries, adjust deductions, and view institutional spending.
* **Teachers / General Staff:** Apply for leaves online, monitor approval statuses, and download monthly salary slips.

---

## 2. Submodules
* **StaffProfile:** Manages employee master files containing basic details, credentials, department details, designation roles, and salary specifications.
* **Documents:** Handles the upload, classification, and verification of contracts, identity logs, and educational credentials.
* **Leave:** Oversees staff leave balances, tracks casual/medical leave consumption, and hosts the leave approval workflow.
* **Salary:** Operates the payroll engine to compile allowances, calculate deductions, and disburse sequential payslip vouchers.
* **Roles:** Handles sub-designations (e.g., Department Head, Class Coordinator) linked to specific staff roles.
* **StaffAttendance:** Integrates checked-in timesheets from the attendance registry into the payroll calculation pipeline.

---

## 3. Folder Structure (Domain-Driven)
```text
07_Staff/
├── StaffProfile/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── Documents/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── Leave/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── Salary/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── Roles/
│   ├── Controllers/
│   └── Services/
└── StaffAttendance/
    ├── Controllers/
    └── Services/
```

---

## 4. Backend Files
* `StaffProfile/staff.controller.ts`, `StaffProfile/staff.service.ts`, `StaffProfile/dto/hire-staff.dto.ts`
* `Documents/staff-doc.controller.ts`, `Documents/staff-doc.service.ts`
* `Leave/leave.controller.ts`, `Leave/leave.service.ts`, `Leave/dto/request-leave.dto.ts`
* `Salary/payroll.controller.ts`, `Salary/payroll.service.ts`, `Salary/dto/generate-slip.dto.ts`
* `Roles/staff-roles.service.ts`

---

## 5. Frontend Files
* `src/07_Staff/StaffProfile/HrTab.tsx` (Staff Directory Search, Salary Slip Vault logs, and Apply/Approve Leave desks)
* `src/07_Staff/StaffProfile/hr/EmployeeProfileModal.tsx` (Deep detail editor for contracts, banking credentials, and documents)
* `src/07_Staff/Salary/PayrollVoucherSlip.tsx` (Print-friendly format for employee salary slips)

---

## 6. Database Entities (Prisma / SQL schema models)

* **`Staff`**: id, user_id (foreign key to User), branch_id, employee_id (unique identifier string), first_name, last_name, email, phone, designation, department, joining_date, salary (monthly base rate), status (ENUM: ACTIVE, INACTIVE, SUSPENDED, RESIGNED)
* **`StaffDocument`**: id, staff_id (foreign key to Staff), doc_name (e.g., PAN_CARD, DEGREE), file_url, status (ENUM: PENDING, VERIFIED, REJECTED), verified_by (foreign key to User), uploaded_at
* **`StaffLeave`**: id, staff_id (foreign key to Staff), start_date, end_date, reason, status (ENUM: PENDING, APPROVED, REJECTED), evaluated_by (foreign key to User), evaluated_at
* **`StaffLeaveBalance`**: id, staff_id (foreign key to Staff), leave_type (ENUM: CASUAL, SICK, MATERNITY, LOP), entitlement (integer), consumed (integer)
* **`StaffPayroll`**: id, branch_id, staff_id (foreign key to Staff), month (e.g., "2026-05"), base_salary, allowances, deductions, net_pay, receipt_number (unique sequential payroll string), status (ENUM: DRAFT, PAID, REVERTED), paid_at

---

## 7. API Endpoints

### Staff Directory
* `GET /api/v1/staff` - Search staff registry (scoped to branch, filter by designation/department)
* `POST /api/v1/staff/hire` - Onboard a new employee and auto-generate basic Core User credentials
* `GET /api/v1/staff/:id` - Fetch comprehensive profile particulars (banking, details)

### Leave Management
* `POST /api/v1/staff/leaves/apply` - Submit a leave request (authenticated employee only)
* `GET /api/v1/staff/leaves` - List leave applications (teachers see their own; Admins see all)
* `PATCH /api/v1/staff/leaves/:id/evaluate` - Approve or reject leave application

### Payroll & Salaries
* `POST /api/v1/staff/payroll/generate` - Generate salary slip voucher details
* `GET /api/v1/staff/payroll/slips` - View salary slips (teachers locked to their own profiles)

---

## 8. Role Permissions

* **Super Admin:** Global audit of salary allocations across branches. Override system designations.
* **Institute Admin / HR Manager:** Full CRUD on Staff Profiles, Leave approvals, Payroll processing, and employee document validation.
* **Accountant (Staff):** Read staff rosters, run payroll slips, record salary disbursements. Cannot edit base contracts or approve leave requests.
* **Teacher / General Employee:** Read-only access to employee directory lists. Full read-write on their personal leaves desk (apply for leaves). Read-only for their own payslip records.

---

## 9. Dashboard Widgets

* **Staff Distribution Pie:** Visualizes headcount per department (Teaching, Admin, Operations, Security).
* **Leave Requests Desk:** Count indicator of pending leave requests awaiting approval.
* **Payroll Expense Counter:** Total salary budget paid vs pending for the current cycle.
* **Contract Expiry Alert:** Flags employees whose contracts are ending within 30 days.

---

## 10. Reports

* **Employee Salaries Sheet:** Consolidated ledger showing staff payouts, PF deductions, allowances, and net salaries (essential for bank CSV exports).
* **Leave Entitlement Matrix:** Breakdown of casual/sick leave totals consumed by each employee.
* **Timesheet Discrepancy Ledger:** Matches attendance records with payroll LOP (Loss of Pay) deductions.
* **Onboarding Completeness Audit:** Highlights employees missing mandatory credentials (e.g., PAN, Degree uploads).

---

## 11. Audit Requirements

**Must Log Actions:**
* Updates to employee contract wages (`Staff.salary`).
* Termination or status change of an employee.
* Leave application decisions (Approval/Rejection with decision-maker ID).
* Payroll payouts and slip voids.

**Tracked Fields:**
* `staff_id`, `payroll_id`, `actor_id` (Admin/HR User ID).
* `action_type` (e.g., `HIRE_STAFF`, `SET_SALARY`, `EVALUATE_LEAVE`).
* `previous_salary`, `new_salary` (if applicable).
* `timestamp` and `ip_address`.

---

## 12. Security Requirements

* **Validation Rules:**
  * **Leave Date Validation:** Leave start date must be before or equal to leave end date. Leave request dates cannot overlap existing approved leaves.
  * **Wages Boundary:** Monthly base salary and allowances must be numeric and non-negative.
* **Authorization Checks:**
  * Only users carrying `HR_Manager`, `Institute_Admin`, or `Super_Admin` roles can invoke onboarding and base contract settings.
  * Teachers are prevented from querying salary details, documents, or personal registers of other employees.
* **Tenant Isolation:**
  * All queries must append `WHERE branch_id = :branchId` extracted from JWT claims. HR managers cannot edit staff details outside their branch.
* **Data Protection:**
  * Sensitive data (e.g., Bank Account Numbers, PAN, Aadhaar) must be encrypted at rest in the database.
  * Document upload repositories must reject files larger than 10MB and enforce MIME type checks (PDF, JPG, PNG only).
