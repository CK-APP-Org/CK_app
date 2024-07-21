import { createStore } from "vuex";
import scheduleData from "../data/ClassSchedule.json";

const colorOptions = [
  { label: "Default", value: "#f4f4f1" },
  { label: "Red", value: "#FFCCCB" },
  { label: "Orange", value: "#f5c884" },
  { label: "Yellow", value: "#FFFFE0" },
  { label: "Green", value: "#90EE90" },
  { label: "Blue", value: "#ADD8E6" },
  { label: "Purple", value: "#e299ff" },
  { label: "Pink", value: "#ffa1e4" },
];

// prettier-ignore
export default createStore({
  state() {
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
  },
  mutations: {
    SET_SCHEDULE_DATA(state, data) {
      state.scheduleData = data
      localStorage.setItem('store', JSON.stringify(state))
      console.log('Saved to localStorage:', JSON.parse(localStorage.getItem('store')))
    },
    UPDATE_CELL(state, { rowIndex, colName, newValue }) {
      state.scheduleData[rowIndex][colName] = newValue
      localStorage.setItem('store', JSON.stringify(state))
      console.log('Saved to localStorage:', JSON.parse(localStorage.getItem('store')))
    },
    UPDATE_COLOR_OPTIONS(state) {
      state.colorOptions = colorOptions
      localStorage.setItem('store', JSON.stringify(state))
      console.log('Saved to localStorage:', JSON.parse(localStorage.getItem('store')))
    }
  },
  actions: {
    loadScheduleData({ commit }) {
      commit('SET_SCHEDULE_DATA', scheduleData)
    },
    loadColorData({ commit }) {
      commit('UPDATE_COLOR_OPTIONS')
    },
    updateCell({ commit }, payload) {
      commit('UPDATE_CELL', payload)
    },
  },
  getters: {
    getScheduleData: state => state.scheduleData,
    getUserClass: state => state.userClass,
    getOptions: state => state.options,
    getColorOptions: state => state.colorOptions,
    getStationList: state => state.stationList
  }
})
