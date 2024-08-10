import { createStore } from "vuex";
import youbikeModule from "./modules/youbike";
import newsModule from "./modules/news";
import scheduleModule from "./modules/schedule";
import todoModule from "./modules/todo";
import foodModule from "./modules/food";
import accountModule from "./modules/account";
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

export default createStore({
  plugins: [storeWatcherPlugin, localStoragePlugin],
  modules: {
    youbike: youbikeModule,
    news: newsModule,
    schedule: scheduleModule,
    todo: todoModule,
    food: foodModule,
    account: accountModule,
  },
  mutations: {
    CLEAR_DATA(state) {
      localStorage.removeItem("store");

      // Reset module states
      Object.keys(this._modules.root._children).forEach((moduleName) => {
        const moduleState = this._modules.root._children[moduleName].state;
        if (typeof moduleState === "function") {
          state[moduleName] = moduleState();
        } else {
          state[moduleName] = { ...moduleState };
        }
      });

      console.log("Data cleared from state and localStorage");
    },
  },
  actions: {
    clearALL({ commit }) {
      commit("CLEAR_DATA");
    },
  },
});
