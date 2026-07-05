<template>
  <div v-if="currentView === 'calendar'" class="calendar">
    <div class="calendar-header">
      <button @click="previousMonth">&lt;</button>
      <div class="text-h5">{{ currentMonthYear }}</div>
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
          <div class="item-indicators">
            <div
              v-for="(item, index) in day.items.slice(0, 6)"
              :key="item.type + '-' + index"
              :class="[
                'item-indicator',
                'position-' + (index + 1),
                item.type === 'event' ? 'event-circle' : 'todo-checkmark',
              ]"
              :style="
                item.type === 'event'
                  ? { backgroundColor: item.category.color }
                  : {}
              "
            >
              {{ item.type === "todo" ? "✓" : "" }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <q-dialog v-model="showDayEventsDialog">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">{{ formatDate(selectedDate) }}</div>
      </q-card-section>

      <q-card-section>
        <q-list v-if="selectedDayItems.length > 0">
          <q-item
            v-for="(item, index) in selectedDayItems"
            :key="index"
            clickable
            @click="handleItemClick(item)"
            class="q-mb-sm"
          >
            <q-item-section avatar>
              <div
                v-if="item.type === 'event'"
                class="custom-badge"
                :style="{ backgroundColor: item.category.color }"
              ></div>
              <q-icon v-else name="task_alt" color="green" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="item-title">{{ item.title }}</q-item-label>
              <q-item-label v-if="item.type === 'event'">
                {{ new Date(item.startDate).toLocaleDateString() }} -
                {{ new Date(item.endDate).toLocaleDateString() }}
              </q-item-label>
              <q-item-label v-else>
                {{
                  item.date
                    ? new Date(item.date).toLocaleDateString()
                    : "無日期"
                }}
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
</template>

<script setup>
import { ref, computed } from "vue";
import { useQuasar } from "quasar";

const props = defineProps({
  events: { type: Array, required: true },
  todos: { type: Array, required: true },
  schoolEvents: { type: Array, required: true },
  currentView: { type: String, required: true },
});

const emit = defineEmits(["edit-event"]);

const $q = useQuasar();

const currentDate = ref(new Date());
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const selectedDate = ref(null);
const selectedDayEvents = ref([]);
const selectedDayItems = ref([]);
const showDayEventsDialog = ref(false);

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
});

const isToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  let days = [];

  // Previous month's days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month, -i),
      isCurrentMonth: false,
    });
  }

  // Current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  // Next month's days
  const remainingDays = 42 - days.length; // 6 rows * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  return days.map((day) => {
    const dayEvents = [...props.events, ...props.schoolEvents]
      .filter((event) => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        return day.date >= eventStart && day.date <= eventEnd;
      })
      .map((event) => ({ ...event, type: "event" }));

    const dayTodos = props.todos
      .filter((todo) => {
        if (!todo.date) return false;
        const todoDate = new Date(todo.date);
        return (
          day.date.getDate() === todoDate.getDate() &&
          day.date.getMonth() === todoDate.getMonth() &&
          day.date.getFullYear() === todoDate.getFullYear()
        );
      })
      .map((todo) => ({ ...todo, type: "todo" }));

    const combinedItems = [...dayEvents, ...dayTodos]
      .sort((a, b) => {
        const dateA =
          a.type === "event" ? new Date(a.startDate) : new Date(a.date);
        const dateB =
          b.type === "event" ? new Date(b.startDate) : new Date(b.date);
        return dateA - dateB;
      })
      .slice(0, 6); // Limit to 4 items total

    return {
      ...day,
      items: combinedItems,
      isToday: isToday(day.date),
    };
  });
});

const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
};

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
};

const formatDate = (date) => {
  const days = ["日", "一", "二", "三", "四", "五", "六"];
  const dayOfWeek = days[date.getDay()];
  return `${date.getMonth() + 1}/${date.getDate()} (${dayOfWeek})`;
};

const showDayEvents = (day) => {
  selectedDate.value = day.date;

  // Filter events for the selected day
  selectedDayEvents.value = [...props.events, ...props.schoolEvents].filter(
    (event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return day.date >= eventStart && day.date <= eventEnd;
    }
  );

  // Filter todos for the selected day
  const selectedDayTodos = props.todos.filter((todo) => {
    if (!todo.date) return false;
    const todoDate = new Date(todo.date);
    return (
      day.date.getDate() === todoDate.getDate() &&
      day.date.getMonth() === todoDate.getMonth() &&
      day.date.getFullYear() === todoDate.getFullYear()
    );
  });

  // Combine events and todos
  selectedDayItems.value = [
    ...selectedDayEvents.value.map((event) => ({ ...event, type: "event" })),
    ...selectedDayTodos.map((todo) => ({ ...todo, type: "todo" })),
  ];

  showDayEventsDialog.value = true;
};

const handleItemClick = (item) => {
  if (item.type !== "event") return;
  if (item.category && item.category.name === "學校事務") {
    $q.notify({
      type: "warning",
      message: "School events cannot be edited.",
    });
    return;
  }
  emit("edit-event", item);
  showDayEventsDialog.value = false;
};

const updateSelectedDayEvents = () => {
  if (selectedDate.value) {
    // This only ever runs right after showDayEventsDialog has just been
    // closed by the caller (EventDialog.vue's save/delete flow), so its
    // effect isn't visible to the user in practice - preserved as-is from
    // the pre-split TodoPage.vue rather than removed, since this refactor
    // is a pure code move (see this plan's deviations section, item 5).
    selectedDayEvents.value = props.events.filter((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return (
        selectedDate.value >= eventStart && selectedDate.value <= eventEnd
      );
    });
  }
};

defineExpose({ updateSelectedDayEvents });
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
  margin-top: 10px;
  margin-bottom: 15px;
  padding: 0 10px;
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
  height: 85px; /*Here to change the height of the individual boxes*/
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
  border: none;
  border-bottom: 1px solid #ddd;
}

.calendar-day {
  border: 1px solid #ddd;
}

.other-month {
  color: #ccc;
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
  border-radius: 50%;
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
  top: 39%;
  left: 0;
}
.position-4 {
  top: 39%;
  right: 0;
}
.position-5 {
  bottom: 0;
  left: 0;
}
.position-6 {
  bottom: 0;
  right: 0;
}
.calendar-day {
  cursor: pointer;
  transition: background-color 0.3s;
}

.calendar-day:hover {
  /*background-color: #f0f0f0;*/
  background-color: #ffffff;
}
.q-list .q-item:not(.q-select__dropdown .q-item) {
  background-color: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
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

.item-indicators {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  flex-wrap: wrap;
  width: 30px;
  height: 40px;
}

.item-indicator {
  width: 10px;
  height: 10px;
  position: absolute;
}
</style>
