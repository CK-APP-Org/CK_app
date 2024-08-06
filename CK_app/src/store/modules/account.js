export default {
  state: () => ({
    userName: "Default"
  }),
  mutations: {
    SET_USER_ACCOUNT(state, newAccount) {
      console.log(newAccount)
      state.userName = newAccount;
    },

  },

  actions: {
    setUserAccount({ commit }, newAccount) {
      commit("SET_USER_ACCOUNT", newAccount);
      localStorage.setItem("userName", newAccount);
    },
  },

  getters: {
    getUserAccount: (state) => state.userName,
  },
};
