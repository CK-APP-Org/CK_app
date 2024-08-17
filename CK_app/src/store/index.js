import { createStore } from "vuex";
import youbikeModule from "./modules/youbike";
import newsModule from "./modules/news";
import scheduleModule from "./modules/schedule";
import todoModule from "./modules/todo";
import foodModule from "./modules/food";
import accountModule from "./modules/account";
import settingsModule from "./modules/settings";
import metroModule from "./modules/metro";
import { localStoragePlugin } from "./localStoragePlugin";

const storeWatcherPlugin = (store) => {
  store.watch(
    (state) => state,
    (newValue) => {
      console.log(
        "Store scheduleData changed:",
        JSON.parse(JSON.stringify(newValue))
      );
    },
    { deep: true }
  );
};

const modules = {
  youbike: youbikeModule,
  news: newsModule,
  schedule: scheduleModule,
  todo: todoModule,
  food: foodModule,
  account: accountModule,
  settings: settingsModule,
  metro: metroModule,
};

export default createStore({
  plugins: [storeWatcherPlugin, localStoragePlugin],
  modules,
  mutations: {
    CLEAR_DATA(state) {
      delete state.userClass;
      delete state.lastClearedTime;
      // Reset module states
      Object.keys(modules).forEach((moduleName) => {
        const moduleState = modules[moduleName].state;
        if (typeof moduleState === "function") {
          // Get the default state
          const defaultState = moduleState();
          // Merge the current state with the default state
          state[moduleName] = { ...defaultState, ...state[moduleName] };
          // Now overwrite with the default state to reset everything
          state[moduleName] = { ...defaultState };
        } else {
          // For non-function states, simply reset to the initial state
          state[moduleName] = { ...moduleState };
        }
      });

      console.log("Data cleared from state and localStorage");
      console.log(JSON.parse(localStorage.getItem("store")));
    },
  },
  actions: {
    clearALL({ commit }) {
      commit("CLEAR_DATA");
    },
  },
});
