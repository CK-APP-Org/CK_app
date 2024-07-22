export default {
  state: () => ({
    //Prettier-ignores
    stationList: {
      "YouBike2.0_泉州寧波西街口": {
        nickname: "泉州寧波西街口(建中側門)",
        city: "臺北市",
      },
      "YouBike2.0_郵政博物館": { nickname: "郵政博物館", city: "臺北市" },
      "YouBike2.0_植物園": { nickname: "台北植物園", city: "臺北市" },
      "YouBike2.0_捷運中正紀念堂站(2號出口)": {
        nickname: "中正紀念堂站(2號出口)",
        city: "臺北市",
      },
    },
  }),
  mutations: {
    UPDATE_STATION_NICKNAME(state, { stationName, newNickname }) {
      if (state.stationList[stationName]) {
        state.stationList[stationName].nickname = newNickname;
      }
    },
    DELETE_STATION(state, stationName) {
      if (state.stationList[stationName]) {
        delete state.stationList[stationName];
        console.log(JSON.parse(localStorage.getItem("store")));
      }
    },
    ADD_STATION(state, { stationName, stationData }) {
      state.stationList[stationName] = {
        nickname: stationData.nickname,
        city: stationData.city,
      };
    },
  },
  actions: {
    updateStationNickname({ commit }, payload) {
      commit("UPDATE_STATION_NICKNAME", payload);
    },
    deleteStation({ commit }, stationName) {
      commit("DELETE_STATION", stationName);
      console.log(JSON.parse(localStorage.getItem("store")));
    },
    addStation({ commit }, payload) {
      commit("ADD_STATION", payload);
    },
  },
  getters: {
    getStationList: (state) => state.stationList,
  },
};
