<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6 col-md-4">
        <!-- Account Information Card -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">帳號資訊</div>
            <div v-if="isLoggedIn" class="column q-gutter-y-sm">
              <div><strong>名稱:</strong> {{ userAccount }}</div>
              <div><strong>Email:</strong> {{ email }}</div>
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
                label="匯入資料"
                @click="importData"
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
              <p>
                您尚未登入。若欲備份您的資料或匯入已備份之資料，請點擊登入/註冊按鈕。
              </p>
              <q-btn
                color="primary"
                label="登入/註冊"
                @click="goToLoginPage"
                class="full-width q-mt-md"
              />
              <q-btn
                color="negative"
                label="清除所有資料"
                @click="confirmClear"
                class="full-width q-mt-md"
              />
            </div>
          </q-card-section>
        </q-card>
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

    <q-dialog v-model="showBackupDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">註冊成功！歡迎您的加入</div>
        </q-card-section>

        <q-card-section>
          現在您可以備份您的帳號資料了。這將幫助您在更換設備或重新安裝CK
          APP時恢復您的資料。
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="稍後再說" v-close-popup />
          <q-btn
            flat
            label="立即備份"
            color="primary"
            @click="initiateBackup"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showImportDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">歡迎回來，{{ userAccount }}！</div>
        </q-card-section>

        <q-card-section>
          您現在可以匯入之前備份的帳號資料。這將恢復您先前保存的所有設定和資訊。
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="稍後再說" v-close-popup />
          <q-btn
            flat
            label="立即匯入"
            color="primary"
            @click="initiateImport"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showImportWarningDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">警告！</div>
        </q-card-section>

        <q-card-section>
          此操作將使用您最近備份的資料替換當前的本地資料。您的本地資料將會被刪除。是否確定要繼續？
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="確定" color="negative" @click="confirmImport" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { computed, ref, onMounted } from "vue";
import { useStore } from "vuex";
import { useQuasar } from "quasar";
import { useRouter, useRoute } from "vue-router";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";

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
    const route = useRoute();

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

    const isLoggedIn = ref(false);
    const userName = ref("");
    const userEmail = ref("");

    const userAccount = computed(() => store.getters.getUserAccount);
    console.log("484", userAccount);
    const password = computed(() => store.getters.getPassword);
    const email = computed(() => store.getters.getEmail);
    const userRef = ref(null);

    const favoriteRestaurants = computed(
      () => store.getters.getFavoriteRestaurants
    );

    const pinnedNews = computed(() => store.getters.getPinnedNews);
    const lastClearedTime = computed(() => store.getters.getLastClearedTime);

    const events = computed(() => store.getters.getEvents);
    const eventCategories = computed(() => store.getters.getEventCategories);
    const todos = computed(() => store.getters.getTodos);
    const todoCategories = computed(() => store.getters.getTodoCategories);
    const currentView = computed(() => store.getters.getCurrentView);

    const stationList = computed(() => store.getters.getStationList);

    const scheduleData = computed(() => store.getters.getScheduleData);

    const showHomeSettings = ref(false);
    const showToolbarSettings = ref(false);

    const metroStationList = computed(() => store.getters.getMetroStationList);

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

    const importData = () => {
      showImportWarningDialog.value = true;
    };

    const confirmImport = async () => {
      showImportWarningDialog.value = false;
      try {
        const firebaseConfig = {
          apiKey: "AIzaSyAfHEWoaKuz8fiMKojoTEeJWMUzJDgiuVU",
          authDomain: "ck-app-database.firebaseapp.com",
          projectId: "ck-app-database",
          storageBucket: "ck-app-database.appspot.com",
          messagingSenderId: "253500838094",
          appId: "1:253500838094:web:b6bfcf4975f3323ab8c09f",
          measurementId: "G-T79H6D7WRT",
        };

        console.log(userAccount.value);

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        userRef.value = doc(db, "User Data", "Userdata");
        const docSnap = await getDoc(userRef.value);
        const userData = docSnap.data()[userAccount.value] || {};

        // Helper function to convert Firebase timestamp to JavaScript Date
        const convertTimestamp = (timestamp) => {
          if (timestamp && typeof timestamp.toDate === "function") {
            return timestamp.toDate();
          } else if (timestamp && timestamp.seconds) {
            return new Date(timestamp.seconds * 1000);
          }
          return null;
        };

        // Default values
        const defaultValues = {
          Food: { favoriteRestaurants: [] },
          News: { pinnedNews: [], lastClearedTime: null },
          Settings: {
            showSchoolNews: true,
            showSchedule: true,
            showTodo: true,
            menuItems: [
              {
                label: "首頁",
                icon: "home",
                link: "/",
                visible: true,
                fixed: true,
              },
              { label: "課表", icon: "book", link: "/schedule", visible: true },
              {
                label: "行事曆",
                icon: "calendar_month",
                link: "/todo",
                visible: true,
              },
              {
                label: "交通",
                icon: "directions_walk",
                link: "/transport",
                visible: true,
              },
              {
                label: "熱食部",
                icon: "restaurant_menu",
                link: "/menu",
                visible: true,
              },
              { label: "美食", icon: "fastfood", link: "/food", visible: true },
              {
                label: "校網",
                icon: "newspaper",
                link: "/news",
                visible: true,
              },
            ],
          },
          Schedule: { userClass: "101", ScheduleData: null },
          Todo: {
            events: [],
            eventCategories: [{ name: "Default", color: "#ADADAD" }],
            todos: [],
            currentView: "calendar",
            todoCategories: [],
          },
          Youbike: {
            stationList: {
              "YouBike2.0_泉州寧波西街口": {
                nickname: "建中東側門",
                city: "臺北市",
              },
              "YouBike2.0_郵政博物館": {
                nickname: "郵政博物館",
                city: "臺北市",
              },
              "YouBike2.0_植物園": { nickname: "台北植物園", city: "臺北市" },
              "YouBike2.0_捷運中正紀念堂站(2號出口)": {
                nickname: "中正紀念堂站",
                city: "臺北市",
              },
            },
          },
          Metro: { metroStationList: ["中正紀念堂", "小南門", "西門"] },
        };

        // Helper function to get value or default
        const getValueOrDefault = (obj, path, defaultValue) => {
          return (
            path.split(".").reduce((acc, part) => acc && acc[part], obj) ??
            defaultValue
          );
        };

        const favoriteRestaurants = getValueOrDefault(
          userData,
          "Food.favoriteRestaurants",
          defaultValues.Food.favoriteRestaurants
        );
        const pinnedNews = getValueOrDefault(
          userData,
          "News.pinnedNews",
          defaultValues.News.pinnedNews
        ).map((news) => ({
          ...news,
          pubDate: news.pubDate ? new Date(news.pubDate.seconds * 1000) : null,
        }));
        const lastClearedTime = convertTimestamp(
          getValueOrDefault(
            userData,
            "News.lastClearedTime",
            defaultValues.News.lastClearedTime
          )
        );
        const showSchool = getValueOrDefault(
          userData,
          "Settings.showSchoolNews",
          defaultValues.Settings.showSchoolNews
        );
        const classes = getValueOrDefault(
          userData,
          "Schedule.userClass",
          defaultValues.Schedule.userClass
        );
        const schedules = getValueOrDefault(
          userData,
          "Schedule.ScheduleData",
          defaultValues.Schedule.ScheduleData
        );
        const showSchedule = getValueOrDefault(
          userData,
          "Settings.showSchedule",
          defaultValues.Settings.showSchedule
        );
        const events = getValueOrDefault(
          userData,
          "Todo.events",
          defaultValues.Todo.events
        ).map((event) => ({
          ...event,
          startDate: convertTimestamp(event.startDate),
          endDate: convertTimestamp(event.endDate),
        }));
        const eventCategories = getValueOrDefault(
          userData,
          "Todo.eventCategories",
          defaultValues.Todo.eventCategories
        );
        const todos = getValueOrDefault(
          userData,
          "Todo.todos",
          defaultValues.Todo.todos
        ).map((todo) => ({
          ...todo,
          date: convertTimestamp(todo.date),
        }));
        const currentView = getValueOrDefault(
          userData,
          "Todo.currentView",
          defaultValues.Todo.currentView
        );
        const todoCategories = getValueOrDefault(
          userData,
          "Todo.todoCategories",
          defaultValues.Todo.todoCategories
        );
        const showTodo = getValueOrDefault(
          userData,
          "Settings.showTodo",
          defaultValues.Settings.showTodo
        );
        const StationList = getValueOrDefault(
          userData,
          "Youbike.stationList",
          defaultValues.Youbike.stationList
        );
        const metroStationList = getValueOrDefault(
          userData,
          "Metro.metroStationList",
          defaultValues.Metro.metroStationList
        );
        const menuItems = getValueOrDefault(
          userData,
          "Settings.menuItems",
          defaultValues.Settings.menuItems
        );

        if (schedules === null) {
          $q.notify({
            message: "您尚未備份過或備份資料不完整",
            color: "warning",
            position: "bottom",
            timeout: 2000,
          });
          return;
        }

        store.dispatch("loadRestaurants", favoriteRestaurants);
        store.dispatch("loadNews", {
          pinned: pinnedNews,
          cleared: lastClearedTime,
          display: showSchool,
        });
        store.dispatch("loadingSchedule", {
          schedules: schedules,
          classes: classes,
          showSchedule: showSchedule,
        });
        store.dispatch("loadTodo", {
          todos: todos,
          todoCategories: todoCategories,
          events: events,
          eventCategories: eventCategories,
          currentView: currentView,
          displayTodoWidget: showTodo,
        });
        store.dispatch("loadStation", StationList);
        store.dispatch("loadMetro", metroStationList);
        store.dispatch("updateMenuItems", menuItems);

        $q.notify({
          message: "成功匯入資料",
          color: "positive",
          position: "bottom",
          timeout: 2000,
        });
      } catch (error) {
        console.error("Error importing data from Firebase:", error);
        $q.notify({
          message: "資料匯入時發生錯誤",
          color: "negative",
          position: "bottom",
          timeout: 2000,
        });
      }
    };

    const showBackupDialog = ref(false);

    const initiateBackup = () => {
      // Call your existing saveData function here
      saveData();
    };

    const showImportDialog = ref(false);

    const initiateImport = () => {
      importData();
      showImportDialog.value = false;
    };

    const showImportWarningDialog = ref(false);

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

    onMounted(() => {
      console.log(email.value);
      isLoggedIn.value = userAccount.value != "Default";

      if (route.query.justLoggedIn === "true") {
        showImportDialog.value = true;
      }

      if (route.query.newAccount === "true") {
        showBackupDialog.value = true;
      }
    });

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

      const loadingNotif = $q.notify({
        message: "備份中...",
        color: "info",
        position: "bottom",
        timeout: 0,
      });

      try {
        await Promise.race([
          (async () => {
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

            userRef.value = doc(db, "User Data", "Userdata");

            // Helper function to convert Date to Firestore Timestamp
            const dateToTimestamp = (date) => {
              return date instanceof Date ? Timestamp.fromDate(date) : null;
            };

            // Helper function to process arrays with dates
            const processArrayWithDates = (arr, dateFields) => {
              return arr.map((item) => {
                const newItem = { ...item };
                dateFields.forEach((field) => {
                  if (item[field]) {
                    newItem[field] = dateToTimestamp(item[field]);
                  }
                });
                return newItem;
              });
            };

            const newUserData = {
              Email: email.value,
              Password: password.value,
              Schedule: {
                ScheduleData: scheduleData.value,
                userClass: userClass.value,
              },
              Youbike: { stationList: stationList.value },
              News: {
                pinnedNews: processArrayWithDates(pinnedNews.value, [
                  "pubDate",
                ]),
                lastClearedTime: dateToTimestamp(lastClearedTime.value),
              },
              Food: {
                favoriteRestaurants: favoriteRestaurants.value,
                userRatings: {},
              },
              Todo: {
                events: processArrayWithDates(events.value, [
                  "startDate",
                  "endDate",
                ]),
                eventCategories: eventCategories.value,
                todos: processArrayWithDates(todos.value, ["date"]),
                currentView: currentView.value,
                todoCategories: todoCategories.value,
              },
              Settings: {
                showSchedule: showSchedule.value,
                showTodo: showTodo.value,
                showSchoolNews: showSchoolNews.value,
                menuItems: menuItems.value,
              },
              Metro: {
                metroStationList: metroStationList.value,
              },
            };

            const updatePath = `${userAccount.value}`;
            await updateDoc(userRef.value, { [updatePath]: newUserData });
          })(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 10000)
          ),
        ]);

        loadingNotif();

        $q.notify({
          message: "資料已成功備份到資料庫",
          color: "positive",
          position: "bottom",
          timeout: 2000,
        });
      } catch (error) {
        console.error("Error saving data to Firebase:", error);

        loadingNotif();

        let errorMessage = "備份資料時發生錯誤";
        if (error.message === "Timeout") {
          errorMessage = "備份超時，請檢查您的網路連接並重試";
        } else if (
          error.name === "NetworkError" ||
          error.message.includes("network") ||
          error.message.includes("ERR_NAME_NOT_RESOLVED")
        ) {
          errorMessage = "網路連接失敗，請檢查您的網路連接並重試";
        }

        $q.notify({
          message: errorMessage,
          color: "negative",
          position: "bottom",
          timeout: 2000,
        });
      }
    };

    const logout = async () => {
      try {
        store.dispatch("setUserAccount", "Default");
        // localStorage.clear();
        $q.notify({
          message: "已成功登出",
          color: "positive",
          position: "bottom",
          timeout: 2000,
        });
        router.push("/");
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
      saveData,
      logout,
      goToLoginPage,
      userAccount,
      email,
      password,
      importData,
      showBackupDialog,
      initiateBackup,
      showImportDialog,
      initiateImport,
      showImportWarningDialog,
      confirmImport,
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
