// backend/api/index.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import serverless from "serverless-http";
import app from "../src/app";

const handler = serverless(app);

// Vercel exige um default export que trate a requisição
export default (req: VercelRequest, res: VercelResponse) => {
  return handler(req as any, res as any);
};
