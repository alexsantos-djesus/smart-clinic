import cors from "cors";

const allowed = [
  "http://localhost:5173",
  "https://smart-clinic-frontend.vercel.app/",
];

app.use(
  cors({
    origin: allowed,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
