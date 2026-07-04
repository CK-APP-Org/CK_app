<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6 col-md-4">
        <!-- Settings Cards -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">設定</div>
            <q-list>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="school" />
                </q-item-section>
                <q-item-section>
                  <q-select
                    disable
                    filled
                    @update:model-value="confirmClassChange"
                    :options="classOptions"
                    v-model="selectedClass"
                    label="選擇班級(用於課表資料匯入)"
                    style="padding: 8px 0"
                  />
                </q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="showHomeSettings = true">
                <q-item-section avatar>
                  <q-icon name="home" />
                </q-item-section>
                <q-item-section>首頁顯示項目設定</q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" />
                </q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="showToolbarSettings = true">
                <q-item-section avatar>
                  <q-icon name="build" />
                </q-item-section>
                <q-item-section>自訂工具列</q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 首頁顯示項目設定 Dialog -->
    <q-dialog v-model="showHomeSettings">
      <q-card>
        <q-card-section>
          <div class="text-h6">首頁顯示項目設定</div>
        </q-card-section>
        <q-card-section>
          <q-list>
            <q-item tag="label" v-ripple>
              <q-item-section>
                <q-item-label>目前課程</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="showSchedule" color="primary" />
              </q-item-section>
            </q-item>
            <q-item tag="label" v-ripple>
              <q-item-section>
                <q-item-label>今日待辦事項</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="showTodo" color="primary" />
              </q-item-section>
            </q-item>
            <q-item tag="label" v-ripple>
              <q-item-section>
                <q-item-label>釘選校網內容</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="showSchoolNews" color="primary" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="關閉" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 自訂工具列 Dialog -->
    <q-dialog v-model="showToolbarSettings">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">自訂工具列</div>
        </q-card-section>
        <q-card-section>
          <q-list separator>
            <q-item v-for="(item, index) in menuItems" :key="index">
              <q-item-section avatar>
                <q-icon :name="item.icon" />
              </q-item-section>
              <q-item-section>{{ item.label }}</q-item-section>
              <q-item-section side>
                <q-toggle
                  v-if="!item.fixed"
                  v-model="item.visible"
                  @update:model-value="(val) => toggleVisibility(index, val)"
                  :disable="item.fixed"
                />
              </q-item-section>
              <q-item-section side>
                <q-btn-group flat>
                  <q-btn
                    flat
                    dense
                    round
                    icon="arrow_upward"
                    @click="moveItem(index, -1)"
                    :disable="index === 0"
                  />
                  <q-btn
                    flat
                    dense
                    round
                    icon="arrow_downward"
                    @click="moveItem(index, 1)"
                    :disable="index === menuItems.length - 1"
                  />
                </q-btn-group>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="關閉" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmDialog">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">確定清除所有本地資料?注意，此動作無法復原</span>
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
          <span class="q-ml-sm" style="font-size: 1.5rem"
            >確定更改班級為 <strong>{{ selectedClass }}</strong
            >?</span
          >
          <span class="q-ml-sm"
            >(請注意，本動作會導致所有過去自訂的顏色和標籤全部消失並無法復原)</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" @click="cancelClassChange" />
          <q-btn flat label="確定" color="primary" @click="updateUserClass" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";

const classOptions = [
  101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115,
  116, 117, 118, 119, 120, 121, 122, 123, 125, 126, 127, 128, 201, 202, 203,
  204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218,
  219, 220, 221, 222, 223, 225, 226, 227, 328, 301, 302, 303, 304, 305, 306,
  307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321,
  322, 323, 325, 326, 327, 328,
];

const themeColors = [
  { label: "藍色", value: "#1976D2" },
  { label: "紅色", value: "#C10015" },
  { label: "綠色", value: "#4CAF50" },
  { label: "紫色", value: "#9C27B0" },
  { label: "橙色", value: "#FF9800" },
];

export default {
  setup() {
    const $q = useQuasar();
    const store = useStore();
    const confirmDialog = ref(false);
    const confirmClassChangeDialog = ref(false);
    const userClass = computed(() => store.getters.getUserClass);
    const selectedClass = ref(userClass.value);

    const router = useRouter();

    const showHomeSettings = ref(false);
    const showToolbarSettings = ref(false);

    // Theme color
    const themeColor = ref("#1976D2"); // Default to blue

    // Watch for theme color changes and apply them
    /*
    watch(
      themeColor,
      (newColor) => {
        $q.dark.set(false); // Ensure light mode is active
        document.body.style.setProperty("--q-primary", newColor);
      },
      { immediate: true }
    );
    */

    // Computed properties for checkbox states
    const showSchedule = computed({
      get: () => store.getters.getShowSchedule,
      set: (value) => store.commit("SET_SHOW_SCHEDULE", value),
    });

    const showTodo = computed({
      get: () => store.getters.getShowTodo,
      set: (value) => store.commit("SET_SHOW_TODO", value),
    });

    const showSchoolNews = computed({
      get: () => store.getters.getShowSchoolNews,
      set: (value) => store.commit("SET_SHOW_NEWS", value),
    });

    const confirmClear = () => {
      confirmDialog.value = true;
    };

    const clearAllData = () => {
      store.dispatch("clearALL");
      store.dispatch("loadSchedule");
      $q.notify({
        message: `已刪除所有資料`,
        color: "positive",
        position: "bottom",
        timeout: 2000,
      });
      router.push("/");
    };

    const confirmClassChange = (newClass) => {
      selectedClass.value = newClass;
      confirmClassChangeDialog.value = true;
    };

    const updateUserClass = () => {
      store.dispatch("setUserClass", selectedClass.value);
      store.dispatch("loadSchedule");
      confirmClassChangeDialog.value = false;

      $q.notify({
        message: `已成功更改班級為 ${selectedClass.value}`,
        color: "positive",
        position: "bottom",
        timeout: 2000,
      });
    };

    const cancelClassChange = () => {
      selectedClass.value = userClass.value;
      confirmClassChangeDialog.value = false;
    };

    const toggleVisibility = (index, newValue) => {
      store.dispatch("toggleMenuItemVisibility", { index, newValue });
    };

    const menuItems = computed({
      get: () => store.getters.getMenuItems,
      set: (newItems) => store.dispatch("updateMenuItems", newItems),
    });

    const moveItem = (index, direction) => {
      const newItems = [...menuItems.value];
      const item = newItems.splice(index, 1)[0];
      newItems.splice(index + direction, 0, item);
      store.dispatch("updateMenuItems", newItems);
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
      showSchoolNews,
      themeColor,
      themeColors,
      menuItems,
      toggleVisibility,
      moveItem,
      showHomeSettings,
      showToolbarSettings,
    };
  },
};
</script>

<style scoped>
.custom-menu-item {
  padding: 8px 16px;
}
.custom-menu-item .q-item__section--side {
  padding-right: 0;
}
.custom-menu-item .q-item__section--avatar {
  min-width: 40px;
}
</style>
