import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import {
  disconnectBusinessWhatsApp,
  getBusinessWhatsAppConnection,
  upsertBusinessWhatsAppConnection,
} from "@/lib/whatsapp/credentials";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connection = await getBusinessWhatsAppConnection(user.businessId);
  return NextResponse.json(connection);
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    phoneNumberId?: string;
    displayNumber?: string | null;
    wabaId?: string | null;
    accessToken?: string | null;
    appSecret?: string | null;
    verifyToken?: string | null;
  };

  const phoneNumberId = body.phoneNumberId?.trim() ?? "";
  if (!phoneNumberId) {
    return NextResponse.json(
      { error: "Phone number ID is required." },
      { status: 400 },
    );
  }

  try {
    await upsertBusinessWhatsAppConnection(user.businessId, {
      phoneNumberId,
      displayNumber: body.displayNumber,
      wabaId: body.wabaId,
      accessToken: body.accessToken,
      appSecret: body.appSecret,
      verifyToken: body.verifyToken,
    });

    const connection = await getBusinessWhatsAppConnection(user.businessId);
    return NextResponse.json(connection);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save WhatsApp connection.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await disconnectBusinessWhatsApp(user.businessId);
  return NextResponse.json({ ok: true });
}
