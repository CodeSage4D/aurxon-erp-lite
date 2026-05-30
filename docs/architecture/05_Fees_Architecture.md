# AURXON ERP Lite - Module Architecture: 05_Fees

## 1. Module Purpose
The `05_Fees` module provides financial governance and transaction processing for the institution. It automates billing pipelines, processes credits/debits, manages parent invoices, and provides a real-time Profit & Loss (P&L) ledger to monitor overall institutional surplus margins.

**Business Value:** It digitizes billing and cash desk activities. By generating dynamic, tax-compliant receipt numbers, calculating late fines, and tracking operating expenses, it provides the institution with clear financial forecasting, eliminates leakage, and helps administrators manage operational liquidity.
**User Value:** 
* **Administrators / Accountants:** Define modular fee schedules, collect cash payments, issue digital receipts, and input utility/operational expenses to compute institutional margins automatically.
* **Parents:** Can track outstanding dues, view historical receipts, and pay online through secure gateways (UPI/Card/NetBanking).

---

## 2. Submodules
* **FeeHeads:** Definitions of core fee items (e.g., Tuition Fee, Computer Fee, Transport Fee) linked to school ledger accounts.
* **FeeStructure:** Grouping individual FeeHeads into class-specific billing packages with defined due dates.
* **StudentFeeAllocation:** The billing engine that applies fee structures to specific grades, sections, or individual student accounts.
* **Payments:** Core payment processing engine supporting Cash Desk, UPI, and Bank Transfer channels.
* **Receipts:** Sequential, tamper-proof tax receipt generator.
* **Concessions:** Policy engine handling custom discounts, scholarships, and sibling waivers.
* **Dues & Penalties:** Tracks late payments and calculates fine parameters based on overdue age.
* **Refunds:** Workflow for processing student cancellations, withdrawals, and ledger adjustments.

---

## 3. Folder Structure (Domain-Driven)
```text
05_Fees/
├── FeeHeads/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── FeeStructure/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── StudentFeeAllocation/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── Payments/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── Receipts/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── Concessions/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── Dues/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
└── Refunds/
    ├── Controllers/
    ├── Services/
    └── DTOs/
```

---

## 4. Backend Files
* `FeeHeads/fee-head.controller.ts`, `FeeHeads/fee-head.service.ts`
* `FeeStructure/fee-structure.controller.ts`, `FeeStructure/fee-structure.service.ts`, `FeeStructure/dto/create-structure.dto.ts`
* `StudentFeeAllocation/allocation.controller.ts`, `StudentFeeAllocation/allocation.service.ts`
* `Payments/payments.controller.ts`, `Payments/payments.service.ts`, `Payments/dto/record-payment.dto.ts`
* `Receipts/receipts.controller.ts`, `Receipts/receipts.service.ts`
* `Concessions/concession.controller.ts`, `Concessions/concession.service.ts`
* `Dues/dues.service.ts`
* `Refunds/refund.controller.ts`, `Refunds/refund.service.ts`

---

## 5. Frontend Files
* `src/05_Fees/FeeStructure/FeesTab.tsx` (P&L Ledger view, Cash payment modal, structure creator, and operational expense debit tracker)
* `src/05_Fees/Payments/PaymentGatePage.tsx` (Secure checkout gateway view for parents)
* `src/05_Fees/Receipts/ReceiptViewer.tsx` (Formatted invoice print preview and download action)
* `src/05_Fees/Concessions/WaiverModal.tsx` (Admin panel to approve scholarships or sibling discounts)

---

## 6. Database Entities (Prisma / SQL schema models)

* **`FeeHead`**: id, branch_id, name, description, ledger_code (e.g. "REV-TUI-101")
* **`FeeStructure`**: id, branch_id, name, total_amount, due_date, academic_year_id (foreign key to AcademicYear)
* **`FeeStructureItem`**: id, fee_structure_id (foreign key to FeeStructure), fee_head_id (foreign key to FeeHead), amount
* **`StudentFeeAllocation`**: id, branch_id, student_id (foreign key to Student), fee_structure_id (foreign key to FeeStructure), status (ENUM: UNPAID, PARTIAL, PAID), amount_due, amount_paid, waiver_amount, penalty_amount
* **`FeePayment`**: id, branch_id, allocation_id (foreign key to StudentFeeAllocation), amount_paid, payment_method (ENUM: CASH, BANK_TRANSFER, UPI, CARD), transaction_reference, remarks (nullable), collected_by (foreign key to User), paid_at
* **`FeeReceipt`**: id, payment_id (foreign key to FeePayment), receipt_number (unique sequential string), pdf_url, created_at
* **`FeeConcession`**: id, branch_id, allocation_id (foreign key to StudentFeeAllocation), concession_type (ENUM: SCHOLARSHIP, STAFF_DISCOUNT, SIBLING_DISCOUNT), amount_waived, approved_by (foreign key to User), justification
* **`FeeRefund`**: id, branch_id, allocation_id (foreign key to StudentFeeAllocation), refund_amount, status (ENUM: PENDING, APPROVED, REJECTED), refund_method, processed_by (foreign key to User), processed_at
* **`OperatingExpense`**: id, branch_id, title, amount, category (ENUM: UTILITY, MAINTENANCE, SALARY, OPERATIONAL), payment_method, recorded_by (foreign key to User), created_at

---

## 7. API Endpoints

### Configurations & Allocations
* `GET /api/v1/fees/structures` - Retrieve fee structure templates (scoped to branch)
* `POST /api/v1/fees/structures` - Create a fee structure configuration
* `GET /api/v1/fees/allocations` - Retrieve allocations (supports status, class filters)
* `POST /api/v1/fees/allocations/bulk` - Batch allocate fee structures to classes/sections

### Transaction Processing
* `POST /api/v1/fees/payments` - Process cash/online payment collection and issue receipt
* `GET /api/v1/fees/receipts/:id` - Fetch receipt metadata and PDF file links
* `POST /api/v1/fees/refunds` - File a fee refund request

### Operational Expense & Ledger
* `POST /api/v1/fees/expenses` - Debit an operational expense (e.g. utilities, repairs)
* `DELETE /api/v1/fees/expenses/:id` - Revert recorded operating expense
* `GET /api/v1/fees/ledger/overview` - Fetch total revenues, expenses, salaries, and net profit surplus

---

## 8. Role Permissions

* **Super Admin:** View organization-wide multi-branch financial ledgers. Override global tax parameters.
* **Institute Admin:** Define structure items. Authorize refunds and concessions. Override payment records. Full view of P&L ledgers.
* **Accountant (Staff):** Primary user. Can create allocations, collect payments, print receipts, and log operational expenses. Cannot delete published receipts or approve refunds.
* **Parent / Student:** Read-only view of their personal invoices, dues, and transaction histories. Can initialize payments.

---

## 9. Dashboard Widgets

* **Revenues vs. Dues Gauge:** Progress dial matching actual collections against overall receivables.
* **Cash Desk Activity Tracker:** Displays cash, UPI, and bank transfers collected today.
* **Net Surplus Margin:** Shows dynamic profit/surplus margin based on fee collection minus operational expenditures and staff salaries.
* **Due Date Alerts:** Flags classes or student subsets showing critical delinquency indicators.

---

## 10. Reports

* **Overdue Defaulters List:** Lists students with unpaid or partially paid balances, sorted by aging brackets (e.g. 30, 60, 90+ days overdue).
* **Daily Cash Journal:** Chronological statement of credits and debits processed during the business day.
* **Category Expense ledger:** Detailed breakdown of institutional outflows (salaries, repairs, utilities).
* **Concession Disbursement Report:** Audits waivers and scholarships granted to ensure policy adherence.

---

## 11. Audit Requirements

**Must Log Actions:**
* Reversals/Deletions of `OperatingExpense` entries.
* Issuance of any `FeeConcession` (who approved, how much was waived, and reasoning).
* Status changes of `FeeRefund` records from PENDING to APPROVED.
* Direct alterations to the base fee amounts of assigned `StudentFeeAllocation` entities.

**Tracked Fields:**
* `allocation_id`, `payment_id`, `actor_id` (Accountant/Admin user ID).
* `action_type` (e.g. APPROVE_CONCESSION, REVERT_EXPENSE).
* `previous_amount`, `new_amount`.
* `timestamp` and `ip_address`.

---

## 12. Security Requirements

* **Validation Rules:**
  * **Negative Check:** Amounts paid, waived, or debited must be strictly positive (> 0).
  * **Receipt Uniqueness:** Sequential numbers must rely on database locking and sequence objects to prevent number skips or duplicate receipt values.
* **Authorization Checks:**
  * Only users carrying `Accountant` or `Institute Admin` roles can post payments or expenses.
  * Adjusting a concession or processing refunds must trigger strict permission validations in the controller layer.
* **Tenant Isolation:**
  * Multi-branch separation must isolate financial ledger books (`WHERE branch_id = :branchId`). Cross-branch transaction checks are strictly blocked.
* **Data Integrity:**
  * Once a payment is registered against a `StudentFeeAllocation`, the parent `FeeStructure` must be locked from edits to prevent downstream discrepancies in historical invoice accounting.
