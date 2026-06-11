# AURXON Platform OS — API Specification & Integration Guide
Version 1.0

This API specification serves as the interface agreement between the AURXON Next.js frontend, tenant dynamic workspaces, and the NestJS backend control plane.

---

## 1. Authentication & Tenant Context Gates

### Dynamic Tenant Mapping Header
All requests targeting tenant-specific services must carry the tenant routing header:
- **Header:** `x-tenant-slug`
- **Value:** `{tenant-slug}` (e.g., `greenvalley`)

This header is extracted by the reverse proxy/Next.js middleware to route context to appropriate databases and scope tenant isolation parameters.

### JWT Bearer Token Authentication
Most endpoints require authentication. Include the JWT inside the HTTP Authorization header:
- **Header:** `Authorization`
- **Value:** `Bearer <token>`

---

## 2. Authentication Endpoints (`/auth`)

### A. Dynamic Tenant Login
* **Endpoint:** `POST /auth/login`
* **Access:** Public (Subdomain dynamic check)
* **Payload:**
```json
{
  "email": "principal@gvschool.edu",
  "password": "Green@123",
  "tenantSlug": "greenvalley"
}
```
* **Response:**
```json
{
  "accessToken": "eyJhbGciOi...",
  "user": {
    "id": "usr-101",
    "email": "principal@gvschool.edu",
    "role": "TEACHER",
    "institutionId": "inst-greenvalley"
  }
}
```

### B. Founder Control Plane Login
* **Endpoint:** `POST /auth/founder/login`
* **Access:** Restricted (Only works on `portal` subdomain; rejects tenant logins)
* **Payload:**
```json
{
  "email": "founder@aurxon.com",
  "password": "Aurxon@2026"
}
```

### C. Multi-Role Switch Context
* **Endpoint:** `POST /auth/switch-context`
* **Access:** Authenticated
* **Payload:**
```json
{
  "organizationId": "inst-kpphs"
}
```
* **Response:** Returns a new signed JWT scoped to the secondary organization.

---

## 3. Customer Acquisition & Registration (`/registrations`)

### A. Submit Workspace Request
* **Endpoint:** `POST /registrations/register`
* **Access:** Public (Runs on `register.aurxon.com`)
* **Payload:**
```json
{
  "orgName": "Delhi Public School",
  "email": "founder@dpsdelhi.edu",
  "phone": "+919999911111",
  "ownerName": "Gopal Verma",
  "city": "Delhi",
  "state": "Delhi",
  "industryPackCode": "SCHOOL_ERP"
}
```
* **Response:**
```json
{
  "success": true,
  "referenceNumber": "AURX-REG-2026-6A3F",
  "status": "PENDING_REVIEW"
}
```

### B. Verify OTP Verification (Public)
* **Endpoint:** `POST /registrations/verify-otp`
* **Payload:** `{"email": "...", "otp": "123456"}`

---

## 4. Setup Wizard Control Plane (`/setup`)

Endpoints are restricted to `SUPER_ADMIN` and `INSTITUTE_ADMIN` credentials.

### A. Retrieve Setup Onboarding Progress
* **Endpoint:** `GET /setup/status`
* **Response:**
```json
{
  "setupCompleted": false,
  "currentStep": 2,
  "wizardVersion": "2.0",
  "industryPackCode": "SCHOOL_ERP",
  "steps": {
    "academicConfig": true,
    "branchConfig": false
  },
  "details": {
    "academicYear": "2026-2027",
    "gradingSystem": "CBSE"
  }
}
```

### B. Save Intermediate Step Draft
* **Endpoint:** `POST /setup/save-draft`
* **Payload:**
```json
{
  "step": 1,
  "data": {
    "academicYear": "2026-2027",
    "gradingSystem": "CBSE",
    "timezone": "Asia/Kolkata",
    "currency": "INR"
  }
}
```

### C. Submit Final Configurations
* **Endpoint:** `POST /setup/submit`
* **Payload:** Contains step 1 & step 2 parameters. Sets `setupCompleted` to `true` in Postgres.

---

## 5. Platform Administrative Commands (`/founder`)

Authorized team member role permissions required (e.g. `FOUNDER`, `CO_FOUNDER`, `TECHNICAL_ADMINISTRATOR`).

### A. Launch Support Impersonation
* **Endpoint:** `POST /founder/impersonate/:institutionId`
* **Payload:**
```json
{
  "reason": "Debugging student ledger validation issue",
  "supportTicketRef": "TKT-8902"
}
```
* **Response:** Returns support session JWT scoped to target organization.

### B. End Impersonation Session
* **Endpoint:** `POST /founder/impersonate/end`

### C. Suspend Tenant Subscription
* **Endpoint:** `POST /founder/institutions/:id/suspend`

### D. Resume Tenant Subscription
* **Endpoint:** `POST /founder/institutions/:id/resume`

### E. Manual User Password Reset
* **Endpoint:** `POST /founder/users/:id/reset-password`
* **Response:** Returns temporary passphrase: `Temp@a9f81d3b`.

---

## 6. Offline Resiliency Fallbacks

If the client application detects network loss or backend outage, the frontend core `frontend/src/lib/api.ts` gracefully activates mock safety overrides:
* **Key Redemptions:** Accepts `AURX-ACT-` key patterns locally and displays fake provisioning logs to protect UX state.
* **Onboarding Drafts:** Saves draft stages to localStorage so the user can refresh without losing onboarding configurations.
