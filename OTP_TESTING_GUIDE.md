# AURXON OTP Verification - Quick Start & Reference Manual

This guide explains where OTP codes are received, how to retrieve and use them, and the security rules governing the OTP system.

---

## 🔑 Where Do OTPs Arrive?

In the local development and testing environment, OTP codes do not require actual email/SMS gateways. They are captured and shown in two places:

1. **Backend Console Output:**
   * Watch the running backend terminal window. You will see a log line printed immediately:
     `[VERIFICATION OTP] Generated OTP Code: <6-DIGIT-CODE> for target: <EMAIL_OR_PHONE>`
     *(Example: `[VERIFICATION OTP] Generated OTP Code: 582104 for target: admin@aurxon.com`)*

2. **Founder Dashboard Notification Feed:**
   * Log in to the **Founder Dashboard** and look at the **Notifications Feed**.
   * A simulated notification card is created in-app:
     `Simulated Email: Your verification code is <6-DIGIT-CODE> for target: <EMAIL_OR_PHONE>`

---

## 🚀 How to Retrieve & Use the OTP

### A. Email Verification (Mandatory)
1. **Enter Details:** In Step 4 of the registration wizard, enter the official email address.
2. **Request OTP:** Click the **"Send OTP"** button. The button will disable and begin a 60-second countdown.
3. **Retrieve Code:** Copy the 6-digit OTP code from either the backend console log or the Founder notifications.
4. **Submit & Verify:** Paste the 6-digit code into the email verification input field and click **"Verify OTP"**.
5. **Success:** Once verified, the indicator updates to **`✓ Verified`** (green), enabling registration submission.

### B. Mobile Verification (Optional)
1. **Request OTP:** (Optional) Enter the mobile number and click **"Send OTP"**.
2. **Verify / Skip:** Check the logs to retrieve the code and verify. If SMS services are not configured, you can skip mobile verification and still successfully submit the form because **Mobile verification is optional**.

### C. Fallback Manual Override (Admin Bypass)
If you cannot access the backend logs or need to bypass OTP validation:
1. **Request Override:** Check the checkbox **"Request Founder Manual Approval Override"** at the bottom of Step 4.
2. **Submit Wizard:** Complete and submit the wizard.
3. **Founder Approval:** Log into the **Founder Console** (`/founder`), find the registration request under the approvals table, and click the **"Verify Manually"** button. This instantly overrides all validation checks and marks both Email and Phone as verified.

---

## 🛡️ Security Guardrails & Limits

* **Rate Limiting:** You must wait **60 seconds** between consecutive OTP requests for the same target email or phone number.
* **Brute-Force Protection:** You are allowed a maximum of **3 incorrect attempts**. Entering an incorrect code for the 3rd time deletes the active OTP record from the database. You will be blocked and must request a new OTP.
* **Expiry:** OTPs are valid for **5 minutes** from the generation time. After 5 minutes, they expire and verification fails.
