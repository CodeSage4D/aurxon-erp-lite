# AURXON Platform OS — Database Specification & Schema Index
Version 1.1

This database specification conforms to standard multi-tenant schema isolation rules under PostgreSQL, accessed via Prisma ORM.

---

## 1. Tenancy Schema Architecture

AURXON enforces absolute multi-tenant database isolation at the application layer through foreign key scoping. 

### Core Tenancy Anchors
- **`Tenant` Model:** Represents the primary commercial subscriber account. Holds the master slug (e.g., `greenvalley`).
- **`Institution` Model:** Represents the operational organization unit. Maps 1-to-1 or 1-to-many under a Tenant. All resource tables carry an `institutionId` foreign key linking back to `Institution.id`.

Every read, update, or delete operation inside a tenant workspace is parameterized with:
`WHERE "institutionId" = req.user.institutionId`

---

## 2. Updated Domain Entities

The database structure has been updated from a module-centric approach to a domain-centric historical approach:

### School ERP Domain
- **`Section`**: Stores classes section designations:
  - `id`: `UUID` (Primary Key)
  - `name`: `VARCHAR` (e.g., "A", "B")
  - `classId`: `UUID` (Foreign Key -> `Class.id`)
- **`Enrollment`**: Tracks student placements per academic year, preventing history overwrites on promotions:
  - `id`: `UUID` (Primary Key)
  - `studentId`: `UUID` (Foreign Key -> `Student.id`)
  - `classId`: `UUID` (Foreign Key -> `Class.id`)
  - `sectionId`: `UUID` (Foreign Key -> `Section.id`)
  - `academicYearId`: `UUID` (Foreign Key -> `AcademicYear.id`)
  - `status`: `VARCHAR` (Prospect, Applicant, Approved, Enrolled, Active, Promoted, Transferred, Graduated, Alumni)

### Hospital ERP Domain
- **`HospitalDepartment`**: Department entity scoped under `Institution`.
- **`MedicalUnit`**: Sub-unit within a department.
- **`Ward` & `Bed`**: Bed availability and ward placement metrics.
- **`PatientEpisode`**: Logs patient hospitalization admissions, ward/bed transfers, and discharge events historically.

### Corporate ERP Domain
- **`CorporateDivision`**: Main divisions of corporate organizations.
- **`CorporateDepartment` & `CorporateTeam`**: Organization hierarchies.
- **`WorkAssignment`**: Staff roles and assignments history ledger.

---

## 3. Core Tables Reference

### A. Tenant Workspace Registry (`Institution`)
Stores the operational state and presets of each workspace.
- **`id`**: `UUID` (Primary Key)
- **`name`**: `VARCHAR`
- **`primaryColor`**: `VARCHAR` (Default: `#0284c7`)
- **`tenantId`**: `UUID` (Foreign Key -> `Tenant.id`)
- **`industryPackCode`**: `VARCHAR` (Foreign Key -> `IndustryPack.code`)
- **`status`**: `VARCHAR` (Default: `ACTIVE` | `SUSPENDED` | `EXPIRED`)

### B. User Authentication (`User`)
Stores login credentials and base roles.
- **`id`**: `UUID` (Primary Key)
- **`email`**: `VARCHAR` (Unique Index)
- **`passwordHash`**: `VARCHAR`
- **`role`**: `VARCHAR` (Base routing context)
- **`institutionId`**: `UUID` (Foreign Key -> `Institution.id`)

---

## 4. Key Relational Indexes

To guarantee maximum speed and prevent cross-tenant queries from escaping isolation boundaries, the following Prisma indexes (`@@index`) are explicitly set up in Postgres:
1. **Student Indexing:**
   - `@@index([scholarNumber])`
   - `@@index([institutionId, classId])`
2. **Audit Logging Indexing:**
   - `@@index([userId, createdAt])`
