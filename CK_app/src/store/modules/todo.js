export default {
  state: () => ({
    events: [],
    eventCategories: [{ name: "Default", color: "#ADADAD" }],
    displayTodoWidget: true,
    todos: [],
    currentView: "calendar",
    todoCategories: [],
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
    ADD_EVENT_CATEGORY(state, category) {
      state.eventCategories.push(category);
    },
    UPDATE_EVENT_CATEGORY(state, updatedCategory) {
      const index = state.eventCategories.findIndex(
        (c) => c.name === updatedCategory.name
      );
      if (index !== -1) {
        state.eventCategories.splice(index, 1, updatedCategory);
      }
    },
    DELETE_EVENT_CATEGORY(state, categoryName) {
      state.eventCategories = state.eventCategories.filter(
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
    ADD_TODO_CATEGORY(state, category) {
      state.todoCategories.push({ name: category.name });
    },
    UPDATE_TODO_CATEGORY(state, updatedCategory) {
      const index = state.todoCategories.findIndex(
        (c) => c.name === updatedCategory.name
      );
      if (index !== -1) {
        state.todoCategories.splice(index, 1, { name: updatedCategory.name });
      }
    },
    DELETE_TODO_CATEGORY(state, categoryName) {
      state.todoCategories = state.todoCategories.filter(
        (c) => c.name !== categoryName
      );
    },
    LOAD_TODO(state, todos, todocat, events, eventcat, page, display) {
      state.todoCategories = todocat,
      state.todos = todos,
      state.events = events
      state.eventCategories = eventcat,
      state.currentView = page,
      state.displayTodoWidget = display
    }
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
    addEventCategory({ commit }, category) {
      commit("ADD_EVENT_CATEGORY", category);
    },
    updateEventCategory({ commit }, category) {
      commit("UPDATE_EVENT_CATEGORY", category);
    },
    deleteEventCategory({ commit }, categoryName) {
      commit("DELETE_EVENT_CATEGORY", categoryName);
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

    addTodoCategory({ commit }, category) {
      commit("ADD_TODO_CATEGORY", { name: category.name });
    },
    updateTodoCategory({ commit }, category) {
      commit("UPDATE_TODO_CATEGORY", { name: category.name });
    },
    deleteTodoCategory({ commit }, categoryName) {
      commit("DELETE_TODO_CATEGORY", categoryName);
    },
    loadTodo({commit}, todos, todocat, events, eventcat, page, display) {
      commit("LOAD_TODO", todos, todocat, events, eventcat, page, display);
    }
  },
  getters: {
    getEvents: (state) => state.events,
    getEventCategories: (state) => state.eventCategories,
    getShowTodo: (state) => state.displayTodoWidget,
    getTodos: (state) => state.todos,
    getCurrentView: (state) => state.currentView,
    getTodoCategories: (state) => state.todoCategories,
  },
};
