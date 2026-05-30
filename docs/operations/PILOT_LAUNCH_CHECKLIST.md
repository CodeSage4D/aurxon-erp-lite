# AURXON ERP Lite — Institutional Pilot Launch Playbook & Onboarding Checklist

This document serves as the official handbook and operational guide for onboarding new educational institutions onto the AURXON ERP Lite system. It establishes standardized procedures for multi-tenant branch setup, user provisioning, academic term configuration, User Acceptance Testing (UAT), and defect resolution.

---

## 1. Pre-Deployment Readiness Check
Before starting institutional provisioning, ensure the baseline environments are active:
- [ ] **Production Environment Up**: Front-end (Next.js) and Back-end (NestJS) are compiling cleanly with zero errors.
- [ ] **Database Connection Secure**: Neon PostgreSQL server is online with SSL enabled.
- [ ] **S3 Backup Storage Configured**: Object storage buckets (`aurxon-production-vault`) are provisioned with daily pg_dump cron jobs and retention lifecycles.
- [ ] **Email/SMS Terminals Active**: Verified SMTP/SMS keys configured in environments for real-time circular notifications.

---

## 2. Onboarding Workflow Checklist

### Phase 2.1: Institutional & Branch Setup
Execute the following step-by-step SQL scripts or call Admin API endpoints:
- [ ] **Create Institution Record**:
  - Provision the primary tenant table entry (`Institution` model).
  - Assign primary theme colors (e.g. Design System V2 default accent `#2563EB`).
- [ ] **Provision Branches**:
  - Add individual branch records (e.g. Middle School Branch, High School Branch, Primary Wing).
  - Connect branches to the parent `Institution` via foreign keys to guarantee strict multi-tenant boundary compliance.
- [ ] **Set Academic Year**:
  - Provision the active term index (e.g. Academic Year `2026-2027`).
- [ ] **Map Boards & Streams**:
  - Setup CBSE/ICSE regulatory boards.
  - Setup standard Streams (Science, Commerce, Arts, General).

### Phase 2.2: User Provisioning & RBAC Setup
Provide strict Role-Based Access Control (RBAC) credentials:
- [ ] **Administrative Core**:
  - Provision `SUPER_ADMIN` and `INSTITUTE_ADMIN` credentials for branch coordinators.
- [ ] **Operational Staff**:
  - Provision `ACCOUNTANT` for the Fees and Finance desk.
  - Provision `LIBRARIAN` for library checkout desks.
  - Provision `HR_MANAGER` to oversee staff rosters and payroll.
- [ ] **Instructional Staff (Teachers)**:
  - Generate teacher user logins automatically in bulk, mapping each to a specific `Staff` record.
  - Apply standard credential default templates (`password123`).
- [ ] **Scholars & Guardians (Students & Parents)**:
  - Bulk upload student profile records using the CSV Admissions Template.
  - Automatically map parents (`Parent` model) to their respective child scholars (`Student` model).
  - Generate secure individual student scholar accounts in the user pool.

---

## 3. Academic Structure Setup

Follow this logical dependency sequence to build the branch schedules:
1. **Class/Grade Setup**: Define Standards and Sections (e.g. `Grade 10-A`, `Grade 11-A`).
2. **Subject Assignment**: Map subjects (e.g. `Advanced Mathematics`, `Introductory Physics`) to classes.
3. **Class Teachers Link**: Assign primary teachers to standard sections.
4. **Timetable Grid Generation**: Create the weekly schedule slots. Ensure the backend conflict check validation executes to prevent duplicate assignments for the same period.
5. **Fee Structures Allocations**: Define tuition, lab, and transport fee indexes and allocate them to eligible classes.
6. **Exams Setup**: Define CBSE / State Board unit tests or terminal exams parameters.

---

## 4. Multi-Role UAT Validation Cases

Run these interactive test scenarios to validate Design System V2 and the role-based action dashboards:

### Scenarios 4.1: Principal & Admin Dashboard (Cockpit)
- [ ] **Verification Case 4.1.1: Leave Approval Flow**
  - **Action**: Locate the "Leaves Pending Review" card. Click `[Quick Approve]` on a pending leave request.
  - **Expected Result**: Leave request status changes, the card is filtered out, a successful circular dispatch notification toast is rendered, and the teacher's leave balance consumed index increments by 1 in the database.
- [ ] **Verification Case 4.1.2: Scholar ID Assignment**
  - **Action**: Locate a scholar in the admissions pipeline card and click `[Assign Scholar ID]`.
  - **Expected Result**: A permanent Scholar ID index is cryptographically generated and assigned, updating the student's status.
- [ ] **Verification Case 4.1.3: SRE Security Hash Validation**
  - **Action**: Locate the Encryption Warning card and click `[Stamp Cryptographic Hashes]`.
  - **Expected Result**: The simulation runs, signatures are generated, and a confirmation toast is rendered. All future document uploads now enforce strict SHA-256 integrity rules.

### Scenarios 4.2: Teacher Dashboard (Classroom Hub)
- [ ] **Verification Case 4.2.1: Daily Roll-Call Notice**
  - **Action**: Locate the outstanding roll-call card on the dashboard. Click `[Take Attendance Now]`.
  - **Expected Result**: Redirects to the Attendance Desk with Grade 10-A roster loaded automatically.
- [ ] **Verification Case 4.2.2: Homework Grading**
  - **Action**: Locate a pending submission in the Homework Evaluation card. Click `[Enter Grade]`, input a score (e.g. `95`), and click the checkmark.
  - **Expected Result**: Renders a success toast and commits the score to the student result sheets.

### Scenarios 4.3: Parent Dashboard (Family Portal)
- [ ] **Verification Case 4.3.1: Secure Fee Settlement**
  - **Action**: Click `[Pay Tuition Dues Securely]` on the outstanding dues card. Select a payment method in the Stripe Sandbox, and click `[Authorize Payment Sandbox]`.
  - **Expected Result**: The payment simulation processes. Receipt is generated, dues total drops to ₹0, and a green "Settle Compliant" badge is rendered.

### Scenarios 4.4: Student Dashboard (Academics Desk)
- [ ] **Verification Case 4.4.1: Homework PDF Submission**
  - **Action**: Find an assignment in the homework card, click `[Turn In PDF]`, select a simulated worksheet, and click `[Upload & Turn In]`.
  - **Expected Result**: Homework status transitions from PENDING to SUBMITTED. A success toast notifies the student.

---

## 5. Defect Severity & Launch Readiness Thresholds

During UAT phases, categorize all incoming issues using the following metrics:

| Severity Level | Description | Resolution Target | Pilot Go/No-Go Rule |
| :--- | :--- | :--- | :--- |
| **Blocker (Critical)** | Core flow is broken (e.g. SQL boundary leak, RBAC authorization failure, broken payment checkout). | Within 4 hours | Must be 100% resolved before launch. |
| **High** | Subsystem failing (e.g. Timetable conflict check backend failing, CSV parser failure). | Within 24 hours | Must be resolved before pilot start. |
| **Medium** | Minor functional bugs (e.g. toast notification delayed, modal overflow issue). | Within 3 days | Maximum 3 outstanding items allowed. |
| **Low (Polish)** | Readability, color variables minor contrast shifts, scrollbar styling. | Within 5 days | Permitted to go live, resolved post-launch. |

---

## 6. Feedback & Rollout Operations

- **Feedback Logs**: All feedback during UAT must be recorded dynamically using the Admin operations ticketing desk.
- **Rollout Phases**:
  - **Cohort A (Alpha)**: 5 Principal users, 10 Teachers, 20 Parents.
  - **Cohort B (Beta)**: Full Grade 10 and Grade 11 student and parent rosters (50+ users).
  - **Institutional Launch**: Global campus rollouts (500+ active sessions).
