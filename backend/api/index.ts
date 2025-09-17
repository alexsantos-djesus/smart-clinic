import serverless from "serverless-http";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "../src/modules/auth/auth.routes.js";
import usersRoutes from "../src/modules/users/users.routes.js";
import apptRoutes from "../src/modules/appointments/appointments.routes.js";
import cepRoutes from "../src/modules/integrations/cep.controller.js";
import weatherRoutes from "../src/modules/integrations/weather.controller.js";

const app = express();

const allowedOrigins = [
  "https://smart-clinic-frontend.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.status(200).send("ok"));

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/appointments", apptRoutes);
app.use("/cep", cepRoutes);
app.use("/weather", weatherRoutes);

app.use((_req, res) => res.status(404).json({ error: "not_found" }));

export default serverless(app, { basePath: "/api" });

