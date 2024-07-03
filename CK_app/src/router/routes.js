import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("src/pages/HomePage.vue") }],
  },
  {
    path: "/youbike",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/YoubikePage.vue") }],
  },
  {
    path: "/menu",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/MenuPage.vue") }],
  },
  {
    path: "/settings",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/SettingsPage.vue") }],
  },
  {
    path: "/about",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/AboutPage.vue") }],
  },
  {
    path: "/todo",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/TodoPage.vue") }],
  },
  {
    path: "/news",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/NewsPage.vue") }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
