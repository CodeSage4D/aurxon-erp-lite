/**
 * AURXON — Founder Password Reset Script
 * Run with: npx ts-node scripts/reset-founder-password.ts
 *
 * This script updates the founder@aurxon.com password in the database
 * without requiring a full reseed (which would delete all data).
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const FOUNDER_EMAIL = 'founder@aurxon.com';
const NEW_PASSWORD = 'AurxonFuture$136';

async function main() {
  console.log('────────────────────────────────────────');
  console.log('  AURXON — Founder Password Reset');
  console.log('────────────────────────────────────────');

  const user = await prisma.user.findUnique({
    where: { email: FOUNDER_EMAIL },
    select: { id: true, email: true, role: true, isActive: true },
  });

  if (!user) {
    console.error(`❌  User not found: ${FOUNDER_EMAIL}`);
    console.log('   Run the seed first: cd backend && npx prisma db seed');
    process.exit(1);
  }

  if (user.role !== 'SUPER_ADMIN') {
    console.error(`❌  User ${FOUNDER_EMAIL} is not SUPER_ADMIN (role: ${user.role})`);
    process.exit(1);
  }

  const newHash = await bcrypt.hash(NEW_PASSWORD, 12);

  await prisma.user.update({
    where: { email: FOUNDER_EMAIL },
    data: { passwordHash: newHash },
  });

  // Log in security audit
  await prisma.securityEventLog.create({
    data: {
      userId: user.id,
      email: FOUNDER_EMAIL,
      action: 'PASSWORD_CHANGED',
      details: 'Founder password updated via reset script.',
    },
  }).catch(() => {}); // ignore if securityEventLog not available

  console.log(`✅  Password updated for: ${FOUNDER_EMAIL}`);
  console.log(`    New password: ${NEW_PASSWORD}`);
  console.log(`    Hash algorithm: bcrypt (12 rounds)`);
  console.log('────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
