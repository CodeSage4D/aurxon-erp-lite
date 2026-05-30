# AURXON ERP Lite - Module Architecture: 04_Attendance

## 1. Module Purpose
The `04_Attendance` module provides institution-wide mechanisms to record, monitor, and report daily presence for students and staff. It acts as a safety and compliance engine, ensuring accurate real-time attendance registers.

**Business Value:** It automates the tracking of student attendance and staff timesheets. By integrating biometric/RFID terminal feeds and automatically triggering notifications (SMS/Email) to parents, it enhances student safety, maintains school safety regulations, and simplifies payroll preparation by feeding exact working hours into administrative pipelines.
**User Value:** 
* **Administrators:** Oversee overall attendance statistics, handle manual register overrides, view live RFID scanner feeds, and manage staff punch cards.
* **Teachers:** Quickly mark daily attendance rosters via a clean interface or let RFID readers handle it automatically.
* **Parents:** Receive instant automated updates when their child is absent or late.

---

## 2. Submodules
* **Attendance Session:** Configures active attendance windows (e.g., morning check-in, afternoon checkout) and excludes public/school holidays.
* **Student Attendance:** Manages daily class rosters, marking codes (Present, Absent, Late, Half-Day), manual remark entries, and status histories.
* **Staff Attendance:** Operates staff shift schedules, punch-in/out registers, and timesheet aggregation.
* **Attendance Alerts:** Automates instant notifications (SMS/Email) to parent contacts when students are marked absent or late.
* **Attendance Reports:** Processes monthly registers, flags chronic absenteeism, and exports timesheets.

---

## 3. Folder Structure (Domain-Driven)
```text
04_Attendance/
├── AttendanceSession/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── StudentAttendance/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── StaffAttendance/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── AttendanceAlerts/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
└── AttendanceReports/
    ├── Controllers/
    ├── Services/
    └── DTOs/
```

---

## 4. Backend Files
* `AttendanceSession/session.controller.ts`, `AttendanceSession/session.service.ts`
* `StudentAttendance/student-attendance.controller.ts`, `StudentAttendance/student-attendance.service.ts`, `StudentAttendance/dto/attendance-roster.dto.ts`
* `StaffAttendance/staff-attendance.controller.ts`, `StaffAttendance/staff-attendance.service.ts`, `StaffAttendance/dto/punch-clock.dto.ts`
* `AttendanceAlerts/alerts.controller.ts`, `AttendanceAlerts/alerts.service.ts`
* `AttendanceReports/reports.controller.ts`, `AttendanceReports/reports.service.ts`

---

## 5. Frontend Files
* `src/04_Attendance/StudentAttendance/AttendanceTab.tsx` (Daily roster table, present/absent selector, and live RFID stream monitoring)
* `src/04_Attendance/StaffAttendance/StaffCheckInCard.tsx` (Self-service punch-in and clock status dashboard)
* `src/04_Attendance/AttendanceAlerts/AlertConfigForm.tsx` (Configures automated SMS/Email templates and alert thresholds)
* `src/04_Attendance/AttendanceReports/MonthlyGrid.tsx` (Heatmap visual grid representing monthly individual attendance sheets)

---

## 6. Database Entities (Prisma / SQL schema models)

* **`AttendanceSession`**: id, branch_id, date, session_type (ENUM: STUDENT_DAILY, STAFF_DAILY), start_time, end_time, is_holiday, status (ENUM: OPEN, CLOSED)
* **`StudentAttendance`**: id, branch_id, student_id (foreign key to Student), session_id (foreign key to AttendanceSession), status (ENUM: PRESENT, ABSENT, LATE, HALF_DAY), checked_in_at (timestamp), source (ENUM: MANUAL, RFID, BIOMETRIC, APP), remarks (nullable), verified_by (foreign key to User)
* **`StaffAttendance`**: id, branch_id, staff_id (foreign key to Staff), date, clock_in (timestamp), clock_out (timestamp, nullable), status (ENUM: PRESENT, ABSENT, LATE, HALF_DAY, ON_LEAVE), source (ENUM: MANUAL, RFID, BIOMETRIC, PORTAL), ip_address (nullable), device_id (nullable)
* **`BiometricLog`**: id, branch_id, device_serial, card_number (RFID hash), raw_timestamp, status (ENUM: PENDING, PROCESSED, ERROR), error_message (nullable)
* **`AttendanceAlertLog`**: id, student_id, date, alert_type (ENUM: SMS, EMAIL), recipient_contact, status (ENUM: SENT, FAILED), gateway_response (nullable)

---

## 7. API Endpoints

### Attendance Sessions
* `GET /api/v1/attendance/sessions` - Retrieve sessions scoped by date and type
* `POST /api/v1/attendance/sessions` - Open a new attendance session for the day

### Student Register
* `GET /api/v1/attendance/student/roster` - Fetch attendance sheet/roster for a class section and date
* `POST /api/v1/attendance/student/submit` - Save/update bulk attendance records for a class
* `POST /api/v1/attendance/biometric/sync` - Webhook receiver for physical RFID readers pushing card read data

### Staff Clock
* `GET /api/v1/attendance/staff/records` - View history of staff attendance records
* `POST /api/v1/attendance/staff/clock-in` - Clock-in current authenticated staff member
* `POST /api/v1/attendance/staff/clock-out` - Clock-out current authenticated staff member

### Alerts & Analytics
* `GET /api/v1/attendance/reports/monthly-summary` - Monthly summary per student/class
* `POST /api/v1/attendance/alerts/dispatch` - Manually force triggering absent alerts for unresolved absences

---

## 8. Role Permissions

* **Super Admin:** Global management of biometric integration tokens and hardware device serial associations.
* **Institute Admin:** Full read-write permission for all student and staff records. Can manually overwrite any attendance status or session rules.
* **Teacher:** Can mark student attendance for their mapped classes and sections. Read-only for other sections. Read-only for their own staff attendance cards.
* **Staff (General):** Can clock in/out through the system portal and view their own monthly attendance logs.
* **Student / Parent:** Read-only access to view their own attendance grids and alerts.

---

## 9. Dashboard Widgets

* **Today's Attendance Rate:** Circular indicator showing the percentage of present students today.
* **Staff Presence Grid:** Shows real-time counter of checked-in teachers vs total roster.
* **RFID Scanner Feed:** Stream of latest card scans with success/failure feedback (e.g. "Card #12903 mapped to Student Karan").
* **Abnormal Absence Warning:** Highlights students who have been absent for 3 consecutive days.

---

## 10. Reports

* **Monthly Attendance Ledger:** Printable sheet formatted like a traditional grid showing attendance for all days of the month.
* **Chronic Absentee List:** Identifies students falling below the mandatory academic attendance threshold (e.g., 75% attendance).
* **Timesheet / Hours Worked Report:** Breakdown of staff working hours, late arrivals, and total days present.
* **Alert Deliverability Audit:** Details sent vs. failed notifications.

---

## 11. Audit Requirements

**Must Log Actions:**
* Any manual adjustment of `StudentAttendance.status` or `StaffAttendance.status` after submission.
* Manual clock-ins/outs overridden by administrators.
* Failed biometric card logs that could not be matched to any student or staff record.

**Tracked Fields:**
* `attendance_record_id`, `actor_id` (User who performed the override).
* `previous_status`, `new_status`.
* `remarks` (Mandatory text explanation of the correction).
* `timestamp` and `ip_address`.

---

## 12. Security Requirements

* **Validation Rules:**
  * **Time Range Boundaries:** Clock-in date must match today's system date. Clock-out time must be chronologically after the corresponding clock-in time.
  * **Device Authentication:** Biometric API endpoints must validate an authentication signature using a secure, SHA-256 HMAC header containing the device serial and timestamp.
* **Authorization Checks:**
  * Only authorized personnel (Teachers, Admins) can edit daily register records.
  * Teachers can only modify registers within 48 hours of the target date; older records require Institute Admin credentials to lock down historical grades.
* **Tenant Isolation:**
  * All queries must include the tenant check (`WHERE branch_id = :branchId`).
  * Biometric reader logs are matched to branches using the device serial configuration saved in Branch settings.
* **Data Integrity:**
  * Roster submission must use transaction scopes (`SELECT FOR UPDATE` on student status or bulk records) to prevent duplicate row creation if multiple teachers open the same class register at the same time.
