# Enterprise School ERP - Database Architecture Specification

## 1. Multi-Tenant Database Design

To support hundreds of schools with maximum efficiency, security, and scalability, the database adopts a **Logical Multi-Tenancy Architecture** via a shared PostgreSQL instance. Row Level Security (RLS) policies are declared on all tenant-specific tables to enforce strict data isolation.

### 1.1 Tenant Isolation Strategy
1. **Row-Level Security (RLS)**: Every tenant table contains an `institutionId` field. The API server accesses the database using a restricted database user role. For every database session, the server executes:
   ```sql
   SET LOCAL app.current_tenant_id = 'target-institution-uuid';
   ```
   PostgreSQL automatically filters queries based on the security policy:
   ```sql
   CREATE POLICY tenant_isolation_policy ON "Student" 
   USING (institution_id = current_setting('app.current_tenant_id'));
   ```
2. **Schema-Level Isolation**: For large trust groups with high transaction volumes, the routing middleware switches connection strings dynamically to route their traffic to a dedicated PostgreSQL database schema, isolating tables physically while sharing compute resources.

---

## 2. Entity-Relationship (ER) Topography

The ERP database represents **150+ logical entities** organized across 8 primary domain modules. The core relational map below details the connections between these main modules.

```mermaid
erDiagram
    %% Core Tenancy Domain
    Institution ||--o{ Branch : "operates"
    Institution ||--o{ User : "authenticates"
    Institution ||--o{ Settings : "configures"
    
    %% User Profile Boundaries
    User ||--o| Student : "has profile"
    User ||--o| Staff : "has profile"
    User ||--o| Parent : "has profile"
    Parent ||--o{ Student : "sponsors"

    %% Academics Domain
    Institution ||--o{ Class : "defines"
    Class ||--o{ Section : "contains"
    Class ||--o{ Subject : "teaches"
    Staff ||--o{ Class : "acts as Class Teacher"
    Staff ||--o{ Subject : "instructs Subject"
    Student ||--o{ Attendance : "records daily attendance"

    %% Exam & Result Engine
    Subject ||--o{ Exam : "assesses"
    Exam ||--o{ ExamResult : "records marks"
    Student ||--o{ ExamResult : "earns score"
    Class ||--o{ ExamResultFormula : "defines calculations"

    %% Finance & General Ledger
    Institution ||--o{ AccountChart : "defines ledger chart"
    AccountChart ||--o{ LedgerEntry : "records transaction double entries"
    Student ||--o{ StudentFeeAllocation : "receives fee terms"
    StudentFeeAllocation ||--o{ Payment : "clears"
    Payment ||--o{ LedgerEntry : "journalizes ledger entries"
    Payment ||--o| FeeReceipt : "generates"
    Staff ||--o{ Payroll : "earns salary"
    Payroll ||--o{ LedgerEntry : "journalizes payroll entries"

    %% Inventory & Procurement
    Institution ||--o{ Vendor : "purchases from"
    Vendor ||--o{ PurchaseOrder : "fulfills"
    PurchaseOrder ||--o{ InventoryItem : "replenishes stock"
```

### 2.1 Full Entity Catalog (150+ Entities Grouped by Domain)
The 150+ database entities are categorized into the following physical namespaces:
1. **Core Admin (12 tables)**: `Institution`, `Branch`, `User`, `Settings`, `AuditLog`, `SecurityEventLog`, `Notification`, `PermissionPreset`, `CustomRole`, `UserToken`, `MfaCredential`, `FeatureFlag`.
2. **Student & Parent (18 tables)**: `Student`, `Parent`, `StudentTimeline`, `GuardianContact`, `SiblingMapping`, `StudentDocument`, `StudentMedicalRecord`, `VaccinationLog`, `AadhaarVerification`, `SamagraMapping`, `ApaarRegistration`, `UdiseStudentFields`, `DisciplinaryAction`, `StudentPromotion`, `StudentAlumniRecord`, `StudentCategory`, `RteEnrollment`, `ScholarshipClaim`.
3. **Staff & HR (20 tables)**: `Staff`, `StaffExperience`, `StaffEducation`, `StaffCertification`, `StaffAttendance`, `LeaveRequest`, `StaffLeaveBalance`, `Payroll`, `SalaryComponent`, `StaffSalaryConcession`, `StaffBonusRecord`, `TaxDeclaration`, `PFDetails`, `ESIDetails`, `StaffContract`, `ResignationRequest`, `ExitClearance`, `SubstituteTeacherLog`, `TeacherLoadMapping`, `ProfessionalDevelopment`.
4. **Academics & Curriculums (18 tables)**: `Class`, `Section`, `SubjectGroup`, `Subject`, `Stream`, `Board`, `AcademicYear`, `LessonPlan`, `SyllabusTracker`, `TimetableEntry`, `HomeworkAssignment`, `HomeworkSubmission`, `CoScholasticArea`, `CoScholasticGrade`, `StudentBehaviorRemark`, `ExtraCurricularParticipation`, `HouseGroup`, `ClassActivityLog`.
5. **Examination Engine (16 tables)**: `Exam`, `ExamType`, `ExamResult`, `GradeScale`, `ReportCardStatus`, `ExamResultFormula`, `MarksheetTemplate`, `GraceMarksLog`, `PromotionThreshold`, `ModerationFactor`, `ExamHallAllocation`, `InvigilationDuty`, `AdmitCardRegistry`, `RevaluationRequest`, `RankHistory`, `SubjectToExamWeightage`.
6. **Finance & Ledger Accounts (24 tables)**: `AccountChart`, `LedgerAccount`, `LedgerTransaction`, `LedgerEntry`, `FeeStructure`, `FeeHeads`, `FeeInstallment`, `StudentFeeAllocation`, `Payment`, `FeeReceipt`, `FeeConcession`, `FeeRefund`, `LateFeeCalculation`, `ChequeClearanceLog`, `GatewayReference`, `DepartmentBudget`, `BudgetAllocation`, `Expense`, `ExpenseCategory`, `Vendor`, `VendorBill`, `TaxInvoice`, `LedgerReconciliation`, `FinancialAuditTrail`.
7. **Library & Resources (14 tables)**: `Book`, `BookAuthor`, `BookCategory`, `BookPublisher`, `BookIssue`, `LibraryFine`, `LibrarySettings`, `DigitalResource`, `LibraryVisitor`, `EbookSubscription`, `ReservationQueue`, `BookStockLog`, `DamageReport`, `InventoryDiscard`.
8. **Operations & Security (14 tables)**: `Visitor`, `VisitorPass`, `InventoryItem`, `InventoryCategory`, `AssetDepreciation`, `AssetMaintenance`, `SystemAlert`, `UatTicket`, `TodoTask`, `DiaryEntry`, `PlannerActivity`, `AssignedTask`, `BackupSchedule`, `DatabasePartitionLog`.
9. **Infrastructure Settings (14 tables)**: `S3UploadMetadata`, `PushSubscription`, `SmsLog`, `EmailLog`, `WhatsAppTemplate`, `DeliveryReceipt`, `RouteMapping`, `TransportVehicle`, `DriverRecord`, `StudentTransportAllocation`, `HostelBlock`, `HostelRoom`, `HostelAttendance`, `HostelVisitor`.

---

## 3. Production-Ready Prisma Schema Extensions

The following schema adds the complete production mappings for SaaS Tenancy, Indian Identity Compliance, the Result Calculation Formula Engine, and the Double-Entry General Ledger.

```prisma
// e:\AURXON-ERP\backend\prisma\schema.prisma (Target File for final integration)

// ─────────────────────────────────────────────
// SaaS Tenancy Extensions
// ─────────────────────────────────────────────

model TenantDomain {
  id            String      @id @default(uuid())
  domain        String      @unique // e.g. "delhischool.aurxon.com"
  institutionId String
  institution   Institution @relation(fields: [institutionId], references: [id], onDelete: Cascade)
  isPrimary     Boolean     @default(true)
  sslStatus     String      @default("PENDING") // PENDING, ACTIVE, FAILED
  createdAt     DateTime    @default(now())
}

// ─────────────────────────────────────────────
// Indian Demographics & Identity Compliance (APAAR, Samagra, UDISE+)
// ─────────────────────────────────────────────

model StudentCompliance {
  id                     String    @id @default(uuid())
  studentId              String    @unique
  student                Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
  apaarId                String?   @unique // 12-digit Academic APAAR ID (ABC)
  udisePlusCode          String?   // UDISE+ National Student Code (SDMS)
  samagraHouseholdId     String?   // MP State Samagra Family ID (8 digits)
  samagraMemberId        String?   @unique // MP State Samagra Member ID (9 digits)
  ewsCategoryNumber      String?   // Economically Weaker Section Certificate No
  rteAdmissionStatus     Boolean   @default(false)
  rteReimbursementClaimed Float    @default(0.0)
  verifiedAadhaarStatus  Boolean   @default(false)
  lastVerificationDate   DateTime?
}

// ─────────────────────────────────────────────
// Configurable Assessment Result Formula Engine
// ─────────────────────────────────────────────

model ExamResultFormula {
  id            String      @id @default(uuid())
  name          String      // e.g. "Grade 10 CBSE Math Scheme"
  classId       String
  class         Class       @relation(fields: [classId], references: [id], onDelete: Cascade)
  formulaJson   String      // e.g. {"UT": 0.20, "HalfYearly": 0.30, "Annual": 0.50}
  minimumPassPercentage Float @default(33.0)
  graceMarksAllowed    Float @default(0.0)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

// ─────────────────────────────────────────────
// Double-Entry General Ledger System
// ─────────────────────────────────────────────

model AccountChart {
  id            String          @id @default(uuid())
  institutionId String
  institution   Institution     @relation(fields: [institutionId], references: [id], onDelete: Cascade)
  code          String          // e.g. "10100", "20100"
  name          String          // e.g. "Tuition Fees Receivable", "Cash at Hand"
  type          String          // ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
  parentCode    String?
  isActive      Boolean         @default(true)
  entries       LedgerEntry[]

  @@unique([institutionId, code])
}

model LedgerTransaction {
  id            String        @id @default(uuid())
  institutionId String
  referenceNo   String        // e.g. "TXN-FEE-10023", "TXN-PAY-2026-05"
  narration     String        // Description of transaction
  transactionDate DateTime    @default(now())
  postedById    String
  entries       LedgerEntry[]
  createdAt     DateTime      @default(now())

  @@index([institutionId, referenceNo])
}

model LedgerEntry {
  id            String            @id @default(uuid())
  transactionId String
  transaction   LedgerTransaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  accountCode   String
  accountChart  AccountChart      @relation(fields: [transactionId, accountCode], references: [id, code], onDelete: Cascade)
  debitAmount   Float             @default(0.0)
  creditAmount  Float             @default(0.0)

  // Double entry integrity constraint rule check: sum(debit) == sum(credit) for the transaction
}
```

---

## 4. Indexing & Partitioning Strategies

### 4.1 Indexing Policies (PostgreSQL)
To ensure queries resolve in sub-millisecond timelines under massive enterprise loads, indices are structured as:
1. **Composite Tenant Indices**: Since RLS restricts records by institution, core query tables use compound indexing:
   ```sql
   CREATE INDEX idx_student_tenant_class ON "Student" (institution_id, class_id, status);
   ```
2. **Search Indexing**: Standardize text search prefixes (e.g. searching students by name or scholar number):
   ```sql
   CREATE INDEX idx_student_search ON "Student" (scholar_number, lower(first_name), lower(last_name));
   ```
3. **Transaction Indexes**: Quick reconciliations for ledger auditing:
   ```sql
   CREATE INDEX idx_ledger_entry_lookup ON "LedgerEntry" (account_code, debit_amount, credit_amount);
   ```

### 4.2 PostgreSQL Table Partitioning Strategy
For tables exceeding 10 million records annually (`Attendance`, `AuditLog`, `LedgerEntry`), we apply **Range Partitioning** based on the primary transaction date:
```sql
-- Partition Master Table
CREATE TABLE "Attendance_Partitioned" (
    id UUID NOT NULL,
    student_id UUID NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    institution_id UUID NOT NULL,
    PRIMARY KEY (id, date)
) PARTITION BY RANGE (date);

-- Sub-Partition Creation (Automated script executes this monthly in advance)
CREATE TABLE attendance_y2026m06 PARTITION OF "Attendance_Partitioned"
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
```

---

## 5. Database Migration & Rollback Policies

- **Forward Migrations**: Executed exclusively in CI/CD pipeline using Prisma CLI:
  ```bash
  npx prisma migrate deploy
  ```
- **Rollback Policy**: Every migration script must have a companion rollback script. If a migration fails during the deployment hook, ArgoCD triggers automated pipeline rollbacks to recreate table state using historical backup logs, reverting the Prisma schema engine to the last verified commit Hash.
