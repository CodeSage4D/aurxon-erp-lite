import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      institution: {
        select: {
          name: true,
        }
      }
    }
  });
  console.log('--- ALL USERS ---');
  console.log(JSON.stringify(users, null, 2));

  const memberships = await prisma.organizationMembership.findMany({
    include: {
      user: { select: { email: true } },
      institution: { select: { name: true } },
      role: { select: { code: true } }
    }
  });
  console.log('--- ALL MEMBERSHIPS ---');
  console.log(JSON.stringify(memberships, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
