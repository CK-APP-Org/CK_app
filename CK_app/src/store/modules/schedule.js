import scheduleData from "../../data/ClassSchedule.json";

export default {
  state: () => ({
    scheduleData: scheduleData,
    userClass: "217",
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
  },
  actions: {
    updateSchedule({ commit }, payload) {
      commit("UPDATE_SCHEDULE", payload);
    },
    setUserClass({ commit }, newClass) {
      commit("SET_USER_CLASS", newClass);
      localStorage.setItem("userClass", newClass);
    },
    loadSchedule({ commit }) {
      commit("SET_SCHEDULE_DATA", scheduleData);
    },
  },
  getters: {
    getScheduleData: (state) => state.scheduleData,
    getUserClass: (state) => state.userClass,
  },
};
