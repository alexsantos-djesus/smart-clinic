import { Router } from "express";
import { prisma } from "../../prisma.js";
import { requireAuth } from "../../auth/auth.middleware.js";
import { isSlotFree } from "./appointments.service.js";

const r = Router();

r.get("/", requireAuth, async (req, res) => {
  const u = (req as any).user as { sub: string; role: "PATIENT" | "STAFF" };

  const take = Math.min(Number(req.query.take ?? 50), 100);
  const skip = Math.max(Number(req.query.skip ?? 0), 0);

  const whereBase =
    u.role === "PATIENT" ? { patientId: u.sub } : { staffId: u.sub };

  const dateFilter: any = {};
  if (req.query.from) dateFilter.gte = new Date(String(req.query.from));
  if (req.query.to) dateFilter.lte = new Date(String(req.query.to));

  const status =
    typeof req.query.status === "string" && req.query.status.length
      ? String(req.query.status).toUpperCase()
      : undefined;

  const where = {
    ...whereBase,
    ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}),
    ...(status ? { status: status as any } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: { date: "asc" },
      include: { patient: true, staff: true },
      take,
      skip,
    }),
    prisma.appointment.count({ where }),
  ]);

  res.json({ items, total, take, skip });
});

r.get("/availability", requireAuth, async (req, res) => {
  const { staffId, date } = req.query as { staffId?: string; date?: string };
  if (!staffId || !date)
    return res.status(400).json({ error: "missing_params" });

  const when = new Date(date);
  if (isNaN(when.getTime()))
    return res.status(400).json({ error: "invalid_date" });

  const free = await isSlotFree(staffId, when);
  res.json({ free });
});

r.post("/", requireAuth, async (req, res) => {
  const { date, staffId, reason } = req.body as {
    date?: string;
    staffId?: string;
    reason?: string;
  };

  const u = (req as any).user as { sub: string; role: "PATIENT" | "STAFF" };

  if (!date || !staffId)
    return res.status(400).json({ error: "missing_fields" });

  const when = new Date(date);
  if (isNaN(when.getTime()))
    return res.status(400).json({ error: "invalid_date" });
  if (when < new Date())
    return res.status(400).json({ error: "past_date_not_allowed" });

  const staff = await prisma.user.findUnique({
    where: { id: staffId },
    select: {
      role: true,
      street: true,
      number: true,
      district: true,
      city: true,
      uf: true,
    },
  });
  if (!staff || staff.role !== "STAFF")
    return res.status(400).json({ error: "invalid_staff" });

  if (!(await isSlotFree(staffId, when)))
    return res.status(409).json({ error: "slot_unavailable" });

  const clinicLocation = [
    staff.street && `${staff.street}, ${staff.number || "s/n"}`,
    staff.district,
    staff.city && staff.uf
      ? `${staff.city}/${staff.uf}`
      : staff.city || staff.uf,
  ]
    .filter(Boolean)
    .join(" - ");

  const appt = await prisma.appointment.create({
    data: {
      date: when,
      reason,
      location: clinicLocation,
      patientId: u.sub,
      staffId,
    },
    include: { patient: true, staff: true },
  });

  res.status(201).json(appt);
});

r.patch("/:id/cancel", requireAuth, async (req, res) => {
  const { id } = req.params;
  const u = (req as any).user as { sub: string };

  const a = await prisma.appointment.findUnique({ where: { id } });
  if (!a || (a.patientId !== u.sub && a.staffId !== u.sub))
    return res.status(404).json({ error: "not_found" });

  if (a.status === "DONE")
    return res.status(400).json({ error: "already_done" });

  const upd = await prisma.appointment.update({
    where: { id },
    data: { status: "CANCELED" },
  });

  res.json(upd);
});

r.patch("/:id/done", requireAuth, async (req, res) => {
  const { id } = req.params;
  const u = (req as any).user as { sub: string };

  const a = await prisma.appointment.findUnique({ where: { id } });
  if (!a || (a.patientId !== u.sub && a.staffId !== u.sub))
    return res.status(404).json({ error: "not_found" });

  if (a.status === "CANCELED")
    return res.status(400).json({ error: "already_canceled" });

  const upd = await prisma.appointment.update({
    where: { id },
    data: { status: "DONE" },
  });

  res.json(upd);
});

export default r;
