import { prisma } from "../../prisma";
export async function isSlotFree(staffId: string, date: Date) {
  const start = new Date(date);
  start.setMinutes(0, 0, 0);
  const end = new Date(start);
  end.setMinutes(59, 59, 999);
  const count = await prisma.appointment.count({
    where: {
      staffId,
      date: { gte: start, lte: end },
      status: { not: "CANCELED" },
    },
  });
  return count === 0;
}
