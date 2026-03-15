import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@sistemikkartlar.com" },
    update: {},
    create: {
      email: "admin@sistemikkartlar.com",
      name: "Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Admin user seeded:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
