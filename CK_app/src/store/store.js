import { createStore } from "vuex";
import scheduleData from "../data/ClassSchedule.json";

// prettier-ignore
const storeWatcherPlugin = (store) => {
  store.watch(
    (state) => state.scheduleData,
    (newValue) => {
      console.log('Store scheduleData changed:', JSON.parse(JSON.stringify(newValue)));
    },
    { deep: true }
  );
};

// prettier-ignore
export default createStore({
  plugins: [storeWatcherPlugin],
  state() {
    return JSON.parse(localStorage.getItem('store')) || {
      scheduleData: scheduleData,
      userClass: "217",
      stationList: {
        "YouBike2.0_泉州寧波西街口": { nickname: "泉州寧波西街口(建中側門)", city: "臺北市" },
        "YouBike2.0_郵政博物館": { nickname: "郵政博物館", city: "臺北市" },
        "YouBike2.0_植物園": { nickname: "台北植物園", city: "臺北市" },
        "YouBike2.0_捷運中正紀念堂站(2號出口)": { nickname: "中正紀念堂站(2號出口)", city: "臺北市" },
      },
      pinnedNews: [],
      lastClearedTime: null
    }
  },
  mutations: {
    UPDATE_SCHEDULE(state, { rowIndex, colName, newValue }) {
      state.scheduleData[rowIndex][colName] = newValue
      localStorage.setItem('store', JSON.stringify(state))
      console.log('Saved to localStorage++:', JSON.parse(localStorage.getItem('store')))
    },

    SET_SCHEDULE_DATA(state, data) {
      state.scheduleData = data
      localStorage.setItem('store', JSON.stringify(state))
      console.log('Saved to localStorage:', JSON.parse(localStorage.getItem('store')))
    },

    CLEAR_DATA(state) {
      state.scheduleData = [];
      localStorage.removeItem('store');
      console.log('Data cleared from state and localStorage');
    },

    UPDATE_STATION_NICKNAME(state, { stationName, newNickname }) {
      if (state.stationList[stationName]) {
        state.stationList[stationName].nickname = newNickname;
      }
      localStorage.setItem('store', JSON.stringify(state));
      console.log('Saved to localStorage:', JSON.parse(localStorage.getItem('store')));
    },

    DELETE_STATION(state, stationName) {
      if (state.stationList[stationName]) {
        delete state.stationList[stationName];
      }
      localStorage.setItem('store', JSON.stringify(state));
      console.log('Saved to localStorage:', JSON.parse(localStorage.getItem('store')));
    },

    ADD_STATION(state, { stationName, stationData }) {
      state.stationList[stationName] = {nickname: stationData.nickname, city: stationData.city }
      localStorage.setItem('store', JSON.stringify(state));
      console.log('Saved to localStorage:', JSON.parse(localStorage.getItem('store')));
    },

    PIN_NEWS(state, newsItem) {
      state.pinnedNews.push(newsItem);
      localStorage.setItem('store', JSON.stringify(state));
    },

    UNPIN_NEWS(state, newsItemTitle) {
      state.pinnedNews = state.pinnedNews.filter(item => item.title !== newsItemTitle);
      localStorage.setItem('store', JSON.stringify(state));
    },

    SET_LAST_CLEARED_TIME(state, time) {
      state.lastClearedTime = time;
      localStorage.setItem('store', JSON.stringify(state));
      console.log('Last cleared time saved:', state.lastClearedTime);
    }
  },
  actions: {
    updateSchedule({ commit }, payload) {
      commit('UPDATE_SCHEDULE', payload)
      console.log('1');
    },
    loadSchedule({ commit }) {
      commit('SET_SCHEDULE_DATA', scheduleData)
      console.log('2');
    },
    clearALL({ commit }) {
      commit('CLEAR_DATA')
      console.log('3');
    },
    updateStationNickname({ commit }, payload) {
      commit('UPDATE_STATION_NICKNAME', payload);
    },
    deleteStation({ commit }, stationName) {
      commit('DELETE_STATION', stationName);
    },
    addStation({ commit }, payload) {
      commit('ADD_STATION', payload);
    },
    pinNews({ commit }, newsItem) {
      commit('PIN_NEWS', newsItem);
    },
    unpinNews({ commit }, newsItemTitle) {
      commit('UNPIN_NEWS', newsItemTitle);
    },
    setLastClearedTime({ commit }, time) {
      commit('SET_LAST_CLEARED_TIME', time);
    }
  },
  getters: {
    getScheduleData: state => state.scheduleData,
    getUserClass: state => state.userClass,
    getStationList: state => state.stationList,
    getPinnedNews: state => state.pinnedNews,
    getLastClearedTime: state => state.lastClearedTime
  }
})
