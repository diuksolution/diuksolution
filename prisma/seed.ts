import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

const SEED_PASSWORD = "Admin123!";

async function upsertBusiness(
  name: string,
  businessType: "CLINIC" | "FNB",
) {
  const existing = await prisma.business.findFirst({
    where: { name },
  });

  if (existing) {
    return prisma.business.update({
      where: { id: existing.id },
      data: { businessType },
    });
  }

  return prisma.business.create({
    data: { name, businessType },
  });
}

async function main() {
  const clinic = await upsertBusiness("Klinik Kecantikan Ayu", "CLINIC");
  const fnb = await upsertBusiness("Ayu Food & Beverage", "FNB");
  const passwordHash = await hashPassword(SEED_PASSWORD);

  await prisma.user.deleteMany({
    where: {
      authProvider: "GOOGLE",
      businessId: clinic.id,
      email: { not: "wrongfalse0@gmail.com" },
    },
  });

  await prisma.user.upsert({
    where: { email: "wrongfalse0@gmail.com" },
    update: {
      name: "Admin Klinik",
      username: null,
      password: null,
      authProvider: "GOOGLE",
      role: "ADMIN",
      businessId: clinic.id,
    },
    create: {
      name: "Admin Klinik",
      email: "wrongfalse0@gmail.com",
      authProvider: "GOOGLE",
      role: "ADMIN",
      businessId: clinic.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin.fnb@example.com" },
    update: {
      name: "Admin F&B",
      username: "adminfnb",
      password: passwordHash,
      authProvider: "CREDENTIALS",
      role: "ADMIN",
      businessId: fnb.id,
    },
    create: {
      name: "Admin F&B",
      email: "admin.fnb@example.com",
      username: "adminfnb",
      password: passwordHash,
      authProvider: "CREDENTIALS",
      role: "ADMIN",
      businessId: fnb.id,
    },
  });

  const doctorCount = await prisma.practitioner.count({
    where: { businessId: clinic.id },
  });
  if (doctorCount === 0) {
    await prisma.practitioner.createMany({
      data: [
        {
          businessId: clinic.id,
          name: "Dr. Sarah Wijaya",
          title: "Sp.KK",
          specialty: "Dermatologist",
          location: "Suite 2",
          email: "sarah@klinikayu.example",
          phone: "+6281110002001",
          tone: "primary",
          updatedAt: new Date(),
        },
        {
          businessId: clinic.id,
          name: "Dr. Kevin Pratama",
          title: "Sp.DV",
          specialty: "Aesthetic Doctor",
          location: "Laser 1",
          email: "kevin@klinikayu.example",
          phone: "+6281110002002",
          tone: "secondary",
          updatedAt: new Date(),
        },
        {
          businessId: clinic.id,
          name: "Dr. Maya Siregar",
          title: "Sp.BP-RE",
          specialty: "Plastic & Aesthetic",
          location: "Suite 3",
          email: "maya@klinikayu.example",
          phone: "+6281110002003",
          tone: "success",
          updatedAt: new Date(),
        },
      ],
    });
    console.log("Seeded clinic doctors");
  }

  const seeded = await prisma.user.findMany({
    include: { business: true },
    orderBy: { email: "asc" },
  });

  for (const user of seeded) {
    console.log(
      `${user.name} | ${user.email} | ${user.authProvider} | ${user.business.name} (${user.business.businessType}) | password=${user.password ? "hashed" : "none"}`,
    );
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
