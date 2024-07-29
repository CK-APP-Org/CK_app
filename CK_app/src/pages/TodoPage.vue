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
        <div
          v-for="day in calendarDays"
          :key="day.date"
          :class="{ 'calendar-day': true, 'other-month': !day.isCurrentMonth }"
        >
          {{ day.date.getDate() }}
          <div class="event-circles">
            <div
              v-for="(event, index) in day.events"
              :key="index"
              class="event-circle"
              :style="{ backgroundColor: event.color }"
              :class="'position-' + (index + 1)"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <div class="add-button-container">
      <button class="add-button" @click="toggleMenu">+</button>
      <div v-if="showMenu" class="add-menu">
        <button class="menu-item" @click="addItem('工作')">💼工作</button>
        <button class="menu-item" @click="openEventDialog">📅活動</button>
      </div>
    </div>
    <q-dialog v-model="showEventDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">新增活動</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-model="eventTitle" label="活動標題" dense />
          <q-input v-model="eventStartDate" label="起始日期" dense>
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="eventStartDate">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input
            v-model="eventEndDate"
            label="結束日期"
            dense
            :disable="!eventStartDate"
            :error="!!endDateErrorMessage"
            :error-message="endDateErrorMessage"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="eventEndDate">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-select
            v-model="eventColor"
            :options="colorOptions"
            label="活動顏色"
            dense
          >
            <template v-slot:selected>
              <q-chip
                square
                :style="{ backgroundColor: eventColor.value }"
                class="q-mr-sm"
              />
              {{ eventColor.label }}
            </template>
            <template v-slot:option="{ itemProps, opt }">
              <q-item v-bind="itemProps">
                <q-item-section side>
                  <q-chip
                    :style="{ backgroundColor: opt.value }"
                    square
                    dense
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn
            flat
            label="新增活動"
            color="primary"
            @click="addEvent"
            :disable="!isFormValid"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
const colorOptions = [
  { label: "Default", value: "#ADADAD" },
  { label: "Red", value: "#FFCCCB" },
  { label: "Orange", value: "#f5c884" },
  { label: "Yellow", value: "#FFFFE0" },
  { label: "Green", value: "#90EE90" },
  { label: "Blue", value: "#ADD8E6" },
  { label: "Purple", value: "#e299ff" },
  { label: "Pink", value: "#ffa1e4" },
];
export default {
  data() {
    return {
      currentDate: new Date(),
      weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      showMenu: false,
      showEventDialog: false,
      eventTitle: "",
      eventStartDate: "",
      eventEndDate: "",
      events: [],
      eventColor: { label: "Default", value: "#ADADAD" },
      colorOptions,
      endDateErrorMessage: "",
    };
  },
  computed: {
    currentMonthYear() {
      return this.currentDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
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
          isCurrentMonth: false,
        });
      }

      // Current month's days
      for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push({
          date: new Date(year, month, i),
          isCurrentMonth: true,
        });
      }

      // Next month's days
      const remainingDays = 42 - calendarDays.length; // 6 rows * 7 days
      for (let i = 1; i <= remainingDays; i++) {
        calendarDays.push({
          date: new Date(year, month + 1, i),
          isCurrentMonth: false,
        });
      }

      return calendarDays.map((day) => {
        const dayEvents = this.events
          .filter((event) => {
            const eventStart = new Date(event.startDate);
            const eventEnd = new Date(event.endDate);
            return day.date >= eventStart && day.date <= eventEnd;
          })
          .slice(0, 4); // Limit to 4 events per day

        return {
          ...day,
          events: dayEvents,
        };
      });
    },
    isFormValid() {
      return (
        this.eventTitle.trim() !== "" &&
        this.eventStartDate !== "" &&
        this.eventEndDate !== "" &&
        this.eventColor.value !== "" &&
        this.isEndDateValid
      );
    },
    isEndDateValid() {
      if (!this.eventStartDate || !this.eventEndDate) return true;
      return new Date(this.eventEndDate) >= new Date(this.eventStartDate);
    },
  },
  methods: {
    previousMonth() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() - 1,
        1
      );
    },
    nextMonth() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1,
        1
      );
    },
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
    addItem(type) {
      console.log(`Adding ${type}`);
      // Add your logic here for what should happen when an item is added
      this.showMenu = false; // Close the menu after selection
    },
    openEventDialog() {
      this.showEventDialog = true;
      this.showMenu = false;
    },

    addEvent() {
      const newEvent = {
        title: this.eventTitle,
        startDate: new Date(this.eventStartDate),
        endDate: new Date(this.eventEndDate),
        color: this.eventColor.value,
      };
      this.events.push(newEvent);
      console.log("Event added:", newEvent);
      console.log("All events:", this.events);
      this.resetEventForm();
    },
    resetEventForm() {
      this.eventTitle = "";
      this.eventStartDate = "";
      this.eventEndDate = "";
      this.eventColor = { label: "Default", value: "#f4f4f1" };
    },
    displayEvents() {
      console.log("All events:", this.events);
    },
    validateEndDate() {
      if (!this.isEndDateValid) {
        this.endDateErrorMessage = "結束日期不能早於起始日期";
      } else {
        this.endDateErrorMessage = "";
      }
    },
  },
  watch: {
    eventStartDate() {
      this.validateEndDate();
    },
    eventEndDate() {
      this.validateEndDate();
    },
  },
};
</script>

<style scoped>
.calendar {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  padding-bottom: 60px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0px;
}

.weekdays,
.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.weekdays > div,
.calendar-day {
  text-align: center;
  padding: 8px;
  height: 78px; /*Here to change the height of the individual boxes*/
}

.weekdays > div {
  font-weight: bold;
  height: 35px;
}

.calendar-day {
  border: 1px solid #ddd;
}

.other-month {
  color: #ccc;
}

.add-button-container {
  position: absolute;
  bottom: 20px;
  right: 20px;
}

.add-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #c10015;
  color: white;
  font-size: 24px;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-menu {
  position: absolute;
  bottom: 60px;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 80px;
}

.add-menu .menu-item {
  display: block;
  width: 100%;
  padding: 10px 10px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  text-align: center;
  white-space: nowrap;
}

.add-menu button {
  display: block;
  width: 100%;
  padding: 10px 20px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  text-align: left;
}

.calendar-day {
  position: relative;
}

.event-circles {
  /*Here to adjust position of circles*/
  position: absolute;
  bottom: 15px;
  right: 15px;
  display: flex;
  flex-wrap: wrap;
  width: 25px;
  height: 25px;
}

.event-circle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  position: absolute;
}

.position-1 {
  top: 0;
  left: 0;
}
.position-2 {
  top: 0;
  right: 0;
}
.position-3 {
  bottom: 0;
  left: 0;
}
.position-4 {
  bottom: 0;
  right: 0;
}
</style>
