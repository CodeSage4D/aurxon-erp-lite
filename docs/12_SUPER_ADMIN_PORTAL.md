# Aurxon School ERP - Super Admin Portal Specification

## 1. Core Tenant Operational Controls

The **Super Admin Portal** is used by Aurxon's customer success, billing, operations, and support teams to onboard and manage tenant organizations.

### 1.1 Organization Lifecycle Administration
- **Create Organization**: Initializes a new tenant entry in the DB. Triggers invitation dispatch workflows containing registration keys.
- **Edit Organization**: Modify metadata, billing contacts, and branding domains.
- **Activate / Suspend**: Immediate state changes. Suspending updates the database record instantly, which invalidates the tenant's cache context.
- **Archive**: Initiates read-only status and detaches active indices from queries.

---

## 2. Subscription & Licensing Managers

### 2.2 Plan Limits & Parameters
The Super Admin dashboard permits configuration of subscription limits per tenant:

| Plan Code | Default Student Cap | Default Storage Limit | Feature Scope |
| :--- | :---: | :---: | :--- |
| **Starter** | 250 | 5 GB | Core Modules (Student, Staff, Attendance) |
| **Professional** | 1,000 | 20 GB | Starter + Exams + Parents Portals |
| **Enterprise** | Unlimited | 100 GB | All modules + BI Analytics + Custom branding |
| **Custom** | Negotiated | Negotiated | Mapped individually via contract settings |

---

## 3. Dynamic Module & Feature Allocation

Super Admins configure active module access at the tenant profile level via a checkboxes grid interface.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Organization Modules Configuration: [ Ramakrishna Mission (RKMVP) ]  │
├────────────────────────────────────────────────────────────────────────┤
│ [x] Student Management Module                                         │
│     ├── [x] Standard Directory Profile                                 │
│     └── [x] APAAR Sync (ABC Integration)                               │
│ [x] Attendance Module                                                  │
│     ├── [x] Manual Attendance Input                                    │
│     └── [ ] Biometric Integration (Premium Add-on)                     │
│ [ ] Finance & Ledger Accounts Module                                   │
│     ├── [ ] Fee Payments Ledger                                        │
│     └── [ ] Statutory HR Payroll                                       │
├────────────────────────────────────────────────────────────────────────┤
│                       [ Save Module Configuration ]                     │
└────────────────────────────────────────────────────────────────────────┘
```
Updating the configuration triggers a domain event `module.enabled` or `module.disabled`, updating cached permission contexts.

---

## 4. Context Administration & Support Tools

### 4.1 Organization Membership Administration
- **Membership Overviews**: View list of registered members in a tenant, with options to assign roles, suspend memberships, or remove associations.
- **Role Assignments**: Override local organization roles, adjusting permissions to resolve configuration issues.

### 4.2 Audited Impersonation & Debugging (Support Tool)
To assist users without exposing sensitive data permanently:
1. **Approval Request**: A support engineer requests impersonation access.
2. **Time-Limited Token**: Once the tenant admin approves via their portal, a secure token is generated.
3. **Login-As Mode**: The Super Admin client re-initializes, using the support token to load the tenant's context within a restricted view.
4. **Audit Logs Logging**: The database logs every SQL update executed by the support user.
5. **Self-Destruct**: The session is automatically terminated by the backend if the approved timeframe (e.g. 2 hours) expires.
