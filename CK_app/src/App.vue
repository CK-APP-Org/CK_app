<template>
  <router-view />
</template>

<script>
import { defineComponent } from "vue";
import { onMounted } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const store = useStore();

    onMounted(() => {
      if (store.getters.getScheduleData.length === 0) {
        store.dispatch("loadSchedule");
        console.log("Loaded");
      }
    });
  },
});
</script>
