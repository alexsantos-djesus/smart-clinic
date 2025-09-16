// api/index.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import serverless from "serverless-http";
import app from "../src/server";

const handler = serverless(app);

export default async (req: VercelRequest, res: VercelResponse) => {
  return handler(req as any, res as any);
};
