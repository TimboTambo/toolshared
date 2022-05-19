import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "rachel@remix.run";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("racheliscool", 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.note.create({
    data: {
      title: "My first note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "My second note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  const gardenCategory = await prisma.category.create({
    data: {
      name: "Garden",
    },
  });

  await prisma.subCategory.create({
    data: {
      name: "Plants & seeds",
      categoryId: gardenCategory.id,
    },
  });

  await prisma.subCategory.create({
    data: {
      name: "Pots & planters",
      categoryId: gardenCategory.id,
    },
  });

  const handToolsCategory = await prisma.category.create({
    data: {
      name: "Hand tools",
    },
  });

  await prisma.subCategory.create({
    data: {
      name: "Hand saws",
      categoryId: handToolsCategory.id,
    },
  });

  await prisma.subCategory.create({
    data: {
      name: "Spanners & wrenches",
      categoryId: handToolsCategory.id,
    },
  });

  await prisma.memberPermission.create({
    data: {
      name: "Admin",
    },
  });

  await prisma.memberPermission.create({
    data: {
      name: "Member",
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
