<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6 col-md-4">
        <q-select
          filled
          @update:model-value="confirmClassChange"
          :options="classOptions"
          v-model="selectedClass"
          label="選擇班級(用於課表資料匯入)"
          class="q-mb-md"
        />

        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">首頁顯示項目設定</div>
            <div class="column q-gutter-y-sm">
              <q-checkbox v-model="showSchedule" label="顯示課表" />
              <q-checkbox v-model="showTodo" label="顯示待辦事項" />
              <q-checkbox v-model="showSchoolNews" label="顯示學校新聞" />
            </div>
          </q-card-section>
        </q-card>

        <q-btn
          color="primary"
          label="清除所有資料"
          @click="confirmClear"
          class="full-width q-mb-md"
        />

      </div>
    </div>

    <!-- Existing dialogs remain unchanged -->
    <q-dialog v-model="confirmDialog">
      <!-- ... (unchanged) ... -->
    </q-dialog>

    <q-dialog v-model="confirmClassChangeDialog">
      <!-- ... (unchanged) ... -->
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

    // Simple checkbox states
    const showSchedule = ref(true);
    const showTodo = ref(true);
    const showSchoolNews = ref(true);

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
      selectedClass,
      showSchedule,
      showTodo,
      showSchoolNews
    };
  },
};
</script>
