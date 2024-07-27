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
          <div class="day-number">{{ day.date.getDate() }}</div>
          <div class="day-events">
            <div
              v-for="event in day.events"
              :key="event.title"
              class="event"
              :style="getEventStyle(event, day.date)"
            >
              <span v-if="event.isStart">{{ event.title }}</span>
            </div>
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
          <q-input v-model="eventEndDate" label="結束日期" dense>
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
          .map((event) => ({
            ...event,
            isStart:
              new Date(event.startDate).toDateString() ===
              day.date.toDateString(),
            isEnd:
              new Date(event.endDate).toDateString() ===
              day.date.toDateString(),
          }));
        return { ...day, events: dayEvents };
      });
    },
    isFormValid() {
      return (
        this.eventTitle.trim() !== "" &&
        this.eventStartDate !== "" &&
        this.eventEndDate !== ""
      );
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
        startDate: this.eventStartDate,
        endDate: this.eventEndDate,
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
    },
    displayEvents() {
      console.log("All events:", this.events);
    },
    getEventStyle(event, currentDate) {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      const durationDays = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;
      const dayOfWeek = currentDate.getDay();
      const daysUntilEndOfWeek = 7 - dayOfWeek;

      let width = "100%";
      if (event.isStart) {
        width = `${100 * Math.min(durationDays, daysUntilEndOfWeek)}%`;
      } else if (!event.isEnd && dayOfWeek === 0) {
        width = `${
          100 *
          Math.min(
            durationDays - (currentDate - startDate) / (1000 * 60 * 60 * 24),
            7
          )
        }%`;
      }

      return {
        width: width,
        borderRadius: event.isStart
          ? "4px 0 0 4px"
          : event.isEnd
          ? "0 4px 4px 0"
          : "0",
        marginLeft: event.isStart ? "0" : "-1px",
        borderLeft: event.isStart ? null : "none",
      };
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
  overflow: visible;
  border-right: none;
  border-bottom: none;
}

.calendar {
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
}

.event {
  font-size: 12px;
  padding: 2px 4px;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: #4285f4;
  color: white;
  border: 1px solid #3367d6;
  box-sizing: border-box;
}
</style>
