<template>
  <div class="calendar">
    <div class="calendar-header">
      <button @click="previousMonth">&lt;</button>
      <h2>{{ currentMonthYear }}</h2>
      <button @click="nextMonth">&gt;</button>
    </div>
    <div class="calendar-body">
      <div class="weekdays">
        <div v-for="day in weekdays" :key="day">{{ day }}</div>
      </div>
      <div class="days">
        <div v-for="day in calendarDays" :key="day.date"
             :class="{ 'calendar-day': true, 'other-month': !day.isCurrentMonth }">
          {{ day.date.getDate() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentDate: new Date(),
      weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    }
  },
  computed: {
    currentMonthYear() {
      return this.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    },
    calendarDays() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();

      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);

      const daysInMonth = lastDayOfMonth.getDate();
      const startingDayOfWeek = firstDayOfMonth.getDay();

      let calendarDays = [];

      // Previous month's days
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        calendarDays.push({
          date: new Date(year, month, -i),
          isCurrentMonth: false
        });
      }

      // Current month's days
      for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push({
          date: new Date(year, month, i),
          isCurrentMonth: true
        });
      }

      // Next month's days
      const remainingDays = 42 - calendarDays.length; // 6 rows * 7 days
      for (let i = 1; i <= remainingDays; i++) {
        calendarDays.push({
          date: new Date(year, month + 1, i),
          isCurrentMonth: false
        });
      }

      return calendarDays;
    }
  },
  methods: {
    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    }
  }
}
</script>

<style scoped>
.calendar {
  max-width: 800px;
  margin: 0 auto;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.weekdays, .days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.weekdays > div, .calendar-day {
  text-align: center;
  padding: 10px;
}

.weekdays > div {
  font-weight: bold;
}

.calendar-day {
  border: 1px solid #ddd;
}

.other-month {
  color: #ccc;
}
</style>
