export default {
  state: () => ({
    events: [],
    categories: [{ name: "Default", color: "#ADADAD" }],
  }),
  mutations: {
    SET_EVENTS(state, events) {
      state.events = events;
    },
    ADD_EVENT(state, event) {
      state.events.push(event);
    },
    UPDATE_EVENT(state, updatedEvent) {
      const index = state.events.findIndex((e) => e.id === updatedEvent.id);
      if (index !== -1) {
        state.events.splice(index, 1, updatedEvent);
      }
    },
    DELETE_EVENT(state, eventId) {
      state.events = state.events.filter((e) => e.id !== eventId);
    },
    ADD_CATEGORY(state, category) {
      state.categories.push(category);
    },
    UPDATE_CATEGORY(state, updatedCategory) {
      const index = state.categories.findIndex(
        (c) => c.name === updatedCategory.name
      );
      if (index !== -1) {
        state.categories.splice(index, 1, updatedCategory);
      }
    },
    DELETE_CATEGORY(state, categoryName) {
      state.categories = state.categories.filter(
        (c) => c.name !== categoryName
      );
    },
  },
  actions: {
    setEvents({ commit }, events) {
      commit("SET_EVENTS", events);
    },
    addEvent({ commit }, event) {
      commit("ADD_EVENT", event);
    },
    updateEvent({ commit }, event) {
      commit("UPDATE_EVENT", event);
    },
    deleteEvent({ commit }, eventId) {
      commit("DELETE_EVENT", eventId);
    },
    addCategory({ commit }, category) {
      commit("ADD_CATEGORY", category);
    },
    updateCategory({ commit }, category) {
      commit("UPDATE_CATEGORY", category);
    },
    deleteCategory({ commit }, categoryName) {
      commit("DELETE_CATEGORY", categoryName);
    },
  },
  getters: {
    getEvents: (state) => state.events,
    getCategories: (state) => state.categories,
  },
};
