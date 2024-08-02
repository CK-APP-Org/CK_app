export default {
  state: () => ({
    events: [],
    categories: [{ name: "Default", color: "#ADADAD" }],
    displayTodoWidget: true,
    todos: [],
    currentView: "calendar",
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
    SET_SHOW_TODO(state, value) {
      state.displayTodoWidget = value;
    },
    SET_TODOS(state, todos) {
      state.todos = todos;
    },
    ADD_TODO(state, todo) {
      state.todos.push(todo);
    },
    UPDATE_TODO(state, updatedTodo) {
      const index = state.todos.findIndex((t) => t.id === updatedTodo.id);
      if (index !== -1) {
        state.todos.splice(index, 1, updatedTodo);
      }
    },
    DELETE_TODO(state, todoId) {
      state.todos = state.todos.filter((t) => t.id !== todoId);
    },
    SET_SHOW_TODO(state, value) {
      state.displayTodoWidget = value;
    },
    SET_CURRENT_VIEW(state, view) {
      state.currentView = view;
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
    setTodos({ commit }, todos) {
      commit("SET_TODOS", todos);
    },
    addTodo({ commit }, todo) {
      commit("ADD_TODO", todo);
    },
    updateTodo({ commit }, todo) {
      commit("UPDATE_TODO", todo);
    },
    deleteTodo({ commit }, todoId) {
      commit("DELETE_TODO", todoId);
    },
    updateCurrentView({ commit }, view) {
      commit("SET_CURRENT_VIEW", view);
    },
  },
  getters: {
    getEvents: (state) => state.events,
    getCategories: (state) => state.categories,
    getShowTodo: (state) => state.displayTodoWidget,
    getTodos: (state) => state.todos,
    getCurrentView: (state) => state.currentView,
  },
};
