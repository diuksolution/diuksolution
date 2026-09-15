import { NextResponse } from "next/server";
import {
  verifyMidtransSignature,
} from "@/lib/midtrans/client";
import { applyMidtransNotification } from "@/lib/payments/create";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    order_id?: string;
    status_code?: string;
    gross_amount?: string;
    signature_key?: string;
    transaction_status?: string;
    transaction_id?: string;
    fraud_status?: string;
  };

  const orderId = body.order_id?.trim() ?? "";
  const statusCode = body.status_code?.trim() ?? "";
  const grossAmount = body.gross_amount?.trim() ?? "";
  const signatureKey = body.signature_key?.trim() ?? "";
  const transactionStatus = body.transaction_status?.trim() ?? "";

  if (!orderId || !statusCode || !grossAmount || !signatureKey || !transactionStatus) {
    return NextResponse.json({ error: "Invalid notification" }, { status: 400 });
  }

  if (
    !verifyMidtransSignature({
      orderId,
      statusCode,
      grossAmount,
      signatureKey,
    })
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const result = await applyMidtransNotification({
      orderId,
      transactionStatus,
      transactionId: body.transaction_id,
      fraudStatus: body.fraud_status,
    });

    console.info("[midtrans webhook]", result);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[midtrans webhook] failed", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
