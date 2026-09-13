import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { encryptSecret, tryDecryptSecret } from "@/lib/crypto/secrets";
import { safeEqual } from "@/lib/whatsapp/signature";

export type WhatsAppConnectionStatus = {
  connected: boolean;
  phoneNumberId: string | null;
  displayNumber: string | null;
  wabaId: string | null;
  hasAccessToken: boolean;
  hasAppSecret: boolean;
  hasVerifyToken: boolean;
};

export type WhatsAppSendCredentials = {
  phoneNumberId: string;
  accessToken: string;
};

function trimOrNull(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function getBusinessWhatsAppConnection(
  businessId: string,
): Promise<WhatsAppConnectionStatus> {
  const row = await prisma.whatsAppNumber.findFirst({
    where: { businessId },
    orderBy: { createdAt: "asc" },
  });

  if (!row) {
    return {
      connected: false,
      phoneNumberId: null,
      displayNumber: null,
      wabaId: null,
      hasAccessToken: false,
      hasAppSecret: false,
      hasVerifyToken: false,
    };
  }

  return {
    connected: Boolean(row.accessTokenEnc && row.phoneNumberId),
    phoneNumberId: row.phoneNumberId,
    displayNumber: row.displayNumber,
    wabaId: row.wabaId,
    hasAccessToken: Boolean(row.accessTokenEnc),
    hasAppSecret: Boolean(row.appSecretEnc),
    hasVerifyToken: Boolean(row.verifyTokenEnc),
  };
}

export async function upsertBusinessWhatsAppConnection(
  businessId: string,
  input: {
    phoneNumberId: string;
    displayNumber?: string | null;
    wabaId?: string | null;
    accessToken?: string | null;
    appSecret?: string | null;
    verifyToken?: string | null;
  },
) {
  const phoneNumberId = input.phoneNumberId.trim();
  if (!phoneNumberId) {
    throw new Error("Phone number ID is required.");
  }

  const conflict = await prisma.whatsAppNumber.findUnique({
    where: { phoneNumberId },
  });
  if (conflict && conflict.businessId !== businessId) {
    throw new Error("Phone number ID sudah dipakai bisnis lain.");
  }

  const existing = await prisma.whatsAppNumber.findFirst({
    where: { businessId },
    orderBy: { createdAt: "asc" },
  });

  const accessToken = trimOrNull(input.accessToken);
  const appSecret = trimOrNull(input.appSecret);
  const verifyToken = trimOrNull(input.verifyToken);

  const data = {
    phoneNumberId,
    displayNumber: trimOrNull(input.displayNumber),
    wabaId: trimOrNull(input.wabaId),
    ...(accessToken ? { accessTokenEnc: encryptSecret(accessToken) } : {}),
    ...(appSecret ? { appSecretEnc: encryptSecret(appSecret) } : {}),
    ...(verifyToken ? { verifyTokenEnc: encryptSecret(verifyToken) } : {}),
  };

  if (existing) {
    if (existing.phoneNumberId !== phoneNumberId) {
      await prisma.whatsAppNumber.deleteMany({
        where: { businessId, id: { not: existing.id } },
      });
    }
    return prisma.whatsAppNumber.update({
      where: { id: existing.id },
      data,
    });
  }

  if (!accessToken) {
    throw new Error("Access token is required for a new connection.");
  }

  return prisma.whatsAppNumber.create({
    data: {
      businessId,
      ...data,
      accessTokenEnc: encryptSecret(accessToken),
    },
  });
}

export async function disconnectBusinessWhatsApp(businessId: string) {
  await prisma.whatsAppNumber.deleteMany({ where: { businessId } });
}

export async function resolveSendCredentials(input: {
  phoneNumberId?: string | null;
  businessId?: string | null;
}): Promise<WhatsAppSendCredentials | null> {
  if (input.phoneNumberId) {
    const row = await prisma.whatsAppNumber.findUnique({
      where: { phoneNumberId: input.phoneNumberId },
    });
    const token = tryDecryptSecret(row?.accessTokenEnc);
    if (row && token) {
      return { phoneNumberId: row.phoneNumberId, accessToken: token };
    }
  }

  if (input.businessId) {
    const row = await prisma.whatsAppNumber.findFirst({
      where: { businessId: input.businessId },
      orderBy: { createdAt: "asc" },
    });
    const token = tryDecryptSecret(row?.accessTokenEnc);
    if (row && token) {
      return { phoneNumberId: row.phoneNumberId, accessToken: token };
    }
  }

  return null;
}

export async function isValidWebhookVerifyToken(token: string) {
  const rows = await prisma.whatsAppNumber.findMany({
    where: { verifyTokenEnc: { not: null } },
    select: { verifyTokenEnc: true },
  });

  for (const row of rows) {
    const decrypted = tryDecryptSecret(row.verifyTokenEnc);
    if (decrypted && safeEqual(token, decrypted)) {
      return true;
    }
  }

  return false;
}

export async function isValidWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
) {
  if (!signatureHeader?.startsWith("sha256=")) {
    return false;
  }

  const signature = signatureHeader;

  function matches(secret: string) {
    const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
    const left = Buffer.from(expected);
    const right = Buffer.from(signature);
    return left.length === right.length && timingSafeEqual(left, right);
  }

  const rows = await prisma.whatsAppNumber.findMany({
    where: { appSecretEnc: { not: null } },
    select: { appSecretEnc: true },
  });

  for (const row of rows) {
    const secret = tryDecryptSecret(row.appSecretEnc);
    if (secret && matches(secret)) {
      return true;
    }
  }

  return false;
}
