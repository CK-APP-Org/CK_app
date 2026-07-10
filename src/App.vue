<template>
  <router-view />
</template>

<script>
import { defineComponent, onMounted } from "vue";
import { useStore } from "vuex";
import newsService from "./services/newsService";
import { register } from "timeago.js";
import zh_TW from "timeago.js/lib/lang/zh_TW";

register("zh_TW", zh_TW); //Set the timeago of NewsPage to zh-tw

export default defineComponent({
  setup() {
    const store = useStore();

    onMounted(() => {
      // Start the background news fetching
      newsService.startBackgroundFetch();

      if (store.getters.getScheduleData.length === 0) {
        store.dispatch("loadSchedule");
      }
    });
  },
});
</script>
