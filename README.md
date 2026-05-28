# AURXON ERP Lite

### Elite Grade • Simple • Modern • Affordable Educational ERP

**AURXON ERP Lite** is a lightweight educational ERP platform tailored specifically for Schools, Coaching Centers, Tuition Centers, and Training Institutes.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v20+ recommended)
- Neon Serverless PostgreSQL Database account

### 2. Environment Setup
Create a `.env` file in the `backend/` and `frontend/` directories:
```bash
# backend/.env
PORT=5000
DATABASE_URL="postgresql://neondb_owner:npg_TlX2uQbnqkL7@ep-delicate-sunset-apa9azq7-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
JWT_SECRET="super-secret-aurxon-jwt-key-2026-lite-erp"
NODE_ENV=development

# frontend/.env
# keep Neon credentials secure: do not expose them to client-side code
DATABASE_URL="postgresql://neondb_owner:npg_TlX2uQbnqkL7@ep-delicate-sunset-apa9azq7-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### 3. Database Migration & Seeding
Apply database migrations and load mock profiles:
```bash
cd backend
npx prisma migrate dev --name init_postgres
npx prisma db seed
```

### 4. Running Locally
Start both backend and frontend servers in development mode:
```bash
# Start NestJS backend (listening on http://localhost:5000)
cd backend
npm run start:dev

# Start Next.js frontend (listening on http://localhost:3000)
cd frontend
npm run dev
```

---

## 📁 Directory Structure

```text
aurxon-erp-lite/
├── backend/               (NestJS API Monolith)
│   ├── prisma/
│   │   ├── schema.prisma  (Prisma Database Models)
│   │   └── seed.ts        (Institution and Roster Seeding Script)
│   └── src/               (Auth, Students, Staff, Attendance, Fees, Exams Sub-systems)
└── frontend/              (Next.js App Router Client)
    ├── src/
    │   ├── app/           (Login and Dynamic Dashboards Layouts)
    │   ├── lib/           (api.ts dual-mode offline-fallback client)
    │   └── globals.css    (Tailwind v4 variables)
```

---

## 👥 Seeded Quick-Login Profiles
Password is `password123` for all profiles:
- **Institute Admin**: `admin@aurxon.com`
- **Teacher**: `teacher1@aurxon.com`
- **Accountant**: `accountant@aurxon.com`
- **Student**: `student@aurxon.com`
- **Parent**: `parent@aurxon.com`
