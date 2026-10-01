import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Testing database connection...\n");

  const result = await prisma.$queryRaw<
    [{ now: Date }]
  >`SELECT NOW() as now`;
  console.log("Connected! Server time:", result[0].now);

  const userCount = await prisma.user.count();
  console.log("Users:", userCount);

  const itemTypeCount = await prisma.itemType.count();
  console.log("Item types:", itemTypeCount);

  const itemCount = await prisma.item.count();
  console.log("Items:", itemCount);

  const collectionCount = await prisma.collection.count();
  console.log("Collections:", collectionCount);

  const tagCount = await prisma.tag.count();
  console.log("Tags:", tagCount);

  console.log("\nAll tables accessible. Database is working!");
}

main()
  .catch((e) => {
    console.error("Database test failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
