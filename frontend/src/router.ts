import { createRouter, createWebHistory } from "vue-router";
import Home from "./pages/Home.vue";
import Login from "./pages/Login.vue";
import Register from "./pages/Register.vue";
import DashboardPatient from "./pages/DashboardPatient.vue";
import DashboardStaff from "./pages/DashboardStaff.vue";
import Schedule from "./pages/Schedule.vue";
export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Home },
    { path: "/login", component: Login },
    { path: "/register", component: Register },
    { path: "/dashboard/patient", component: DashboardPatient },
    { path: "/dashboard/staff", component: DashboardStaff },
    { path: "/schedule", component: Schedule },
  ],
});
