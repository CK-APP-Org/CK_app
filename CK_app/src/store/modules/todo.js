export default {
  state: () => ({
    events: [],
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
  },
  getters: {
    getEvents: (state) => state.events,
  },
};
