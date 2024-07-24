<template>
  <q-page class="q-pa-md">
    <div class="row">
      <div class="col-12 col-sm-6 col-md-4 q-gutter-y-md">
        <q-select
          filled
          @update:model-value="confirmClassChange"
          :options="classOptions"
          v-model="selectedClass"
          label="選擇班級(用於課表資料匯入)"
          class="w-full"
        />

        <q-btn
          color="primary"
          label="清除所有資料"
          @click="confirmClear"
          class="w-full"
        />
      </div>
    </div>

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

    <q-dialog v-model="confirmClassChangeDialog">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm" style="font-size: 1.5rem;">確定更改班級為 <strong>{{ selectedClass }}</strong>?</span>
          <span class="q-ml-sm">(請注意，本動作會導致所有過去自訂的顏色和標籤全部消失並無法復原)</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" @click="cancelClassChange" />
          <q-btn
            flat
            label="確定"
            color="primary"
            @click="updateUserClass"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed } from "vue";
import { useStore } from "vuex";

const classOptions = [217, 227];

export default {
  setup() {
    const store = useStore();
    const confirmDialog = ref(false);
    const confirmClassChangeDialog = ref(false);
    const userClass = computed(() => store.getters.getUserClass);
    const selectedClass = ref(userClass.value);

    const confirmClear = () => {
      confirmDialog.value = true;
    };

    const clearAllData = () => {
      store.dispatch("clearALL");
    };

    const confirmClassChange = (newClass) => {
      selectedClass.value = newClass;
      confirmClassChangeDialog.value = true;
    };

    const updateUserClass = () => {
      store.dispatch("setUserClass", selectedClass.value);
      store.dispatch("loadSchedule");
      confirmClassChangeDialog.value = false;
    };

    const cancelClassChange = () => {
      selectedClass.value = userClass.value;
      confirmClassChangeDialog.value = false;
    };

    return {
      confirmDialog,
      confirmClassChangeDialog,
      confirmClear,
      clearAllData,
      classOptions,
      confirmClassChange,
      updateUserClass,
      cancelClassChange,
      userClass,
      selectedClass
    };
  },
};
</script>
