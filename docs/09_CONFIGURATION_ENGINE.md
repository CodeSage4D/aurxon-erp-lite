# Aurxon School ERP - Configuration Engine Specification

## 1. Dynamic Configuration Strategy

The platform separates school operational rules (grading frameworks, attendance metrics, promotion thresholds, fee installment periods) from core application code. The **Configuration Engine** loads operational guidelines dynamically from database key-value stores.

```text
Global Templates (CBSE, ICSE, Cambridge)
  │
  ├── Inherited by Organization (Settings Group)
  │     │
  │     ├── Resolved by School (Configuration Items)
  │     │     │
  │     │     └── Active Session Rules mapped in context
```

---

## 2. Core Configuration Parameters

Configurations are structured into **Setting Groups** containing typed key-value pairs:

### 2.1 CBSE Affiliation Template (Sample Configuration Group)
- **Group Code**: `ACADEMIC_CBSE_RULES`
- **Key-Value Settings**:
  - `grading_system`: `CCE_LETTER_GRADE` (A1, A2, B1, B2, C1, C2, D, E)
  - `gpa_conversion`: `CBSE_GPA_MULTIPLIER` (Percentage = GPA * 9.5)
  - `scholastic_weightage`: `{"UT": 10, "PA": 10, "TERM_1": 30, "TERM_2": 50}`
  - `min_attendance_threshold`: `75` (Percentage required to sit for examinations)
  - `promotion_rule`: `PASS_ALL_CORE_SUBJECTS` (Failing maths/science triggers retest logs)

### 2.2 Cambridge IGCSE Template (Sample Configuration Group)
- **Group Code**: `ACADEMIC_CAMBRIDGE_RULES`
- **Key-Value Settings**:
  - `grading_system`: `IGCSE_MARKS_GRADE` (A*, A, B, C, D, E, F, G, U)
  - `gpa_conversion`: `GPA_SCALE_4`
  - `attendance_rule`: `PERIOD_WISE_ATTENDANCE`
  - `min_attendance_threshold`: `85`
  - `scholastic_weightage`: `{"EXTERNAL_EXAM": 70, "COURSEWORK": 30}`

---

## 3. Configuration JSON Topography

Below is the concrete configuration matrix stored in `ConfigurationItem` for an active CBSE School:

```json
{
  "organizationId": "org-rkmvp-uuid",
  "settings": [
    {
      "group": "ATTENDANCE_RULES",
      "items": {
        "attendance_type": "DAILY_ONCE",
        "default_status": "PRESENT",
        "parent_notification_trigger": "ABSENT_3_CONSECUTIVE_DAYS",
        "leave_approval_requirement": "CLASS_TEACHER_AND_HOD"
      }
    },
    {
      "group": "GRADING_RULES",
      "items": {
        "assessment_scale": "CCE_100_MARK_PERCENT",
        "grade_scale_map": [
          {"min": 91, "max": 100, "grade": "A1", "points": 10.0},
          {"min": 81, "max": 90, "grade": "A2", "points": 9.0},
          {"min": 71, "max": 80, "grade": "B1", "points": 8.0},
          {"min": 61, "max": 70, "grade": "B2", "points": 7.0},
          {"min": 51, "max": 60, "grade": "C1", "points": 6.0},
          {"min": 41, "max": 50, "grade": "C2", "points": 5.0},
          {"min": 33, "max": 40, "grade": "D", "points": 4.0},
          {"min": 0, "max": 32, "grade": "E", "points": 0.0}
        ],
        "allow_grace_marks": true,
        "max_grace_marks_per_subject": 5
      }
    },
    {
      "group": "FEE_COLLECTION_RULES",
      "items": {
        "billing_cycle": "QUARTERLY",
        "late_fee_grace_days": 10,
        "late_fee_charge_type": "DAILY_FLAT_RATE",
        "late_fee_amount": 50.00,
        "automatic_suspension_after_due_days": 45
      }
    }
  ]
}
```

---

## 4. Configuration Service Helper (NestJS Pattern)

To retrieve active rules efficiently, a NestJS cache helper is mapped to queries:
```typescript
import { Injectable, CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfigurationService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getSetting(organizationId: string, groupCode: string, key: string): Promise<string | null> {
    const cacheKey = `setting:${organizationId}:${groupCode}:${key}`;
    const cachedValue = await this.cacheManager.get<string>(cacheKey);
    
    if (cachedValue) {
      return cachedValue;
    }

    const item = await this.prisma.configurationItem.findFirst({
      where: {
        key,
        setting: {
          organizationId,
          groupCode,
        },
      },
    });

    if (item) {
      await this.cacheManager.set(cacheKey, item.value, { ttl: 3600 }); // Cache for 1 hour
      return item.value;
    }

    return null;
  }
}
```
This isolates raw database scans, speeding up authorization rules execution.
