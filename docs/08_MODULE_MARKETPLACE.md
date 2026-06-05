# Aurxon School ERP - Module Marketplace Specification

## 1. Modules vs. Features Architectural Taxonomy

To enable flexible commercial pricing tiers and avoid monolithic feature creep, the platform implements a strict separation between **ERP Modules** and **Granular Features**.

### 1.1 Taxonomy Mapping Matrix

```text
├── Module: STUDENT_MANAGEMENT (Core Student Directory)
│   ├── Feature: ENROLLMENT_WORKFLOW (Digital Admissions Intake & Scholar No Generation)
│   ├── Feature: STUDENT_TIMELINE (Event History Logging)
│   └── Feature: APAAR_ABC_SYNC (Academic Credit Registry Integrations)
│
├── Module: ATTENDANCE (Basic Daily Registries)
│   ├── Feature: ATTENDANCE_MANUAL (Standard Teacher Web Interface inputs)
│   ├── Feature: ATTENDANCE_BIOMETRIC (Webhook integrations for physical RFID/Fingerprint devices)
│   ├── Feature: ATTENDANCE_QR (Mobile App dynamic QR scanner tags)
│   └── Feature: ATTENDANCE_GEO (GPS Geofencing verification for staff logins)
│
├── Module: EXAMINATION (Basic Grading Marks Inputs)
│   ├── Feature: EXAM_FORMULA_CALCULATOR (Dynamic Result Weighting calculation engine)
│   ├── Feature: REPORT_CARD_BULK_PDF (Bulk compilation engine writing signed A4 report card PDFs)
│   └── Feature: GRACE_MARKS_PROLOGUE (Automated grace marks allocator algorithms)
│
└── Module: FINANCE (Ledger Accounts configurations)
    ├── Feature: ONLINE_GATEWAY_UPI (UPI payment collection pathways)
    ├── Feature: STATUTORY_PAYROLL_IN (Indian Provident Fund/ESI statutory payroll structures)
    └── Feature: RTE_CLAIM_AUDITING (RTE admission reimbursement tracking & ledger adjustments)
```

---

## 2. Dynamic UI Sidebar & Navigation Rendering

The client app does not hardcode route menus in frontend assets. Navigations are parsed dynamically from active organization settings resolved by the **Context Engine**:

```typescript
// Example JSON payload returned by GET /api/v1/portal/navigation
{
  "success": true,
  "menus": [
    {
      "title": "Admissions",
      "route": "/admissions",
      "icon": "UsersIcon",
      "moduleCode": "STUDENT_MANAGEMENT"
    },
    {
      "title": "Attendance",
      "route": "/attendance",
      "icon": "CalendarCheckIcon",
      "moduleCode": "ATTENDANCE"
    },
    {
      "title": "Biometric Devices",
      "route": "/attendance/biometric",
      "icon": "FingerprintIcon",
      "moduleCode": "ATTENDANCE",
      "featureCode": "ATTENDANCE_BIOMETRIC"
    }
  ]
}
```
If `ATTENDANCE` is disabled in `OrganizationModule` records, the entire "Attendance" navigation block is excluded from the API response. If `ATTENDANCE_BIOMETRIC` is disabled, the submenu is hidden, preventing client routing attempts.

---

## 3. Dynamic Backend API Gating & Middleware Execution

To prevent API access bypassing via raw HTTP calls (e.g. executing `POST /api/v1/attendance/biometric/sync` when biometric tracking is disabled for that tenant), NestJS Route Interceptors perform checks:

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_MODULE_KEY } from './require-module.decorator';

@Injectable()
export class ModuleAccessInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const requiredModule = this.reflector.get<string>(REQUIRE_MODULE_KEY, context.getHandler());
    if (!requiredModule) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const activeContext = request.userContext; // Populated by Context Resolution Guard

    const isModuleActive = activeContext.enabledModules.includes(requiredModule);
    if (!isModuleActive) {
      throw new ForbiddenException(`The parent module [${requiredModule}] is not activated for this organization.`);
    }

    return next.handle();
  }
}
```
This multi-tier checks prevent unauthorized processing actions, keeping endpoints secured.
