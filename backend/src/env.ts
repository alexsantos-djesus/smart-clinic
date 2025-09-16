import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const candidates = [
  path.resolve(__dirname, "..", ".env"),
  path.resolve(__dirname, "..", "..", ".env"),
  path.resolve(process.cwd(), ".env"),
];

let loadedFrom = "";
for (const p of candidates) {
  if (fs.existsSync(p)) {
    const res = dotenv.config({ path: p, override: true });
    if (!res.error) {
      loadedFrom = p;
      break;
    }
  }
}

function req(name: string) {
  const v = process.env[name];
  if (!v) {
    const hint =
      `Faltou ${name}. Procurei .env em:\n- ${candidates.join("\n- ")}\n` +
      `Carregado de: ${loadedFrom || "nenhum"}\n` +
      `Dica: crie backend/.env (UTF-8) com:\n` +
      `DATABASE_URL=...\nJWT_SECRET=...\nOPENWEATHER_KEY=...\nPORT=3001\n`;
    throw new Error(hint);
  }
  return v;
}

export const env = {
  PORT: Number(process.env.PORT || 3001),
  DATABASE_URL: req("DATABASE_URL"),
  JWT_SECRET: req("JWT_SECRET"),
  OPENWEATHER_KEY: req("OPENWEATHER_KEY"),
};
