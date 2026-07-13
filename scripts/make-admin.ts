import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.apartmentMember.update({
    where: {
      apartmentId_userId: {
        apartmentId: 'a1',
        userId: 'u1',
      },
    },
    data: {
      isAdmin: true,
    },
  });

  console.log('Elevated u1 to admin for a1:', result);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
