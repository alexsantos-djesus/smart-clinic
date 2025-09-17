import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "./jwt.js";
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization || "";
  const t = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!t) return res.status(401).json({ error: "unauthorized" });
  try {
    (req as any).user = verifyJwt(t);
    next();
  } catch {
    res.status(401).json({ error: "invalid_token" });
  }
}
export function requireRole(...roles: ("PATIENT" | "STAFF")[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const u = (req as any).user;
    if (!u || !roles.includes(u.role))
      return res.status(403).json({ error: "forbidden" });
    next();
  };
}
