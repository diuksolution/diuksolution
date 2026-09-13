import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { createService, listServices } from "@/lib/services";
import type { ServiceInput } from "@/lib/services/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const services = await listServices(user.businessId);
  return NextResponse.json({ services });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as ServiceInput;
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    const service = await createService(user.businessId, body);
    if (!service) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create service.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
