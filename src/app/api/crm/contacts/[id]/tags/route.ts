import { NextResponse } from "next/server";
import { toggleContactTag } from "@/lib/crm/contacts";
import { getCurrentUser } from "@/lib/current-user";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as { tagId?: string };

  if (!body.tagId) {
    return NextResponse.json({ error: "tagId is required" }, { status: 400 });
  }

  const result = await toggleContactTag({
    businessId: user.businessId,
    contactId: id,
    tagId: body.tagId,
  });

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
