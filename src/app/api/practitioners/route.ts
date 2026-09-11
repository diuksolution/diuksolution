import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import {
  createPractitioner,
  listPractitioners,
} from "@/lib/practitioners";
import type { PractitionerInput } from "@/lib/practitioners/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const practitioners = await listPractitioners(user.businessId);
  return NextResponse.json({ practitioners });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as PractitionerInput;
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const practitioner = await createPractitioner(user.businessId, body);
  if (!practitioner) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  return NextResponse.json({ practitioner }, { status: 201 });
}
