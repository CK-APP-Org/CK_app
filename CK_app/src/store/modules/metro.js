export default {
  state: () => ({
    metroStationList: ["中正紀念堂", "小南門", "西門"],
  }),
  mutations: {
    ADD_METRO_STATION(state, stationName) {
      if (!state.metroStationList.includes(stationName)) {
        state.metroStationList.push(stationName);
      }
    },
    DELETE_METRO_STATION(state, stationName) {
      const index = state.metroStationList.indexOf(stationName);
      if (index > -1) {
        state.metroStationList.splice(index, 1);
      }
    },
    LOAD_METRO(state, stations) {
      state.metroStationList = stations;
    },
  },
  actions: {
    addMetroStation({ commit }, stationName) {
      commit("ADD_METRO_STATION", stationName);
    },
    deleteMetroStation({ commit }, stationName) {
      commit("DELETE_METRO_STATION", stationName);
    },
    loadMetro({ commit }, stations) {
      commit("LOAD_METRO", stations);
    },
  },
  getters: {
    getMetroStationList: (state) => state.metroStationList,
  },
};
