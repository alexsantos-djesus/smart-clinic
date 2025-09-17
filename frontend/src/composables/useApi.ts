import axios from "axios";

const raw = import.meta.env.VITE_API_URL?.trim();

const baseURL =
  raw && raw.length ? raw.replace(/\/+$/, "") : "http://localhost:3001";

const api = axios.create({
  baseURL,
  timeout: 20000, // 20s
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) {
    cfg.headers = cfg.headers ?? {};
    (cfg.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return cfg;
});

export default api;
