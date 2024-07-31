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
          :class="{
            'calendar-day': true,
            'other-month': !day.isCurrentMonth,
            today: day.isToday,
          }"
          @click="showDayEvents(day)"
        >
          <span class="day-number">{{ day.date.getDate() }}</span>
          <div class="event-circles">
            <div
              v-for="(event, index) in day.events"
              :key="index"
              class="event-circle"
              :style="{ backgroundColor: event.category.color }"
              :class="'position-' + (index + 1)"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <div class="add-button-container">
      <button class="add-button" @click="toggleMenu">+</button>
      <div v-if="showMenu" class="add-menu">
        <button class="menu-item" disabled @click="addItem('工作')">
          💼工作
        </button>
        <button class="menu-item" @click="openEventDialog">📅活動</button>
      </div>
    </div>
    <q-dialog v-model="showEventDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">{{ isEditing ? "編輯活動" : "新增活動" }}</div>
          <q-btn
            v-if="isEditing"
            flat
            color="red"
            label="刪除"
            @click="confirmDelete"
          />
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
            v-model="eventCategory"
            :options="categories"
            option-label="name"
            label="活動類別"
            dense
          >
            <template v-slot:selected>
              <q-chip
                v-if="Object.keys(eventCategory).length != 0"
                square
                :style="{ backgroundColor: eventCategory.color }"
                class="q-mr-sm"
              />
              {{ eventCategory.name }}
            </template>
            <template v-slot:option="{ itemProps, opt }">
              <q-item v-bind="itemProps">
                <q-item-section side>
                  <q-chip
                    :style="{ backgroundColor: opt.color }"
                    square
                    dense
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ opt.name }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-btn label="管理類別" @click="showCategoryDialog = true" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="取消"
            color="primary"
            v-close-popup
            @click="resetEventForm"
          />
          <q-btn
            flat
            :label="isEditing ? '保存更改' : '新增活動'"
            color="primary"
            @click="addEvent"
            :disable="!isFormValid"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showDayEventsDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ formatDate(selectedDate) }}活動列表</div>
        </q-card-section>

        <q-card-section>
          <q-list v-if="selectedDayEvents.length > 0">
            <q-item
              v-for="(event, index) in selectedDayEvents"
              :key="index"
              clickable
              @click="editEvent(event)"
              class="q-mb-sm"
            >
              <q-item-section avatar>
                <div
                  class="custom-badge"
                  :style="{ backgroundColor: event.category.color }"
                ></div>
              </q-item-section>
              <q-item-section>
                <q-item-label class="item-title">{{
                  event.title
                }}</q-item-label>
                <q-item-label>
                  {{ new Date(event.startDate).toLocaleDateString() }} -
                  {{ new Date(event.endDate).toLocaleDateString() }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" color="grey" />
              </q-item-section>
            </q-item>
          </q-list>
          <div v-else>無。</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="關閉" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showDeleteConfirmation">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">確定刪除此活動？</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn
            flat
            label="確定"
            color="negative"
            @click="deleteEvent"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showCategoryDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">管理類別</div>
        </q-card-section>

        <q-card-section>
          <div class="text-h7">所有類別</div>
          <q-list>
            <q-item v-for="category in categories" :key="category.name">
              <q-item-section>
                <q-chip
                  square
                  :style="{ backgroundColor: category.color }"
                  class="q-mr-sm"
                />
                {{ category.name }}
              </q-item-section>
              <q-item-section side>
                <q-btn
                  v-if="Object.keys(categories).length > 1"
                  flat
                  round
                  icon="delete"
                  @click="deleteCategory(category.name)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-section>
          <q-input v-model="newCategoryName" label="新類別名稱" dense />
          <q-input v-model="newCategoryColor" label="新類別顏色" dense>
            <q-chip
              square
              :style="{ backgroundColor: newCategoryColor }"
              class="q-mr-sm"
            />
            <template v-slot:append>
              <q-icon name="colorize" class="cursor-pointer">
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-color v-model="newCategoryColor" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-btn label="新增類別" @click="addCategory" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="關閉" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showDeleteCategoryConfirmation">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm"
            >確定刪除類別 "{{ categoryToDelete }}"
            嗎？若確定則所有屬於這類別的活動會維持原本的樣式，但往後所有活動將無法選取為此類別。</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn
            flat
            label="確定"
            color="negative"
            @click="confirmDeleteCategory"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { computed } from "vue";
import store from "../store/index";

export default {
  setup() {
    const events = computed(() => store.getters.getEvents);
    const categories = computed(() => store.getters.getCategories);
    return { events, categories };
  },
  data() {
    return {
      currentDate: new Date(),
      weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      showMenu: false,
      showEventDialog: false,
      eventTitle: "",
      eventStartDate: "",
      eventEndDate: "",
      endDateErrorMessage: "",
      selectedDate: null,
      selectedDayEvents: [],
      showDayEventsDialog: false,
      editingEvent: null,
      isEditing: false,
      showDeleteConfirmation: false,
      eventCategory: {},
      showCategoryDialog: false,
      newCategoryName: "",
      newCategoryColor: "#ADADAD",
      showDeleteCategoryConfirmation: false,
      categoryToDelete: null,
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
          .slice(0, 4);

        return {
          ...day,
          events: dayEvents.map((event) => ({
            ...event,
            color: event.category.color,
          })),
          isToday: this.isToday(day.date),
        };
      });
    },
    isFormValid() {
      return (
        this.eventTitle.trim() !== "" &&
        this.eventStartDate !== "" &&
        this.eventEndDate !== "" &&
        this.isEndDateValid &&
        this.eventCategory !== ""
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
      this.showMenu = false;
    },
    openEventDialog() {
      this.showEventDialog = true;
      this.showMenu = false;
    },

    addEvent() {
      if (this.isEditing) {
        this.saveEditedEvent();
      } else {
        const newEvent = {
          title: this.eventTitle,
          startDate: new Date(this.eventStartDate),
          endDate: new Date(this.eventEndDate),
          category: this.eventCategory,
        };
        store.dispatch("addEvent", {
          id: Date.now(), // Generate a unique ID for the event
          title: this.eventTitle,
          startDate: new Date(this.eventStartDate),
          endDate: new Date(this.eventEndDate),
          category: this.eventCategory,
        });

        this.resetEventForm();
        this.showEventDialog = false;
        this.updateSelectedDayEvents();
      }
    },
    resetEventForm() {
      this.eventTitle = "";
      this.eventStartDate = "";
      this.eventEndDate = "";
      this.isEditing = false;
      this.editingEvent = null;
      this.eventCategory = {};
    },
    validateEndDate() {
      if (!this.isEndDateValid) {
        this.endDateErrorMessage = "結束日期不能早於起始日期";
      } else {
        this.endDateErrorMessage = "";
      }
    },
    showDayEvents(day) {
      this.selectedDate = day.date;
      this.selectedDayEvents = this.events.filter((event) => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        return day.date >= eventStart && day.date <= eventEnd;
      });
      this.showDayEventsDialog = true;
    },

    formatDate(date) {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    },
    editEvent(event) {
      this.editingEvent = { ...event };
      this.eventTitle = event.title;
      this.eventStartDate = this.formatDateForInput(event.startDate);
      this.eventEndDate = this.formatDateForInput(event.endDate);
      this.eventCategory = event.category;
      this.isEditing = true;
      this.showEventDialog = true;
      this.showDayEventsDialog = false;
    },
    formatDateForInput(date) {
      const d = new Date(date);
      let month = "" + (d.getMonth() + 1);
      let day = "" + d.getDate();
      const year = d.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      return [year, month, day].join("-");
    },
    saveEditedEvent() {
      const updatedEvent = {
        id: this.editingEvent.id,
        title: this.eventTitle,
        startDate: new Date(this.eventStartDate),
        endDate: new Date(this.eventEndDate),
        category: this.eventCategory,
      };

      store.dispatch("updateEvent", updatedEvent);

      this.resetEventForm();
      this.showEventDialog = false;
      this.showDayEventsDialog = true;

      // Refresh the selected day events
      this.updateSelectedDayEvents();
    },
    updateSelectedDayEvents() {
      if (this.selectedDate) {
        const allEvents = store.getters.getEvents;
        this.selectedDayEvents = allEvents.filter((event) => {
          const eventStart = new Date(event.startDate);
          const eventEnd = new Date(event.endDate);
          return (
            this.selectedDate >= eventStart && this.selectedDate <= eventEnd
          );
        });
      }
    },
    confirmDelete() {
      this.showDeleteConfirmation = true;
    },

    deleteEvent() {
      if (this.editingEvent) {
        store.dispatch("deleteEvent", this.editingEvent.id);
      }

      this.resetEventForm();
      this.showEventDialog = false;
      this.showDayEventsDialog = true;

      // Refresh the selected day events
      this.updateSelectedDayEvents();
    },
    addCategory() {
      if (this.newCategoryName && this.newCategoryColor) {
        store.dispatch("addCategory", {
          name: this.newCategoryName,
          color: this.newCategoryColor,
        });
        this.newCategoryName = "";
        this.newCategoryColor = "#ADADAD";
      }
    },

    deleteCategory(categoryName) {
      this.showDeleteCategoryConfirmationDialog(categoryName);
    },

    showDeleteCategoryConfirmationDialog(categoryName) {
      this.categoryToDelete = categoryName;
      this.showDeleteCategoryConfirmation = true;
    },

    confirmDeleteCategory() {
      if (this.categoryToDelete) {
        store.dispatch("deleteCategory", this.categoryToDelete);
      }
      this.showDeleteCategoryConfirmation = false;
      this.categoryToDelete = null;
    },

    isToday(date) {
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
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
  position: relative;
  text-align: center;
  padding: 8px;
  height: 78px; /*Here to change the height of the individual boxes*/
  border: 1px solid #ddd;
  cursor: pointer;
  transition: background-color 0.3s;
}

.day-number {
  position: relative;
  z-index: 1;
}

.today .day-number::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 25px;
  height: 25px;
  background-color: #03328d;
  border-radius: 50%;
  z-index: -1;
}
.today .day-number {
  color: white;
  z-index: 2;
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
.calendar-day {
  cursor: pointer;
  transition: background-color 0.3s;
}

.calendar-day:hover {
  background-color: #f0f0f0;
}
.q-list .q-item:not(.q-select__dropdown .q-item) {
  background-color: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.q-list .q-item:not(.q-select__dropdown .q-item):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
.item-title {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 4px;
}

.custom-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 10px;
}
</style>
