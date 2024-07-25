<template>
  <div class="app-container">
    <!-- New Banner Component -->
    <q-banner class="bg-primary text-white q-mb-md" rounded>
      <template v-slot:avatar>
        <q-icon name="announcement" color="white" size="md"/>
      </template>
      最新公告：今天下午在禮堂有全校集會
    </q-banner>

    <!-- <div class="header">
      <h5 class="font-weight-bold">歡迎使用 CK APP</h5>
      <h6>為你量身打造的專屬校園APP</h6>
    </div> -->

    <!-- Current Class Section -->
    <div class="current-class-section q-mb-md">
      <q-card>
        <q-card-section>
          <div class="text-h6">目前課程</div>
          <div class="text-subtitle1">{{ currentClass.subject }}</div>
          <q-separator class="q-my-sm" />
          <div class="text-caption">課程備註：</div>
          <div>{{ currentClass.note }}</div>
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
          <div class="text-content">{{ item.name }}</div>
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
      search: '',
      items: [
        { name: "課表", icon: "book", link: "/schedule" },
        { name: "行事曆", icon: "calendar_month", link: "/todo" },
        { name: "Youbike", icon: "directions_bike", link: "/Youbike" },
        { name: "熱食部", icon: "restaurant_menu", link: "/menu" },
        { name: "美食", icon: "fastfood", link: "/food" },
        { name: "校網", icon: "language", link: "/news" },
        { name: "設定", icon: "settings", link: "/settings" },
        { name: "關於", icon: "info", link: "/about" },
      ],
    };
  },
  computed: {
    filteredItems() {
      return this.items.filter(item =>
        item.name.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },
  methods: {
    navigateTo(link) {
      this.$router.push(link);
    },
  },
    setup() {
    const scheduleData = computed(() => store.getters.getScheduleData);

    const currentClass = computed(() => {
      const now = new Date();
      const currentDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()];
      const currentHour = now.getHours();
      console.log(currentDay)
      console.log(currentHour)
      // Assuming classes start at 8 AM and each period is 1 hour
      const currentPeriod = currentHour - 7 -1;
      console.log(currentPeriod)
      if (currentPeriod < 1 || currentPeriod > 7 || currentDay === "Saturday" || currentDay === "Sunday") {
        return {
          subject: "目前無課",
          note: "現在是下課時間或假日"
        };
      }
      console.log(currentClassData.value)
      console.log(currentClassData.value.find(row => row.name === currentDay))
      const currentClassData = scheduleData.value.find(row => row.name === currentDay)?.[currentPeriod.toString()];
      console.log(currentClassData)
      return currentClassData ? {
        subject: currentClassData.subject,
        note: currentClassData.note
      } : {
        subject: "目前無課",
        note: "這個時段沒有安排課程"
      };
    });

    return {
      currentClass
    };
  }
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
</style>
