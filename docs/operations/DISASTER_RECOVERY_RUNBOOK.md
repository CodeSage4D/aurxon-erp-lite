# AURXON ERP Lite — Enterprise Disaster Recovery Runbook
**IEEE 828-2012 Standard Compliant Configuration Management & Database Failover Policy**

This runbook outlines standard recovery procedures, emergency communications, backup rotation strategies, and pilot sandbox UAT failover procedures for AURXON ERP Lite deployments.

---

## 1. BACKUP TOPOLOGY & STORAGE SPECIFICATION
- **Primary Storage**: Daily database state dumps are automatically written in logical PostgreSQL dump format (`.sql`).
- **Vault Location**: Backups are written directly via AWS SDK or S3-compatible API to secure, encrypted S3 vaults:
  `s3://aurxon-production-vault/backups/{institutionId}/`
- **Backup Retention & Rotation Policy**:
  - **Daily Backups**: Retain the last 7 sequential backups.
  - **Weekly Backups**: Retain the last 4 weekly backups.
  - **Monthly Backups**: Retain the last 12 monthly archives.
- **Fail-Soft Buffer**: If S3 connectivity is completely interrupted, backups fall back to a local, encrypted repository under `backend/backups/` and immediately generate a `SystemAlert` severity `WARNING` for administrators to address within 24 hours.

---

## 2. EMERGENCY INCIDENT RECOVERY PROCEDURES

### Scenario A: S3 Backup Verification
Verify that active database states are being written successfully to S3:
```bash
# List all active backups stored in the secure institutional bucket
aws s3 ls s3://aurxon-production-vault/backups/{institutionId}/ --recursive --human-readable --summarize
```

### Scenario B: Full PostgreSQL Database Restoration
If database nodes become corrupted or data loss is detected, execute the following commands in the PostgreSQL terminal:

1. **Terminate existing connections** to avoid transaction lockouts:
```sql
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'neondb'
  AND pid <> pg_backend_pid();
```

2. **Drop and Recreate public schema**:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;
```

3. **Stream and apply the PostgreSQL Dump** from S3:
```bash
# Fetch from secure S3 vault
aws s3 cp s3://aurxon-production-vault/backups/{institutionId}/aurxon_backup_recent.sql ./restore_temp.sql

# Restore using PostgreSQL Client
psql -h ep-delicate-sunset-apa9azq7.c-7.us-east-1.aws.neon.tech -U neondb_owner -d neondb -f ./restore_temp.sql

# Clear temporary buffers
rm ./restore_temp.sql
```

---

## 3. DATA INTEGRITY SWEEP & TELEMETRY
- **Daily Diagnostic Audit**: A system task sweeps all active multi-tenant records daily at **02:00 IST**.
- **Integrity Validation Rules**:
  - **Identities**: Detect duplicate `scholarNumber` or `employeeId`.
  - **Orphans**: Detect records unmapped to parent entities or classes.
  - **Finance**: Detect any overpayments or allocations where `amountPaid` > `amountDue`.
  - **Attendance**: Audit logs to ensure attendance dates fall strictly within the active academic term.
- **Resolution Path**: Identified warning triggers immediate system alarms saved inside the `SystemAlert` ledger, rendering red alerts on the Admin Operations Dashboard.

---

## 4. EMERGENCY PROTOCOL contacts
- **SRE & Infrastructure Lead**: `sre@aurxon.edu` / +91-98765-43210
- **Principal DB Architect**: `dba@aurxon.edu` / +91-87654-32109
- **AWS Vault Security Response Team**: `cloud-security@aurxon.edu`
- **Regional Deployment Support**: `support-central@aurxon.edu`
