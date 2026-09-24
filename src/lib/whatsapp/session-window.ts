export const CUSTOMER_SERVICE_WINDOW_MS = 24 * 60 * 60 * 1000;

export function normalizeWaId(value: string) {
  return value.replace(/[^\d]/g, "");
}

/** Session/free-form text only. Template messages (reminder, broadcast) can send anytime. */
export function isWithinCustomerServiceWindow(lastInboundAt?: Date | null) {
  if (!lastInboundAt) {
    return false;
  }
  return Date.now() - lastInboundAt.getTime() < CUSTOMER_SERVICE_WINDOW_MS;
}

export const OUTSIDE_SESSION_WINDOW_MESSAGE =
  "Window 24 jam untuk balasan teks bebas sudah lewat. Customer harus chat dulu, atau kirim lewat template WhatsApp (reminder/broadcast).";

export function describeWhatsAppSendError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (
    /131047|24 hour|re-engagement|outside the allowed window|session/i.test(
      message,
    )
  ) {
    return OUTSIDE_SESSION_WINDOW_MESSAGE;
  }
  return message || "Gagal mengirim pesan WhatsApp.";
}
