export default {
  state: () => ({
    userName: "Default",
  }),
  mutations: {
    SET_USER_ACCOUNT(state, newAccount) {
      console.log(newAccount);
      state.userName = newAccount;
    },
    CLEAR_USER_DATA(state) {
      state.userName = "Default";
    },
  },

  actions: {
    setUserAccount({ commit }, newAccount) {
      commit("SET_USER_ACCOUNT", newAccount);
      localStorage.setItem("userName", newAccount);
    },
    clearUserData({ commit }) {
      commit("CLEAR_USER_DATA");
      localStorage.removeItem("userName");
    },
  },

  getters: {
    getUserAccount: (state) => state.userName,
  },
};
