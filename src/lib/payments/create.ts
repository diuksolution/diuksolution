import type { PaymentChannel, PaymentKind, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createMidtransQrisCharge,
  createMidtransSnapTransaction,
  isMidtransConfigured,
} from "@/lib/midtrans/client";
import { formatIdr } from "@/lib/services/format";

function makeOrderId(bookingId: string, kind: PaymentKind) {
  const short = bookingId.replace(/[^a-zA-Z0-9]/g, "").slice(-10);
  return `DIUK-${kind}-${short}-${Date.now()}`.slice(0, 50);
}

export async function resolvePaymentAmount(input: {
  bookingId: string;
  businessId: string;
  kind: PaymentKind;
}) {
  const booking = await prisma.crmBooking.findFirst({
    where: { id: input.bookingId, businessId: input.businessId },
  });
  if (!booking) {
    throw new Error("Booking tidak ditemukan.");
  }

  if (booking.amount <= 0) {
    throw new Error(
      "Booking belum punya harga. Pilih layanan dari katalog Services dulu.",
    );
  }

  if (input.kind === "FULL") {
    return { booking, amount: booking.amount };
  }

  // DP: try match service catalog by name
  const service = await prisma.service.findFirst({
    where: {
      businessId: input.businessId,
      isActive: true,
      name: booking.service,
    },
  });

  const dpAmount = service?.dpAmount ?? 0;
  if (dpAmount <= 0) {
    throw new Error(
      `Layanan “${booking.service}” tidak punya opsi DP. Gunakan bayar lunas.`,
    );
  }
  if (dpAmount > booking.amount) {
    throw new Error("Nilai DP tidak valid (lebih besar dari harga).");
  }

  return { booking, amount: dpAmount };
}

export async function createBookingPayment(input: {
  businessId: string;
  bookingId: string;
  kind: PaymentKind;
  channel: PaymentChannel;
}) {
  if (!isMidtransConfigured()) {
    throw new Error(
      "Midtrans belum dikonfigurasi. Tambah MIDTRANS_SERVER_KEY di .env.",
    );
  }

  const { booking, amount } = await resolvePaymentAmount(input);
  const contact = await prisma.contact.findFirst({
    where: { id: booking.contactId, businessId: input.businessId },
  });

  // Cancel previous pending payments for same booking+kind
  await prisma.payment.updateMany({
    where: {
      bookingId: booking.id,
      kind: input.kind,
      status: "PENDING",
    },
    data: { status: "CANCEL" },
  });

  const orderId = makeOrderId(booking.id, input.kind);
  const itemName =
    input.kind === "DP"
      ? `DP ${booking.service}`
      : `Lunas ${booking.service}`;

  if (input.channel === "SNAP") {
    const snap = await createMidtransSnapTransaction({
      orderId,
      amount,
      customerName: contact?.name,
      customerPhone: contact?.waId,
      itemName,
    });

    const payment = await prisma.payment.create({
      data: {
        businessId: input.businessId,
        bookingId: booking.id,
        contactId: booking.contactId,
        orderId,
        kind: input.kind,
        channel: "SNAP",
        amount,
        status: "PENDING",
        snapToken: snap.token,
        redirectUrl: snap.redirectUrl,
      },
    });

    return {
      payment,
      amountLabel: formatIdr(amount),
      kindLabel: input.kind === "DP" ? "DP" : "Lunas",
      customerMessage: [
        `Silakan bayar ${input.kind === "DP" ? "DP" : "lunas"} ${formatIdr(amount)} untuk ${booking.service}.`,
        "",
        `Link pembayaran (QRIS / VA / e-wallet):`,
        snap.redirectUrl,
        "",
        "Status booking akan update otomatis setelah pembayaran berhasil.",
      ].join("\n"),
    };
  }

  const qris = await createMidtransQrisCharge({
    orderId,
    amount,
    customerName: contact?.name,
    customerPhone: contact?.waId,
    itemName,
  });

  const payment = await prisma.payment.create({
    data: {
      businessId: input.businessId,
      bookingId: booking.id,
      contactId: booking.contactId,
      orderId,
      kind: input.kind,
      channel: "QRIS",
      amount,
      status: "PENDING",
      qrisUrl: qris.qrUrl,
      midtransTransactionId: qris.transactionId,
    },
  });

  return {
    payment,
    amountLabel: formatIdr(amount),
    kindLabel: input.kind === "DP" ? "DP" : "Lunas",
    customerMessage: [
      `Silakan scan QRIS untuk bayar ${input.kind === "DP" ? "DP" : "lunas"} ${formatIdr(amount)} (${booking.service}).`,
      qris.qrUrl ? "" : "QRIS dibuat, tapi URL gambar belum tersedia — minta admin kirim ulang.",
      "",
      "Status booking akan update otomatis setelah pembayaran berhasil.",
    ]
      .filter((line) => line !== undefined)
      .join("\n"),
  };
}

function mapMidtransStatus(status: string): PaymentStatus | null {
  switch (status) {
    case "capture":
    case "settlement":
      return "SETTLEMENT";
    case "pending":
      return "PENDING";
    case "deny":
    case "failure":
      return "FAILURE";
    case "cancel":
      return "CANCEL";
    case "expire":
      return "EXPIRE";
    default:
      return null;
  }
}

export async function applyMidtransNotification(input: {
  orderId: string;
  transactionStatus: string;
  transactionId?: string;
  fraudStatus?: string;
}) {
  const payment = await prisma.payment.findUnique({
    where: { orderId: input.orderId },
    include: { booking: true },
  });

  if (!payment) {
    return { ok: false as const, reason: "payment_not_found" };
  }

  let next = mapMidtransStatus(input.transactionStatus);
  if (
    input.transactionStatus === "capture" &&
    input.fraudStatus &&
    input.fraudStatus !== "accept"
  ) {
    next = "FAILURE";
  }

  if (!next) {
    return { ok: true as const, paymentId: payment.id, ignored: true };
  }

  const paidAt = next === "SETTLEMENT" ? new Date() : payment.paidAt;

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: next,
      paidAt,
      midtransTransactionId:
        input.transactionId || payment.midtransTransactionId,
    },
  });

  if (next === "SETTLEMENT") {
    const bookingStatus = payment.kind === "DP" ? "DP" : "PAID";
    // Don't downgrade PAID -> DP
    const current = payment.booking.status;
    const shouldUpdate =
      current === "BOOKED" ||
      current === "DP" ||
      (bookingStatus === "PAID" && current !== "DONE" && current !== "CANCELLED");

    if (shouldUpdate && !(current === "PAID" && bookingStatus === "DP")) {
      await prisma.crmBooking.update({
        where: { id: payment.bookingId },
        data: { status: bookingStatus },
      });
    }
  }

  return { ok: true as const, paymentId: updated.id, status: updated.status };
}
