# AURXON ERP Lite - Module Architecture: 02_Admission

## 1. Module Purpose
The `02_Admission` module handles the entire lifecycle of a student entering the institution, from initial application inquiry to full enrollment.

**Business Value:** It digitizes the traditionally paper-heavy enrollment process, reducing manual data entry errors, ensuring KYC/identity compliance (Aadhaar/PAN), and establishing a strict audit trail for fee deposits and document verification.
**User Value:** Parents experience a seamless digital onboarding and tracking pipeline. Administrators benefit from automated scholar number generation, structured workflows (Approve/Reject/Request Resubmission), and integrated address validation.

---

## 2. Submodules
* **Application Intake:** Inquiry forms, lead tracking, and initial application submission.
* **Admission Workflow:** State machine managing application status (Draft -> Submitted -> Under Review -> Approved -> Enrolled / Rejected).
* **Identity & Document Verification:** KYC processing, Aadhaar integration tracking, document upload and OCR/manual validation.
* **Parent/Guardian Linkage:** Creating or associating existing parent profiles to sibling applications.
* **Scholar Number Generation:** Rule-based automatic generation of permanent student IDs upon enrollment.
* **Address Lookup:** PIN code integration to auto-fetch State, City, and District data.
* **Student Profile (Core Record):** Finalized student master data upon successful admission.

---

## 3. Folder Structure (Domain-Driven)
```text
02_Admission/
├── ApplicationIntake/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── AdmissionWorkflow/
│   ├── Controllers/
│   ├── Services/
│   ├── StateMachine/
│   └── DTOs/
├── IdentityVerification/
│   ├── Controllers/
│   ├── Services/
│   └── Providers/
├── Documents/
│   ├── Controllers/
│   ├── Services/
│   └── Utilities/
├── ScholarNumber/
│   ├── Services/
│   └── Generators/
├── AddressLookup/
│   └── Services/
├── ParentProfile/
│   ├── Controllers/
│   └── Services/
└── StudentProfile/
    ├── Controllers/
    ├── Services/
    └── DTOs/
```

---

## 4. Backend Files
* `ApplicationIntake/application.controller.ts`, `ApplicationIntake/application.service.ts`
* `AdmissionWorkflow/workflow.controller.ts`, `AdmissionWorkflow/workflow.service.ts`
* `IdentityVerification/aadhaar-verify.service.ts`, `IdentityVerification/kyc.controller.ts`
* `Documents/upload.controller.ts`, `Documents/document-validation.service.ts`
* `ScholarNumber/scholar-number.service.ts` (Contains pattern logic e.g., `[YEAR]-[BRANCH]-[SEQ]`)
* `AddressLookup/pincode.service.ts`
* `StudentProfile/student.controller.ts`, `StudentProfile/student.service.ts`, `StudentProfile/create-student.dto.ts`

---

## 5. Frontend Files
* `src/02_Admission/ApplicationIntake/PublicAdmissionForm.tsx`, `src/02_Admission/ApplicationIntake/LeadTracker.tsx`
* `src/02_Admission/AdmissionWorkflow/ApplicationReviewKanban.tsx`, `src/02_Admission/AdmissionWorkflow/ApprovalModal.tsx`
* `src/02_Admission/Documents/DocumentUploadZone.tsx`, `src/02_Admission/Documents/VerificationViewer.tsx`
* `src/02_Admission/ParentProfile/ParentSearchAndLink.tsx`
* `src/02_Admission/StudentProfile/StudentsTab.tsx`, `src/02_Admission/StudentProfile/StudentDetailView.tsx`

---

## 6. Database Entities (Prisma / SQL schema models)

* **`AdmissionApplication`**: id, branch_id, application_number, status (ENUM: DRAFT, SUBMITTED, REVIEW, RESUBMIT, APPROVED, REJECTED, ENROLLED), applied_grade, submitted_at, processed_by
* **`ApplicantDetail`**: id, application_id, first_name, last_name, dob, gender, blood_group, aadhaar_number, nationality
* **`ApplicantAddress`**: id, application_id, address_line1, address_line2, pincode, city, state, country, type (CURRENT/PERMANENT)
* **`ApplicantParent`**: id, application_id, parent_id (nullable, links to existing Parent if matched), relation, name, phone, email, occupation, annual_income
* **`ApplicantDocument`**: id, application_id, doc_type (e.g., BIRTH_CERT, AADHAAR, TRANSFER_CERT), file_url, status (PENDING, VERIFIED, REJECTED), rejection_reason, verified_by, verified_at
* **`Student`**: id, branch_id, scholar_number, admission_date, user_id (links to Core.User), parent_id (links to Core.User), first_name, last_name, dob, gender, blood_group, current_grade, current_section, status (ACTIVE, ALUMNI, EXPELLED)
* **`Parent`**: id, user_id, primary_contact, secondary_contact, primary_email, address, aadhaar_number
* **`ScholarSequence`**: branch_id, academic_year, last_sequence_value (Used to guarantee atomic scholar number generation without race conditions)

---

## 7. API Endpoints

### Application Intake & Workflow
* `POST /api/v1/admission/apply` - Public endpoint to submit a new application
* `GET /api/v1/admission/applications` - List applications (supports filtering by status, grade)
* `PATCH /api/v1/admission/applications/:id/status` - Transition application status (e.g., Request Resubmission, Approve)

### Documents & Identity
* `POST /api/v1/admission/applications/:id/documents` - Upload applicant document
* `PATCH /api/v1/admission/documents/:docId/verify` - Mark document as VERIFIED or REJECTED (with reason)
* `POST /api/v1/admission/verify-aadhaar` - Verify Aadhaar format/checksum

### Final Enrollment (Student Creation)
* `POST /api/v1/admission/applications/:id/enroll` - Converts an APPROVED application into a formal Student record, generates Scholar Number, links/creates Parent record, and generates Core User credentials.

### Utilities
* `GET /api/v1/admission/address/pincode/:pin` - Returns City and State for a PIN code.

---

## 8. Role Permissions

* **Super Admin**: View all applications globally. Configure Scholar Number generation rules.
* **Institute Admin**: Manage all applications within their Branch. Can override document rejections and force approvals.
* **Admission Officer / Staff**: Primary actors. Can view applications, verify documents, and change status to APPROVED/REJECTED. Cannot configure Scholar Number rules.
* **Parent (Applicant)**: Can view their own application status via a public tracker link or temporary portal. Can upload documents if status is RESUBMIT.
* **Teacher / Student**: No access to the admission pipeline.

---

## 9. Dashboard Widgets (Admission Officer View)

* **Admission Funnel**: visual chart showing Leads -> Applied -> Approved -> Enrolled.
* **Pending Verifications**: Count of documents awaiting manual review.
* **Today's Enrollments**: Real-time counter of students successfully enrolled today.
* **Applications by Grade**: Bar chart showing demand per class/grade.

---

## 10. Reports

* **Admission Conversion Report**: Conversion rates from inquiry to enrollment.
* **Demographics Report**: Geographic spread (based on PIN code) and gender ratio of new intakes.
* **Document Discrepancy Report**: List of applications stuck in RESUBMIT status for > 7 days.
* **Daily Admission Register**: Traditional ledger format report of all enrollments for a given day (required for compliance).

---

## 11. Audit Requirements

**Must Log Actions:**
* Every state transition in `AdmissionApplication.status`.
* Acceptance or Rejection of an `ApplicantDocument` (who verified it, when, and why if rejected).
* Final conversion of an application to a Student (Enrollment event).

**Tracked Fields:**
* `application_id`, `actor_id` (Staff who performed the action).
* `previous_status`, `new_status`.
* `timestamp`, `ip_address`.

---

## 12. Security Requirements

* **Validation Rules:** 
  * Strict regex validation for Aadhaar (12 digits, specific checksum if applicable) and Phone numbers (CountryPhoneInput format).
  * File upload validation (Strict MIME type checking for PDF, JPG, PNG only. Max size 5MB) to prevent malicious payloads.
* **Authorization Checks:** `RolesGuard` ensures only `Admission Officer` or `Institute Admin` can trigger the `enroll` endpoint.
* **Tenant Isolation:** All GET requests for applications MUST be scoped by the JWT's `branch_id`. Cross-branch application access is strictly forbidden unless Super Admin.
* **Data Protection:** 
  * `aadhaar_number` in `ApplicantDetail` and `Parent` must be encrypted at rest.
  * Document URLs must be signed (e.g., AWS S3 pre-signed URLs) with short expirations; they should never be publicly accessible static links.
  * Scholar Number generation must utilize transactional database locks (e.g., `SELECT FOR UPDATE` on `ScholarSequence`) to prevent duplicate IDs during concurrent high-volume enrollment periods.
