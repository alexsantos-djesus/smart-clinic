import "dotenv/config";

type Opts = { required?: boolean };

function getEnv(name: string, opts: Opts = { required: false }) {
  const v = process.env[name];
  if ((opts.required ?? false) && (!v || v.trim() === "")) {
    throw new Error(`Missing required env: ${name}`);
  }
  return v?.trim() ?? "";
}

export const env = {
  DATABASE_URL: getEnv("DATABASE_URL"),
  DIRECT_URL: getEnv("DIRECT_URL"),
  JWT_SECRET: getEnv("JWT_SECRET", { required: true }),
  OPENWEATHER_KEY: getEnv("OPENWEATHER_KEY", { required: true }),
};

export function ensureDbEnv() {
  if (!env.DATABASE_URL)
    throw new Error("DATABASE_URL is required to access the database");
}
