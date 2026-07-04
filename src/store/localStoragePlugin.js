export const localStoragePlugin = (store) => {
  // Initialize store state from localStorage only if it exists
  const savedState = JSON.parse(localStorage.getItem("store"));
  if (savedState) {
    store.replaceState(Object.assign({}, store.state, savedState));
  }

  // Save to localStorage after each mutation, except for CLEAR_DATA
  store.subscribe((mutation, state) => {
    if (mutation.type !== "CLEAR_DATA") {
      localStorage.setItem("store", JSON.stringify(state));
    }
  });
};
