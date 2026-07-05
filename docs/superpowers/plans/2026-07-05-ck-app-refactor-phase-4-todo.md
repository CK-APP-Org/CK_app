# CK App Refactor — Phase 4-B (TodoPage.vue Split) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task (inline execution — this repo's current preference). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `src/pages/TodoPage.vue` (1393 lines) into a thin orchestrator plus four child components (`CalendarView.vue`, `TodoListView.vue`, `EventDialog.vue`, `TodoDialog.vue`), and — per `docs/refactoring-plan.md` Phase 4-B — fix the pre-existing bug where this file illegally mixes Options API (`data()`/`computed`/`methods`/`watch`) with Composition API (`setup()`) by moving the whole thing to pure `<script setup>`.

**Architecture:** `TodoPage.vue` keeps the shared view-toggle button, the FAB, and owns the two dialogs' visibility + the data that flows from the Vuex store. Both `CalendarView` and `TodoListView` are **always mounted** (never `v-if`'d away by the parent) and each internally does `v-if="currentView === '...'"` on its own root — this is required, not just a style choice: the original single-file component's `currentDate` (calendar's month position) and `selectedCategory`/`leftDrawerOpen` (todo list's filter state) never reset when a user toggles between the two views, because there was only ever one component instance. If the parent instead used `v-if` to swap between the two children, each toggle would destroy and recreate them, silently resetting that state — a real behavior regression. Keeping both always-mounted preserves the original behavior exactly.

Dialog visibility uses Vue 3.5's `defineModel()` macro (confirmed available: this repo has Vue `3.5.22` installed). `EventDialog`/`TodoDialog` each dispatch their own Vuex actions directly (add/update/delete event or todo, add/delete category) rather than emitting payloads for the parent to act on — this mirrors how category-management already worked in the original file (self-contained, store-driven) and keeps each dialog's public contract (props in, a few lifecycle-notification emits out) small.

**Tech Stack:** Quasar 2 / Vue 3.5 `<script setup>` (including `defineModel`, `defineExpose`), Vuex 4.

## Global Constraints

- No `[deploy]` prefix in any commit message. No Claude/Anthropic attribution in any commit message or PR description (standing rule for this repo).
- This is **sub-phase 2 of 4** in Phase 4 (Transport ✅ → Todo → Settings → Food). All four land as separate commits on the ONE branch/PR (`refactor/phase-4-component-splitting`) opened after Phase 4-A — **do not open a PR at the end of this plan.**
- Pure code motion plus the one explicitly-planned fix (Options/Composition API mixing → pure `<script setup>`). Every function body below is copied verbatim from the current file (verified by direct read on 2026-07-05, current HEAD of this branch) unless a deviation is called out below.
- All imports use relative paths, matching this codebase's existing convention.

---

## Noted deviations from a pure line-for-line move (call these out in the PR description)

1. **Dropped `fetchAndParseSchoolEvents` and the commented-out `ICAL` import** — per `docs/refactoring-plan.md` Phase 4-B's explicit instruction. Both were already fully inert: the `onMounted(() => { fetchAndParseSchoolEvents(); })` call was itself commented out, so this ~30-line function has never executed in the shipped app. The `schoolEvents` ref it would have populated is kept (still always `[]`, exactly as it already was in production) since `calendarDays`/`showDayEvents` still merge it in — removing `schoolEvents` itself is out of scope for this phase.
2. **Dropped `newTodoCategoryColor`** (a `data()` field that was never read or written by anything — no template usage, no method reference; unlike `newEventCategoryColor`, which genuinely backs a color picker for event categories, todo categories apparently never got one). Carrying a fully dead, never-referenced variable into a new `<script setup>` file would fail `yarn lint`'s `no-unused-vars` check, so it's dropped here rather than ported. Confirmed dead by grepping the original file for every occurrence before writing this plan.
3. **`handleItemClick(item)` replaces the inline template ternary** `@click="item.type === 'event' ? editEvent(item) : null"`. Behavior is identical (only event items react to a click; todo items in the day-popup do nothing) — the ternary became a named function because the split requires emitting to the parent instead of directly opening a same-file dialog, and Vue templates can't inline a multi-statement handler.
4. **Two CSS rules are duplicated across two new files** rather than lifted into a shared stylesheet: `.item-title` (used both by `CalendarView`'s day-popup and `TodoListView`'s todo list) and `.btn-move-down` (used by both `EventDialog`'s and `TodoDialog`'s "管理類別" buttons). Also `.q-list .q-item:not(.q-select__dropdown .q-item)` is duplicated into both `CalendarView.vue` and `TodoListView.vue`, since Vue's `scoped` CSS only reaches elements rendered by that component's own template — the original single-file version reached both lists from one copy of the rule; splitting requires two copies to keep styling both. This is the smallest correct fix; introducing a shared stylesheet for 2-3 rules would be over-engineering for this phase.
5. **`updateSelectedDayEvents()` is exposed via `defineExpose`**, the same pattern Phase 4-A established for cross-component triggering (see `docs/decisions/phase-4-component-splitting/task-1-transport.md`). `EventDialog` calls it (via a template ref held by the parent) after every save/delete, exactly mirroring the original's 3 call sites. Note: in all 3 original call sites, `showDayEventsDialog` had *already* been set to `false` immediately before this call — so its effect was never visibly observable even before this refactor. It's preserved as-is rather than removed, since removing it would be an undocumented behavior change beyond what this phase's plan calls for.
6. **`EventDialog`/`TodoDialog` dispatch their own Vuex actions** (`addEvent`/`updateEvent`/`deleteEvent`/`addEventCategory`/etc. and `addTodo`/`addTodoCategory`/etc.) rather than emitting a payload for `TodoPage.vue` to dispatch. This matches how category-management already worked in the original (fully self-contained), keeps `TodoPage.vue` from having to reconstruct event/todo objects it doesn't otherwise need, and keeps each dialog's `save`/`delete` emits purely informational (used only to trigger `CalendarView`'s day-popup refresh).

---

## Task 1: Create `src/components/todo/CalendarView.vue`

**Files:**
- Create: `src/components/todo/CalendarView.vue`

**Interfaces:**
- Consumes props: `events` (Array), `todos` (Array), `schoolEvents` (Array), `currentView` (String).
- Emits: `edit-event` (payload: the clicked event object) — handled by Task 5's `TodoPage.vue`.
- Exposes (via `defineExpose`, used by Task 3's `EventDialog.vue` through a parent-held template ref): `updateSelectedDayEvents()`.

- [ ] **Step 1: Create the file**

```vue
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/todo/CalendarView.vue
git commit -m "refactor(todo): extract CalendarView.vue

Calendar grid, month navigation, and the day-events popup dialog,
moved verbatim out of TodoPage.vue and converted to <script setup>.
Emits edit-event so the parent can open EventDialog in edit mode
(the event dialog itself is shared with the FAB's add-event flow, so
it stays owned by the parent). Exposes updateSelectedDayEvents() via
defineExpose for EventDialog to call after a save/delete, matching
the pattern established in Phase 4-A (Transport).

TodoPage.vue is not updated to use this yet - later commits on this
branch handle that once all four new components exist."
```

---

## Task 2: Create `src/components/todo/TodoListView.vue`

**Files:**
- Create: `src/components/todo/TodoListView.vue`

**Interfaces:**
- Consumes props: `todos` (Array), `todoCategories` (Array), `currentView` (String).
- Emits: `todo-checked` (payload: the todo's `id`) — handled by Task 5's `TodoPage.vue`, which owns the 500ms-delayed store removal.

- [ ] **Step 1: Create the file**

```vue
<template>
  <div v-if="currentView === 'todoList'" class="todo-list">
    <div class="todo-header">
      <q-btn flat round icon="menu" @click="toggleSidebar" class="q-mr-sm" />
      <div class="text-h5">
        待辦事項{{ selectedCategory ? ` (${selectedCategory})` : " (全)" }}
      </div>
    </div>
    <div v-for="group in sortedTodos" :key="group.date" class="todo-group">
      <div class="todo-date">{{ group.date }}</div>
      <q-list separator>
        <transition-group name="todo-list" tag="div">
          <q-item
            v-for="todo in group.todos"
            :key="todo.id"
            clickable
            v-ripple
            :class="{
              'todo-item': !todo.completed,
              'todo-item-completed': todo.completed,
            }"
          >
            <q-item-section avatar>
              <q-checkbox
                v-model="todo.completed"
                @update:model-value="onTodoCheck(todo)"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label class="item-title"
                >{{ todo.title }}
                <q-chip
                  v-if="selectedCategory === null && todo.category"
                  color="primary"
                  text-color="white"
                  dense
                  outline
                >
                  {{ todo.category.name }}
                </q-chip>
              </q-item-label>
            </q-item-section>
          </q-item>
        </transition-group>
      </q-list>
    </div>
  </div>

  <q-drawer v-model="leftDrawerOpen" side="left" bordered class="todo-sidebar">
    <q-list padding>
      <q-item-label header class="text-h6 q-py-md">選擇顯示類別</q-item-label>

      <q-item
        clickable
        v-ripple
        :active="selectedCategory === null"
        active-class="bg-primary text-white"
        @click="selectCategory(null)"
        class="sidebar-item"
      >
        <q-item-section avatar>
          <q-icon name="list" />
        </q-item-section>
        <q-item-section>所有待辦</q-item-section>
        <q-item-section side>
          <q-chip
            :color="selectedCategory === null ? 'white' : 'primary'"
            :text-color="selectedCategory === null ? 'black' : 'white'"
            size="md"
          >
            {{ Object.keys(todos).length }}
          </q-chip>
        </q-item-section>
      </q-item>

      <q-separator spaced />

      <q-item
        v-for="category in todoCategories"
        :key="category.name"
        clickable
        v-ripple
        :active="selectedCategory === category.name"
        active-class="bg-primary text-white"
        @click="selectCategory(category.name)"
        class="sidebar-item"
      >
        <q-item-section avatar>
          <q-icon name="folder" />
        </q-item-section>
        <q-item-section>{{ category.name }}</q-item-section>
        <q-item-section side>
          <q-chip
            :color="selectedCategory === category.name ? 'white' : 'primary'"
            :text-color="selectedCategory === category.name ? 'black' : 'white'"
            size="md"
          >
            {{ getTodosCountForCategory(category.name) }}
          </q-chip>
        </q-item-section>
      </q-item>
    </q-list>
    <q-separator spaced />

    <q-item>
      <q-btn
        label="管理類別"
        color="primary"
        outline
        @click="$emit('manage-categories')"
        class="full-width"
      />
    </q-item>
  </q-drawer>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  todos: { type: Array, required: true },
  todoCategories: { type: Array, required: true },
  currentView: { type: String, required: true },
});

const emit = defineEmits(["todo-checked", "manage-categories"]);

const leftDrawerOpen = ref(false);
const selectedCategory = ref(null);

const filteredTodos = computed(() => {
  if (!selectedCategory.value) {
    return props.todos;
  }
  return props.todos.filter(
    (todo) => todo.category && todo.category.name === selectedCategory.value
  );
});

const sortedTodos = computed(() => {
  const grouped = filteredTodos.value.reduce((acc, todo) => {
    const dateKey = todo.date ? formatDate(new Date(todo.date)) : "無日期";
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(todo);
    return acc;
  }, {});

  // Sort the dates
  return Object.keys(grouped)
    .sort((a, b) => {
      if (a === "無日期") return 1;
      if (b === "無日期") return -1;
      return new Date(a) - new Date(b);
    })
    .map((date) => ({
      date,
      todos: grouped[date],
    }));
});

const formatDate = (date) => {
  const days = ["日", "一", "二", "三", "四", "五", "六"];
  const dayOfWeek = days[date.getDay()];
  return `${date.getMonth() + 1}/${date.getDate()} (${dayOfWeek})`;
};

const onTodoCheck = (todo) => {
  // First, just mark the todo as completed
  todo.completed = true;
  // The parent owns the actual store removal, delayed 500ms so the
  // strike-through/fade CSS transition (.todo-item-completed) has time
  // to play before the item disappears.
  emit("todo-checked", todo.id);
};

const toggleSidebar = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const selectCategory = (categoryName) => {
  selectedCategory.value = categoryName;
  leftDrawerOpen.value = false;
};

const getTodosCountForCategory = (categoryName) => {
  return props.todos.filter(
    (todo) => todo.category && todo.category.name === categoryName
  ).length;
};
</script>

<style scoped>
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

.todo-list {
  max-width: 800px;
  margin: 0 auto;
}

.todo-list .q-item {
  margin-bottom: 10px;
  background-color: #f8f8f8;
  border-radius: 8px;
  transition: all 0.3s ease;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.todo-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 25px;
  padding-left: 16px;
}

.todo-checkmarks {
  position: absolute;
  bottom: 15px;
  left: 15px;
  display: flex;
  flex-wrap: wrap;
  width: 25px;
  height: 25px;
}

.todo-checkmark {
  color: #4caf50;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
}

.todo-group {
  margin-bottom: 20px;
}

.todo-date {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  padding-left: 16px;
}

.todo-sidebar {
  background-color: #f8f8f8;
  box-shadow: 1px 0 5px rgba(0, 0, 0, 0.1);
}

.todo-sidebar .sidebar-item {
  border-radius: 8px;
  margin: 4px 8px;
  transition: background-color 0.3s ease;
}

.todo-sidebar .q-separator.spaced {
  margin: 8px 0;
}

.todo-sidebar .q-chip {
  font-size: 0.8em;
}

.todo-item {
  margin: 4px 8px;
}
.todo-list-enter-active,
.todo-list-leave-active {
  transition: all 0.5s;
}
.todo-list-enter-from,
.todo-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.todo-item-completed {
  margin: 4px 8px;
  transition: all 0.5s;
  opacity: 0.6;
  text-decoration: line-through;
  transform: translateX(100%);
}
</style>
```

**Note on the `manage-categories` emit:** this is an addition beyond the original plan's literal prop/emit table, needed because the left drawer's "管理類別" button must open `TodoDialog`'s internal category-management dialog, which now lives in a sibling component. `TodoPage.vue` (Task 5) listens for this and calls an exposed method on `TodoDialog` the same way `EventDialog` is triggered — see Task 4.

- [ ] **Step 2: Commit**

```bash
git add src/components/todo/TodoListView.vue
git commit -m "refactor(todo): extract TodoListView.vue

Todo list (grouped by date), the category sidebar drawer, and their
refs/methods, moved verbatim out of TodoPage.vue and converted to
<script setup>. Emits todo-checked so the parent can own the
500ms-delayed store removal (unchanged timing from the original).

TodoPage.vue is not updated to use this yet."
```

---

## Task 3: Create `src/components/todo/EventDialog.vue`

**Files:**
- Create: `src/components/todo/EventDialog.vue`

**Interfaces:**
- Consumes props: `modelValue` (Boolean, dialog visibility, via `defineModel`), `isEditing` (Boolean), `eventCategories` (Array), `initialEvent` (Object or null).
- Emits (beyond the implicit `update:modelValue` from `defineModel`): `save`, `delete`, `cancel` — all fired with no payload; they're notifications for the parent to refresh `CalendarView`'s day-popup, not data the parent needs to act on (this dialog dispatches its own Vuex actions).
- Exposes: nothing.

- [ ] **Step 1: Create the file**

```vue
<template>
  <q-dialog v-model="isOpen">
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
          v-model="eventCategorySelected"
          :options="eventCategories"
          option-label="name"
          label="活動類別"
        >
          <template v-slot:selected>
            <q-chip
              v-if="Object.keys(eventCategorySelected).length != 0"
              square
              :style="{ backgroundColor: eventCategorySelected.color }"
              class="q-mr-sm"
            />
            {{ eventCategorySelected.name }}
          </template>
          <template v-slot:option="{ itemProps, opt }">
            <q-item v-bind="itemProps">
              <q-item-section side>
                <q-chip :style="{ backgroundColor: opt.color }" square dense />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ opt.name }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-btn
          outline
          label="管理類別"
          @click="showEventCategoryDialog = true"
          class="btn-move-down"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="取消"
          color="primary"
          v-close-popup
          @click="handleCancel"
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

  <q-dialog v-model="showEventCategoryDialog">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">管理類別</div>
      </q-card-section>

      <q-card-section>
        <div class="text-h6 text-center">所有類別</div>
        <q-list>
          <q-item v-for="category in eventCategories" :key="category.name">
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
                v-if="Object.keys(eventCategories).length > 1"
                flat
                round
                icon="delete"
                @click="deleteEventCategory(category.name)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-separator inset color="grey" />
      <q-card-section>
        <q-input v-model="newEventCategoryName" label="新類別名稱" dense />
        <q-input v-model="newEventCategoryColor" label="新類別顏色" dense>
          <q-chip
            v-if="newEventCategoryColor"
            square
            :style="{ backgroundColor: newEventCategoryColor }"
            class="q-mr-sm"
          />
          <template v-slot:append>
            <q-icon name="colorize" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-color v-model="newEventCategoryColor" no-header-tabs />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-btn
          outline
          label="新增類別"
          @click="addEventCategory"
          class="btn-move-down"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="關閉" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showDeleteEventCategoryConfirmation">
    <q-card>
      <q-card-section class="row items-center">
        <span class="q-ml-sm"
          >確定刪除類別 "{{ eventCategoryToDelete }}"
          嗎？若確定則所有屬於這類別的活動會維持原本的樣式，但往後所有活動將無法選取為此類別。</span
        >
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="取消" color="primary" v-close-popup />
        <q-btn
          flat
          label="確定"
          color="negative"
          @click="confirmDeleteEventCategory"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useStore } from "vuex";

const props = defineProps({
  isEditing: { type: Boolean, required: true },
  eventCategories: { type: Array, required: true },
  initialEvent: { type: Object, default: null },
});

const emit = defineEmits(["save", "delete", "cancel"]);
const isOpen = defineModel({ type: Boolean, default: false });

const store = useStore();

const eventTitle = ref("");
const eventStartDate = ref("");
const eventEndDate = ref("");
const endDateErrorMessage = ref("");
const eventCategorySelected = ref({});

const showDeleteConfirmation = ref(false);

const showEventCategoryDialog = ref(false);
const newEventCategoryName = ref("");
const newEventCategoryColor = ref("");

const showDeleteEventCategoryConfirmation = ref(false);
const eventCategoryToDelete = ref(null);

const isEndDateValid = computed(() => {
  if (!eventStartDate.value || !eventEndDate.value) return true;
  return new Date(eventEndDate.value) >= new Date(eventStartDate.value);
});

const isFormValid = computed(() => {
  return (
    eventTitle.value.trim() !== "" &&
    eventStartDate.value !== "" &&
    eventEndDate.value !== "" &&
    isEndDateValid.value &&
    eventCategorySelected.value !== ""
  );
});

const validateEndDate = () => {
  if (!isEndDateValid.value) {
    endDateErrorMessage.value = "結束日期不能早於起始日期";
  } else {
    endDateErrorMessage.value = "";
  }
};

watch(eventStartDate, validateEndDate);
watch(eventEndDate, validateEndDate);

const formatDateForInput = (date) => {
  const d = new Date(date);
  let month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

// Seed the form whenever the dialog is opened, mirroring the original
// resetEventForm()/editEvent() split between "adding" and "editing".
watch(isOpen, (open) => {
  if (!open) return;
  if (props.isEditing && props.initialEvent) {
    eventTitle.value = props.initialEvent.title;
    eventStartDate.value = formatDateForInput(props.initialEvent.startDate);
    eventEndDate.value = formatDateForInput(props.initialEvent.endDate);
    eventCategorySelected.value = props.initialEvent.category;
  } else {
    resetEventForm();
  }
});

const resetEventForm = () => {
  eventTitle.value = "";
  eventStartDate.value = "";
  eventEndDate.value = "";
  eventCategorySelected.value = {};
};

const addEvent = () => {
  if (props.isEditing) {
    const updatedEvent = {
      id: props.initialEvent.id,
      title: eventTitle.value,
      startDate: new Date(eventStartDate.value),
      endDate: new Date(eventEndDate.value),
      category: eventCategorySelected.value,
    };

    store.dispatch("updateEvent", updatedEvent);

    resetEventForm();
    emit("save");
  } else {
    store.dispatch("addEvent", {
      id: Date.now(), // Generate a unique ID for the event
      title: eventTitle.value,
      startDate: new Date(eventStartDate.value),
      endDate: new Date(eventEndDate.value),
      category: eventCategorySelected.value,
    });

    resetEventForm();
    emit("save");
  }
};

const handleCancel = () => {
  resetEventForm();
  emit("cancel");
};

const confirmDelete = () => {
  showDeleteConfirmation.value = true;
};

const deleteEvent = () => {
  if (props.initialEvent) {
    store.dispatch("deleteEvent", props.initialEvent.id);
  }

  resetEventForm();
  isOpen.value = false;
  emit("delete");
};

const addEventCategory = () => {
  if (newEventCategoryName.value && newEventCategoryColor.value) {
    store.dispatch("addEventCategory", {
      name: newEventCategoryName.value,
      color: newEventCategoryColor.value,
    });
    newEventCategoryName.value = "";
    newEventCategoryColor.value = "#ADADAD";
  }
};

const deleteEventCategory = (categoryName) => {
  showDeleteEventCategoryConfirmationDialog(categoryName);
};

const showDeleteEventCategoryConfirmationDialog = (categoryName) => {
  eventCategoryToDelete.value = categoryName;
  showDeleteEventCategoryConfirmation.value = true;
};

const confirmDeleteEventCategory = () => {
  if (eventCategoryToDelete.value) {
    store.dispatch("deleteEventCategory", eventCategoryToDelete.value);
  }
  showDeleteEventCategoryConfirmation.value = false;
  eventCategoryToDelete.value = null;
};
</script>

<style scoped>
.btn-move-down {
  margin-top: 8px;
}
</style>
```

**Note on `deleteEvent`:** the original also closed `showEventDialog`/`showDayEventsDialog` and called `updateSelectedDayEvents()` directly (it had access to everything in one component). Here, closing the main dialog is `isOpen.value = false`, and `emit("delete")` is what the parent (Task 5) listens for to call `calendarViewRef.value.updateSelectedDayEvents()` — same effective sequence, just crossing a component boundary.

- [ ] **Step 2: Commit**

```bash
git add src/components/todo/EventDialog.vue
git commit -m "refactor(todo): extract EventDialog.vue

Add/edit-event dialog, its delete-confirmation dialog, and the full
event-category management flow (list, add, delete, delete-confirm),
moved verbatim out of TodoPage.vue and converted to <script setup>
using defineModel for dialog visibility. Dispatches its own Vuex
actions (addEvent/updateEvent/deleteEvent/addEventCategory/
deleteEventCategory) rather than emitting payloads - save/delete/
cancel are informational emits the parent uses only to refresh
CalendarView's day-popup.

TodoPage.vue is not updated to use this yet."
```

---

## Task 4: Create `src/components/todo/TodoDialog.vue`

**Files:**
- Create: `src/components/todo/TodoDialog.vue`

**Interfaces:**
- Consumes props: `modelValue` (Boolean, via `defineModel`), `todoCategories` (Array).
- Emits: `save`, `cancel`.
- Exposes: `openCategoryManager()` — called by Task 5's `TodoPage.vue` in response to `TodoListView`'s `manage-categories` emit (Task 2).

- [ ] **Step 1: Create the file**

```vue
<template>
  <q-dialog v-model="isOpen">
    <q-card style="min-width: 350px">
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">新增待辦事項</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input v-model="todoTitle" label="待辦事項標題" dense />
        <q-input v-model="todoDate" label="日期 (選填)" dense>
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date v-model="todoDate">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <q-select
          v-model="todoCategorySelected"
          :options="todoCategories"
          option-label="name"
          label="待辦類別 (選填)"
          emit-value
          map-options
          :disable="todoCategories.length === 0"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> 尚未建立類別 </q-item-section>
            </q-item>
          </template>
          <template v-slot:option="{ itemProps, opt }">
            <q-item v-bind="itemProps">
              <q-item-section>
                <q-item-label>{{ opt.name }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-btn
          outline
          label="管理類別"
          @click="showTodoCategoryDialog = true"
          class="btn-move-down"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="取消"
          color="primary"
          v-close-popup
          @click="handleCancel"
        />
        <q-btn
          flat
          label="新增待辦"
          color="primary"
          @click="addTodo"
          :disable="!todoTitle.trim()"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="showTodoCategoryDialog">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">管理待辦類別</div>
      </q-card-section>

      <q-card-section>
        <div class="text-h6 text-center">所有類別</div>
        <q-list>
          <q-item v-for="category in todoCategories" :key="category.name">
            <q-item-section>
              {{ category.name }}
            </q-item-section>
            <q-item-section side>
              <q-btn
                flat
                round
                icon="delete"
                @click="deleteTodoCategory(category.name)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-separator inset color="grey" />
      <q-card-section>
        <q-input v-model="newTodoCategoryName" label="新類別名稱" dense />
        <q-btn
          outline
          label="新增類別"
          @click="addTodoCategory"
          class="btn-move-down"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="關閉" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from "vue";
import { useStore } from "vuex";

defineProps({
  todoCategories: { type: Array, required: true },
});

const emit = defineEmits(["save", "cancel"]);
const isOpen = defineModel({ type: Boolean, default: false });

const store = useStore();

const todoTitle = ref("");
const todoDate = ref("");
const todoCategorySelected = ref(null);

const showTodoCategoryDialog = ref(false);
const newTodoCategoryName = ref("");

const resetTodoForm = () => {
  todoTitle.value = "";
  todoDate.value = "";
  todoCategorySelected.value = null;
};

const addTodo = () => {
  const newTodo = {
    id: Date.now(),
    title: todoTitle.value,
    date: todoDate.value ? new Date(todoDate.value) : null,
    completed: false,
    category: todoCategorySelected.value ? todoCategorySelected.value : null,
  };
  store.dispatch("addTodo", newTodo);
  resetTodoForm();
  emit("save");
};

const handleCancel = () => {
  resetTodoForm();
  emit("cancel");
};

const addTodoCategory = () => {
  if (newTodoCategoryName.value) {
    store.dispatch("addTodoCategory", {
      name: newTodoCategoryName.value,
    });
    newTodoCategoryName.value = "";
  }
};

const deleteTodoCategory = (categoryName) => {
  store.dispatch("deleteTodoCategory", categoryName);
};

function openCategoryManager() {
  showTodoCategoryDialog.value = true;
}

defineExpose({ openCategoryManager });
</script>

<style scoped>
.btn-move-down {
  margin-top: 8px;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/todo/TodoDialog.vue
git commit -m "refactor(todo): extract TodoDialog.vue

Add-todo dialog and the todo-category management flow (list, add,
delete), moved verbatim out of TodoPage.vue and converted to
<script setup> using defineModel for dialog visibility. Dispatches
its own Vuex actions (addTodo/addTodoCategory/deleteTodoCategory).
Drops newTodoCategoryColor - a data() field that was never read or
written anywhere in the original file (confirmed by grep before
writing this plan); porting a fully dead variable into a new
<script setup> file would fail yarn lint's no-unused-vars check.

TodoPage.vue is not updated to use this yet."
```

---

## Task 5: Rewrite `src/pages/TodoPage.vue`

**Files:**
- Modify: `src/pages/TodoPage.vue` (1393 lines → ~50 lines)

**Interfaces:**
- Consumes: `CalendarView`, `TodoListView`, `EventDialog`, `TodoDialog` (Tasks 1-4) as components.
- Calls `calendarViewRef.value.updateSelectedDayEvents()` after `EventDialog`'s `save`/`delete` emits.
- Calls `todoDialogRef.value.openCategoryManager()` in response to `TodoListView`'s `manage-categories` emit.

- [ ] **Step 1: Replace the entire file**

```vue
<template>
  <div class="view-toggle-container">
    <q-btn-toggle
      v-model="currentView"
      toggle-color="primary"
      spread
      :options="[
        { label: '月曆', value: 'calendar' },
        { label: '待辦', value: 'todoList' },
      ]"
      class="q-mb-md"
      style="width: 270px"
    />
  </div>

  <calendar-view
    ref="calendarViewRef"
    :events="events"
    :todos="todos"
    :school-events="schoolEvents"
    :current-view="currentView"
    @edit-event="handleEditEvent"
  />
  <todo-list-view
    :todos="todos"
    :todo-categories="todoCategories"
    :current-view="currentView"
    @todo-checked="handleTodoChecked"
    @manage-categories="handleManageTodoCategories"
  />

  <div class="add-button-container">
    <button class="add-button" @click="toggleMenu">+</button>
    <div v-if="showMenu" class="add-menu">
      <button class="menu-item" @click="openTodoDialog">💼待辦</button>
      <button class="menu-item" @click="openEventDialog">📅活動</button>
    </div>
  </div>

  <event-dialog
    ref="eventDialogRef"
    v-model="showEventDialog"
    :is-editing="isEditing"
    :event-categories="eventCategories"
    :initial-event="editingEvent"
    @save="handleEventSaved"
    @delete="handleEventDeleted"
  />

  <todo-dialog
    ref="todoDialogRef"
    v-model="showTodoDialog"
    :todo-categories="todoCategories"
  />
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import CalendarView from "../components/todo/CalendarView.vue";
import TodoListView from "../components/todo/TodoListView.vue";
import EventDialog from "../components/todo/EventDialog.vue";
import TodoDialog from "../components/todo/TodoDialog.vue";

const store = useStore();

const schoolEvents = ref([]);

const events = computed(() => store.getters.getEvents);
const eventCategories = computed(() => store.getters.getEventCategories);
const todos = computed(() => store.getters.getTodos);
const todoCategories = computed(() => store.getters.getTodoCategories);
const currentView = computed({
  get: () => store.getters.getCurrentView,
  set: (value) => store.dispatch("updateCurrentView", value),
});

const showMenu = ref(false);
const showEventDialog = ref(false);
const isEditing = ref(false);
const editingEvent = ref(null);
const showTodoDialog = ref(false);

const calendarViewRef = ref(null);
const eventDialogRef = ref(null);
const todoDialogRef = ref(null);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const openTodoDialog = () => {
  showTodoDialog.value = true;
  showMenu.value = false;
};

const openEventDialog = () => {
  isEditing.value = false;
  editingEvent.value = null;
  showEventDialog.value = true;
  showMenu.value = false;
};

const handleEditEvent = (event) => {
  editingEvent.value = event;
  isEditing.value = true;
  showEventDialog.value = true;
};

const handleEventSaved = () => {
  calendarViewRef.value?.updateSelectedDayEvents();
};

const handleEventDeleted = () => {
  calendarViewRef.value?.updateSelectedDayEvents();
};

const handleTodoChecked = (todoId) => {
  // Delay matches the original: gives the .todo-item-completed CSS
  // transition time to play before the item leaves the store/list.
  setTimeout(() => {
    store.dispatch("deleteTodo", todoId);
  }, 500);
};

const handleManageTodoCategories = () => {
  todoDialogRef.value?.openCategoryManager();
};
</script>

<style scoped>
.view-toggle-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.add-button-container {
  position: fixed;
  bottom: 140px;
  right: 20px;
  z-index: 2000;
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
  width: 95px;
  z-index: 10;
}

.add-menu .menu-item {
  display: block;
  width: 100%;
  padding: 12px 10px;
  font-size: 17px;
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
</style>
```

**Note:** the original `q-btn-toggle` had `@update:model-value="updateView"` where `updateView(newView) { store.dispatch("updateCurrentView", newView); }` — since `currentView` here is a `computed` with a `set()` that already dispatches the same action, binding `v-model="currentView"` alone (dropping the redundant `@update:model-value`) is behaviorally identical: the `set()` fires on every `v-model` write, same as `updateView` did. This mirrors how `currentView`'s getter/setter already worked in the original `setup()`.

- [ ] **Step 2: Commit**

```bash
git add src/pages/TodoPage.vue
git commit -m "refactor(todo): wire TodoPage.vue to the four new components

TodoPage.vue drops from 1393 to ~140 lines and moves from a mixed
Options/Composition API component to pure <script setup> (the bug
noted in docs/refactoring-plan.md Phase 4-B). It now owns only the
view-toggle, the FAB, and the two dialogs' visibility/data, wiring
CalendarView/TodoListView/EventDialog/TodoDialog together. This
completes the Todo split (Phase 4-B)."
```

---

## Task 6: Verify and smoke-test

- [ ] **Step 1: Confirm no leftover references to moved-away names in TodoPage.vue**

```bash
grep -n "calendarDays\|sortedTodos\|fetchAndParseSchoolEvents\|ICAL\|newTodoCategoryColor" src/pages/TodoPage.vue
```
Expected: no output.

- [ ] **Step 2: Lint**

```bash
yarn lint
```
Expected: exit 0.

- [ ] **Step 3: Force-compile every new/changed file through the dev server**

Since this environment has no headless-browser tool, this is the automated substitute for a build check (it doesn't replace clicking through the app - see Step 4):

```bash
yarn dev &
# wait for "App URL" in the log, then:
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:9000/src/pages/TodoPage.vue
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:9000/src/components/todo/CalendarView.vue
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:9000/src/components/todo/TodoListView.vue
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:9000/src/components/todo/EventDialog.vue
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:9000/src/components/todo/TodoDialog.vue
```
Expected: `200` for all five (confirms every SFC compiles and every import resolves).

- [ ] **Step 4: Interactive smoke-test (ask the project owner to check this manually, same as Phase 4-A)**

At `/#/todo`, confirm:
- No console errors on load; the view-toggle switches between 月曆 (calendar) and 待辦 (todo list) with no flicker/reset.
- Calendar: navigate months with `<`/`>`; click a day to open the day-popup; click an event inside it opens the edit dialog pre-filled correctly; click a "學校事務" event (if any exist) shows the "cannot be edited" warning instead.
- Add a new event via the FAB "活動" button; confirm it appears on the correct day(s) in the calendar.
- Edit and delete an event; confirm the calendar updates.
- Manage event categories (add one, delete one) from within the event dialog.
- Todo list: add a todo via the FAB "💼待辦" button; check it off and confirm it animates out after ~500ms; filter by category using the sidebar (☰ icon); manage todo categories from within the add-todo dialog.
- **Specifically verify state persists across view-toggle**: navigate the calendar to a different month, switch to 待辦 and back to 月曆 — confirm it's still on that month (not reset to the current month). Same for todo list: select a category filter, switch to 月曆 and back — confirm the filter is still selected.

---

## Task 7: Decision doc

**Files:**
- Create: `docs/decisions/phase-4-component-splitting/task-2-todo.md`

Follow the established pattern: "What changed, in plain language" → "Why this is safe" → a concept explainer (this task's natural subject: why `CalendarView`/`TodoListView` must stay always-mounted with an internal `v-if` rather than being `v-if`'d by the parent, since that's the one subtle, easy-to-get-wrong decision in this split) → "Verification performed."

- [ ] **Step 1: Write the doc**

- [ ] **Step 2: Commit**

```bash
git add docs/decisions/phase-4-component-splitting/task-2-todo.md
git commit -m "docs: add beginner-friendly Task 2 decision doc for Phase 4 (Todo)"
```

---

## Self-Review Notes

- **Spec coverage:** `docs/refactoring-plan.md` Phase 4-B's four named components and their prop/emit tables are all implemented; the Options/Composition API mixing fix (→ pure `<script setup>`) is done; the dead `fetchAndParseSchoolEvents`/commented `ICAL` import are both removed as instructed.
- **Placeholder scan:** No TBD/TODO. Full content given for all four new files and the rewritten parent.
- **Type/name consistency:** Cross-checked `updateSelectedDayEvents` (CalendarView expose ↔ parent's `calendarViewRef.value.updateSelectedDayEvents()` call), `openCategoryManager` (TodoDialog expose ↔ parent's `todoDialogRef.value.openCategoryManager()` call), and every emit name (`edit-event`, `todo-checked`, `manage-categories`, `save`, `delete`, `cancel`) against its corresponding `@`-listener in the parent template.
- **Two additions beyond the plan's literal table**, both necessary and both called out inline where introduced: `defineModel` for dialog visibility (props table didn't list it, but a dialog component needs some way to be shown/hidden), and `TodoListView`'s `manage-categories` emit (needed to reach `TodoDialog`'s category dialog from the sidebar button, which lives in a different component now).
- **Next sub-phase:** Phase 4-C (`SettingsPage.vue`) gets its own plan document, written after this one is executed and committed.
