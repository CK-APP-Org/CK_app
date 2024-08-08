<template>
  <div class="app-container">
    <!-- Loading Spinner -->
    <div v-if="loading" class="loading-spinner">
      <q-spinner size="3em" color="primary" />
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- New Banner Component -->
      <q-banner class="bg-primary text-white q-mb-md" rounded>
        <template v-slot:avatar>
          <q-icon name="announcement" color="white" size="md" />
        </template>
        CKAPP第二版隆重推出
      </q-banner>

      <!-- Current Class Section -->
      <div class="current-class-section q-mb-md" v-if="showSchedule">
        <q-card class="cursor-pointer">
          <q-card-section :style="{ backgroundColor: currentClass.color }">
            <div class="row items-center q-mb-sm">
              <div class="text-h6 q-mr-sm">目前課程</div>
              <q-btn
                flat
                dense
                round
                icon="arrow_forward_ios"
                color="primary"
                size="0.8em"
                href="/#/schedule"
              />
            </div>
            <div style="font-weight: bold; font-size: x-large">
              {{ currentClass.subject }}
            </div>
            <q-separator class="q-my-sm" />
            <div class="text-caption">課程備註：</div>
            <div>{{ currentClass.note }}</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Todo Tasks Section -->
      <div class="todo-tasks-section q-mb-md" v-if="showTodo">
        <q-card>
          <q-card-section class="bg-blue-1">
            <div class="row items-center q-mb-sm">
              <div class="text-h6 q-mr-sm">今日待辦事項</div>
              <q-btn
                flat
                dense
                round
                icon="arrow_forward_ios"
                color="primary"
                size="0.8em"
                href="/#/todo"
              />
            </div>
            <q-list dense>
              <q-item v-for="task in todayTodos" :key="task.id">
                <q-item-section avatar>
                  <q-checkbox
                    v-model="task.completed"
                    @update:model-value="onTodoCheck(task)"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ task.title }}</q-item-label>
                  <q-item-label caption v-if="task.category">{{
                    task.category.name
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-if="todayTodos.length === 0" class="text-center q-pa-md">
              今天沒有待辦事項
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Pinned School News Section -->
      <div class="school-news-section q-mb-md" v-if="showSchoolNews">
        <q-card>
          <q-card-section class="bg-blue-1">
            <div class="row items-center q-mb-sm">
              <div class="text-h6 q-mr-sm">釘選校網內容</div>
              <q-btn
                flat
                dense
                round
                icon="arrow_forward_ios"
                color="primary"
                size="0.8em"
                href="/#/news"
              />
            </div>
            <q-list dense v-if="pinnedNews.length > 0">
              <q-item
                v-for="(news, index) in pinnedNews"
                :key="index"
                clickable
                v-ripple
                :href="news.link"
              >
                <q-item-section side>
                  <q-icon name="fiber_manual_record" size="xs" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ news.title }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-center q-pa-md">無釘選內容</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Icon Grid -->
      <div class="icon-grid">
        <div v-for="item in filteredItems" :key="item.name" class="icon-item">
          <q-btn
            stack
            class="icon-btn"
            :rounded="true"
            @click="navigateTo(item.link)"
          >
            <q-icon :name="item.icon" size="2.5em" />
            <div class="text-content text-capitalize">{{ item.name }}</div>
          </q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { onMounted, ref, computed } from "vue";
import { useQuasar } from "quasar";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import loadingSchedule from "../data/loadingSchedule.json";

export default {
  setup() {
    const store = useStore();
    const router = useRouter();
    const $q = useQuasar();

    const userAccount = computed(() => store.getters.getUserAccount);
    const scheduleData = ref(loadingSchedule.schedule);
    const todos = ref([]);
    const pinnedNews = ref([])

    const showSchedule = ref(false)
    const showTodo = ref(false)
    const showSchoolNews = ref(false)

    const userData = ref(null);
    const userRef = ref(null); // Declare userRef here

    const loading = ref(true);

    const search = ref("");
    const items = ref([
      { name: "課表", icon: "book", link: "/schedule" },
      { name: "行事曆", icon: "calendar_month", link: "/todo" },
      { name: "YouBike", icon: "directions_bike", link: "/Youbike" },
      { name: "熱食部", icon: "restaurant_menu", link: "/menu" },
      { name: "美食", icon: "fastfood", link: "/food" },
      { name: "校網", icon: "newspaper", link: "/news" },
      // { name: "登入", icon: "login", link: "/login" },
    ]);

    const colorOptions = [
      { label: "Default", value: "#f4f4f1" },
      { label: "Red", value: "#FFCCCB" },
      { label: "Orange", value: "#f5c884" },
      { label: "Yellow", value: "#FFFFE0" },
      { label: "Green", value: "#90EE90" },
      { label: "Blue", value: "#ADD8E6" },
      { label: "Purple", value: "#e299ff" },
      { label: "Pink", value: "#ffa1e4" },
    ];

    onMounted(async () => {
      // Set loading to true before data fetching
      loading.value = true;
      
      // Your existing data fetching logic
      console.log(userAccount.value);
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

      userRef.value = doc(db, "User Data", "Userdata"); // Initialize userRef here
      const docSnap = await getDoc(userRef.value);
      userData.value = docSnap.data()[userAccount.value];
      scheduleData.value = userData.value["Schedule"]["ScheduleData"];
      showSchedule.value = userData.value["Settings"]["showSchedule"];
      showTodo.value = userData.value["Settings"]["showTodo"];
      showSchoolNews.value = userData.value["Settings"]["showSchoolNews"];
      console.log(userData.value["Todo"]["todos"]);
      pinnedNews.value = userData.value["News"]["pinnedNews"];
      todos.value = userData.value["Todo"]["todos"].map((event) => ({
        ...event,
        date: event.date ? event.date.toDate() : null,
      }));

      
      // Set loading to false once data fetching is complete
      loading.value = false;
    });

    const filteredItems = computed(() => {
      return items.value.filter((item) =>
        item.name.toLowerCase().includes(search.value.toLowerCase())
      );
    });


    const todayTodos = computed(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return todos.value.filter((todo) => {
        const todoDate = new Date(todo.date);
        todoDate.setHours(0, 0, 0, 0);
        return todoDate.getTime() === today.getTime() && !todo.completed;
      });
    });

    const currentClass = computed(() => {
      const now = new Date();
      const currentDay = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][now.getDay()];
      const currentHour = now.getHours();
      const currentPeriod =
        ["一", "二", "三", "四", "五", "五", "六", "七"][currentHour - 8] || "課後";
      
      if (
        currentPeriod < 1 ||
        currentPeriod > 7 ||
        currentDay === "Saturday" ||
        currentDay === "Sunday"
      ) {
        return {
          subject: "目前無課",
          note: "現在是下課時間或假日",
          color: "#f4f4f1",
        };
      }
      
      const currentClassData = scheduleData.value.find(
        (row) => row.name === currentPeriod
      )?.[currentDay.toString()];
      
      const getFormattedColor = (color) => {
        if (color && typeof color === "object" && color.label) {
          return color.label;
        }
        return color || "Default";
      };
      
      const getLabelValue = (label) => {
        const option = colorOptions.find((opt) => opt.label === label);
        return option ? option.value : "#f4f4f1";
      };
      
      return currentClassData
        ? {
            subject: currentPeriod + ": " + currentClassData.subject,
            note: currentClassData.note,
            color: getLabelValue(getFormattedColor(currentClassData.color)),
          }
        : {
            subject: "目前無課",
            note: "這個時段沒有安排課程",
            color: "#f4f4f1",
          };
    });

    const navigateTo = (link) => {
      router.push(link);
    };

    const onTodoCheck = (todo) => {
      store.dispatch("deleteTodo", todo.id);
    };

    return {
      search,
      items,
      filteredItems,
      currentClass,
      todos,
      pinnedNews,
      showSchedule,
      showSchoolNews,
      showTodo,
      todayTodos,
      navigateTo,
      onTodoCheck,
      loading,
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

.app-container {
  padding: 25px;
  font-weight: bold;
  max-width: 600px;
  margin: 0 auto;
}

.header {
  color: white;
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 20px;
  background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
  height: 125px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header h5 {
  margin: 4px;
  margin-bottom: 5px;
  font-size: 1.5em;
}

.header h6 {
  margin: 4px;
  font-size: 1em;
  opacity: 0.9;
}

.current-class-section {
  margin-bottom: 20px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 15px;
}

.icon-item {
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-btn {
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  position: relative;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.icon-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.icon-btn ::v-deep .q-btn__content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.icon-btn ::v-deep .q-icon {
  margin-bottom: 5px;
  color: #4a4a4a;
}

.icon-btn ::v-deep .text-content {
  font-size: 1.1em;
  line-height: 1.2;
  color: #4a4a4a;
}
.text-capitalize {
  text-transform: capitalize;
}
</style>
