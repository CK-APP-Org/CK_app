export default {
  state: () => ({
    // prettier-ignore
    menuItems: [
      { label: "首頁", icon: "home", link: "/", visible: true, fixed: true },
      { label: "課表", icon: "book", link: "/schedule", visible: true },
      { label: "行事曆", icon: "calendar_month", link: "/todo", visible: true },
      { label: "YouBike", icon: "directions_bike", link: "/Youbike", visible: true },
      { label: "熱食部", icon: "restaurant_menu", link: "/menu", visible: true },
      { label: "美食", icon: "fastfood", link: "/food", visible: true },
      { label: "校網", icon: "newspaper", link: "/news", visible: true },
      { label: "北捷", icon: "directions_subway", link: "/metro", visible: true },
    ],
  }),
  mutations: {
    UPDATE_MENU_ITEMS(state, newMenuItems) {
      state.menuItems = newMenuItems;
    },
    TOGGLE_MENU_ITEM_VISIBILITY(state, index) {
      console.log(1, state.menuItems[index]);
      console.log(2, state.menuItems[index].visible);
      if (!state.menuItems[index].fixed) {
        state.menuItems[index] = {
          ...state.menuItems[index],
          visible: !state.menuItems[index].visible,
        };
      }
    },
  },
  actions: {
    updateMenuItems({ commit }, newMenuItems) {
      commit("UPDATE_MENU_ITEMS", newMenuItems);
    },
    toggleMenuItemVisibility({ commit }, index) {
      commit("TOGGLE_MENU_ITEM_VISIBILITY", index);
    },
  },
  getters: {
    getMenuItems: (state) => state.menuItems,
    getVisibleMenuItems: (state) =>
      state.menuItems.filter((item) => item.visible),
  },
};
