import { reactive } from "vue";
import api from "./useApi";
export const auth = reactive<{ user: any | null }>({ user: null });
export async function login(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });
  localStorage.setItem("token", data.token);
  auth.user = data.user;
  return data.user;
}
export async function register(p: any) {
  const { data } = await api.post("/auth/register", p);
  localStorage.setItem("token", data.token);
  auth.user = data.user;
  return data.user;
}
export function logout() {
  localStorage.removeItem("token");
  auth.user = null;
}
