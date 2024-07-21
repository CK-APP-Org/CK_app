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
      }
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
    }
  },
  getters: {
    getScheduleData: state => state.scheduleData,
    getUserClass: state => state.userClass,
    getStationList: state => state.stationList
  }
})
