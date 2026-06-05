# Aurxon School ERP - Implementation Roadmap Specification

## 1. Phase-wise Implementation Plan (Phase 0 Foundations)

All engineering effort must prioritize the **SaaS Platform Foundation** (Phase 0) before any functional ERP models are compiled. The foundation roadmap is structured into 8 progressive development blocks:

```text
├── Phase 0.1: Identity Layer (Weeks 1-2)
│   ├── User DB structures & Bcrypt password hashing
│   └── Stateless JWT token issue, refresh token rotation & password resets
│
├── Phase 0.2: Organization Layer (Weeks 3-4)
│   ├── Organization profile registry & School/Campus DB hierarchies
│   └── Theme variables mapped to subdomains by Branding Engine
│
├── Phase 0.3: Membership Layer (Weeks 5-6)
│   ├── OrganizationMembership relational mapping
│   └── Switch Organization token swap context generation logic
│
├── Phase 0.4: Authorization Layer (Weeks 7-8)
│   ├── System Roles registry & Permission tables
│   └── RBAC NestJS Guards resolving actions against Context objects
│
├── Phase 0.5: Configuration Layer (Weeks 9-10)
│   ├── ConfigurationGroups & ConfigurationItems settings caches
│   └── Academic templates mapping (CBSE vs. Cambridge default items)
│
├── Phase 0.6: Commercial Layer (Weeks 11-12)
│   ├── Subscription structures, student limit caps, storage quotas
│   └── Module Marketplace, Feature Flags toggle interceptors
│
├── Phase 0.7: Operations Layer (Weeks 13-14)
│   ├── Founder Portal and Super Admin Portal views
│   └── Support Access approval tokens, audit log interceptors
│
└── Phase 0.8: Activation Layer (Weeks 15-16)
    ├── Setup Wizard UI workflow (8-step data collection engine)
    └── Go-live validation checkpoints & status activation to ACTIVE
```

---

## 2. Deferred Scope (Post-MVP Readiness)

To accelerate initial deployment and validate the SaaS Control Plane, the following enterprise infrastructure items are deferred until Core ERP MVP stability is achieved:
1. **Kubernetes Orchestration**: Initial runs will host NestJS/Next.js container pods inside simpler platforms (e.g. AWS Elastic Beanstalk, Azure App Services, or Google Cloud Run via simple Docker Compose files).
2. **Terraform Infrastructure scripts**: Infrastructure will be provisioned using cloud console templates rather than automated Terraform code.
3. **Automated CI/CD Pipelines**: Branch testing and code synchronization will run via local scripting frameworks rather than complete ArgoCD GitOps pipelines.
4. **Disaster Recovery (DR) Cross-Region replication**: Focus on standard localized backup snapshots before configuring automatic geographic DNS failovers.
5. **Advanced Observability**: Prometheus metrics aggregators, Loki logs pools, and custom Grafana panels configurations are deferred in favor of standard Sentry error tracking logs.

---

## 3. The Core ERP Development Gate (Go/No-Go Rule)

> [!IMPORTANT]
> **Strict Gate Compliance**: Under no circumstances should engineering teams write database models, views, controllers, or UI layouts for functional ERP modules (Student Management, Staff, Attendance, Exams, Fees, Payroll, Library, Inventory) until the Phase 0 (0.1 - 0.8) control plane passes all validation gates.

### 3.1 Go/No-Go Acceptance Validation Matrix

To pass the gate and receive authorization to begin Phase 1 ERP development, the platform must verify the following core features:

| System Capability | Target Acceptance Condition | Verification Method |
| :--- | :--- | :--- |
| **Multi-Organization Login** | A single user email logs in and retrieves multiple organization memberships. | Automated integration login tests |
| **Organization Switching** | User swaps context, receiving a new JWT access token mapping the target context. | Context swap API check validation |
| **Dynamic RBAC Guards** | Restricting resource requests (e.g. `academic:schedules`) if the user's role lacks permissions. | Penetration/API status code audits |
| **Module & Feature Marketplace**| Disabling a module instantly hides associated routes and blocks backend controller calls. | UI route check & API interceptor test |
| **Licensing Expiry Enforcer** | Expiration triggers block all database read/write actions, returning a license expired alert. | Database system date modification test |
| **Support Access Auditing** | Support sessions generate unique audit entries logging all representative queries. | Support log database record queries |
| **Setup Wizard Completion** | Completing the wizard creates class records and successfully activates the organization. | Onboarding wizard testing run-through |
