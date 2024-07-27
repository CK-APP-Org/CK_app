import scheduleData from "../../data/ClassesSchedule.json";

export default {
  state: () => ({
    scheduleData: scheduleData['317']['schedule'],
    userClass: "317",
    displayScheduleWidget: true
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
    loadSchedule({ commit, state }) {
      const classSchedule = scheduleData[state.userClass]['schedule']
      console.log(classSchedule)
      commit("SET_SCHEDULE_DATA", classSchedule);
    },
  },
  getters: {
    getScheduleData: (state) => state.scheduleData,
    getUserClass: (state) => state.userClass,
    getScheduleWidget: (state) => state.displayScheduleWidget,
  },
};

