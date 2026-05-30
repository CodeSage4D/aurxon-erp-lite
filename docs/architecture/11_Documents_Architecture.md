# AURXON ERP Lite - Module Architecture: 11_Documents

## 1. Module Purpose
The `11_Documents` module handles the Document Management System (DMS) and official document rendering operations of the institution. It manages cloud file upload states, generates official printable certificates (Bonafide, Character, Transfer Certificates), renders school ID cards, and compiles academic mark sheets.

**Business Value:** It centralizes document generation, prints student/staff ID cards, automates CBSE-compliant Transfer Certificate (TC) workflows, and secures uploaded files. Tracking issued documents with unique verification hashes prevents document fraud and keeps the school compliant with local regulations.
**User Value:** 
* **Administrators / Principals:** Issue character certificates, compile student mark sheets, generate and print ID cards, and authorize final Transfer Certificates (TC).
* **Teachers:** Request study/bonafide certificates for class students.
* **Parents / Students:** Download issued certificates, view digital ID cards, and export mark sheets from their portals.

---

## 2. Submodules
* **Uploads:** Secure file upload router that validates MIME types, checks size limits, and logs cloud S3 storage reference metadata.
* **Certificates:** Instantly generates, signs, and logs official school certificates (Bonafide/Study, Character, and Transfer Certificates).
* **IDCards:** Formats print-ready school identity cards for both students and staff, complete with barcode or QR structures.
* **MarkSheets:** Compiles raw exam results into term-wise transcripts or final annual mark sheets.
* **Archive:** Organizes and preserves historical student portfolios, registration records, and files for subsequent lookup.

---

## 3. Folder Structure (Domain-Driven)
```text
11_Documents/
├── Uploads/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── Certificates/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── IDCards/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── MarkSheets/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
└── Archive/
    ├── Controllers/
    ├── Services/
    └── DTOs/
```

---

## 4. Backend Files
* `Uploads/upload.controller.ts`, `Uploads/upload.service.ts`
* `Certificates/certificate.controller.ts`, `Certificates/certificate.service.ts`, `Certificates/dto/compile-cert.dto.ts`
* `IDCards/idcard.controller.ts`, `IDCards/idcard.service.ts`
* `MarkSheets/marksheet.controller.ts`, `MarkSheets/marksheet.service.ts`
* `Archive/archive.controller.ts`, `Archive/archive.service.ts`

---

## 5. Frontend Files
* `src/11_Documents/Certificates/CertificatesTab.tsx` (Document parameters panel, study/character/TC selectors, and print previews with digital signatures)
* `src/11_Documents/IDCards/IdCardPrintGrid.tsx` (Formatted layout displaying printable student/staff badge structures)
* `src/11_Documents/Archive/DigitalCabinet.tsx` (Cabinet layout browsing archived student dossiers and contracts)

---

## 6. Database Entities (Prisma / SQL schema models)

* **`UploadedFile`**: id, branch_id, filename, original_name, mime_type, file_size, storage_key (S3 key), is_verified, verified_by (foreign key to User), category (ENUM: ADMISSION_DOC, STAFF_CONTRACT, ACADEMIC_RECORD, GENERAL), owner_id (foreign key to User), created_at
* **`IssuedDocument`**: id, branch_id, document_type (ENUM: STUDY_BONAFIDE, CHARACTER, TRANSFER_CERT, MARKSHEET, ID_CARD), target_type (ENUM: STUDENT, STAFF), target_id (foreign key to Student or Staff), document_number (unique sequential identifier string, e.g. "TC-2026-0001"), verification_hash (cryptographic hash validating certificate details), pdf_url, generated_by (foreign key to User), generated_at

---

## 7. API Endpoints

### Cloud Uploads
* `POST /api/v1/documents/upload` - Upload file attachment (validates files, returns key)
* `GET /api/v1/documents/files` - List files metadata under branch (filter by category)

### Official Certificates
* `POST /api/v1/documents/certificates/compile` - Compile study/character/TC details and log state
* `GET /api/v1/documents/certificates/history` - Fetch history of issued certificates
* `GET /api/v1/documents/certificates/verify/:hash` - Public validation link checking document validity

### Print Layouts
* `GET /api/v1/documents/idcards/:targetType/:id` - Fetch ID card design data for printing
* `GET /api/v1/documents/marksheets/:studentId/:term` - Renders transcript mark sheet details

---

## 8. Role Permissions

* **Super Admin:** Manage S3 integration settings, delete archived uploads, and configure default ID card layouts organization-wide.
* **Institute Admin / Principal:** Full CRUD on all uploads, issued documents, and TCs. Can delete files, configure document numbers, and sign/publish official letters.
* **Teacher:** Compile Bonafide and Character certificates for their students. Read-only for other sections. Cannot issue school Transfer Certificates (TC) or delete historical files.
* **Student / Parent:** Access their personal folder (download their ID card, view published mark sheets, and download issued bonafides). Cannot delete files or view archives.

---

## 9. Dashboard Widgets

* **Recent Certificates Log:** List of recently printed bonafides and character letters.
* **S3 Allocation Monitor:** Radial chart tracking S3 storage consumption (MB/GB).
* **TC Applications Queue:** Shows pending Transfer Certificate requests awaiting Principal signature.
* **ID Card Printing Queue:** Counts student records missing generated ID card files.

---

## 10. Reports

* **Issued Certificates Ledger:** Master log of document numbers, types, operators, and target profiles.
* **Missing Documents Checklist:** Highlights student admissions missing mandatory uploads (e.g. transfer certificates or Aadhaar copies).

---

## 11. Audit Requirements

**Must Log Actions:**
* Issuing school-leaving Transfer Certificates (TC) (actor, target, serial number, and security hash).
* Accessing files from the historical `Archive` folders.
* Deleting any file from system storage directories.

**Tracked Fields:**
* `document_id`, `file_id`, `actor_id` (User ID).
* `action_type` (e.g., `ISSUE_TC`, `DELETE_FILE`, `DOWNLOAD_CONTRACT`).
* `document_number`, `verification_hash`.
* `timestamp` and `ip_address`.

---

## 12. Security Requirements

* **Validation Rules:**
  * **File Constraints:** Uploaded files must not exceed 5MB for photos or 10MB for PDFs. MIME verification must read the file signature (magic bytes), not just the file extension.
  * **ID Card Photo Ratio:** Validates image coordinates to prevent squished profile cards in printing.
* **Authorization Checks:**
  * Endpoint for generating Transfer Certificates (`/certificates/compile` with type `TC`) must enforce Principal/Admin privileges.
  * File download routes must verify that the requesting user's branch matches the file's `branch_id`.
* **Tenant Isolation:**
  * Storage directories inside cloud S3 structures must use `branch_id` prefixes (e.g., `/branch-102/admissions/`) to isolate directories.
* **Data Protection:**
  * S3 resources must remain private; access is granted only via pre-signed, temporary URLs carrying a maximum validity of 5 minutes.
  * Official documents (such as TCs) include a SHA-256 validation hash, verifiable on a public route (`/documents/certificates/verify/:hash`) to prevent forgery.
