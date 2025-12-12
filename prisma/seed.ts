import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const statuses = ['OPEN', 'PENDING', 'INPROGRESS','COMPLETED', 'CANCELLED'];

  for (let i = 1; i <= 50; i++) {
    const order = await prisma.order.create({
      data: {
        orderNo: `ORD-${1000 + i}`,
        customerName: `Customer ${i}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        amount: parseFloat((Math.random() * 1000).toFixed(2)),
      },
    });

    await prisma.auditLog.create({
      data: {
        orderId: order.id,
        action: 'CREATE',
        actor: 'system',
        after: order as any,
      },
    });
  }

  console.log('Seed completed!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
