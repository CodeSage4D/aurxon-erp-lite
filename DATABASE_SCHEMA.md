# AURXON Platform OS — Database Specification & Schema Index
Version 1.0

This database specification conforms to standard multi-tenant schema isolation rules under PostgreSQL, accessed via Prisma ORM.

---

## 1. Tenancy Schema Architecture

AURXON enforces absolute multi-tenant database isolation at the application layer through foreign key scoping. 

### Core Tenancy Anchors
- **`Tenant` Model:** Represents the primary commercial subscriber account. Holds the master slug (e.g., `greenvalley`).
- **`Institution` Model:** Represents the operational organization unit. Maps 1-to-1 or 1-to-many under a Tenant. All resource tables (e.g., `Student`, `Staff`, `Class`, `Branch`, `Settings`) carry an `institutionId` foreign key linking directly back to `Institution.id`.

Every read, update, or delete operation inside a tenant workspace is parameterized with:
`WHERE "institutionId" = req.user.institutionId`

---

## 2. Model Relational Maps

```mermaid
erDiagram
    TENANT ||--o{ INSTITUTION : owns
    INSTITUTION ||--o{ USER : contains
    INSTITUTION ||--o{ STUDENT : manages
    INSTITUTION ||--o{ STAFF : employs
    INSTITUTION ||--o{ CLASS : contains
    INSTITUTION ||--o{ BRANCH : contains
    INSTITUTION ||--o{ LICENSE : secures
    INSTITUTION ||--o{ SUBSCRIPTION : bills
    
    USER ||--|| STUDENT : profiles
    USER ||--|| STAFF : profiles
    USER ||--|| TEAM_MEMBER : team
    USER ||--o{ AUDIT_LOG : audits
```

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
- **`failedLoginAttempts`**: `INT` (Default: `0`)
- **`lockedUntil`**: `TIMESTAMP`

### C. Workspace Status (`OrganizationSetupStatus`)
Keeps track of onboarding wizard progress in Postgres.
- **`institutionId`**: `UUID` (Primary Key, Foreign Key -> `Institution.id`)
- **`setupStarted`**: `BOOLEAN` (Default: `true`)
- **`setupCompleted`**: `BOOLEAN` (Default: `false`)
- **`setupCompletedAt`**: `TIMESTAMP`
- **`currentStep`**: `INT` (Default: `1` -> Setup Parameters, `2` -> Branch Params, `3` -> Locked Complete)
- **`wizardVersion`**: `VARCHAR` (Default: `2.0`)

### D. Licensing & Activation (`License`)
Enforces SaaS license terms.
- **`id`**: `UUID` (Primary Key)
- **`organizationId`**: `UUID` (Foreign Key -> `Institution.id`)
- **`licenseKey`**: `VARCHAR` (Unique Index, e.g. `LIC-PROD-GREENVALLEY-...`)
- **`status`**: `VARCHAR` (Default: `ACTIVE` | `EXPIRED` | `SUSPENDED` | `REVOKED`)
- **`expiresAt`**: `TIMESTAMP`

---

## 4. Key Relational Indexes

To guarantee maximum speed and prevent cross-tenant queries from escaping isolation boundaries, the following Prisma indexes (`@@index`) are explicitly set up in Postgres:
1. **Student Indexing:**
   - `@@index([scholarNumber])`
   - `@@index([institutionId, classId])`
   - `@@index([institutionId, parentId])`
2. **Audit Logging Indexing:**
   - `@@index([userId, createdAt])`
3. **Staff Indexing:**
   - `@@index([institutionId, employeeId])`
4. **Tenant Domains Indexing:**
   - Unique constraints on subdomains.

---

## 5. Security Audit Log Trail (`AuditLog`)
Every system state change, password reset, context switch, and impersonation log writes to this ledger:
- **`id`**: `UUID` (Primary Key)
- **`userId`**: `UUID` (Foreign Key -> `User.id`)
- **`action`**: `VARCHAR` (e.g. `COMPLETE_SETUP`, `KEY_RENEWAL`, `INSTITUTION_SUSPENSION`)
- **`details`**: `TEXT` (Human readable parameters)
- **`ipAddress`**: `VARCHAR`
- **`createdAt`**: `TIMESTAMP`
