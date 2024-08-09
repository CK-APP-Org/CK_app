import axios from "axios";

const SCHEDULE_URL =
  "https://raw.githubusercontent.com/CK-APP-Org/ScheduleData/main/ClassesSchedule.json";

export default {
  state: () => ({
    scheduleData: [],
    userClass: "317",
    displayScheduleWidget: true,
  }),
  mutations: {
    UPDATE_SCHEDULE(state, { rowIndex, colName, newValue }) {
      state.scheduleData[rowIndex][colName] = newValue;
    },
    SET_SCHEDULE_DATA(state, data) {
      state.scheduleData = data;
    },
    SET_USER_CLASS(state, newClass) {
      state.userClass = newClass;
    },
    SET_SHOW_SCHEDULE(state, value) {
      state.displayScheduleWidget = value;
    },
    LOADING_SCHEDULE(state, schedule, userclass, display) {
      state.schedule = schedule;
      state.userClass = userclass;
      state.displayScheduleWidget = display
    },
  },
  actions: {
    updateSchedule({ commit }, payload) {
      commit("UPDATE_SCHEDULE", payload);
    },
    setUserClass({ commit }, newClass) {
      commit("SET_USER_CLASS", newClass);
      localStorage.setItem("userClass", newClass);
    },
    loadingSchedule({commit}, schedule, userclass, display) {
      commit("LOADING_SCHEDULE", schedule, userclass, display);
    },
    async loadSchedule({ commit, state }) {
      try {
        const response = await axios.get(SCHEDULE_URL);
        const classSchedule = response.data[state.userClass]["schedule"];
        commit("SET_SCHEDULE_DATA", classSchedule);
      } catch (error) {
        console.error("Failed to load schedule:", error);
      }
    },
  },
  getters: {
    getScheduleData: (state) => state.scheduleData,
    getUserClass: (state) => state.userClass,
    getShowSchedule: (state) => state.displayScheduleWidget,
  },
};
