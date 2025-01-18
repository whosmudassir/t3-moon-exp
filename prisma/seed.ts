import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = Array.from({ length: 100 }).map(() => ({
    name: faker.commerce.productName(),
  }));

  await prisma.category.createMany({
    data: categories,
    skipDuplicates: true,
  });

  console.log("✅ 100 categories added to the database");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
