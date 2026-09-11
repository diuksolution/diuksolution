import { NextResponse } from "next/server";
import { addContactNote } from "@/lib/crm/contacts";
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
  const body = (await request.json()) as { body?: string };
  const noteBody = body.body?.trim();

  if (!noteBody) {
    return NextResponse.json({ error: "Note is required" }, { status: 400 });
  }

  const note = await addContactNote({
    businessId: user.businessId,
    contactId: id,
    body: noteBody,
    authorId: user.id,
    authorName: user.name || user.email,
  });

  if (!note) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ note });
}
