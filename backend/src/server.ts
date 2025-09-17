import express from "express";
import cors from "cors";
import morgan from "morgan";
import { errorHandler } from "./middlewares/error";
import authRoutes from "../src/modules/auth/auth.routes.js";
import usersRoutes from "../src/modules/users/users.routes.js";
import apptRoutes from "../src/modules/appointments/appointments.routes.js";
import cepRoutes from "../src/modules/integrations/cep.controller.js";
import weatherRoutes from "../src/modules/integrations/weather.controller.js";

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

app.use(errorHandler);

export default app;
