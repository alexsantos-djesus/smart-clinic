import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./modules/auth/auth.routes";
import usersRoutes from "./modules/users/users.routes";
import apptRoutes from "./modules/appointments/appointments.routes";
import cepRoutes from "./modules/integrations/cep.controller";
import weatherRoutes from "./modules/integrations/weather.controller";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/appointments", apptRoutes);
app.use("/cep", cepRoutes);
app.use("/weather", weatherRoutes);

export default app;
