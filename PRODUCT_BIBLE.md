# AURXON Platform OS — Product Bible
Version 1.0

Welcome to the **AURXON Platform OS** product specification, design manifest, and operational runbook. This document serves as the absolute blueprint for our multi-tenant SaaS architecture.

---

## 1. System Philosophy & Priority Order

AURXON is built on a strict operational hierarchy:
$$\text{Working} \longrightarrow \text{Reliable} \longrightarrow \text{Simple} \longrightarrow \text{Fast} \longrightarrow \text{Beautiful} \longrightarrow \text{Expandable}$$

Our objective is operational stability first: zero feature bloat, high-fidelity tenant isolation, and failure-proof customer onboarding journeys.

---

## 2. Platform Architecture

AURXON separates operational concerns into three core layers:
1. **Platform Owner Control Plane (Founder OS):** Operating under the administrative subdomain (`portal.aurxon.com` / `founder`), allowing platform engineers and operators to review registrations, generate activation keys, override tenant states, and suspend or restore licenses.
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

## 3. The Core Business Flow (Customer Journey)

### Flow 1: Customer Onboarding
1. **Visit & Register:** The prospective customer visits `register.aurxon.com`, fills out their organization name, selector industry pack, and user credentials.
2. **Reference Generation:** The system registers the founder request in the backend queue and generates a unique **Founder Queue Reference Number**.
3. **Founder Approval:** The administrator logs into `portal.aurxon.com`, reviews the pending queue, approves the request, and generates a **30-Day Temporary Activation Key** (`AURX-ACT-XXXX-XXXX`).
4. **Key Verification:** The customer visits `activate.aurxon.com`, inputs their key, and initiates their dynamic workspace.
5. **Setup Wizard:** Upon first login, the customer is routed to `/setup-wizard` to finalize:
   - Step 1: System Parameters (Academic Year / Fiscal Year, Grading Standards, timezone, currency).
   - Step 2: Site/Branch Location (Name, site code, phone, address).
   - Step 3: Complete and Lock. Once completed, the wizard is locked forever.
6. **Workspace Access:** Customer enters `/dashboard` as the tenant owner, ready to perform billing, admissions, or patient management.

---

## 4. Multi-Industry Packs (SaaS Modularity)

AURXON supports customized runtime presets based on the selected industry pack:
* **SCHOOL_ERP:** Activates Academics, Class registries, Admissions, Fee ledgers, Staff checks, and Exam trackers.
* **HOSPITAL_ERP:** Activates Patients, Doctors registry, Appointments dashboard, and Medical billing modules.
* **CORPORATE_ERP:** Activates Organization teams, departments list, assets, and payroll compensation modules.

---

## 5. Role-Based Access Control (RBAC)

RBAC is enforced via database-defined resource permission tokens (`resource:action`).
* **Founder Console:** Allowed only for `SUPER_ADMIN`.
* **Tenant Admin:** Full read/write over tenant parameters.
* **Staff/Teacher:** Filtered workspace limited to classroom registries, student profiles, and attendance checklists.
* **Student/Parent:** Read-only access to academic progress, fees paid, and notice boards.

---

## 6. Resilience and Recovery Systems

* **Offline Fallbacks:** Critical endpoints in `frontend/src/lib/api.ts` feature automatic mock validation if connection is lost.
* **State Recovery:** Setup Wizard drafts are auto-saved to PostgreSQL at each transition step, ensuring that page refreshes or connection drops do not wipe user progress.
* **Safety Guards:** Standard HTML5 `beforeunload` blockers prevent users from accidentally clicking back/reload during setup.
