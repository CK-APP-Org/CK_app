export default {
  state: () => ({
    pinnedNews: [],
    lastClearedTime: null,
    displayNewsWidget: true,
    fetchedNews: [],
    lastFetchTime: null,
  }),
  mutations: {
    PIN_NEWS(state, newsItem) {
      state.pinnedNews.push(newsItem);
    },
    UNPIN_NEWS(state, newsItemTitle) {
      state.pinnedNews = state.pinnedNews.filter(
        (item) => item.title !== newsItemTitle
      );
    },
    SET_LAST_CLEARED_TIME(state, time) {
      state.lastClearedTime = time;
    },
    SET_SHOW_NEWS(state, value) {
      state.displayNewsWidget = value;
    },
    LOAD_NEWS(state, { pinned, cleared, display }) {
      state.pinnedNews = pinned;
      state.lastClearedTime = cleared;
      state.displayNewsWidget = display;
    },
    SET_FETCHED_NEWS(state, news) {
      state.fetchedNews = news;
    },
    SET_LAST_FETCH_TIME(state, time) {
      state.lastFetchTime = time;
    },
  },
  actions: {
    pinNews({ commit }, newsItem) {
      commit("PIN_NEWS", newsItem);
    },
    unpinNews({ commit }, newsItemTitle) {
      commit("UNPIN_NEWS", newsItemTitle);
    },
    setLastClearedTime({ commit }, time) {
      commit("SET_LAST_CLEARED_TIME", time);
    },
    loadNews({ commit }, { pinned, cleared, display }) {
      commit("LOAD_NEWS", { pinned, cleared, display });
    },
    setFetchedNews({ commit }, news) {
      commit("SET_FETCHED_NEWS", news);
    },
    setLastFetchTime({ commit }, time) {
      commit("SET_LAST_FETCH_TIME", time);
    },
  },
  getters: {
    getPinnedNews: (state) => state.pinnedNews,
    getLastClearedTime: (state) => state.lastClearedTime,
    getShowSchoolNews: (state) => state.displayNewsWidget,
    getFetchedNews: (state) => state.fetchedNews,
    getLastFetchTime: (state) => state.lastFetchTime,
  },
};
