# Aurxon School ERP - Prisma Schema Specification

The following schema represents the production-ready Prisma mapping for the **Aurxon School ERP SaaS Control Plane**. It defines constraints, indices, database relationships, and configurations.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ─────────────────────────────────────────────
// User & Authentication Layer
// ─────────────────────────────────────────────

model User {
  id                  String               @id @default(uuid())
  email               String               @unique
  passwordHash        String
  isActive            Boolean              @default(true)
  failedLoginAttempts Int                  @default(0)
  lockedUntil         DateTime?
  refreshTokenHash    String?
  mfaSecret           String?
  isMfaEnabled        Boolean              @default(false)
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt

  memberships         OrganizationMembership[]
  auditLogs           AuditLog[]
  supportSessions     SupportSession[]     @relation("SupportRepresentative")
  notifications       NotificationInbox[]
}

// ─────────────────────────────────────────────
// Organization & Multi-Campus Structure
// ─────────────────────────────────────────────

model Organization {
  id           String      @id @default(uuid())
  name         String
  code         String      @unique // e.g. "RKMVP", "KPPHS"
  status       String      @default("INACTIVE") // INACTIVE, PENDING_SETUP, ACTIVE, SUSPENDED, ARCHIVED
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  domains      TenantDomain[]
  branding     OrganizationBranding?
  settings     OrganizationSetting[]
  schools      School[]
  memberships  OrganizationMembership[]
  modules      OrganizationModule[]
  features     OrganizationFeature[]
  subscription Subscription?
  license      License?
  supportRequests SupportRequest[]
  auditLogs    AuditLog[]
}

model TenantDomain {
  id             String       @id @default(uuid())
  domain         String       @unique // e.g. "delhi.rkmvp.edu"
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  isPrimary      Boolean      @default(false)
  sslStatus      String       @default("PENDING") // PENDING, ACTIVE, FAILED
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

model School {
  id             String       @id @default(uuid())
  name           String
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  campuses       Campus[]
  memberships    OrganizationMembership[]
}

model Campus {
  id        String   @id @default(uuid())
  name      String
  address   String?
  schoolId  String
  school    School   @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  memberships OrganizationMembership[]
}

// ─────────────────────────────────────────────
// Membership & Authorization (RBAC)
// ─────────────────────────────────────────────

model OrganizationMembership {
  id             String       @id @default(uuid())
  userId         String
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  schoolId       String?
  school         School?      @relation(fields: [schoolId], references: [id], onDelete: SetNull)
  campusId       String?
  campus         Campus?      @relation(fields: [campusId], references: [id], onDelete: SetNull)
  roleId         String
  role           Role         @relation(fields: [roleId], references: [id], onDelete: Restrict)
  status         String       @default("ACTIVE") // ACTIVE, INACTIVE, SUSPENDED
  isPrimary      Boolean      @default(false)
  joinedAt       DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@unique([userId, organizationId, schoolId, campusId])
  @@index([userId])
  @@index([organizationId])
}

model Role {
  id             String         @id @default(uuid())
  name           String         // e.g. "Principal", "Teacher", "CustomAuditor"
  code           String         // e.g. "PRINCIPAL", "TEACHER"
  description    String?
  isSystem       Boolean        @default(false) // System-defined roles cannot be deleted
  organizationId String?        // Null if global system role
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  permissions    Permission[]
  memberships    OrganizationMembership[]

  @@unique([organizationId, code])
}

model Permission {
  id          String   @id @default(uuid())
  resource    String   // e.g. "student:profile", "finance:ledger"
  action      String   // e.g. "CREATE", "READ", "UPDATE", "DELETE", "APPROVE"
  roleId      String
  role        Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())

  @@unique([roleId, resource, action])
}

// ─────────────────────────────────────────────
// Commercial Billing, Subscriptions & Licensing
// ─────────────────────────────────────────────

model Subscription {
  id             String       @id @default(uuid())
  organizationId String       @unique
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  planCode       String       // e.g. "STARTER", "PROFESSIONAL", "ENTERPRISE"
  status         String       @default("ACTIVE") // ACTIVE, GRACE_PERIOD, UNPAID, CANCELLED
  studentLimit   Int          @default(500)
  storageLimitGb Float        @default(10.0)
  startDate      DateTime     @default(now())
  endDate        DateTime
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

model License {
  id             String       @id @default(uuid())
  organizationId String       @unique
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  licenseKey     String       @unique
  licenseType    String       @default("TRIAL") // TRIAL, SUBSCRIPTION, ENTERPRISE_CONTRACT
  status         String       @default("ACTIVE") // ACTIVE, EXPIRED, REVOKED
  expiresAt      DateTime
  activatedAt    DateTime     @default(now())
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

// ─────────────────────────────────────────────
// Module & Feature Marketplace System
// ─────────────────────────────────────────────

model Module {
  id          String   @id @default(uuid())
  name        String   // e.g. "Student Management"
  code        String   @unique // e.g. "STUDENT_MANAGEMENT"
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  features    Feature[]
  orgModules  OrganizationModule[]
}

model Feature {
  id          String   @id @default(uuid())
  moduleId    String
  module      Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  name        String   // e.g. "Biometric Attendance"
  code        String   @unique // e.g. "BIOMETRIC_ATTENDANCE"
  description String?
  createdAt   DateTime @default(now())

  orgFeatures OrganizationFeature[]
}

model OrganizationModule {
  id             String       @id @default(uuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  moduleCode     String
  module         Module       @relation(fields: [moduleCode], references: [code], onDelete: Cascade)
  isEnabled      Boolean      @default(true)
  activatedAt    DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@unique([organizationId, moduleCode])
}

model OrganizationFeature {
  id             String       @id @default(uuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  featureCode    String
  feature        Feature      @relation(fields: [featureCode], references: [code], onDelete: Cascade)
  isEnabled      Boolean      @default(true)
  activatedAt    DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@unique([organizationId, featureCode])
}

// ─────────────────────────────────────────────
// Configuration & Customization Settings
// ─────────────────────────────────────────────

model OrganizationSetting {
  id             String              @id @default(uuid())
  organizationId String
  organization   Organization        @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  groupCode      String              // e.g. "ACADEMIC_RULES", "GRADE_RULES"
  createdAt      DateTime            @default(now())
  updatedAt      DateTime            @updatedAt
  items          ConfigurationItem[]

  @@unique([organizationId, groupCode])
}

model ConfigurationItem {
  id         String              @id @default(uuid())
  settingId  String
  setting    OrganizationSetting @relation(fields: [settingId], references: [id], onDelete: Cascade)
  key        String              // e.g. "board_affiliation", "grading_system"
  value      String              // e.g. "CBSE", "ICSE", "GPA_SCALE_10"
  type       String              @default("STRING") // STRING, BOOLEAN, NUMBER, JSON
  createdAt  DateTime            @default(now())
  updatedAt  DateTime            @updatedAt

  @@unique([settingId, key])
}

model OrganizationBranding {
  id             String       @id @default(uuid())
  organizationId String       @unique
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  logoUrl        String?
  primaryColor   String       @default("#0284c7")
  secondaryColor String       @default("#0f172a")
  loginBannerUrl String?
  customCss      String?
  termsUrl       String?
  privacyUrl     String?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

// ─────────────────────────────────────────────
// Security Privacy & Auditing Logs
// ─────────────────────────────────────────────

model SupportRequest {
  id             String       @id @default(uuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  reason         String       // Support details/ticket reference
  status         String       @default("PENDING") // PENDING, APPROVED, REJECTED, EXPIRED
  durationHours  Int          @default(2)
  approvedAt     DateTime?
  expiresAt      DateTime?
  createdAt      DateTime     @default(now())

  sessions       SupportSession[]
}

model SupportSession {
  id               String         @id @default(uuid())
  supportRequestId String
  supportRequest   SupportRequest @relation(fields: [supportRequestId], references: [id], onDelete: Cascade)
  representativeId String
  representative   User           @relation("SupportRepresentative", fields: [representativeId], references: [id], onDelete: Cascade)
  tokenHash        String         @unique // Cryptographic validation token
  isActive         Boolean        @default(true)
  startedAt        DateTime       @default(now())
  endedAt          DateTime?
  logs             SupportAccessLog[]
}

model SupportAccessLog {
  id               String         @id @default(uuid())
  supportSessionId String
  supportSession   SupportSession @relation(fields: [supportSessionId], references: [id], onDelete: Cascade)
  action           String         // e.g. "VIEW_STUDENT_PROFILE", "EDIT_GRADE"
  resourceAccessed String         // e.g. "StudentProfile:student-uuid"
  ipAddress        String?
  details          String?
  createdAt        DateTime       @default(now())
}

model AuditLog {
  id             String       @id @default(uuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  actorId        String
  actor          User         @relation(fields: [actorId], references: [id], onDelete: Cascade)
  action         String       // e.g. "UPDATE_FEES_STRUCTURE"
  details        String       // JSON storing changed parameters (old_value -> new_value)
  ipAddress      String?
  createdAt      DateTime     @default(now())
}

// ─────────────────────────────────────────────
// Notifications Engine
// ─────────────────────────────────────────────

model NotificationInbox {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  content   String
  category  String   // INVITATION, PASSWORD_RESET, LICENSE_ALERT, MODULE_ALERT
  isRead    Boolean  @default(false)
  sentAt    DateTime @default(now())
  readAt    DateTime?
}
```
