# AURXON ERP Lite - Module Architecture: 01_Core

## 1. Module Purpose
The `01_Core` module acts as the central nervous system of AURXON ERP Lite. It is the foundational layer upon which all other modules (Admission, Academics, Finance, etc.) depend. 

**Business Value:** It ensures cross-cutting concerns like multi-tenancy (branches/institutions), role-based access control, global settings, and audit trails are handled uniformly, securely, and efficiently.
**User Value:** It provides administrators a centralized dashboard to manage the institution's fundamental parameters (academic years, branches, global configurations) and guarantees a secure, authenticated experience for all user personas.

---

## 2. Submodules
* **Authentication (Auth):** Login, token generation, 2FA, password recovery, session termination.
* **Role-Based Access Control (RBAC):** Roles, permissions mapping, dynamic access policies.
* **Institution Management:** Organization profile, branding, global defaults.
* **Branch Management:** Multi-branch setup, isolated branch context switching.
* **Global Settings:** System variables, email/SMS gateway configs, localization (timezone, currency).
* **Audit & Logging:** Immutable system action tracking.
* **Dashboard Overview:** Aggregated KPIs and quick-access widgets for Super Admins.

---

## 3. Folder Structure (Domain-Driven)
```text
01_Core/
├── Auth/
│   ├── Controllers/
│   ├── Services/
│   ├── DTOs/
│   ├── Strategies/
│   ├── Guards/
│   └── Interfaces/
├── RBAC/
│   ├── Controllers/
│   ├── Services/
│   ├── DTOs/
│   ├── Entities/
│   └── Decorators/
├── Institution/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── Branch/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── Settings/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── AuditLogs/
│   ├── Services/
│   ├── Interceptors/
│   └── Entities/
└── Dashboard/
    ├── Controllers/
    └── Services/
```

---

## 4. Backend Files
* `Auth/auth.controller.ts`, `Auth/auth.service.ts`, `Auth/jwt.strategy.ts`, `Auth/login.dto.ts`
* `RBAC/roles.guard.ts`, `RBAC/permissions.decorator.ts`, `RBAC/rbac.service.ts`
* `Branch/branch.controller.ts`, `Branch/branch.service.ts`, `Branch/create-branch.dto.ts`
* `Settings/settings.controller.ts`, `Settings/settings.service.ts`
* `AuditLogs/audit-log.interceptor.ts`, `AuditLogs/audit.service.ts`
* `Dashboard/dashboard.controller.ts`

---

## 5. Frontend Files
* `src/01_Core/Auth/LoginPage.tsx`, `src/01_Core/Auth/ForgotPasswordForm.tsx`
* `src/01_Core/Dashboard/OverviewTab.tsx`, `src/01_Core/Dashboard/Sidebar.tsx`, `src/01_Core/Dashboard/CommandPalette.tsx`
* `src/01_Core/Settings/GlobalSettingsForm.tsx`, `src/01_Core/Settings/GatewayConfig.tsx`
* `src/01_Core/Branch/BranchSelector.tsx`, `src/01_Core/Branch/BranchManagementTable.tsx`
* `src/01_Core/RBAC/RolePermissionsGrid.tsx`

---

## 6. Database Entities (Prisma / SQL schema models)

* **`User`**: id, email, password_hash, role_id, is_active, last_login, created_at, updated_at
* **`Role`**: id, name (e.g. SUPER_ADMIN, TEACHER), description, is_system (boolean)
* **`Permission`**: id, resource (e.g. STUDENT), action (e.g. CREATE, READ)
* **`RolePermission`**: role_id, permission_id
* **`Institution`**: id, name, logo_url, address, contact_email, timezone, currency
* **`Branch`**: id, institution_id, name, branch_code, address, contact_number, is_active
* **`UserBranch`**: user_id, branch_id (M:N mapping for staff working in multiple branches)
* **`SystemSetting`**: id, category (e.g. SMS, EMAIL), key, value (JSON encrypted)
* **`AuditLog`**: id, user_id, action, resource, entity_id, old_values (JSON), new_values (JSON), ip_address, created_at

---

## 7. API Endpoints

### Auth
* `POST /api/v1/core/auth/login` - Authenticate and return JWT
* `POST /api/v1/core/auth/logout` - Invalidate session
* `POST /api/v1/core/auth/refresh` - Refresh access token

### Branch Management
* `GET /api/v1/core/branches` - List all branches
* `POST /api/v1/core/branches` - Create a branch
* `PUT /api/v1/core/branches/:id` - Update branch details

### RBAC
* `GET /api/v1/core/roles` - Get all roles
* `PUT /api/v1/core/roles/:id/permissions` - Update role permissions matrix

### Settings
* `GET /api/v1/core/settings` - Retrieve global settings
* `PUT /api/v1/core/settings` - Update settings

### Dashboard
* `GET /api/v1/core/dashboard/metrics` - Fetch aggregated KPIs (total students, daily revenue)

---

## 8. Role Permissions

* **Super Admin**: Full CRUD across Institution, Branch, RBAC, Settings, and Audit Logs. Can bypass tenant isolation to view global data.
* **Institute Admin**: Full access within their specific Branch. Cannot modify Global Settings or create new Roles, but can assign existing roles.
* **Teacher / Accountant / Staff / Parent / Student**: No access to Core configuration (Branches, Settings, RBAC). Can only access `Auth` endpoints and view `Dashboard` (with widgets scoped strictly to their role).

---

## 9. Dashboard Widgets

* **Super Admin View**:
  * Total Branches Active
  * System Uptime / API Health
  * Active Sessions Count
  * Quick Actions (Add Branch, Configure SMS)
* **Institute Admin View**:
  * Total Students (Branch scope)
  * Today's Attendance % (Branch scope)
  * Today's Fee Collection (Branch scope)

---

## 10. Reports

* **System Access Report**: Login frequencies, failed login attempts (Security).
* **Audit Trail Report**: Export of actions taken on critical entities (e.g., Who changed the fee structure?).
* **Branch Summary Report**: High-level comparison of branch sizes and staff counts.

---

## 11. Audit Requirements

**Must Log Actions:**
* Any modifications to `Settings`, `Branch`, `Institution`, or `RBAC` (Roles/Permissions).
* Login success, login failures, password resets.
* Bulk data exports.

**Tracked Fields:**
* `user_id` (Actor)
* `timestamp`
* `ip_address`
* `action_type` (CREATE, UPDATE, DELETE)
* Data diffs (`old_state` vs `new_state`)

---

## 12. Security Requirements

* **Validation Rules:** Strict DTO validation on all Settings and Branch inputs to prevent XSS and NoSQL/SQL injections.
* **Authorization Checks:** `RolesGuard` and `PermissionsGuard` applied strictly via metadata decorators (`@RequirePermissions('UPDATE_SETTINGS')`).
* **Tenant Isolation:** Every query traversing `Branch` data MUST automatically append `WHERE branch_id = :currentBranchId` extracted from the JWT token. Super Admins are the only exception.
* **Data Protection:** `SystemSetting` values holding API keys (e.g., Twilio, SMTP) MUST be symmetrically encrypted in the database and only decrypted in-memory during service execution. No sensitive tokens returned via API GET requests.
