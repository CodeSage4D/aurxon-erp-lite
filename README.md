# AURXON ERP Lite

<div align="center">

**Elite Grade · Simple · Modern · Affordable**

An enterprise-quality Educational ERP for Schools, Coaching Centers, Tuition Centers, and Training Institutes.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red?logo=nestjs)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-blue?logo=prisma)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-green?logo=postgresql)](https://neon.tech/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)

</div>

---

## 📖 Overview

AURXON ERP Lite is a production-hardened, multi-tenant Educational Resource Planning platform purpose-built for Indian schools and educational institutions. It combines a NestJS REST API backend with a Next.js 15 App Router frontend, a Prisma-managed PostgreSQL schema, enterprise RBAC, field-level PII encryption, automated operations monitoring, and a premium UX design system.

> **Status**: Pilot-Ready · Design System V2 · Analytics Integrated · Operations Hardened

---

## ✨ Key Features

| Category | Highlights |
|---|---|
| **Multi-Tenancy** | Institution-scoped data isolation at every query level |
| **RBAC** | Super Admin → Institution Admin → Teacher → Accountant → Parent → Student |
| **Security** | JWT Auth, field-level PII encryption (Aadhaar, PAN, Bank), response-layer masking |
| **Dashboard** | Attention → Decision → Analytics three-tier hierarchy per role |
| **Analytics** | Recharts-powered KPI cards, trend lines, bar/area charts with MoM comparisons |
| **Demo Mode** | High-fidelity Demo School seeded with 100 students, 15 teachers, 12-month trends |
| **Operations** | Automated integrity checks, backup status monitoring, UAT issue tracking |
| **Compliance** | Audit logs, data lifecycle hooks, PII masking in API responses |
| **Offline-First** | Dual-mode API client with localStorage fallback when backend is unavailable |
| **Indian-First** | Indian names, states, pincodes, Aadhaar/PAN structures, INR currency |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+
- Neon PostgreSQL (or any PostgreSQL 15+ instance)
- npm v10+

### 1. Clone & Install

```bash
git clone https://github.com/CodeSage4D/aurxon-erp-lite.git
cd aurxon-erp-lite

# Install root workspace deps
npm install

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Environment Setup

```bash
# backend/.env
PORT=5000
DATABASE_URL="postgresql://<user>:<password>@<host>/neondb?sslmode=require"
JWT_SECRET="your-strong-jwt-secret-min-32-chars"
NODE_ENV=development
ENCRYPTION_KEY="your-32-char-field-encryption-key"

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

> ⚠️ Never commit `.env` files. All secrets must be stored in environment variables or a secrets manager in production.

### 3. Database Migration & Seeding

```bash
cd backend

# Apply schema migrations (development)
npx prisma migrate dev --name init

# Seed with demo institution, roles & profiles
npx prisma db seed
```

> For production deployments use `npx prisma migrate deploy` (never `migrate dev`).

### 4. Run Locally

```bash
# Terminal 1 — NestJS backend on http://localhost:5000
cd backend
npm run start:dev

# Terminal 2 — Next.js frontend on http://localhost:3000
cd frontend
npm run dev
```

---

## 🔐 Demo Login Credentials

All demo accounts use password: `password123`

| Role | Email | Access Level |
|---|---|---|
| Super Admin | `superadmin@aurxon.com` | All institutions |
| Institution Admin | `admin@aurxon.com` | Single institution |
| Teacher | `teacher1@aurxon.com` | Class & subject scope |
| Accountant | `accountant@aurxon.com` | Finance modules |
| Student | `student@aurxon.com` | Student portal |
| Parent | `parent@aurxon.com` | Parent portal |

> The **Demo School Portal** on the login page auto-seeds a 100-scholar campus with 12 months of historical data for analytics visualization.

---

## 📁 Project Structure

```text
aurxon-erp-lite/
│
├── README.md                          # This file
├── package.json                       # Root workspace config
├── vercel.json                        # Vercel deployment config
├── .gitignore
├── .gitattributes
│
├── docs/                              # Project documentation
│   ├── architecture/                  # Module-level architecture docs
│   │   ├── 01_Core_Architecture.md
│   │   ├── 02_Admission_Architecture.md
│   │   ├── 03_Academics_Architecture.md
│   │   ├── 04_Attendance_Architecture.md
│   │   ├── 05_Fees_Architecture.md
│   │   ├── 06_Exams_Architecture.md
│   │   ├── 07_Staff_Architecture.md
│   │   ├── 08_Communication_Architecture.md
│   │   ├── 09_Reports_Architecture.md
│   │   ├── 10_Analytics_Architecture.md
│   │   ├── 11_Documents_Architecture.md
│   │   ├── 12_ParentPortal_Architecture.md
│   │   ├── 13_StudentPortal_Architecture.md
│   │   └── 14_FutureTrendModules_Architecture.md
│   └── operations/                    # SRE & pilot operations
│       ├── PILOT_LAUNCH_CHECKLIST.md  # Pre-launch readiness checklist
│       ├── QUICK_START_GUIDES.md      # Admin / teacher onboarding guides
│       └── DISASTER_RECOVERY_RUNBOOK.md  # DR procedures & escalation paths
│
├── backend/                           # NestJS REST API
│   ├── prisma/
│   │   ├── schema.prisma              # Full Prisma schema (all models)
│   │   ├── seed.ts                    # Demo institution & roster seeder
│   │   └── migrations/                # Versioned migration history
│   ├── src/
│   │   ├── main.ts                    # Bootstrap: CORS, validation, Swagger
│   │   ├── app.module.ts              # Root module (all feature modules wired)
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   ├── common/
│   │   │   ├── filters/               # Global HTTP exception filter
│   │   │   ├── helpers/               # PII masking, encryption utilities
│   │   │   └── interceptors/          # Logging, response transform interceptors
│   │   ├── 01_Core/
│   │   │   ├── Auth/                  # JWT auth, login, token refresh
│   │   │   ├── Institution/           # Institution CRUD & tenant setup
│   │   │   ├── Branch/                # Multi-branch management
│   │   │   ├── RBAC/                  # Role & permission management
│   │   │   ├── AuditLogs/             # Full audit trail per entity
│   │   │   ├── Dashboard/             # Dashboard aggregation endpoints
│   │   │   ├── Settings/              # Institution settings
│   │   │   ├── Operations/            # Backup status, integrity checks, UAT
│   │   │   └── prisma/                # PrismaService wrapper
│   │   ├── 02_Admission/
│   │   │   ├── Application/           # Admission applications lifecycle
│   │   │   ├── AdmissionWorkflow/     # Stage-based admission pipeline
│   │   │   ├── StudentProfile/        # Scholar profile CRUD
│   │   │   ├── ParentProfile/         # Parent/guardian profiles
│   │   │   ├── ScholarNumber/         # Unique scholar ID generation
│   │   │   ├── IdentityVerification/  # Aadhaar/PAN verification hooks
│   │   │   ├── AddressLookup/         # Pincode-based address resolution
│   │   │   └── Documents/             # Admission document uploads
│   │   ├── 03_Academics/              # Classes, sections, subjects, timetable
│   │   ├── 04_Attendance/             # Student & teacher attendance
│   │   ├── 05_Fees/                   # Fee structure, collection, receipts
│   │   ├── 06_Exams/                  # Exam setup, marks entry, report cards
│   │   ├── 07_Staff/
│   │   │   ├── StaffProfile/          # Staff CRUD with PII masking
│   │   │   ├── Roles/                 # Staff role assignment
│   │   │   ├── Leave/                 # Leave request & approval
│   │   │   ├── Salary/                # Payroll management
│   │   │   ├── StaffAttendance/       # Staff attendance tracking
│   │   │   └── Documents/             # Staff document storage
│   │   ├── 08_Communication/          # Announcements, notices, SMS/email hooks
│   │   ├── 09_Reports/                # Dynamic report generation
│   │   ├── 10_Analytics/              # Aggregated analytics endpoints
│   │   ├── 11_Documents/              # Centralized document management
│   │   ├── 12_ParentPortal/           # Parent-scoped APIs
│   │   ├── 13_StudentPortal/          # Student-scoped APIs
│   │   └── 14_FutureTrendModules/     # AI/ML ready stubs
│   ├── test/                          # Jest unit & e2e tests
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── package.json
│
└── frontend/                          # Next.js 15 App Router
    ├── src/
    │   ├── app/                       # Next.js routes
    │   │   ├── page.tsx               # Login + Demo School Portal
    │   │   ├── layout.tsx             # Root layout (fonts, meta)
    │   │   ├── globals.css            # Design System V2 CSS variables
    │   │   ├── actions.ts             # Server actions
    │   │   ├── dashboard/             # Main ERP dashboard shell
    │   │   ├── parent/                # Parent portal route
    │   │   └── student/               # Student portal route
    │   ├── 01_Core/
    │   │   └── Dashboard/
    │   │       ├── OverviewTab.tsx    # Role-based dashboard: Attention→Decision→Analytics
    │   │       ├── OperationsDashboard.tsx  # Backup, integrity & UAT monitoring
    │   │       ├── SettingsTab.tsx    # Institution & user settings
    │   │       ├── Sidebar.tsx        # Grouped, role-aware navigation sidebar
    │   │       ├── AiAssistant.tsx    # AI assistant panel (stub)
    │   │       ├── CommandPalette.tsx # ⌘K command palette
    │   │       └── CountryPhoneInput.tsx  # International phone input component
    │   ├── 02_Admission/
    │   │   └── StudentProfile/        # Student profile UI
    │   ├── 03_Academics/              # Academics UI components
    │   ├── 04_Attendance/             # Attendance marking UI
    │   ├── 05_Fees/
    │   │   ├── FeeStructure/          # Fee plan management UI
    │   │   └── Receipts/              # Payment receipts UI
    │   ├── 06_Exams/
    │   │   ├── ExamSetup/             # Exam configuration UI
    │   │   └── ReportCards/           # Student report card UI
    │   ├── 07_Staff/
    │   │   ├── StaffProfile/          # Staff directory UI
    │   │   └── Salary/                # Payroll UI
    │   ├── 08_Communication/          # Announcements UI
    │   ├── 09_Reports/                # Reports viewer UI
    │   ├── 10_Analytics/              # Analytics charts UI
    │   ├── 11_Documents/              # Document manager UI
    │   ├── 12_ParentPortal/
    │   │   ├── ParentDashboard.tsx    # Full parent portal dashboard
    │   │   ├── ParentPaymentsCard.tsx # Fee history & payment view
    │   │   └── ChildSelector.tsx      # Multi-child switcher
    │   ├── 13_StudentPortal/          # Student self-service portal UI
    │   ├── 14_FutureTrendModules/     # Placeholder for AI/ML features
    │   └── lib/
    │       ├── api.ts                 # Dual-mode API client (REST + localStorage)
    │       └── indianData.ts          # Indian demographic seed data
    ├── public/
    ├── next.config.ts
    ├── tsconfig.json
    └── package.json
```

---

## 🏗️ Architecture Decisions & Key Insights

### 1. Multi-Tenant Isolation
Every database query is scoped by `institutionId`. No cross-tenant data leakage is possible at the service layer. Branch-level isolation is supported for multi-campus institutions.

### 2. RBAC & Permission Model
Roles are stored in the database (not hardcoded). Permission checks are enforced via NestJS Guards. The frontend conditionally renders tabs, sidebar items, and actions based on the active role.

```
SuperAdmin > InstitutionAdmin > Teacher > Accountant > Parent > Student
```

### 3. Field-Level PII Encryption
Sensitive fields — Aadhaar, PAN, bank account numbers, and guardian contact details — are encrypted at rest using AES-256. The masking layer in `common/helpers/` ensures raw values never appear in API responses (shown as `****` or partial masks).

### 4. Dual-Mode API Client (`api.ts`)
The frontend API client (`src/lib/api.ts`) operates in two modes:
- **Online mode**: Proxies requests to the NestJS backend over HTTP.
- **Offline/Demo mode**: Falls back to an in-memory localStorage database, allowing full ERP functionality without a backend connection. The Demo School seeder auto-runs when fewer than 50 students are detected.

### 5. Three-Tier Dashboard Architecture
The main dashboard (`OverviewTab.tsx`) follows a deliberate hierarchy:

```
Tier 1 — ATTENTION CENTER   → Alerts, pending actions, urgent items
Tier 2 — DECISION CENTER    → Approvals, quick actions, operational items  
Tier 3 — ANALYTICS CENTER   → Recharts KPI cards, trend lines, comparisons
```

Each tier adapts content to the viewer's role (Principal, Teacher, Accountant, Parent, Student).

### 6. Analytics & Visualizations
Built with **Recharts**. All charts consume CSS variable tokens (`var(--primary)`, `var(--success)`) ensuring they automatically adapt to light/dark mode. Analytics sections include:
- **Executive KPIs**: Total Students, Attendance %, Fee Collection, Outstanding Fees, Admissions MTD
- **Academic Analytics**: Class-wise performance, exam trends, subject pass rates
- **Financial Analytics**: Monthly fee collection, outstanding aging, payment modes
- **Staff Analytics**: Teacher attendance, leave trends, department distribution
- **Month-over-Month** and **Term-over-Term** comparison indicators

### 7. Operations & SRE Layer
A dedicated `Operations` module provides:
- **Backup Status Monitor**: Tracks last backup timestamp, size, and success state
- **Data Integrity Checks**: Automated schema consistency validation with `SystemAlert` escalation
- **UAT Issue Tracker**: Pilot feedback collection and resolution tracking
- **Integrity Health Scores**: Color-coded health indicators for quick ops review

### 8. Design System V2
Global CSS variables defined in `globals.css` power the entire UI:
- **Typography**: Inter (Google Fonts), 16px base, 1.5 line-height
- **Spacing scale**: 4 · 8 · 12 · 16 · 24 · 32 · 48px
- **Color tokens**: HSL-based, theme-aware (light/dark)
- **Motion**: Subtle micro-animations via CSS transitions, no heavy JS animation libraries

### 9. Indian-First Data Layer
`indianData.ts` provides realistic Indian demographic data: names, states, districts, pincodes, phone prefixes, and realistic Aadhaar/PAN patterns — ensuring demo data looks authentic for institutional pilots in India.

### 10. Database Schema Highlights (`schema.prisma`)
- **Composite indexes** on `(institutionId, studentId)`, `(institutionId, classId)`, `(institutionId, createdAt)` for tenant-aware query performance.
- **Soft deletes** via `deletedAt` fields — no hard data destruction.
- **Audit fields**: `createdAt`, `updatedAt`, `createdBy` on all major entities.
- **PITR-ready**: Schema is compatible with PostgreSQL PITR (Point-in-Time Recovery) — test separately per provider.

---

## 📊 Module Summary

| # | Module | Backend | Frontend | Status |
|---|---|---|---|---|
| 01 | Core (Auth, RBAC, Audit) | ✅ | ✅ | Production-Hardened |
| 02 | Admission | ✅ | ✅ | Complete |
| 03 | Academics | ✅ | ✅ | Complete |
| 04 | Attendance | ✅ | ✅ | Complete |
| 05 | Fees | ✅ | ✅ | Complete |
| 06 | Exams & Report Cards | ✅ | ✅ | Complete |
| 07 | Staff Management | ✅ | ✅ | Complete + PII Hardened |
| 08 | Communication | ✅ | ✅ | Complete |
| 09 | Reports | ✅ | ✅ | Complete |
| 10 | Analytics | ✅ | ✅ | Recharts Integrated |
| 11 | Documents | ✅ | ✅ | Complete |
| 12 | Parent Portal | ✅ | ✅ | Complete |
| 13 | Student Portal | ✅ | ✅ | Complete |
| 14 | Future Trend Modules | 🔵 Stub | 🔵 Stub | AI/ML Ready |
| — | Operations Dashboard | ✅ | ✅ | SRE Complete |

---

## 🔧 Operations & Monitoring

### Backup Strategy
- **Primary**: PostgreSQL dumps via `pg_dump` to S3-compatible storage
- **Schedule**: Daily full backups, retention for 30 days
- **PITR**: Supported at provider level (Neon WAL-based recovery) — validate per environment

### Integrity Monitoring
Automated checks run on schedule via the Operations module:
- Orphaned student records
- Fee collection without receipts
- Attendance records without valid class assignments
- Schema constraint violations

Alerts are raised as `SystemAlert` entries visible on the Operations Dashboard.

### UAT & Pilot Tracking
The Operations Dashboard includes a UAT Issue Tracker for collecting and resolving pilot feedback before production rollout.

---

## 📋 Operational Docs

| Document | Purpose |
|---|---|
| [Pilot Launch Checklist](./docs/operations/PILOT_LAUNCH_CHECKLIST.md) | Pre-go-live validation steps |
| [Quick Start Guides](./docs/operations/QUICK_START_GUIDES.md) | Onboarding guide for admins & teachers |
| [Disaster Recovery Runbook](./docs/operations/DISASTER_RECOVERY_RUNBOOK.md) | Incident response & recovery procedures |

---

## 🧪 Testing

```bash
# Backend unit tests
cd backend
npm run test

# Backend test coverage
npm run test:cov

# TypeScript type check (frontend)
cd frontend
npx tsc --noEmit
```

Current test coverage includes:
- Operations service (backup routines, health checks)
- Staff service (data integrity, PII masking)
- App controller smoke tests

---

## 🚢 Deployment

The project is Vercel-ready via `vercel.json`. For production:

1. Deploy the **frontend** to Vercel (Next.js App Router)
2. Deploy the **backend** to Railway, Render, or any Node.js host
3. Use **Neon PostgreSQL** (serverless, auto-scaling) as the database
4. Set all secrets via environment variables — never in source code
5. Run `npx prisma migrate deploy` as a pre-deploy step, not `migrate dev`

---

## 🛡️ Security Notes

- JWT tokens expire in 24h; rotate `JWT_SECRET` on every environment
- All PII fields (Aadhaar, PAN, bank data) are encrypted at rest with AES-256
- API response masking is enforced at the interceptor layer — raw PII is never exposed
- `dev.db` (SQLite dev file) is `.gitignore`d and must never be committed
- Database credentials must never appear in frontend bundles

---

## 👥 Contributing

This is a private institutional product. For internal contribution guidelines, contact the AURXON team.

---

## 📄 License

Proprietary · © 2026 AURXON / CodeSage4D. All rights reserved.
