<template>
  <q-page class="flex flex-center">
    <q-btn color="primary" label="Clear All Data" @click="confirmClear" />

    <q-dialog v-model="confirmDialog">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">確定重置所有資料?注意，此動作無法復原</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn
            flat
            label="確定"
            color="negative"
            @click="clearAllData"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref } from "vue";
import { useStore } from "vuex";

export default {
  setup() {
    const store = useStore();
    const confirmDialog = ref(false);

    const confirmClear = () => {
      confirmDialog.value = true;
    };

    const clearAllData = () => {
      store.dispatch("clearALL");
    };

    return {
      confirmDialog,
      confirmClear,
      clearAllData,
    };
  },
};
</script>
