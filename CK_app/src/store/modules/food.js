export default {
  state: () => ({
    favoriteRestaurants: [],
  }),
  mutations: {
    ADD_FAVORITE_RESTAURANT(state, restaurant) {
      state.favoriteRestaurants.push(restaurant);
    },
    REMOVE_FAVORITE_RESTAURANT(state, restaurantName) {
      state.favoriteRestaurants = state.favoriteRestaurants.filter(
        (item) => item.name !== restaurantName
      );
    },
    LOAD_RESTAURANTS(state, restaurants) {
      state.favoriteRestaurants = restaurants
    }
  },
  actions: {
    addFavoriteRestaurant({ commit }, restaurant) {
      commit("ADD_FAVORITE_RESTAURANT", restaurant);
    },
    removeFavoriteRestaurant({ commit }, restaurantContent) {
      commit("REMOVE_FAVORITE_RESTAURANT", restaurantContent);
    },
    loadRestaurants({ commit }, restaurants) {
      commit("LOAD_RESTAURANTS", restaurants);
    }
  },
  getters: {
    getFavoriteRestaurants: (state) => state.favoriteRestaurants,
  },
};
