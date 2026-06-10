# AURXON Platform OS - Local Development Manual

This document serves as the local configuration, database lifecycle management, and troubleshooting reference manual for developers and QA engineers on the AURXON Platform OS.

---

## 1. Project Structure

The codebase is split into the following layers:
- **`backend/`**: Deployed NestJS API container using Prisma Client to handle multi-tenant postgres models, auth routes, and ERP modules.
- **`frontend/`**: Deployed Next.js (App Router, Tailwind CSS v4, Lucide Icons) interface containing dashboards for Founders, Principals, Staff, Teachers, Parents, and Students.
- **`docs/`**: Official documentation, permissions matrix, and regulatory boundary definitions.

---

## 2. Environment Variables & Ports

### Backend (`backend/.env`)
- **Port**: `5000` (API endpoint container)
- **URL**: `http://localhost:5000`
- **DATABASE_URL**: Neon server serverless PostgreSQL database connection URI.
- **JWT_SECRET**: Key used for cryptographic signing of Auth context payloads (development: `super-secret-aurxon-jwt-key-2026-lite-erp`).
- **BACKEND_ENCRYPTION_KEY**: Key for AES-256-GCM package data encryption.

### Frontend (`frontend/.env`)
- **Port**: `3000` (Next.js server)
- **URL**: `http://localhost:3000`

---

## 3. Setup, Migration & Seeding Lifecycle

Follow these steps in sequence to bootstrap the platform database state:

### A. Install Dependencies
Run in project root:
```powershell
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### B. Prisma Migrations Cycle
Sync schema modifications with database layers:
```powershell
cd backend
# Generate client artifacts
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init_schema
```

### C. Seed Default System Templates
Populate core global modules, licenses, and admin templates:
```powershell
cd backend
# Seed default DB rules, packs and templates
npx prisma db seed
```

### D. Reset / Wipe Database
If you need to wipe the relational DB clean and rebuild schemas:
```powershell
cd backend
# Drop all tables and rerun migrations + seeds
npx prisma migrate reset
```

---

## 4. Run Development & Production Build

### Run Local Dev Servers
```powershell
# Run backend (from backend/)
npm run dev

# Run frontend (from frontend/)
npm run dev
```

### Build Production Bundles
Ensure typechecking and builds pass:
```powershell
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build
```

---

## 5. Development Credentials (Local Only)

These credentials are for local development/testing sandbox operations only. Never commit production credentials here.

### A. Default Founder (Platform OS Control)
- **Email**: `founder@aurxon.com`
- **Password**: `Aurxon@Founder2026`
- **Role**: `SUPER_ADMIN`

### B. Demo School Administrator
- **Email**: `admin@kps.edu`
- **Password**: `Aurxon@School2026`
- **Role**: `INSTITUTE_ADMIN`

### C. Demo Principal
- **Email**: `principal@kps.edu`
- **Password**: `Aurxon@Principal2026`
- **Role**: `PRINCIPAL`

### D. Development Fallbacks (Simulations)
When the backend API server is offline, the frontend falls back to Client-Side Simulators using the following keys:
- **Founder**: `founder@aurxon.com` / `password123`
- **Principal**: `principal@rkmvp.edu` / `password123`
- **Teacher**: `teacher@rkmvp.edu` / `password123`

---

## 6. Common URLs & Access Routes

- **Frontend Home / Login**: `http://localhost:3000/login`
- **SaaS Registration**: `http://localhost:3000/register`
- **Founder OS Command Center**: `http://localhost:3000/founder`
- **General Dashboard**: `http://localhost:3000/dashboard`
- **Workspace Activation**: `http://localhost:3000/activate`
- **Backend API Swagger**: `http://localhost:5000/api`
- **Backend Health State Check**: `http://localhost:5000/health`
- **Prisma DB Studio interface**: Run `npx prisma studio` in backend/ to open visual DB inspector.

---

## 7. Known Issues & Troubleshooting FAQ

### Q1: JWT Verification Errors or "Token Expired"
- **Reason**: Token signatures expire in 2 hours.
- **Fix**: Clear local storage context logs (run `Sign Out` or clear storage variables in devtools) and log in again.

### Q2: Port Collision (Port 5000 or 3000 is already in use)
- **Fix**: Find the locking process using terminal lookup, or terminate it:
```powershell
# Windows port lookup and kill
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### Q3: Prisma "P2002 Unique Constraint Violation"
- **Fix**: Occurs if seed files attempt to duplicate unique fields like scholar numbers. Reset database using `npx prisma migrate reset` and run seeds again.

---

## 8. Version History
- **V1.0 (Stable)**: Setup Wizard bypass completed, silent self-healing tenant configurations, dynamic timezone/board options, global Aptos typography, high-contrast WCAG AA accessibility light mode text overrides, OS-style Founder control deck, global search Ctrl+K command palette, and local offline dev manual generated.
