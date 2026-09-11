import { createHmac, timingSafeEqual } from "node:crypto";

export function getWhatsAppVerifyToken() {
  return process.env.WHATSAPP_VERIFY_TOKEN ?? "";
}

export function getWhatsAppAppSecret() {
  return process.env.WHATSAPP_APP_SECRET ?? "";
}

export function getWhatsAppAccessToken() {
  return process.env.WHATSAPP_ACCESS_TOKEN ?? "";
}

export function getWhatsAppPhoneNumberId() {
  return process.env.WHATSAPP_PHONE_NUMBER_ID ?? "";
}

export function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isValidWhatsAppSignature(rawBody: string, signatureHeader: string | null) {
  const secret = getWhatsAppAppSecret();

  if (!secret || !signatureHeader) {
    return false;
  }

  const prefix = "sha256=";
  if (!signatureHeader.startsWith(prefix)) {
    return false;
  }

  const expected = `${prefix}${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  return safeEqual(expected, signatureHeader);
}
