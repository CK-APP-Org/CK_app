import { createStore } from "vuex";
import scheduleData from "../data/ClassSchedule.json";


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
<<<<<<< HEAD
    const savedState = JSON.parse(localStorage.getItem('store')) || {};

    // Define the default state
    const defaultState = {
      scheduleData: [],
      userClass: "217",
      options: [
        "國文", "數學", "英文", "地理", "歷史", "公民",
        "生物", "物理", "化學", "地科", "音樂", "美術"
      ],
      colorOptions: colorOptions,
      stationList: {
        "YouBike2.0_泉州寧波西街口": { nickname: "泉州寧波西街口(建中側門)", city: "臺北市" },
        "YouBike2.0_郵政博物館": { nickname: "郵政博物館", city: "臺北市" },
        "YouBike2.0_植物園": { nickname: "台北植物園", city: "臺北市" },
        "YouBike2.0_捷運中正紀念堂站(2號出口)": { nickname: "中正紀念堂站(2號出口)", city: "臺北市" },
      }
    };

    // Merge saved state with default state, ensuring all properties exist
    const mergedState = { ...defaultState, ...savedState };

    // Save the merged state back to localStorage
    localStorage.setItem('store', JSON.stringify(mergedState));

    return mergedState;
=======
    return JSON.parse(localStorage.getItem('store')) || {
      scheduleData: scheduleData,
      userClass: "217",
    }
>>>>>>> b5667929b9aa6141680ab8829a39a10c15f39300
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
<<<<<<< HEAD
    getOptions: state => state.options,
    getColorOptions: state => state.colorOptions,
    getStationList: state => state.stationList
=======
>>>>>>> b5667929b9aa6141680ab8829a39a10c15f39300
  }
})
