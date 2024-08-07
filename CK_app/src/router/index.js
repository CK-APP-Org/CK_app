import { route } from "quasar/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAfHEWoaKuz8fiMKojoTEeJWMUzJDgiuVU",
  authDomain: "ck-app-database.firebaseapp.com",
  projectId: "ck-app-database",
  storageBucket: "ck-app-database.appspot.com",
  messagingSenderId: "253500838094",
  appId: "1:253500838094:web:b6bfcf4975f3323ab8c09f",
  measurementId: "G-T79H6D7WRT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default route(function ({ store }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;
  
  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    const publicPages = ['/login']; // Define public pages
    const authRequired = !publicPages.includes(to.path);
    const userAccount = store.getters.getUserAccount;

    if (authRequired && userAccount === "Default") {
      next('/login');
    } else if (userAccount !== "Default") {
      const userRef = doc(db, "User Data", "Userdata");
      try {
        const docSnap = await getDoc(userRef);
        const userData = docSnap.data();
        if (userData && userData[userAccount]) {
          if (to.path === '/login') {
            next('/'); // Redirect to home if trying to access login while authenticated
          } else {
            next();
          }
        } else {
          store.commit("SET_USER_ACCOUNT", "Default");
          next('/login');
        }
      } catch (error) {
        console.error("Error checking user in Firebase:", error);
        store.commit("SET_USER_ACCOUNT", "Default");
        next('/login');
      }
    } else {
      next();
    }
  });

  return Router;
});