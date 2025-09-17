import axios from "axios";

const raw = import.meta.env.VITE_API_BASE?.trim();
const baseURL = raw
  ? raw.replace(/\/+$/, "")
  : "https://smart-clinic-backend.vercel.app/api";

const api = axios.create({ baseURL });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export default api;
