import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  if (!phoneNumberId) {
    throw new Error("WHATSAPP_PHONE_NUMBER_ID is empty in .env");
  }

  const clinic = await prisma.business.findFirst({
    where: { businessType: "CLINIC" },
    orderBy: { createdAt: "asc" },
  });

  if (!clinic) {
    throw new Error("No CLINIC business found. Run db:seed first.");
  }

  const row = await prisma.whatsAppNumber.upsert({
    where: { phoneNumberId },
    update: { businessId: clinic.id },
    create: {
      businessId: clinic.id,
      phoneNumberId,
    },
  });

  console.log(`Mapped ${row.phoneNumberId} -> ${clinic.name} (${clinic.id})`);
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
