# AURXON ERP Lite - Module Architecture: 14_FutureTrendModules

## 1. Module Purpose
The `14_FutureTrendModules` module consolidates the extended operations, secondary facilities, and external integrations of AURXON ERP Lite. It hosts auxiliary support systems—such as Library book circulation, asset Inventory tracking, Gate Visitor monitoring, Digital Classroom resources, and external LMS sync bridges (e.g., Moodle/Google Classroom).

**Business Value:** It coordinates school assets (books, lab equipment, furniture) and manages security logs at the main gate. By centralizing library circulation, tracking inventory depreciation, and bridging to third-party LMS courses, it provides a comprehensive campus management suite.
**User Value:** 
* **Librarians / Inventory Managers:** Catalog books, manage student/staff check-outs/returns, log asset quantities, and flag damaged equipment.
* **Security Officers / Admins:** Check in visitors, issue digital gate passes, log checkout stamps, and keep a real-time count of visitors on campus.
* **Teachers / Students:** Browse book listings, check resource links, and access synced LMS course schedules.

---

## 2. Submodules
* **Library:** Tracks book catalog registers (ISBN, title, author), coordinates student/staff checkouts, manages due dates, and processes returns/fines.
* **Inventory:** Manages school assets, monitors stock quantities, handles classroom equipment allocations, and logs depreciation parameters.
* **VisitorManagement:** Operates the security gate check-in register, hosting host selections, purpose categories, pass rendering, and checkout logging.
* **LMSBridge & DigitalClassroomSupport:** Syncs course mappings, grade points, and file directories with external systems (Google Classroom, Moodle).
* **SmartImportExport & UnifiedSearch:** Handles bulk Excel roster uploads and provides command-palette search queries across the system.

---

## 3. Folder Structure (Domain-Driven)
```text
14_FutureTrendModules/
├── Library/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── Inventory/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── VisitorManagement/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── LMSBridge/
│   ├── Controllers/
│   └── Services/
├── DigitalClassroomSupport/
│   ├── Controllers/
│   └── Services/
└── SmartImportExport/
    ├── Controllers/
    └── Services/
```

---

## 4. Backend Files
* `Library/library.controller.ts`, `Library/library.service.ts`, `Library/dto/catalog-book.dto.ts`
* `Inventory/inventory.controller.ts`, `Inventory/inventory.service.ts`, `Inventory/dto/create-item.dto.ts`
* `VisitorManagement/visitor.controller.ts`, `VisitorManagement/visitor.service.ts`
* `LMSBridge/lms.service.ts`
* `DigitalClassroomSupport/classroom.service.ts`
* `SmartImportExport/import-export.service.ts`

---

## 5. Frontend Files
* `src/14_FutureTrendModules/Library/LibraryTab.tsx` (Book catalog registry search, checkout generation sheets, and active checkout return clickers)
* `src/14_FutureTrendModules/Inventory/InventoryTab.tsx` (Assets lists, room numbers allocations, restock alerts, and damage indicators)
* `src/14_FutureTrendModules/VisitorManagement/GateTab.tsx` (Gate logs register, check-in wizards, and print gate pass triggers)

---

## 6. Database Entities (Prisma / SQL schema models)

* **`Book`**: id, branch_id, title, author, isbn, total_copies, available_copies, status (ENUM: AVAILABLE, DISCARDED)
* **`BookIssue`**: id, book_id (foreign key to Book), student_id (foreign key to Student, nullable), staff_id (foreign key to Staff, nullable), issue_date, due_date, return_date (nullable), status (ENUM: ISSUED, RETURNED, OVERDUE), fine_collected (decimal)
* **`InventoryItem`**: id, branch_id, name, item_code (unique code), category (ENUM: FURNITURE, LAB_EQUIPMENT, STATIONERY, IT), quantity, location (room description), status (ENUM: ACTIVE, DAMAGED, REPAIR_PENDING)
* **`VisitorLog`**: id, branch_id, visitor_name, purpose, phone_number, entry_time, exit_time (nullable), host_user_id (foreign key to User), pass_number (unique pass string)
* **`LMSMapping`**: id, class_subject_mapping_id (foreign key to ClassSubjectMapping), external_course_id, platform (ENUM: GOOGLE_CLASSROOM, MOODLE), sync_status, last_synced_at

---

## 7. API Endpoints

### Library Desk
* `GET /api/v1/library/books` - Retrieve cataloged books list (filter by search queries)
* `POST /api/v1/library/books` - Catalogue a new book
* `POST /api/v1/library/issues` - Generate book checkout record (depletes available copies)
* `PATCH /api/v1/library/issues/:id/return` - Process a book return and update availability

### Asset Inventory
* `GET /api/v1/inventory/items` - List asset items (scoped by branch, category)
* `POST /api/v1/inventory/items` - Log new inventory asset

### Visitor Security
* `POST /api/v1/visitor/check-in` - Log gate check-in entry and generate pass reference
* `PATCH /api/v1/visitor/check-out/:passId` - Register visitor gate exit

---

## 8. Role Permissions

* **Super Admin:** Manage external LMS integrations credentials. Delete historical visitor registries.
* **Institute Admin / Principal:** Full CRUD across books, items, visitors logs, and external mapping rules.
* **Librarian (Staff):** Read-write access to Library submodules (cataloging, checkouts, returns, fines). Read-only for other folders.
* **Gate Officer (Staff):** Read-write access to VisitorManagement check-ins and check-outs. Access to library or inventory is denied.
* **Teacher / Student:** Read-only access to browse the library catalogue. Blocked from other submodules.

---

## 9. Dashboard Widgets

* **Overdue Books Clock:** Count indicator displaying books currently past checkout deadlines.
* **Stock Under Limit:** Flags inventory items falling below minimum quantity thresholds.
* **On-Campus Visitors Gauge:** Shows count of checked-in visitors currently inside campus.
* **LMS Integration Health:** Status bar displaying Google Classroom sync statuses.

---

## 10. Reports

* **Library Circulation Register:** Summary of daily book checkouts and returns.
* **Inventory Stock Evaluation Ledger:** Financial summary of furniture, computer, and lab asset counts.
* **Visitor Gate Book:** Chronological ledger detailing visitor names, purposes, contact numbers, and entry/exit timestamps.

---

## 11. Audit Requirements

**Must Log Actions:**
* Deleting/cataloging library books.
* Manually overriding inventory item quantities.
* Dispatching visitor passes.
* Synchronizing credentials of external LMS course channels.

**Tracked Fields:**
* `book_id`, `item_id`, `visitor_id`, `actor_id` (User ID).
* `action_type` (e.g., `CATALOG_BOOK`, `UPDATE_STOCK`, `VISITOR_CHECKIN`, `LMS_SYNC`).
* `timestamp` and `ip_address`.

---

## 12. Security Requirements

* **Validation Rules:**
  * **ISBN Standard Format:** Book uploads must validate ISBN-10 or ISBN-13 syntax patterns.
  * **Asset Count Boundaries:** Inventory item counts must be positive integers.
  * **Contact String:** Visitor phone numbers must match standard phone patterns.
* **Authorization Checks:**
  * Endpoint access for visitor entry logs is strictly limited to users carrying the `Gate_Officer` role.
* **Tenant Isolation:**
  * Multi-branch scoping forces separation (`WHERE branch_id = :branchId`). LMS integrations operate strictly under branch-specific authorization configurations.
* **Data Protection:**
  * Visitor numbers and logs are kept private; records are auto-archived/cleaned according to standard retention schedules.
  * LMS API secrets are encrypted at rest in the database.
