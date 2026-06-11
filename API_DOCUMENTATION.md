# AURXON Platform OS — API Specification & Integration Guide
Version 1.1

This API specification serves as the interface agreement between the AURXON Next.js frontend, tenant dynamic workspaces, and the NestJS backend control plane.

---

## 1. Authentication & Tenant Context Gates

### Dynamic Tenant Mapping Header
All requests targeting tenant-specific services must carry the tenant routing header:
- **Header:** `x-tenant-slug`
- **Value:** `{tenant-slug}` (e.g., `greenvalley`)

This header is extracted by the reverse proxy/Next.js middleware to route context to appropriate databases and scope tenant isolation parameters.

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

---

## 3. Class & Section Management (`/classes`)

### A. Fetch Class Sections
* **Endpoint:** `GET /classes/:classId/sections`
* **Access:** Authenticated (Staff/Admin roles)
* **Response:**
```json
[
  {
    "id": "sec-a1",
    "name": "A",
    "classId": "cls-10a",
    "createdAt": "2026-06-12T00:00:00.000Z",
    "updatedAt": "2026-06-12T00:00:00.000Z"
  }
]
```

### B. Create Class Section
* **Endpoint:** `POST /classes/:classId/sections`
* **Access:** Authenticated (Admin role)
* **Payload:**
```json
{
  "name": "B"
}
```

---

## 4. Platform Administrative Commands (`/founder`)

Authorized team member role permissions required (e.g. `FOUNDER`, `CO_FOUNDER`, `TECHNICAL_ADMINISTRATOR`).

### A. Reset Setup Wizard
* **Endpoint:** `POST /founder/institutions/:id/reset-wizard`
* **Access:** Founder Roles
* **Response:**
```json
{
  "success": true,
  "status": {
    "institutionId": "inst-greenvalley",
    "setupStarted": true,
    "setupCompleted": false,
    "currentStep": 1
  }
}
```

### B. Launch Support Impersonation
* **Endpoint:** `POST /founder/impersonate/:institutionId`
* **Payload:**
```json
{
  "reason": "Debugging student ledger validation issue",
  "supportTicketRef": "TKT-8902"
}
```
* **Response:** Returns support session JWT scoped to target organization.

### C. Suspend Tenant Subscription
* **Endpoint:** `POST /founder/institutions/:id/suspend`
