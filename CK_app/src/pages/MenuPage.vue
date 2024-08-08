<template>
  <q-page class="flex flex-center column">
    <!--
    <div class="header-section">
      <div class="title">熱食部當週菜單&ensp;</div>
      <q-btn
        class="status-btn"
        :label="statusLabel"
        icon="info"
        size="12px"
        padding="sm"
        :color="statusColor"
        unelevated
        @click="showDialog = true"
      />
    </div>
    -->

    <div class="day-selector q-mt-md">
      <div class="row q-col-gutter-sm justify-center">
        <div v-for="day in days" :key="day.value" class="col-auto">
          <q-btn
            :label="day.label"
            :color="selectedDay === day.value ? 'primary' : 'grey-7'"
            @click="selectDay(day.value)"
            unelevated
            dense
            :outline="selectedDay !== day.value"
            class="day-btn"
          />
        </div>
      </div>
    </div>

    <div class="menu-image-section q-mt-md">
      <img :src="getCurrentMenuImage" class="menu-image" />
    </div>

    <q-dialog v-model="showDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">熱食部營業時間</div>
          <p>
            熱食部營業時間為每日 {{ openHour }}:00 到 {{ closeHour }}:00<br />
            (註：實際營業資訊依熱食部公告為準，<br />本軟體不負任何責任)
          </p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="關閉" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      openHour: 11,
      closeHour: 16,
      showDialog: false,
      baseMenuUrl:
        "https://raw.githubusercontent.com/CK-APP-Org/Data/main/menus/",
      currentWeekStart: this.getWeekStartDate(),
      selectedDay: this.getTodayOrNextMonday(),
      days: [
        { label: "星期一", shortLabel: "一", value: 1 },
        { label: "星期二", shortLabel: "二", value: 2 },
        { label: "星期三", shortLabel: "三", value: 3 },
        { label: "星期四", shortLabel: "四", value: 4 },
        { label: "星期五", shortLabel: "五", value: 5 },
      ],
    };
  },
  computed: {
    statusLabel() {
      const now = new Date();
      const hours = now.getHours();
      if (hours >= this.openHour && hours < this.closeHour) {
        return "營業中";
      } else {
        return "已歇業";
      }
    },
    statusColor() {
      const now = new Date();
      const hours = now.getHours();
      if (hours >= this.openHour && hours < this.closeHour) {
        return "green";
      } else {
        return "red";
      }
    },
    cardStyle() {
      const now = new Date();
      const hours = now.getHours();
      if (hours >= this.openHour && hours < this.closeHour) {
        return {};
      } else {
        return { opacity: 0.5 };
      }
    },
    getCurrentMenuImage() {
      const day = this.selectedDay;
      const weekStart = this.currentWeekStart;
      const timestamp = new Date().getTime(); // Add a timestamp to prevent caching
      return `${this.baseMenuUrl}${weekStart}_${day}.png?t=${timestamp}`;
    },
  },
  methods: {
    selectDay(day) {
      this.selectedDay = day;
    },
    getWeekStartDate() {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is sunday
      const monday = new Date(now.setDate(diff));
      return monday.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    },
    getTodayOrNextMonday() {
      const now = new Date();
      const day = now.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
      if (day === 0 || day === 6) {
        // Saturday or Sunday
        return 1; // Show next Monday's menu
      }
      return day;
    },
  },
};
</script>

<style scoped>
.menu-card {
  width: 100%;
  max-width: 400px;
}
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #03328d;
  color: white;
  padding: 10px;
}
.title {
  font-weight: bold;
  font-size: 20px;
}
.status-btn {
  font-size: 12px;
}
.day-btn {
  width: 60px;
  height: 37px;
}
.menu-image-section {
  display: flex;
  justify-content: center;
  padding: 0;
}
.menu-image {
  width: 100%;
  max-height: 620px;
  object-fit: contain;
}
</style>
