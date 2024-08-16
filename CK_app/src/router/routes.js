import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("src/pages/HomePage.vue") }],
    name: "home",
  },
  {
    path: "/schedule",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/SchedulePage.vue") },
    ],
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
    path: "/food",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/FoodPage.vue") }],
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
  //New---------------
  {
    path: "/login",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/LoginPage.vue") }],
  },
  {
    path: "/metro",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/MetroPage.vue") }],
  },
  //to here-----------

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
