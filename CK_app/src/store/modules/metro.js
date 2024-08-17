export default {
  state: () => ({
    stationList: [
      "圓山",
      "府中",
      "忠孝復興",
      "南港展覽館",
      "民權西路",
      "頭前庄",
      "亞東醫院",
      "淡水",
    ],
  }),
  mutations: {
    ADD_STATION(state, stationName) {
      if (!state.stationList.includes(stationName)) {
        state.stationList.push(stationName);
      }
    },
    DELETE_STATION(state, stationName) {
      const index = state.stationList.indexOf(stationName);
      if (index > -1) {
        state.stationList.splice(index, 1);
      }
    },
  },
  actions: {
    addStation({ commit }, stationName) {
      commit("ADD_STATION", stationName);
    },
    deleteStation({ commit }, stationName) {
      commit("DELETE_STATION", stationName);
    },
  },
  getters: {
    getStationList: (state) => state.stationList,
  },
};
