<template>
  <router-view />
</template>

<script>
import { defineComponent, onMounted } from "vue";
import { useStore } from "vuex";
import newsService from "./services/newsService";

export default defineComponent({
  setup() {
    const store = useStore();

    onMounted(() => {
      // Start the background news fetching
      newsService.startBackgroundFetch();

      // Your existing code (commented out) can remain here if needed
      // if (store.getters.getScheduleData.length === 0) {
      //   store.dispatch("loadSchedule");
      //   console.log("Loaded");
      // }
    });
  },
});
</script>
