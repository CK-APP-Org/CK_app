<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">帳號資訊</div>
            <div v-if="isLoggedIn" class="column q-gutter-y-sm">
              <div><strong>帳號名稱:</strong> {{ userName }}</div>
              <div><strong>Email:</strong> {{ userEmail }}</div>
              <q-btn
                color="negative"
                label="登出"
                @click="logout"
                class="full-width q-mt-md"
              />
              <q-btn
                color="negative"
                label="清除所有資料"
                @click="confirmClear"
                class="full-width q-mt-md"
              />
              <q-btn
                color="primary"
                label="備份資料"
                @click="saveData"
                class="full-width q-mt-md"
              />
            </div>
            <div v-else class="column q-gutter-y-sm">
              <p>您尚未登入</p>
              <q-btn
                color="primary"
                label="登入/註冊"
                @click="goToLoginPage"
                class="full-width q-mt-md"
              />
            </div>
          </q-card-section>
        </q-card>
        <div class="col-12 col-sm-6 col-md-4">
          <q-select
            filled
            @update:model-value="confirmClassChange"
            :options="classOptions"
            v-model="selectedClass"
            label="選擇班級(用於課表資料匯入)"
            class="q-mb-md"
          />
          <!--
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">主題顏色設定</div>
            <q-select
              v-model="themeColor"
              :options="colorOptions"
              label="選擇主題顏色"
              emit-value
              map-options
            >
              <template v-slot:option="{ itemProps, opt, toggleOption }">
                <q-item v-bind="itemProps" @click="toggleOption(opt)">
                  <q-item-section avatar>
                    <q-avatar :color="opt.value" text-color="white">
                      {{ opt.label.charAt(0) }}
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-card-section>
        </q-card>
        -->
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
        </div>
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
import { computed, ref, onMounted } from "vue";
import { useStore } from "vuex";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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
    const firebaseConfig = {
      apiKey: "AIzaSyAfHEWoaKuz8fiMKojoTEeJWMUzJDgiuVU",
      authDomain: "ck-app-database.firebaseapp.com",
      projectId: "ck-app-database",
      storageBucket: "ck-app-database.appspot.com",
      messagingSenderId: "253500838094",
      appId: "1:253500838094:web:b6bfcf4975f3323ab8c09f",
      measurementId: "G-T79H6D7WRT",
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    const userRef = doc(db, "User Data", "Userdata");

    const isLoggedIn = ref(false);
    const userName = ref("");
    const userEmail = ref("");

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
      $q.notify({
        message: `已刪除所有資料`,
        color: "positive",
        position: "bottom",
        timeout: 2000,
      });
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

    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          isLoggedIn.value = true;
          userName.value = user.displayName || "";
          userEmail.value = user.email || "";
          fetchUserData(user.uid);
        } else {
          isLoggedIn.value = false;
          userName.value = "";
          userEmail.value = "";
        }
      });
    });

    const fetchUserData = async (userId) => {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        Object.entries(userData).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
          store.commit(`SET_${key.toUpperCase()}`, value);
        });
      }
    };

    const saveData = async () => {
      if (!isLoggedIn.value) {
        $q.notify({
          message: "請先登入以備份資料",
          color: "negative",
          position: "bottom",
          timeout: 2000,
        });
        return;
      }

      const userId = auth.currentUser.uid;
      const userData = {};

      // Collect all data from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        userData[key] = JSON.parse(localStorage.getItem(key));
      }

      try {
        await setDoc(doc(db, "users", userId), userData);
        $q.notify({
          message: "資料已成功備份到 Firebase",
          color: "positive",
          position: "bottom",
          timeout: 2000,
        });
      } catch (error) {
        console.error("Error saving data to Firebase:", error);
        $q.notify({
          message: "備份資料時發生錯誤",
          color: "negative",
          position: "bottom",
          timeout: 2000,
        });
      }
    };

    const logout = async () => {
      try {
        await auth.signOut();
        store.dispatch("clearUserData");
        localStorage.clear();
        $q.notify({
          message: "已成功登出",
          color: "positive",
          position: "bottom",
          timeout: 2000,
        });
        router.push("/login");
      } catch (error) {
        console.error("Error signing out:", error);
        $q.notify({
          message: "登出時發生錯誤",
          color: "negative",
          position: "bottom",
          timeout: 2000,
        });
      }
    };

    const goToLoginPage = () => {
      router.push("/login");
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
      isLoggedIn,
      userName,
      userEmail,
      saveData,
      logout,
      goToLoginPage,
    };
  },
};
</script>
