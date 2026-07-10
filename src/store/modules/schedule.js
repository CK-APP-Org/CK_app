import { SCHEDULE_DATA } from "../../data/schedules";

export default {
  state: () => ({
    scheduleData: [],
    userClass: "101",
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
    LOADING_SCHEDULE(state, { schedules, classes, showSchedule }) {
      state.scheduleData = schedules;
      state.userClass = classes;
      state.displayScheduleWidget = showSchedule;
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
    loadingSchedule({ commit }, { schedules, classes, showSchedule }) {
      commit("LOADING_SCHEDULE", { schedules, classes, showSchedule });
    },
    loadSchedule({ commit, state }) {
      const classSchedule = SCHEDULE_DATA[state.userClass]?.schedule;
      if (!classSchedule) {
        console.error(`No schedule data found for class ${state.userClass}`);
        return;
      }
      commit("SET_SCHEDULE_DATA", classSchedule);
    },
  },
  getters: {
    getScheduleData: (state) => state.scheduleData,
    getUserClass: (state) => state.userClass,
    getShowSchedule: (state) => state.displayScheduleWidget,
  },
};
