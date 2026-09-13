import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import {
  clearDoctorHours,
  getDoctorHoursForDate,
  upsertDoctorHours,
} from "@/lib/schedules/doctor-hours";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const data = await getDoctorHoursForDate(
    user.businessId,
    searchParams.get("date"),
  );
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    practitionerId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    isOff?: boolean;
    note?: string | null;
    clear?: boolean;
  };

  if (!body.practitionerId || !body.date) {
    return NextResponse.json(
      { error: "practitionerId and date are required" },
      { status: 400 },
    );
  }

  try {
    if (body.clear) {
      await clearDoctorHours({
        businessId: user.businessId,
        practitionerId: body.practitionerId,
        date: body.date,
      });
      return NextResponse.json({ ok: true, cleared: true });
    }

    const row = await upsertDoctorHours({
      businessId: user.businessId,
      practitionerId: body.practitionerId,
      date: body.date,
      startTime: body.startTime ?? "09:00",
      endTime: body.endTime ?? "17:00",
      isOff: Boolean(body.isOff),
      note: body.note,
    });

    return NextResponse.json({ ok: true, schedule: row });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to save schedule",
      },
      { status: 400 },
    );
  }
}
