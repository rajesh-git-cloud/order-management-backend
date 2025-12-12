const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash("admin123", 10);

  await prisma.user.create({
    data: {
      username: "admin",
      password: hashed
    }
  });

  console.log("User created: admin / admin123");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
