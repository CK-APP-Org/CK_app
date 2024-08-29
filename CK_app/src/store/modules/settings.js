export default {
  state: () => ({
    menuItems: [
      { label: "首頁", icon: "home", link: "/", visible: true, fixed: true },
      { label: "課表", icon: "book", link: "/schedule", visible: true },
      { label: "行事曆", icon: "calendar_month", link: "/todo", visible: true },
      {
        label: "交通",
        icon: "directions_walk",
        link: "/transport",
        visible: true,
      },
      {
        label: "熱食部",
        icon: "restaurant_menu",
        link: "/menu",
        visible: true,
      },
      { label: "美食", icon: "fastfood", link: "/food", visible: true },
      { label: "校網", icon: "newspaper", link: "/news", visible: true },
    ],
  }),
  mutations: {
    UPDATE_MENU_ITEMS(state, newMenuItems) {
      state.menuItems = newMenuItems;
    },
    TOGGLE_MENU_ITEM_VISIBILITY(state, { index, newValue }) {
      if (
        index >= 0 &&
        index < state.menuItems.length &&
        !state.menuItems[index].fixed
      ) {
        state.menuItems[index] = {
          ...state.menuItems[index],
          visible:
            newValue !== undefined ? newValue : !state.menuItems[index].visible,
        };
      }
    },
  },
  actions: {
    updateMenuItems({ commit }, newMenuItems) {
      commit("UPDATE_MENU_ITEMS", newMenuItems);
    },
    toggleMenuItemVisibility({ commit }, { index, newValue }) {
      commit("TOGGLE_MENU_ITEM_VISIBILITY", { index, newValue });
    },
  },
  getters: {
    getMenuItems: (state) => state.menuItems,
    getVisibleMenuItems: (state) =>
      state.menuItems.filter((item) => item.visible),
  },
};
