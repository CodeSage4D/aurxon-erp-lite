# Aurxon School ERP - Domain Architecture Specification

This specification defines the 15 core architectural domains that construct the **Aurxon SaaS Control Plane**.

---

## 1. Identity Engine
- **Responsibility**: Manages the global registration, credential hashing, multi-factor authentication (MFA), password reset, and identity lifecycle of all individuals across the platform.
- **Rules**: 
  - Every individual owns a single User identity (email, password hash, and active status). 
  - Password hashes are processed using bcrypt with a salt factor of 12. 
  - MFA uses TOTP (Time-based One-time Password) algorithms mapped to user profiles.

## 2. Organization Engine
- **Responsibility**: Manages the profiles, branches, campuses, and configuration boundaries of tenant organizations (educational trusts/schools).
- **Rules**:
  - Acts as the primary tenancy owner. All student records, employee profiles, and financial books belong directly to an Organization.
  - Controls custom subdomain registrations (`*.aurxon.com`) and custom domain redirects.

## 3. Membership Engine
- **Responsibility**: Permits a single verified User identity to belong to multiple organizations or campuses with completely distinct roles and access credentials.
- **Rules**:
  - Eliminates the need to register separate user profiles for regional trust auditors, parent-teachers, or supply educators working across multiple campuses.
  - Links User UUIDs to Organization UUIDs, mapping custom Role IDs and Status flags.

## 4. Context Engine
- **Responsibility**: Resolves and constructs the dynamic session context payload for every API transaction, checking authorization scopes at runtime.
- **Details**: Mapped directly to the dynamic `@RequireOrganization()` context logic. Maps which modules are active and checks that user roles and resource permissions allow access.

## 5. RBAC Engine
- **Responsibility**: Houses default system-wide permission schemes and enables tenant admins to declare dynamic custom roles and resource permission scopes.
- **Details**:
  - Permissions are mapped to specific API resources (e.g. `academic:schedules`, `finance:ledgers`) with operations (CRUD).
  - Admins can group policies into Permission presets to expedite user setups.

## 6. Configuration Engine
- **Responsibility**: Eliminates hardcoded board logic (CBSE, ICSE, Cambridge) by resolving operational configurations dynamically from database matrices.
- **Details**:
  - Configuration groups contain variables mapping grading rules, GPA scales, academic terms, and attendance methods.
  - Prevents the codebase from housing school-specific `if/else` logic.

## 7. Subscription Engine
- **Responsibility**: Governs commercial billing plans (Starter, Professional, Enterprise, Custom), tracking limits on active students and file storage capacities.
- **Details**:
  - Periodically compares active database counts (e.g. total enrolled student count) against subscription plan ceilings.

## 8. License Engine
- **Responsibility**: Manages operational billing terms (Trial, Monthly, Annual, Custom Contract licenses).
- **Details**:
  - Tracks activation status, payment records, renewal triggers, and expiration date margins.

## 9. Module Marketplace
- **Responsibility**: Orchestrates administrative toggling of primary ERP modules (Student, Staff, Attendance, Exams, Fees, Payroll).
- **Details**:
  - Access is dynamically updated without server restarts. When a module is toggled, API access is checked, and side navigation menus recalculate.

## 10. Feature System
- **Responsibility**: Enables granular controls within modules to lock premium items (e.g. Attendance module is enabled, but Biometric/Geo-Attendance features are locked).
- **Details**:
  - Feature flags are database records evaluated by API guards.

## 11. Branding Engine
- **Responsibility**: Manages visual themes, primary colors, custom login assets, logos, and policy URLs dynamically mapping them to incoming domains.
- **Details**:
  - The frontend client calls the Branding API upon loading to retrieve CSS variables mapping to Glacier White, Azure Blue, or custom branding themes.

## 12. Audit Engine
- **Responsibility**: Records an immutable ledger of administrative and sensitive actions across the entire platform.
- **Details**:
  - Captures fields: `Who`, `What`, `When`, `IP Address`, `Old Value`, and `New Value` for auditing validation.

## 13. Support Access Engine
- **Responsibility**: Protects organization privacy. Aurxon platform administrators have zero database access to student marks, medical records, or transactions by default.
- **Support Workflow**:
  1. An Aurxon support representative requests support access.
  2. The target Organization Admin approves the request, selecting a duration limit (e.g. 2 hours).
  3. A temporary secure Support token is generated.
  4. The support representative performs troubleshooting actions. Every read/write is logged by the audit engine.
  5. The token automatically expires and self-destructs upon time out.

## 14. Setup Wizard
- **Responsibility**: Runs a step-by-step onboarding walkthrough for new organization admins.
- **Details**: Steps track inputs from Organization Details, Schools, Active Academic Year, Classes/Sections, initial Subjects list, first Administrator profiles, and go-live check.

## 15. Notification Domain
- **Responsibility**: An asynchronous communications dispatch engine sending transactional updates through Email, SMS, and In-App notifications.
- **Core Events**:
  - **Organization Invitation**: Sent to a new admin user containing a temporary onboarding signup token.
  - **Password Reset**: Contains secure verification OTPs and expire-duration reset links.
  - **Organization Activation**: Sent to founder admins and the tenant owner when setup wizard tasks validate.
  - **License Expiry**: Alerts admins 15, 7, and 1 day in advance of suspension deadlines.
  - **Subscription Renewal**: Transaction confirmation receipt notifications.
  - **Module Activation**: Notifies admins when a module (e.g. Examinations) has been enabled or disabled.
