import { prisma } from "@/lib/prisma";

export type CatalogDoctorRef = { id: string; name: string };
export type CatalogServiceRef = { id: string; name: string };

export async function listServicesForDoctor(
  businessId: string,
  practitionerId: string,
) {
  const rows = await prisma.practitionerService.findMany({
    where: {
      practitionerId,
      service: { businessId, isActive: true },
    },
    select: {
      service: { select: { id: true, name: true } },
    },
    orderBy: { service: { sortOrder: "asc" } },
  });
  return rows.map((row) => row.service);
}

export async function listDoctorsForService(
  businessId: string,
  serviceId: string,
) {
  const rows = await prisma.practitionerService.findMany({
    where: {
      serviceId,
      practitioner: { businessId, isActive: true },
    },
    select: {
      practitioner: { select: { id: true, name: true } },
    },
    orderBy: { practitioner: { name: "asc" } },
  });
  return rows.map((row) => row.practitioner);
}

export async function doctorOffersService(
  businessId: string,
  practitionerId: string,
  serviceId: string,
) {
  const link = await prisma.practitionerService.findFirst({
    where: {
      practitionerId,
      serviceId,
      practitioner: { businessId },
      service: { businessId },
    },
    select: { practitionerId: true },
  });
  return Boolean(link);
}

export async function setPractitionerServices(
  businessId: string,
  practitionerId: string,
  serviceIds: string[],
) {
  const doctor = await prisma.practitioner.findFirst({
    where: { id: practitionerId, businessId },
    select: { id: true },
  });
  if (!doctor) {
    return false;
  }

  const uniqueIds = [...new Set(serviceIds.filter(Boolean))];
  const valid = uniqueIds.length
    ? await prisma.service.findMany({
        where: { businessId, id: { in: uniqueIds } },
        select: { id: true },
      })
    : [];

  await prisma.$transaction([
    prisma.practitionerService.deleteMany({ where: { practitionerId } }),
    ...(valid.length
      ? [
          prisma.practitionerService.createMany({
            data: valid.map((service) => ({
              practitionerId,
              serviceId: service.id,
            })),
          }),
        ]
      : []),
  ]);

  return true;
}

export async function setServicePractitioners(
  businessId: string,
  serviceId: string,
  practitionerIds: string[],
) {
  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId },
    select: { id: true },
  });
  if (!service) {
    return false;
  }

  const uniqueIds = [...new Set(practitionerIds.filter(Boolean))];
  const valid = uniqueIds.length
    ? await prisma.practitioner.findMany({
        where: { businessId, id: { in: uniqueIds } },
        select: { id: true },
      })
    : [];

  await prisma.$transaction([
    prisma.practitionerService.deleteMany({ where: { serviceId } }),
    ...(valid.length
      ? [
          prisma.practitionerService.createMany({
            data: valid.map((doctor) => ({
              practitionerId: doctor.id,
              serviceId,
            })),
          }),
        ]
      : []),
  ]);

  return true;
}

export async function linkNewPractitionerToAllServices(
  businessId: string,
  practitionerId: string,
) {
  const services = await prisma.service.findMany({
    where: { businessId, isActive: true },
    select: { id: true },
  });
  if (services.length === 0) {
    return;
  }
  await prisma.practitionerService.createMany({
    data: services.map((service) => ({
      practitionerId,
      serviceId: service.id,
    })),
    skipDuplicates: true,
  });
}

export async function linkNewServiceToAllPractitioners(
  businessId: string,
  serviceId: string,
) {
  const doctors = await prisma.practitioner.findMany({
    where: { businessId, isActive: true },
    select: { id: true },
  });
  if (doctors.length === 0) {
    return;
  }
  await prisma.practitionerService.createMany({
    data: doctors.map((doctor) => ({
      practitionerId: doctor.id,
      serviceId,
    })),
    skipDuplicates: true,
  });
}
