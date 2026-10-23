import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const KEEP_EMAIL = "demo@devstash.io";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { not: KEEP_EMAIL } },
    select: { id: true, email: true },
  });

  if (users.length === 0) {
    console.log("No users to delete (only demo user exists).");
    return;
  }

  console.log(`Deleting ${users.length} user(s):`);
  for (const u of users) {
    console.log(`  - ${u.email} (${u.id})`);
  }

  const ids = users.map((u) => u.id);

  // Cascading deletes handle items, collections, tags, accounts, sessions
  // but ItemType has onDelete: Cascade only for custom types (userId set)
  const { count } = await prisma.user.deleteMany({
    where: { id: { in: ids } },
  });

  // Clean up orphaned verification tokens (not tied to kept user)
  const { count: tokenCount } = await prisma.verificationToken.deleteMany({
    where: { identifier: { not: KEEP_EMAIL } },
  });

  console.log(`\nDeleted ${count} user(s) and ${tokenCount} verification token(s).`);
}

main()
  .catch((e) => {
    console.error("Delete failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
