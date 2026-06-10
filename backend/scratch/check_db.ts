import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
    }
  });
  console.log('Users in database:');
  console.log(users);

  const teamMembers = await prisma.aurxonTeamMember.findMany();
  console.log('Team members in database:');
  console.log(teamMembers);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
