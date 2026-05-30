# AURXON ERP Lite - Module Architecture: 10_Analytics

## 1. Module Purpose
The `10_Analytics` module acts as the business intelligence and student performance evaluation core of AURXON ERP Lite. It runs background aggregation queries to track class scoring trends, analyze fee collection forecasts, correlate attendance with grades, and flag students at risk of academic failure.

**Business Value:** It changes administration from reactive to proactive. By analyzing drop-out risk factors and evaluating promotion readiness automatically, it helps administrators intervene early, optimize tuition collection campaigns, and ensure academic quality standards.
**User Value:** 
* **Principals / Admins:** Review projected revenue curves, check class scoring averages, and examine promotion eligibility lists.
* **Teachers:** Identify students struggling with attendance or grades before they fail, allowing for targeted academic support.

---

## 2. Submodules
* **PerformanceTrends:** Analyzes historical exam results to map subject score distributions and tracking class performance over time.
* **AttendanceInsights:** Maps correlations between student absenteeism rates and academic scoring trends.
* **FeeInsights:** Generates collection forecasts based on historical payment dates and structures.
* **StudentRiskAlerts:** An early-warning engine that flags students demonstrating drops in grades, low attendance, or missing payments.
* **PromotionReadiness:** Evaluates whether students meet the necessary grade thresholds, attendance percentages, and fee clearance rules to qualify for year-end promotions.

---

## 3. Folder Structure (Domain-Driven)
```text
10_Analytics/
├── PerformanceTrends/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── AttendanceInsights/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── FeeInsights/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── StudentRiskAlerts/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
└── PromotionReadiness/
    ├── Controllers/
    ├── Services/
    └── DTOs/
```

---

## 4. Backend Files
* `PerformanceTrends/performance.controller.ts`, `PerformanceTrends/performance.service.ts`
* `AttendanceInsights/attendance-insights.controller.ts`, `AttendanceInsights/attendance-insights.service.ts`
* `FeeInsights/fee-insights.controller.ts`, `FeeInsights/fee-insights.service.ts`
* `StudentRiskAlerts/risk.controller.ts`, `StudentRiskAlerts/risk.service.ts`
* `PromotionReadiness/readiness.controller.ts`, `PromotionReadiness/readiness.service.ts`

---

## 5. Frontend Files
* `src/10_Analytics/PerformanceTrends/ClassPerformanceTracker.tsx` (Class scoring trajectory line charts and grade dispersion curves)
* `src/10_Analytics/StudentRiskAlerts/EarlyWarningDashboard.tsx` (Worksheet detailing flagged high-risk students and specific drop factors)
* `src/10_Analytics/PromotionReadiness/ReadinessWizard.tsx` (Checklist displaying student eligibility based on grades, attendance, and fee clearances)

---

## 6. Database Entities (Prisma / SQL schema models)

* **`AnalyticsInsightCache`**: id, branch_id, type (ENUM: PERFORMANCE, ATTENDANCE, FEE, RISK), metric_key, metric_value (JSON data payload), calculated_at (Caches resource-intensive queries)
* **`StudentRiskProfile`**: id, student_id (foreign key to Student), academic_year_id (foreign key to AcademicYear), risk_level (ENUM: LOW, MEDIUM, HIGH), factors (JSON list of warning factors, e.g., low attendance, failing marks), evaluated_at
* **`PromotionEligibility`**: id, student_id (foreign key to Student), academic_year_id (foreign key to AcademicYear), target_class_id (foreign key to Class), is_eligible (boolean), failed_checks (JSON array of criteria details, e.g., `["LOW_ATTENDANCE", "UNPAID_FEES"]`), updated_at

---

## 7. API Endpoints

### Academic & Attendance Insights
* `GET /api/v1/analytics/performance/trends` - Retrieve class grading trajectories across terms
* `GET /api/v1/analytics/attendance/correlations` - Fetch insights relating attendance to grades

### Financial Forecasting
* `GET /api/v1/analytics/fees/forecast` - Retrieve projected collections for the upcoming quarter

### Warning Signals & Eligibility
* `GET /api/v1/analytics/risk/flagged` - List students flagged as high-risk
* `GET /api/v1/analytics/promotion/eligibility` - List students with their readiness criteria check status
* `POST /api/v1/analytics/promotion/recalculate` - Force recalculation of eligibility flags branch-wide

---

## 8. Role Permissions

* **Super Admin:** Access organization-wide cross-branch analytical trends.
* **Institute Admin / Principal:** Full access to all submodules. Can adjust threshold rules for risk factors and force eligibility recalculations.
* **Teacher:** View student risk parameters and scoring graphs for their assigned sections. Restricted from reading fee collections and projections data.
* **Student / Parent / Accountant:** Access to Analytics is prohibited (General dashboard panels contain simple metrics).

---

## 9. Dashboard Widgets

* **Flagged Risk Level Bar:** Counter indicating numbers of medium/high-risk students requiring attention.
* **Collections Projection Trend:** Forecast graph depicting expected fee collections.
* **Section Grade Bell Curve:** Visualizes grade dispersion for exams.
* **Promotion Pass Rate Gauge:** Radial dial showing current class promotion readiness statistics.

---

## 10. Reports

* **Early Warning Risk Ledger:** Summarizes flagged students and their respective risk levels (grades, attendance, fees).
* **Promotion Block Checklist:** Identifies students failing eligibility criteria, noting remaining deficits.

---

## 11. Audit Requirements

**Must Log Actions:**
* Modifications to student risk criteria limits.
* Manual overrides of a student's `PromotionEligibility.is_eligible` status by administrators.

**Tracked Fields:**
* `student_id`, `eligibility_id`, `actor_id` (Admin user ID).
* `action_type` (e.g., `OVERRIDE_PROMOTION_ELIGIBILITY`, `UPDATE_RISK_LIMITS`).
* `previous_value`, `new_value`.
* `timestamp` and `ip_address`.

---

## 12. Security Requirements

* **Validation Rules:**
  * **Threshold Limits:** Parameter configurations for risk detection (e.g., attendance percentage limits) must fall between 0 and 100.
* **Authorization Checks:**
  * Endpoint access for updating risk models or overriding promotion flags is restricted to administrators.
* **Tenant Isolation:**
  * Strict `branch_id` segregation across cache tables and eligibility files.
* **Data Protection:**
  * Insights cache tables must not contain unencrypted PII. They record foreign keys and aggregated quantitative data.
