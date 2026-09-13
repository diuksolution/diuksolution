import { prisma } from "@/lib/prisma";
import type { ServiceInput, ServiceRow } from "@/lib/services/types";

function mapService(row: {
  id: string;
  name: string;
  description: string | null;
  price: number;
  dpAmount: number;
  durationMin: number | null;
  isActive: boolean;
  sortOrder: number;
}): ServiceRow {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    dpAmount: row.dpAmount,
    durationMin: row.durationMin,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  };
}

function parseMoney(value: unknown, field: string) {
  const num =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.replace(/[^\d]/g, ""))
        : NaN;
  if (!Number.isFinite(num) || num < 0 || !Number.isInteger(num)) {
    throw new Error(`${field} harus angka bulat (rupiah) ≥ 0.`);
  }
  return num;
}

export async function listServices(businessId: string) {
  const rows = await prisma.service.findMany({
    where: { businessId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return rows.map(mapService);
}

export async function listActiveServices(businessId: string) {
  const rows = await prisma.service.findMany({
    where: { businessId, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return rows.map(mapService);
}

export async function createService(businessId: string, input: ServiceInput) {
  const name = input.name.trim();
  if (!name) {
    return null;
  }

  const price = parseMoney(input.price, "Harga");
  const dpAmount = parseMoney(input.dpAmount ?? 0, "DP");
  if (dpAmount > price) {
    throw new Error("DP tidak boleh lebih besar dari harga.");
  }

  const row = await prisma.service.create({
    data: {
      businessId,
      name,
      description: input.description?.trim() || null,
      price,
      dpAmount,
      durationMin:
        input.durationMin === null || input.durationMin === undefined
          ? null
          : Number(input.durationMin) || null,
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
    },
  });

  return mapService(row);
}

export async function updateService(
  businessId: string,
  id: string,
  input: Partial<ServiceInput>,
) {
  const existing = await prisma.service.findFirst({
    where: { id, businessId },
  });
  if (!existing) {
    return null;
  }

  const nextPrice =
    input.price !== undefined
      ? parseMoney(input.price, "Harga")
      : existing.price;
  const nextDp =
    input.dpAmount !== undefined
      ? parseMoney(input.dpAmount, "DP")
      : existing.dpAmount;
  if (nextDp > nextPrice) {
    throw new Error("DP tidak boleh lebih besar dari harga.");
  }

  const row = await prisma.service.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
      ...(input.price !== undefined ? { price: nextPrice } : {}),
      ...(input.dpAmount !== undefined ? { dpAmount: nextDp } : {}),
      ...(input.durationMin !== undefined
        ? {
            durationMin:
              input.durationMin === null
                ? null
                : Number(input.durationMin) || null,
          }
        : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    },
  });

  return mapService(row);
}

export async function deleteService(businessId: string, id: string) {
  const existing = await prisma.service.findFirst({
    where: { id, businessId },
    select: { id: true },
  });
  if (!existing) {
    return false;
  }
  await prisma.service.delete({ where: { id } });
  return true;
}

export async function ensureClinicDemoServices(businessId: string) {
  const count = await prisma.service.count({ where: { businessId } });
  if (count > 0) {
    return;
  }

  await prisma.service.createMany({
    data: [
      {
        businessId,
        name: "Konsultasi Dokter",
        description: "Konsultasi awal dengan dokter estetika",
        price: 150_000,
        dpAmount: 0,
        durationMin: 30,
        sortOrder: 1,
      },
      {
        businessId,
        name: "Facial Acne",
        description: "Perawatan facial untuk kulit berjerawat",
        price: 450_000,
        dpAmount: 150_000,
        durationMin: 60,
        sortOrder: 2,
      },
      {
        businessId,
        name: "Pico Laser",
        description: "Laser pico untuk pigmentasi / bekas",
        price: 1_500_000,
        dpAmount: 300_000,
        durationMin: 45,
        sortOrder: 3,
      },
    ],
  });
}
