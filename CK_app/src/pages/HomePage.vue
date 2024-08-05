<template>
  <div class="app-container">
    <!-- New Banner Component -->
    <!--
    <q-banner class="bg-primary text-white q-mb-md" rounded>
      <template v-slot:avatar>
        <q-icon name="announcement" color="white" size="md" />
      </template>
      最新公告：今天下午在禮堂有全校集
    </q-banner>
    -->

    <!-- <div class="header">
      <h5 class="font-weight-bold">歡迎使用 CK APP</h5>
      <h6>為你量身打造的專屬校園APP</h6>
    </div> -->

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
              icon="edit"
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
              icon="edit"
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
              icon="edit"
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

    <!-- <q-input filled v-model="search" label="搜尋功能" dense class="q-mb-md">
      <template v-slot:append>
        <q-icon name="search" />
      </template>
    </q-input> -->
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
</template>

<script>
import { onMounted, ref, computed } from "vue";
import store from "../store/index";

export default {
  data() {
    return {
      search: "",
      items: [
        { name: "課表", icon: "book", link: "/schedule" },
        { name: "行事曆", icon: "calendar_month", link: "/todo" },
        { name: "YouBike", icon: "directions_bike", link: "/Youbike" },
        { name: "熱食部", icon: "restaurant_menu", link: "/menu" },
        { name: "美食", icon: "fastfood", link: "/food" },
        { name: "校網", icon: "newspaper", link: "/news" },
        { name: "登入", icon: "login", link: "/login" },
        // { name: "設定", icon: "settings", link: "/settings" },
        // { name: "關於", icon: "info", link: "/about" },
      ],
    };
  },
  computed: {
    filteredItems() {
      return this.items.filter((item) =>
        item.name.toLowerCase().includes(this.search.toLowerCase())
      );
    },
  },
  methods: {
    navigateTo(link) {
      this.$router.push(link);
    },
    onTodoCheck(todo) {
      store.dispatch("deleteTodo", todo.id);
    },
  },
  setup() {
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

    const todos = computed(() => store.getters.getTodos);

    const todayTodos = computed(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return todos.value.filter((todo) => {
        const todoDate = new Date(todo.date);
        todoDate.setHours(0, 0, 0, 0);
        return todoDate.getTime() === today.getTime() && !todo.completed;
      });
    });

    // Pinned School News data
    // const pinnedNews = ref([
    //   { title: "下週一校慶活動安排", date: "2023-07-25" },
    //   { title: "暑期輔導課程開放報名", date: "2023-07-24" },
    // ]);

    const scheduleData = computed(() => store.getters.getScheduleData);
    const pinnedNews = computed(() => store.getters.getPinnedNews);

    const showSchedule = computed(() => store.getters.getShowSchedule);
    const showTodo = computed(() => store.getters.getShowTodo);
    const showSchoolNews = computed(() => store.getters.getShowSchoolNews);

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
      // Assuming classes start at 8 AM and each period is 1 hour
      const currentPeriod =
        ["一", "二", "三", "四", "五", "六", "七"][currentHour - 9] || "課後";
      if (
        currentPeriod < 1 ||
        currentPeriod > 7 ||
        currentDay === "Saturday" ||
        currentDay === "Sunday"
      ) {
        return {
          subject: "目前無課",
          note: "現在是下課時間或假日",
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
        return option ? option.value : "#f4f4f1"; // Default color if not found
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
          };
    });
    return {
      currentClass,
      todos,
      pinnedNews,
      showSchedule,
      showSchoolNews,
      showTodo,
      todayTodos,
    };
  },
};
</script>

<style scoped>
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
  font-size: 0.9em;
  line-height: 1.2;
  color: #4a4a4a;
}
.text-capitalize {
  text-transform: capitalize;
}
</style>
