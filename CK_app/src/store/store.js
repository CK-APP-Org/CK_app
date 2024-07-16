import { createStore } from 'vuex'
import scheduleData from "../data/ClassSchedule.json";

export default createStore({
  state() {
    return JSON.parse(localStorage.getItem('store')) || {
      scheduleData: [],
      userClass: "217",
      options: [
        "國文", "數學", "英文", "地理", "歷史", "公民",
        "生物", "物理", "化學", "地科", "音樂", "美術"
      ],
      colorOptions: [
        { label: "Default", value: "#ffecb3" },
        { label: "Red", value: "#FFCCCB" },
        { label: "Orange", value: "#f5c884" },
        { label: "Yellow", value: "#FFFFE0" },
        { label: "Green", value: "#90EE90" },
        { label: "Blue", value: "#ADD8E6" },
        { label: "Purple", value: "#e299ff" },
        { label: "Pink", value: "#ffa1e4" },
      ]
    }
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
    }
  },
  actions: {
    loadScheduleData({ commit }) {
      commit('SET_SCHEDULE_DATA', scheduleData)
    },
    updateCell({ commit }, payload) {
      commit('UPDATE_CELL', payload)
    }
  },
  getters: {
    getScheduleData: state => state.scheduleData,
    getUserClass: state => state.userClass,
    getOptions: state => state.options,
    getColorOptions: state => state.colorOptions
  }
})





