export default {
  state: () => ({
    userName: null,
    userEmail: null,
    isLoggedIn: false,
  }),
  mutations: {
    SET_USER_DATA(state, userData) {
      state.userName = userData.userName;
      state.userEmail = userData.userEmail;
      state.isLoggedIn = true;
    },
    CLEAR_USER_DATA(state) {
      state.userName = null;
      state.userEmail = null;
      state.isLoggedIn = false;
    },
  },
  actions: {
    setUserData({ commit }, userData) {
      commit("SET_USER_DATA", userData);
    },
    clearUserData({ commit }) {
      commit("CLEAR_USER_DATA");
    },
  },
  getters: {
    getUserData: (state) => ({
      userName: state.userName,
      userEmail: state.userEmail,
      isLoggedIn: state.isLoggedIn,
    }),
  },
};
