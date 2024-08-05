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
      console.log("Loaded");
      store.dispatch("loadSchedule");
    });
  },
});
</script>
