import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log({
    conversations: await prisma.conversation.count(),
    messages: await prisma.message.count(),
    whatsappNumbers: await prisma.whatsAppNumber.count(),
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
