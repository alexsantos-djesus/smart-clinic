import { Router } from "express";
import { prisma } from "../../prisma";
import { requireAuth } from "../../auth/auth.middleware";

const r = Router();

r.get("/me", requireAuth, async (req, res) => {
  const id = (req as any).user.sub as string;
  const me = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      cpf: true,
      cep: true,
      street: true,
      number: true,
      district: true,
      city: true,
      uf: true,
    },
  });
  if (!me) return res.status(404).json({ error: "user_not_found" });
  res.json(me);
});

r.get("/staff", requireAuth, async (_req, res) => {
  const staff = await prisma.user.findMany({
    where: { role: "STAFF" },
    select: {
      id: true,
      name: true,
      email: true,
      cep: true,
      street: true,
      number: true,
      district: true,
      city: true,
      uf: true,
    },
  });
  res.json(staff);
});

r.patch("/me", requireAuth, async (req, res) => {
  const id = (req as any).user.sub as string;
  const { phone, cep, street, number, district, city, uf, name } =
    req.body ?? {};
  const upd = await prisma.user.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(cep !== undefined ? { cep } : {}),
      ...(street !== undefined ? { street } : {}),
      ...(number !== undefined ? { number } : {}),
      ...(district !== undefined ? { district } : {}),
      ...(city !== undefined ? { city } : {}),
      ...(uf !== undefined ? { uf } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      cep: true,
      street: true,
      number: true,
      district: true,
      city: true,
      uf: true,
    },
  });
  res.json(upd);
});

export default r;
