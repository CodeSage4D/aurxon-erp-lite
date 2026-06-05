# Enterprise School ERP - API Architecture Specification

## 1. REST & GraphQL Design Principles

The API layer is built as an **API-First, Multi-Tenant Gateway** using NestJS Controllers. It exposes REST endpoints for transactional mutations and state changes, alongside a GraphQL Gateway for dashboard queries, reporting analytics, and batch reads.

### 1.1 Base Headers & Tenancy Identification
Every API request must include the following headers:
- `Authorization`: `Bearer <JWT_ACCESS_TOKEN>` containing user metadata.
- `X-Tenant-ID`: The unique UUID of the Institution. Used by middleware to set context routing rules before queries run.

---

## 2. API Conventions & Error Standards

### 2.1 Standardized Error Schema (RFC 7807 Compliant)
If an error occurs, the server returns a structured payload:
```json
{
  "type": "https://api.aurxon.com/errors/insufficient-balance",
  "title": "Transaction Validation Failed",
  "status": 422,
  "detail": "The transaction could not be journalized because the sum of credits ($1500) does not equal debits ($1600).",
  "instance": "/api/v1/finance/ledger/journal-entries",
  "code": "DOUBLE_ENTRY_ASYMMETRY",
  "timestamp": "2026-06-05T12:20:00Z"
}
```

### 2.2 Pagination, Sorting & Filtering Query Format
All `GET` collection endpoints support standardized parameters:
- **Pagination**: `page=1&limit=50` (Default: 20, Max: 100). Metadata is returned in headers (`X-Total-Count`, `X-Total-Pages`) and response bodies.
- **Sorting**: `sort=lastName,-admissionDate` (Minus prefix indicates descending order).
- **Filtering**: Nested query filters, e.g. `filter[classId]=uuid&filter[status]=ACTIVE&filter[birthDate][gte]=2015-01-01`.

---

## 3. High-Fidelity API Endpoints

### 3.1 Fee Payment Processing & Receipt Generation
Processes an online or cash payment, registers the transaction, updates student allocation balances, and posts ledger entries.

- **URL**: `POST /api/v1/finance/payments`
- **Headers**:
  ```http
  Authorization: Bearer token-string
  X-Tenant-ID: inst-uuid-101
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "allocationId": "alloc-9923-88a",
    "paymentMethod": "UPI",
    "amount": 7500.00,
    "paymentDate": "2026-06-05T12:22:00Z",
    "gatewayReference": "UPI-PAY-8829910129",
    "remarks": "Term 2 Tuition fees paid via UPI",
    "ledgerMapping": {
      "debitAccountCode": "10200",
      "creditAccountCode": "30100"
    }
  }
  ```
- **Response Payload (`201 Created`)**:
  ```json
  {
    "success": true,
    "data": {
      "paymentId": "pay-uuid-552",
      "receiptNumber": "REC-2026-05-00122",
      "allocationId": "alloc-9923-88a",
      "amountPaid": 7500.00,
      "remainingBalance": 0.00,
      "status": "PAID",
      "ledgerTransactionId": "txn-uuid-883",
      "receiptPdfUrl": "https://s3.ap-south-1.amazonaws.com/aurxon-receipts/inst-uuid-101/REC-2026-05-00122.pdf"
    }
  }
  ```

### 3.2 Exam Result Processing & Formula Execution
Calculates final grade marks for a student or class using the class formula mapping configuration.

- **URL**: `POST /api/v1/exams/calculations/process`
- **Request Body**:
  ```json
  {
    "classId": "class-uuid-441",
    "subjectId": "subj-uuid-990",
    "academicYearId": "year-uuid-2026",
    "examFormulaId": "formula-uuid-10",
    "studentIds": ["student-uuid-001", "student-uuid-002"]
  }
  ```
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "processedCount": 2,
    "results": [
      {
        "studentId": "student-uuid-001",
        "rawTheory": 58,
        "rawPractical": 28,
        "rawInternal": 9,
        "calculatedTotal": 95,
        "gradeLetter": "A1",
        "gradePoints": 10.0,
        "passStatus": "PASS",
        "marksheetGenerated": true
      }
    ]
  }
  ```

### 3.3 Leave Request Validation & Workflow Step Progression
Executes the next node in the leave approval chain.

- **URL**: `PUT /api/v1/staff/leaves/:leaveId/approve`
- **Request Body**:
  ```json
  {
    "status": "APPROVED",
    "remarks": "Leave approved. Cover arrangements mapped to substitute teacher ID: substitute-uuid-33.",
    "currentStepRole": "HOD"
  }
  ```
- **Response Payload (`200 OK`)**:
  ```json
  {
    "success": true,
    "leaveId": "leave-uuid-4992",
    "currentState": "PENDING_PRINCIPAL_APPROVAL",
    "nextApproverRole": "PRINCIPAL",
    "updatedAt": "2026-06-05T12:25:00Z"
  }
  ```

---

## 4. REST Endpoint Catalog (Targeting 200+ Routes)

The REST gateway is organized into modular endpoints to expose functionalities to different client apps.

### 4.1 01_Core Modules (24 Routes)
- `POST /api/v1/auth/login` (User login, returns JWT tokens and permissions preset)
- `POST /api/v1/auth/mfa/enable` (Initializes 2FA QR code configurations)
- `POST /api/v1/auth/refresh-token` (Exchanges refresh token for new access token)
- `GET /api/v1/institutions` (Lists all institutions for multi-tenant platform admin)
- `POST /api/v1/institutions` (Creates new SaaS tenant instance)
- `GET /api/v1/settings` (Get active settings for tenant settings dashboard)
- `GET /api/v1/audit-logs` (Audit logger list for security auditor panel)

### 4.2 02_Admission Modules (20 Routes)
- `POST /api/v1/admissions/inquiry` (Submits a student inquiry form)
- `GET /api/v1/admissions/applications` (Filters admission applications for officers)
- `POST /api/v1/admissions/applications/:id/verify-aadhaar` (Trigger UIDAI validation flow)
- `POST /api/v1/admissions/applications/:id/enroll` (Converts application to Student profile)

### 4.3 03_Academics Modules (32 Routes)
- `GET /api/v1/academics/classes` (Lists classes configured under current board)
- `POST /api/v1/academics/classes/:classId/sections` (Adds sections to a class)
- `POST /api/v1/academics/subjects/map` (Maps subjects to class and corresponding teachers)
- `GET /api/v1/academics/timetable` (Lists active timetable schedules)

### 4.4 04_Attendance Modules (16 Routes)
- `POST /api/v1/attendance/students` (Submits student daily attendance markers)
- `GET /api/v1/attendance/students/defaulters` (Lists students below minimum requirements)
- `POST /api/v1/attendance/biometric/sync` (Webhooks for biometric device transaction push)

### 4.5 05_Fees & Finance Modules (40 Routes)
- `POST /api/v1/finance/fee-structures` (Defines class fee components)
- `POST /api/v1/finance/allocations` (Allots fee requirements to student profiles)
- `GET /api/v1/finance/ledger/accounts` (Chart of Accounts metadata query)
- `POST /api/v1/finance/ledger/journal-entries` (Direct transaction ledger poster)

### 4.6 06_Exams Modules (28 Routes)
- `POST /api/v1/exams/setup` (Configure mid-term, final exams parameters)
- `POST /api/v1/exams/marks/submit` (Teachers post theory/practical marks)
- `GET /api/v1/exams/report-cards/generate` (Triggers bulk PDF engine runs)

### 4.7 07_Staff & Payroll Modules (20 Routes)
- `POST /api/v1/staff/profiles` (Registers new employee records)
- `POST /api/v1/staff/payroll/slips` (Generates monthly salary runs and posts ledger entry)

### 4.8 08_Communication Modules (12 Routes)
- `POST /api/v1/communication/circulars` (Post notices to parents, teachers portals)

### 4.9 11_Documents Modules (16 Routes)
- `GET /api/v1/documents/certificates/tc` (TC issuance request and PDF creation)

### 4.10 12_Parent & Student Portal (12 Routes)
- `GET /api/v1/portal/student/homework` (Retrieves assigned homework list)
- `POST /api/v1/portal/student/homework/:id/submit` (Submits homework file upload)
- `GET /api/v1/portal/parent/invoice-history` (Parent fee invoice query list)
