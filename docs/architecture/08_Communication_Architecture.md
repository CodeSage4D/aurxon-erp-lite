# AURXON ERP Lite - Module Architecture: 08_Communication

## 1. Module Purpose
The `08_Communication` module acts as the messaging and information broadcasting hub of the institution. It manages multiple communication layers: general notice boards, official circular documents, in-app alerts, and SMS/WhatsApp gateway integrations to keep parents, teachers, and students aligned.

**Business Value:** It eliminates coordination gaps, automates notification alerts (such as fee announcements and weather cancellations), and monitors communication delivery logs. Integrating external SMS/WhatsApp gateways enables immediate reach, increasing parents' engagement and school operations consistency.
**User Value:** 
* **Administrators / Principals:** Send school-wide notifications, schedule notices, and trigger bulk SMS/WhatsApp messages.
* **Teachers:** Post specific announcements to class groups, text individual parents, and view notice logs.
* **Parents / Students:** Access centralized notice boards, receive instant mobile alerts, and view circular attachments.

---

## 2. Submodules
* **Notices:** Manages the visual public notice board, allowing admins and authorized teachers to pin text/image notices.
* **Circulars:** Handles targeted circular broadcasts (e.g., Parent circulars, Teaching Staff notices) with attachments.
* **InternalMessages:** Enables peer-to-peer textual communication inside the dashboard between authorized staff.
* **InAppAlerts:** System-triggered push notifications (e.g., "Fee Overdue", "Attendance Mark Absent") with target routing.
* **RoleBasedFeeds:** Tailors the user dashboard's announcement board to display only role-relevant circular posts.

---

## 3. Folder Structure (Domain-Driven)
```text
08_Communication/
├── Notices/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── Circulars/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── InternalMessages/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
├── InAppAlerts/
│   ├── Controllers/
│   ├── Services/
│   └── DTOs/
└── RoleBasedFeeds/
    ├── Controllers/
    └── Services/
```

---

## 4. Backend Files
* `Notices/notice.controller.ts`, `Notices/notice.service.ts`, `Notices/dto/create-notice.dto.ts`
* `Circulars/circular.controller.ts`, `Circulars/circular.service.ts`, `Circulars/dto/broadcast-circular.dto.ts`
* `InternalMessages/message.controller.ts`, `InternalMessages/message.service.ts`
* `InAppAlerts/alert.service.ts`
* `RoleBasedFeeds/feed.controller.ts`, `RoleBasedFeeds/feed.service.ts`

---

## 5. Frontend Files
* `src/08_Communication/Notices/CommsTab.tsx` (Circular publisher, role scope selectors, SMS/WhatsApp broadcast panel, and delivery simulator logs)
* `src/08_Communication/Notices/NoticeBoard.tsx` (Board UI featuring styled announcement cards with attachment downloads)
* `src/08_Communication/InternalMessages/ChatInbox.tsx` (Peer communication dashboard for school staff)

---

## 6. Database Entities (Prisma / SQL schema models)

* **`NoticeBoard`**: id, branch_id, title, content, attachments (JSON list of file paths), publish_date, expiry_date, status (ENUM: DRAFT, PUBLISHED, ARCHIVED), target_audience (ENUM: ALL, STAFF_ONLY, PARENTS_ONLY), posted_by (foreign key to User)
* **`Circular`**: id, branch_id, title, content, attachment_url (nullable), target_roles (JSON array of role strings), is_sms_sent, is_whatsapp_sent, created_by (foreign key to User), sent_at
* **`InAppAlert`**: id, user_id (foreign key to User), title, body, status (ENUM: UNREAD, READ, DISMISSED), link_url (nullable), created_at
* **`InternalMessage`**: id, sender_id (foreign key to User), receiver_id (foreign key to User), message_body, is_read, sent_at
* **`GatewayLog`**: id, branch_id, type (ENUM: SMS, WHATSAPP, EMAIL), recipient_contact, message_body, provider (ENUM: TWILIO, PLIVO, SMTP), status (ENUM: SENT, FAILED, DELIVERED), error_message (nullable), cost (decimal), created_at

---

## 7. API Endpoints

### Notice Board
* `GET /api/v1/communication/notices` - Fetch notice board lists (scoped by branch, date range, audience)
* `POST /api/v1/communication/notices` - Publish a new notice
* `DELETE /api/v1/communication/notices/:id` - Archive notice post

### Circular broadcasts
* `POST /api/v1/communication/circulars` - Create circular notification (triggers email/push logs)
* `POST /api/v1/communication/broadcast/whatsapp` - Push text to SMS/WhatsApp gateway lists

### In-App Alerts & Messages
* `GET /api/v1/communication/alerts` - Retrieve unread alerts for current user
* `PATCH /api/v1/communication/alerts/:id/read` - Set status to READ
* `POST /api/v1/communication/messages` - Send in-app message to another user

---

## 8. Role Permissions

* **Super Admin:** Modify global gateway integrations and configure API parameters (SMTP, Twilio credentials).
* **Institute Admin / Principal:** Full control over Notices, Circulars, and group chat lists. Can send SMS/WhatsApp broadcasts, and view gateway cost analysis.
* **Teacher:** Create notices for their assigned classes/sections. Send in-app messages to assigned student parents. Cannot run branch-wide SMS broadcasts.
* **Student / Parent / Staff:** Read-only access to notices, circulars, and bulletins. Can read/write personal in-app alerts and chat records.

---

## 9. Dashboard Widgets

* **Pinboard Feed:** Cards scrolling through latest critical announcements.
* **SMS Credit Indicator:** Shows remaining credits or cash balance on Twilio/gateway channels.
* **Unread Alerts Bell:** Displays unread message counts.
* **Broadcast Progress Tracker:** Real-time visual detailing delivery progress of bulk SMS batches.

---

## 10. Reports

* **Gateway Cost Ledger:** Details expenses, sent/failed metrics, and message counts grouped by department.
* **Notice Engagement Auditor:** Shows read stats to verify parental response rates.
* **Delivery Failure Registry:** Chronological logging of failed mobile numbers or SMTP rejections.

---

## 11. Audit Requirements

**Must Log Actions:**
* Sending of any school-wide bulk SMS or WhatsApp broadcast (actor ID, text, cost, and target group).
* Edits made to notice board documents or attachments.
* Changes to gateway credentials or settings in settings dashboards.

**Tracked Fields:**
* `notice_id`, `circular_id`, `actor_id` (User ID).
* `action_type` (e.g., `SEND_BULK_SMS`, `PUBLISH_NOTICE`).
* `recipient_count`, `cost_estimate`.
* `timestamp` and `ip_address`.

---

## 12. Security Requirements

* **Validation Rules:**
  * **Input Sanitization:** Rich-text content in Notices/Circulars must undergo strict sanitization to remove executable JavaScript tag elements (XSS prevention).
  * **Phone Number Structure:** Target broadcast phone numbers must conform to E.164 phone formats.
* **Authorization Checks:**
  * Bulk SMS APIs must enforce a high-privilege check (limiting to Admin/Principal roles).
  * In-app chat APIs must verify that the sender is authorized to talk to the recipient (e.g., teacher can talk to student's parent, but students cannot text random teachers).
* **Tenant Isolation:**
  * All communications must filter by `branch_id` from JWT. Gateway API keys are encrypted at rest per branch, preventing tenant cross-talk.
* **Data Protection:**
  * Sensitive user contact lists must be kept private; numbers are masked in UI grids (`+91 ******1230`) unless viewed by high-privilege administrators.
