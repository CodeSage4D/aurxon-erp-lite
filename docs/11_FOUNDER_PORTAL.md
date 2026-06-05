# Aurxon School ERP - Founder Portal Specification

## 1. Access Control & Boundary Isolation

The **Founder Portal** is the administrative cockpit of the Aurxon SaaS platform. It is isolated from the student/school data layer:
- **Zero Tenant Visibility**: Founder users cannot access database rows mapping student records, employee profiles, or accounting ledger transactions unless temporary debug authorization has been granted and logged by the Support Access Engine.
- **Global Identity Rules**: Access is restricted to users holding the role `SUPER_ADMIN` with membership within the default `Aurxon Platform Control Plane` tenant organization.

---

## 2. Dashboard Widgets & KPI Configurations

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  AURXON FOUNDER PORTAL   |   Cluster: PROD-AP-SOUTH-1   |   API Health: 99.98%         │
├───────────────┬────────────────────────────────────────────────────────────────────────┤
│ Side Nav      │ [ KPI: ARR ]       [ KPI: Tenants ]     [ KPI: Active Users ]          │
│ ────────      │ [ ₹34.2M (+12%) ]  [ 142 Active / 18 Tr] [ 84,204 Session Rate ]        │
│ - Overviews   ├────────────────────────────────────────────────────────────────────────┤
│ - Revenue     │ [ Widget: SaaS Health & Node telemetry ]                               │
│ - Analytics   │ ├─ EKS Node 1 Load: 42% CPU | EKS Node 2 Load: 45% CPU                 │
│ - Global Config│ ├─ RDS Primary Pool Connection Load: 22%                               │
│ - Sentry Logs │ ├─ active System Alerts: 0 unresolved                                  │
│ - Support Log ├────────────────────────────────────────────────────────────────────────┤
│ - Audit Engine│ [ Chart: Module Adoption Analysis ]                                    │
│               │   Attendance   |██████████████████████████████ (98%)                   │
│               │   Examinations |██████████████████████ (74%)                           │
│               │   Fees Ledger  |███████████████ (45%)                                  │
└───────────────┴────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Core Telemetry Metrics (KPI Cards)
- **Active Tenants**: Total organizations count with status `ACTIVE`.
- **Trial Funnel Conversion**: Count of trial licenses that migrated to full paid subscriptions over the past 30 days.
- **Adoption Rate**: Percentage of active organizations that have configured more than 3 modules.
- **Storage Consumption**: Total disk space utilized across S3 assets and PostgreSQL databases, raising warning thresholds at 80% allocation parameters.

---

## 3. Revenue & Commercial Monitoring

### 3.1 Financial Metric Cards
- **Monthly Recurring Revenue (MRR)**: Sum of active monthly subscription plans.
- **Annual Recurring Revenue (ARR)**: Sum of annual subscription and enterprise custom contracts.
- **Upcoming Renewals List**: Grouped list showing organizations whose licenses expire within 30 days, sorting by contract valuation metrics to prioritize account representative follow-ups.

---

## 4. Tenant Analytics & System Health

### 4.1 System Health Telemetry
Founder users track platform operations using integrated metrics panels:
- **Active Connection Pool Load**: Displays database active vs. idle connection ratios sourced from PgBouncer logs.
- **API Request Rates**: Displays P95 latencies and HTTP status code graphs (e.g. tracking spike rates in `5xx` errors).
- **Elasticsearch Log Stream**: Real-time aggregated system logs stream, raising dashboard alerts for uncaught exceptions captured by Sentry.

### 4.2 Tenant Adoption & Churn Analytics
- **Top Active Organizations**: Lists tenants ranked by active user session frequencies and transaction volumes, helping identify advocates.
- **Inactive Organizations**: Identifies tenants with zero transaction modifications in the past 14 days, signaling potential churn risks.
- **Marketplace Trends**: Ranks modules by usage frequency to guide future development investments.
- **Trial Conversion Funnel**: Percentage of trial organizations transitioning to active paid subscriptions.
