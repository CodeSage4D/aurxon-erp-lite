# AURXON Platform OS — Known Issues & System Notes
Version 1.1

This document notes minor operational constraints, framework notices, and edge cases identified during the 1.1 domain re-architecture sprint.

---

## 1. Next.js Middleware/Proxy Notice
* **Observed Warning:** During Next.js production builds, the compiler generates:
  `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy`
* **Status:** Ignorable for local execution. Migration to standard server routing maps will be handled when upgrading Next.js minor release versions.

---

## 2. Dynamic Domain Gates on Localhost
* **Observed Behavior:** Accessing subdomains on `localhost:3000` requires local loopbacks in the Hosts file.
* **Resolution:** Ensure your Windows Hosts file (`C:\Windows\System32\drivers\etc\hosts`) includes:
  ```hosts
  127.0.0.1 portal.localhost
  127.0.0.1 register.localhost
  127.0.0.1 activate.localhost
  127.0.0.1 support.localhost
  127.0.0.1 greenvalley.localhost
  ```

---

## 3. Historic Enrollment Tracking
* **System Design Note:** Because the system tracks student enrollment historically, deleting a class that contains active `Enrollment` records is blocked by foreign key constraints. The administrator must first transfer or promote students to a new class.
