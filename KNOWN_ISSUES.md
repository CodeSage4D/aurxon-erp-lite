# AURXON Platform OS — Known Issues & System Notes
Version 1.0

This document notes minor operational constraints, framework notices, and edge cases identified during the 1.0 production defense sprint.

---

## 1. Next.js Middleware/Proxy Notice
* **Observed Warning:** During Next.js production builds, the compiler generates:
  `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy`
* **Status:** Ignorable for local execution. The current codebase uses Next.js 16.x middleware matching structures. Migration to standard server routing maps will be handled when upgrading Next.js minor release versions.

---

## 2. Dynamic Domain Gates on Localhost
* **Observed Behavior:** Accessing `portal.localhost:3000` or `greenvalley.localhost:3000` on Windows may fail if the hostname loopbacks are not mapped.
* **Resolution:** Ensure your Windows Hosts file (`C:\Windows\System32\drivers\etc\hosts`) includes local subdomain routing maps:
  ```hosts
  127.0.0.1 portal.localhost
  127.0.0.1 register.localhost
  127.0.0.1 activate.localhost
  127.0.0.1 support.localhost
  127.0.0.1 greenvalley.localhost
  127.0.0.1 sunrise.localhost
  ```

---

## 3. Support Impersonation Token Expiry
* **Observed Behavior:** Impersonation tokens issued to support staff expire automatically after **15 minutes**.
* **Rationale:** This is an intentional security design choice. Standard security posture limits external operator visibility window lengths to prevent active session hijack threat risks. If more debug time is needed, the operator must re-authorize a new session from `support.aurxon.com`.

---

## 4. Offline mode Cached Draft Scope
* **Observed Behavior:** If the setup wizard is completed fully while offline, data is cached locally. However, actual database persistence occurs once connectivity is re-established.
* **Caution:** Clearing browser cookies/localStorage while offline will delete local setup drafts. Users are instructed to maintain active sessions until network synchronization completes.
