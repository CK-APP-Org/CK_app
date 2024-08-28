export default {
  state: () => ({
    stationList: ["中正紀念堂", "小南門", "西門"],
  }),
  mutations: {
    ADD_METRO_STATION(state, stationName) {
      if (!state.stationList.includes(stationName)) {
        state.stationList.push(stationName);
      }
    },
    DELETE_METRO_STATION(state, stationName) {
      const index = state.stationList.indexOf(stationName);
      if (index > -1) {
        state.stationList.splice(index, 1);
      }
    },
  },
  actions: {
    addMetroStation({ commit }, stationName) {
      commit("ADD_METRO_STATION", stationName);
    },
    deleteMetroStation({ commit }, stationName) {
      commit("DELETE_METRO_STATION", stationName);
    },
  },
  getters: {
    getMetroStationList: (state) => state.stationList,
  },
};
