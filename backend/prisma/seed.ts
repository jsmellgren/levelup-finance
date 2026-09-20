import { PrismaClient } from "@prisma/client";
import { ACHIEVEMENT_CATALOG } from "../src/modules/achievements/achievements.data.js";

const prisma = new PrismaClient();

async function main() {
  for (const a of ACHIEVEMENT_CATALOG) {
    await prisma.achievement.upsert({
      where: { key: a.key },
      update: { title: a.title, description: a.description, icon: a.icon },
      create: a,
    });
  }
  console.log(`Seeded ${ACHIEVEMENT_CATALOG.length} achievements.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
