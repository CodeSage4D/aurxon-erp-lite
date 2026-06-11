# AURXON Platform OS — Product Bible
Version 1.1

Welcome to the **AURXON Platform OS** product specification, design manifest, and operational runbook. This document serves as the absolute blueprint for our multi-tenant SaaS architecture.

---

## 1. System Philosophy & Priority Order

AURXON is built on a strict operational hierarchy:
$$\text{Working} \longrightarrow \text{Reliable} \longrightarrow \text{Simple} \longrightarrow \text{Fast} \longrightarrow \text{Beautiful} \longrightarrow \text{Expandable}$$

Our objective is operational stability first: zero feature bloat, high-fidelity tenant isolation, and failure-proof customer onboarding journeys.

---

## 2. Platform Architecture

AURXON separates operational concerns into three core layers:
1. **Platform Owner Control Plane (Founder OS):** Operating under the administrative subdomain (`portal.aurxon.com` / `founder`), allowing platform engineers and operators to review registrations, generate activation keys, override tenant states, and reset onboarding configurations.
2. **Customer Tenant Command Planes:** Running under dynamic subdomains (`{slug}.aurxon.com`), containing isolated workspace context for schools, hospitals, and corporates.
3. **Common Utility Subdomains:** Focused micro-portals for specific actions:
   - `register.aurxon.com`: Customer acquisition and queue entry.
   - `activate.aurxon.com`: License verification and key redemption.
   - `support.aurxon.com`: Stateful impersonation helpdesks.

### Tenancy and Authentication Gate Rules
* **Founder Gate:** Founder credentials (`SUPER_ADMIN` and `teamProfile`) are strictly prohibited from authenticating on dynamic tenant subdomains.
* **Tenant Gate:** Standard tenant credentials (`OWNER`, `ADMIN`, `TEACHER`, `STUDENT`, etc.) are blocked from entering the founder control portals.
* **Workspace Isolation:** All database reads/writes are automatically scoped via the active tenant index (`institutionId` / `organizationId`) parsed from context JWT claims.

---

## 3. Domain-Based SaaS Operation & Modeling

Instead of purely mutable fields, AURXON implements historical domain tracking to guarantee compliance and support auditing:

### School ERP Domain
- **Campus**: Maps physical campus branches dynamically.
- **Academic Session**: Configured per organization in the `AcademicYear` ledger.
- **Class & Section**: A class has separate, dedicated `Section` entities to structure rosters.
- **Enrollment**: A historical record mapping a student to a Class, Section, and Academic Session. Promotions or grade transfers create new `Enrollment` lines rather than overwriting history.
- **Student Lifecycles**: Supports progression statuses: `PROSPECT`, `APPLICANT`, `APPROVED`, `ENROLLED`, `ACTIVE`, `PROMOTED`, `TRANSFERRED`, `GRADUATED`, `ALUMNI`.

### Hospital ERP Domain
- **HospitalDepartment**: Parent department locator.
- **MedicalUnit**: Sub-unit within a department.
- **Ward & Bed**: Specific bed locations.
- **PatientEpisode**: Tracks patient hospitalizations, ward/bed occupancy, and discharges historically.

### Corporate ERP Domain
- **CorporateDivision**: Divisions within the enterprise structure.
- **CorporateDepartment**: Corporate department units.
- **CorporateTeam**: Working team rosters.
- **WorkAssignment**: Historic employee roles and compensation alignments.

---

## 4. Onboarding Journey & Setup Reset

1. **Onboarding Setup Wizard:** New customers must complete the Setup Wizard (Step 1: System Parameters, Step 2: Site/Branch Location). Once completed, the wizard state locks the client out to prevent accidental overrides.
2. **Founder Reset Command:** Platform owners can run `Post /founder/institutions/:id/reset-wizard` to reset an organization's setup wizard state to step 1, allowing reconfiguration.
