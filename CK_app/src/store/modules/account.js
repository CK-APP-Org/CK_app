export default {
  state: () => ({
    userName: "Default",
    password: "Default",
    email: "Default",
  }),
  mutations: {
    SET_USER_ACCOUNT(state, newAccount) {
      console.log(newAccount);
      state.userName = newAccount;
    },
    SET_USER_EMAIL(state, email) {
      console.log(email);
      state.email = email;
    },
    SET_USER_PASSWORD(state, password) {
      console.log(password);
      state.password = password;
    },
  },

  actions: {
    setUserAccount({ commit }, newAccount) {
      commit("SET_USER_ACCOUNT", newAccount);
      localStorage.setItem("userName", newAccount);
    },
    setUserEmail({ commit }, mail) {
      commit("SET_USER_EMAIL", mail);
      localStorage.setItem("email", mail);
      console.log(2);
    },
    setUserPassword({ commit }, password) {
      console.log(1);
      commit("SET_USER_PASSWORD", password);
      localStorage.setItem("password", password);
    },
  },

  getters: {
    getUserAccount: (state) => state.userName,
    getEmail: (state) => state.email,
    getPassword: (state) => state.password,
  },
};
