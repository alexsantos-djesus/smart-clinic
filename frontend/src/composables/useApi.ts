import axios from "axios";

const raw = import.meta.env.VITE_API_URL?.trim();
// defina VITE_API_BASE = https://smart-clinic-backend.vercel.app/api
const baseURL = raw ? raw.replace(/\/+$/, "") : "http://localhost:3001/api";

const api = axios.create({ baseURL });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export default api;
