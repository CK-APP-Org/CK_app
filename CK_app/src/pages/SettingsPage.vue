<template>
  <q-page class="q-pa-md">
      <div v-if="loading" class="loading-spinner">
        <q-spinner size="3em" color="primary" />
      </div>
      <div v-else class="row q-col-gutter-md">
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
            label="移除帳號"
            @click="confirmClear"
            class="full-width q-mb-md"
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
import { computed, ref, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { useQuasar } from "quasar";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import axios from "axios";

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
    const userAccount = computed(() => store.getters.getUserAccount);

    const userClass = ref('317');
    const selectedClass = ref("載入中");

    const userData = ref(null);
    const userRef = ref(null);  // Declare userRef here
    const loading = ref(true);


    const showSchedule = ref(true)
    const showTodo = ref(true)
    const showSchoolNews = ref(true)

    const SCHEDULE_URL = "https://raw.githubusercontent.com/CK-APP-Org/ScheduleData/main/ClassesSchedule.json";

    // Inside the setup function
    watch(showSchedule, (newValue) => {
      updateSettingInFirebase('showSchedule', newValue);
    });

    watch(showTodo, (newValue) => {
      updateSettingInFirebase('showTodo', newValue);
    });

    watch(showSchoolNews, (newValue) => {
      updateSettingInFirebase('showSchoolNews', newValue);
    });

    onMounted(async () => {
      loading.value = true;
      console.log(userAccount.value)
      const firebaseConfig = {
        apiKey: "AIzaSyAfHEWoaKuz8fiMKojoTEeJWMUzJDgiuVU",
        authDomain: "ck-app-database.firebaseapp.com",
        projectId: "ck-app-database",
        storageBucket: "ck-app-database.appspot.com",
        messagingSenderId: "253500838094",
        appId: "1:253500838094:web:b6bfcf4975f3323ab8c09f",
        measurementId: "G-T79H6D7WRT"
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      userRef.value = doc(db, 'User Data', 'Userdata');  // Initialize userRef here
      const docSnap = await getDoc(userRef.value);
      userData.value = docSnap.data()[userAccount.value];
      userClass.value = userData.value["Schedule"]["userClass"];
      showSchedule.value = userData.value["Settings"]["showSchedule"];
      showTodo.value = userData.value["Settings"]["showTodo"];
      showSchoolNews.value = userData.value["Settings"]["showSchoolNews"];
      selectedClass.value = userClass.value;
      loading.value = false;
    });

    // Computed properties for checkbox states


    const confirmClear = () => {
      confirmDialog.value = true;
    };

    const clearAllData = async () => {
      const updatePath = `${userAccount.value}`;
      await updateDoc(userRef.value, {[updatePath]: deleteField()});  
      store.dispatch("clearALL");
      $q.notify({
        message: `已刪除此帳號`,
        color: "positive",
        position: "bottom",
        timeout: 2000,
      });
    };

    const confirmClassChange = (newClass) => {
      selectedClass.value = newClass;
      confirmClassChangeDialog.value = true;
    };

    const updateUserClass = async () => {
      const updatePath = `${userAccount.value}.Schedule.userClass`;
      await updateDoc(userRef.value, {[updatePath]: selectedClass.value});
      store.dispatch("setUserClass", selectedClass.value);
      const response = await axios.get(SCHEDULE_URL);
      const scheduleData = response.data[selectedClass.value]["schedule"];
      const updatePath2 = `${userAccount.value}.Schedule.ScheduleData`;
      await updateDoc(userRef.value, {[updatePath2]: scheduleData});
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

    const updateSettingInFirebase = async (setting, value) => {
      try {
        const updatePath = `${userAccount.value}.Settings.${setting}`;
        await updateDoc(userRef.value, {[updatePath]: value});
        $q.notify({
          message: `已更新設定`,
          color: "positive",
          position: "bottom",
          timeout: 2000,
        });
      } catch (error) {
        console.error(`Error updating ${setting}:`, error);
        $q.notify({
          message: `更新設定失敗`,
          color: "negative",
          position: "bottom",
          timeout: 2000,
        });
      }
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
      loading
    };
  },
};
</script>

<style scoped>

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Full viewport height */
}

</style>
