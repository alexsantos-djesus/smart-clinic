import express from "express";
import cors from "cors";
import morgan from "morgan";

// importe suas rotas atuais
import users from "./routes/users";
import appointments from "./routes/appointments";
import auth from "./routes/auth";
// ... outras

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/users", users);
app.use("/appointments", appointments);
app.use("/auth", auth);

export default app;
