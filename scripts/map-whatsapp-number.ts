import { PrismaClient } from "@prisma/client";
import { encryptSecret } from "../src/lib/crypto/secrets";

const prisma = new PrismaClient();

/**
 * One-shot: copy WhatsApp env credentials into WhatsAppNumber for the first CLINIC.
 * Run once before removing WHATSAPP_* from .env.
 */
async function main() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const appSecret = process.env.WHATSAPP_APP_SECRET?.trim();
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN?.trim();

  if (!phoneNumberId || !accessToken) {
    throw new Error(
      "Need WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in env to migrate.",
    );
  }
  if (!process.env.AUTH_SECRET?.trim()) {
    throw new Error("AUTH_SECRET is required to encrypt tokens.");
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
    update: {
      businessId: clinic.id,
      accessTokenEnc: encryptSecret(accessToken),
      ...(appSecret ? { appSecretEnc: encryptSecret(appSecret) } : {}),
      ...(verifyToken ? { verifyTokenEnc: encryptSecret(verifyToken) } : {}),
    },
    create: {
      businessId: clinic.id,
      phoneNumberId,
      accessTokenEnc: encryptSecret(accessToken),
      ...(appSecret ? { appSecretEnc: encryptSecret(appSecret) } : {}),
      ...(verifyToken ? { verifyTokenEnc: encryptSecret(verifyToken) } : {}),
    },
  });

  console.log(
    `Migrated WhatsApp credentials -> ${clinic.name} (phoneNumberId=${row.phoneNumberId})`,
  );
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
