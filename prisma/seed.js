"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const statuses = ['OPEN', 'PENDING', 'INPROGRESS', 'COMPLETED', 'CANCELLED'];
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
                after: order,
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
