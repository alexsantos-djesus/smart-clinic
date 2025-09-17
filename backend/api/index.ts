import serverless from "serverless-http";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "../src/modules/auth/auth.routes";
import usersRoutes from "../src/modules/users/users.routes";
import apptRoutes from "../src/modules/appointments/appointments.routes";
import cepRoutes from "../src/modules/integrations/cep.controller";
import weatherRoutes from "../src/modules/integrations/weather.controller";

const app = express();
app.use(
  cors({
    origin: [
      "https://smart-clinic-frontend.vercel.app",
      "http://localhost:5173",
    ],
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/appointments", apptRoutes);
app.use("/cep", cepRoutes);
app.use("/weather", weatherRoutes);


const handler = serverless(app);

export default handler;
