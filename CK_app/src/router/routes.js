const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { 
        path: "", 
        component: () => import("pages/HomePage.vue"),
        name: "home"
      },
      { 
        path: "schedule", 
        component: () => import("pages/SchedulePage.vue") 
      },
      { 
        path: "youbike", 
        component: () => import("pages/YoubikePage.vue") 
      },
      { 
        path: "menu", 
        component: () => import("pages/MenuPage.vue") 
      },
      { 
        path: "food", 
        component: () => import("pages/FoodPage.vue") 
      },
      { 
        path: "settings", 
        component: () => import("pages/SettingsPage.vue") 
      },
      { 
        path: "about", 
        component: () => import("pages/AboutPage.vue") 
      },
      { 
        path: "todo", 
        component: () => import("pages/TodoPage.vue") 
      },
      { 
        path: "news", 
        component: () => import("pages/NewsPage.vue") 
      },
    ],
  },
  {
    path: "/login",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/LoginPage.vue"),
      },
    ],
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/ErrorNotFound.vue"),
      },
    ],
  },
];

export default routes;