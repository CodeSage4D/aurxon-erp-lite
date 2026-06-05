# Aurxon School ERP - API Architecture Specification

## 1. REST & GraphQL Gateway Conventions

The API gateway handles multi-tenant authentication, dynamic module loading, and organization context mapping.
- **Base Endpoint**: `/api/v1`
- **Tenancy Context Header**: `X-Tenant-ID` (value matches the active Organization UUID).
- **Error Formatting**: RFC 7807 JSON schema details.

---

## 2. Platform Core API Mappings

### 2.1 Identity Login & Token Validation
Retrieves credentials and registers user identity, returning active memberships list.
- **URL**: `POST /api/v1/auth/login`
- **Payload**:
  ```json
  {
    "email": "rahul.sharma@gmail.com",
    "password": "secure-password-hash"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "user-uuid-901",
      "email": "rahul.sharma@gmail.com"
    },
    "tokens": {
      "accessToken": "jwt-access-token-string",
      "refreshToken": "jwt-refresh-token-string"
    },
    "memberships": [
      {
        "membershipId": "memb-uuid-10",
        "organizationId": "org-rkmvp-uuid",
        "organizationName": "Ramakrishna Mission Vidyapith",
        "organizationCode": "RKMVP",
        "role": "PRINCIPAL",
        "isPrimary": true
      },
      {
        "membershipId": "memb-uuid-11",
        "organizationId": "org-kpphs-uuid",
        "organizationName": "Kalyani Priyanath High School",
        "organizationCode": "KPPHS",
        "role": "CONSULTANT",
        "isPrimary": false
      }
    ]
  }
  ```

### 2.2 Switch Active Organization Context
Exchanges current access token for a context-bound token containing organization settings.
- **URL**: `POST /api/v1/auth/switch-context`
- **Request Body**:
  ```json
  {
    "organizationId": "org-kpphs-uuid",
    "schoolId": "school-uuid-301",
    "campusId": "campus-uuid-401"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "accessToken": "new-context-bound-jwt-access-token-string",
    "context": {
      "userId": "user-uuid-901",
      "organizationId": "org-kpphs-uuid",
      "schoolId": "school-uuid-301",
      "campusId": "campus-uuid-401",
      "roles": ["CONSULTANT"],
      "enabledModules": ["STUDENT_MANAGEMENT", "ATTENDANCE"],
      "enabledFeatures": ["MANUAL_ATTENDANCE"],
      "subscriptionPlan": "PROFESSIONAL",
      "licenseStatus": "ACTIVE"
    }
  }
  ```

### 2.3 Toggle Dynamic Module Status
Allows Super Admins or Organization Owners to turn module access on or off dynamically.
- **URL**: `PATCH /api/v1/organizations/modules/toggle`
- **Request Body**:
  ```json
  {
    "moduleCode": "EXAMINATION",
    "isEnabled": false
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "moduleCode": "EXAMINATION",
    "isEnabled": false,
    "updatedAt": "2026-06-05T12:56:00Z"
  }
  ```

---

## 3. Domain Events Architecture (Event Spec)

To support real-time audits, platform notifications, and microservice decoupled extensions, the platform implements an **Event-Driven Architecture**. Core database transitions emit domain events into an internal Event Broker (EventEmitter2 inside NestJS or RabbitMQ in production).

### 3.1 Initial Core Domain Events

| Event Code | Triggering Action | Payload Metadata |
| :--- | :--- | :--- |
| `organization.created` | New organization is registered | `organizationId`, `code`, `ownerEmail` |
| `organization.activated`| Wizard completed & active status set | `organizationId`, `activatedAt` |
| `membership.created` | User maps to a school/campus | `membershipId`, `userId`, `roleId` |
| `membership.removed` | Access privileges are revoked | `membershipId`, `userId` |
| `module.enabled` | Module toggled on in Marketplace | `organizationId`, `moduleCode` |
| `module.disabled` | Module toggled off in Marketplace | `organizationId`, `moduleCode` |
| `license.expired` | License date passes current time | `organizationId`, `licenseKey`, `expiryDate`|
| `subscription.renewed` | Billing transaction succeeds | `organizationId`, `planCode`, `amount` |
| `setup.completed` | Wizard steps confirm successfully | `organizationId`, `adminUserId` |

### 3.2 Mock Event Schema Definition (`module.enabled` example)
```json
{
  "eventId": "evt-88390-10",
  "eventCode": "module.enabled",
  "timestamp": "2026-06-05T12:58:00Z",
  "organizationId": "org-rkmvp-uuid",
  "actorId": "user-super-admin-uuid",
  "payload": {
    "moduleCode": "EXAMINATION",
    "licenseStatus": "ACTIVE",
    "planType": "ENTERPRISE"
  }
}
```
If an event is captured, the **Notification Engine** dispatches associated email/SMS updates asynchronously.
