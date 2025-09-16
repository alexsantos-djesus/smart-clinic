import { Router } from "express";
import { prisma } from "../../prisma";
import { hash, compare } from "../../auth/hash";
import { signJwt } from "../../auth/jwt";
const r = Router();
r.post("/register", async (req, res) => {
  const { name, email, password, role, cpf, phone } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ error: "missing_fields" });
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: "email_in_use" });
  const user = await prisma.user.create({
    data: { name, email, password: await hash(password), role, cpf, phone },
  });
  const token = signJwt({ sub: user.id, role: user.role, name: user.name });
  res.json({
    token,
    user: { id: user.id, name: user.name, role: user.role, email: user.email },
  });
});
r.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await compare(password, user.password)))
    return res.status(401).json({ error: "invalid_credentials" });
  const token = signJwt({ sub: user.id, role: user.role, name: user.name });
  res.json({
    token,
    user: { id: user.id, name: user.name, role: user.role, email: user.email },
  });
});
export default r;
