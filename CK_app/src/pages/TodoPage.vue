<template>
  <!-- Loading Spinner -->
  <div v-if="loading" class="loading-spinner">
    <q-spinner size="3em" color="primary" />
  </div>
  <div v-else>
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
        @update:model-value="updateView"
        style="width: 270px"
      />
    </div>
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

    <div class="add-button-container">
      <button class="add-button" @click="toggleMenu">+</button>
      <div v-if="showMenu" class="add-menu">
        <button class="menu-item" @click="openTodoDialog">💼待辦</button>
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
          <div class="text-h6">{{ formatDate(selectedDate) }}</div>
        </q-card-section>

        <q-card-section>
          <q-list v-if="selectedDayItems.length > 0">
            <q-item
              v-for="(item, index) in selectedDayItems"
              :key="index"
              clickable
              @click="item.type === 'event' ? editEvent(item) : null"
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

    <q-dialog v-model="showTodoDialog">
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
                <q-item-section class="text-grey">
                  尚未建立類別
                </q-item-section>
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
            @click="resetTodoForm"
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

    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      bordered
      class="todo-sidebar"
    >
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
              {{ todosCount }}
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
              :text-color="
                selectedCategory === category.name ? 'black' : 'white'
              "
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
          @click="showTodoCategoryDialog = true"
          class="full-width"
        />
      </q-item>
    </q-drawer>
  </div>
</template>

<script>
import { computed, ref, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { colors, useQuasar } from "quasar";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteField,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";

export default {
  setup() {
    const store = useStore();
    const $q = useQuasar();

    const currentDate = ref(new Date());
    const weekdays = ref(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    const showMenu = ref(false);
    const showEventDialog = ref(false);
    const eventTitle = ref("");
    const eventStartDate = ref("");
    const eventEndDate = ref("");
    const endDateErrorMessage = ref("");
    const selectedDate = ref(null);
    const selectedDayEvents = ref([]);
    const showDayEventsDialog = ref(false);
    const editingEvent = ref(null);
    const isEditing = ref(false);
    const showDeleteConfirmation = ref(false);
    const eventCategorySelected = ref({});
    const showEventCategoryDialog = ref(false);
    const newEventCategoryName = ref("");
    const newEventCategoryColor = ref("");
    const showDeleteEventCategoryConfirmation = ref(false);
    const eventCategoryToDelete = ref(null);
    const showTodoDialog = ref(false);
    const todoTitle = ref("");
    const todoDate = ref("");
    const todoCategorySelected = ref(null);
    const showTodoCategoryDialog = ref(false);
    const newTodoCategoryName = ref("");
    const newTodoCategoryColor = ref("");
    const leftDrawerOpen = ref(false);
    const selectedCategory = ref(null);
    const selectedDayItems = ref([]);

    const events = ref([]);
    const eventCategories = ref([]);
    const todoCategories = ref([]);
    const todos = ref([]);
    const currentView = ref("calendar");

    const userData = ref(null);
    const userRef = ref(null); // Declare userRef here

    const loading = ref(true);

    const userAccount = computed(() => store.getters.getUserAccount);

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

    onMounted(async () => {
      loading.value = true;
      console.log(userAccount.value);

      userRef.value = doc(db, "User Data", "Userdata"); // Initialize userRef here
      const docSnap = await getDoc(userRef.value);
      userData.value = docSnap.data()[userAccount.value];
      events.value = userData.value["Todo"]["events"].map((event) => ({
        ...event,
        startDate: event.startDate.toDate(),
        endDate: event.endDate.toDate(),
      }));
      eventCategories.value = userData.value["Todo"]["eventCategories"];
      todos.value = userData.value["Todo"]["todos"];
      todos.value = userData.value["Todo"]["todos"].map((event) => ({
        ...event,
        date: event.date ? event.date.toDate() : null,
      }));
      currentView.value = userData.value["Todo"]["currentView"];
      todoCategories.value = userData.value["Todo"]["todoCategories"];
      loading.value = false;
    });

    const currentMonthYear = computed(() => {
      return currentDate.value.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
    });

    const calendarDays = computed(() => {
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth();

      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);

      const daysInMonth = lastDayOfMonth.getDate();
      const startingDayOfWeek = firstDayOfMonth.getDay();

      const refreshPage = async () => {
        if (Capacitor.isNativePlatform()) {
          // Native app (iOS or Android)
          await Browser.reload();
        } else {
          // Web browser
          window.location.reload();
        }
      };

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
        const dayEvents = events.value
          .filter((event) => {
            const eventStart = new Date(event.startDate);
            const eventEnd = new Date(event.endDate);
            return day.date >= eventStart && day.date <= eventEnd;
          })
          .map((event) => ({ ...event, type: "event" }));

        const dayTodos = todos.value
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
          .slice(0, 6); // Limit to 6 items total

        return {
          ...day,
          items: combinedItems,
          isToday: isToday(day.date),
        };
      });
    });

    const isFormValid = computed(() => {
      return (
        eventTitle.value.trim() !== "" &&
        eventStartDate.value !== "" &&
        eventEndDate.value !== "" &&
        isEndDateValid.value &&
        Object.keys(eventCategorySelected.value).length !== 0
      );
    });

    const isEndDateValid = computed(() => {
      if (!eventStartDate.value || !eventEndDate.value) return true;
      return new Date(eventEndDate.value) >= new Date(eventStartDate.value);
    });

    const filteredTodos = computed(() => {
      if (!selectedCategory.value) {
        return todos.value;
      }
      return todos.value.filter(
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

    function previousMonth() {
      currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() - 1,
        1
      );
    }

    function nextMonth() {
      currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() + 1,
        1
      );
    }

    function toggleMenu() {
      showMenu.value = !showMenu.value;
    }

    function openTodoDialog() {
      showTodoDialog.value = true;
      showMenu.value = false;
    }

    function openEventDialog() {
      showEventDialog.value = true;
      showMenu.value = false;
    }

    async function addEvent() {
      if (isEditing.value) {
        saveEditedEvent();
      } else {
        // Check if the start date and end date are valid
        if (
          !isValidDate(eventStartDate.value) ||
          !isValidDate(eventEndDate.value)
        ) {
          $q.notify({
            type: "negative",
            message: "請輸入正確之日期",
          });
          return;
        }

        const newEvent = {
          id: Date.now(),
          title: eventTitle.value,
          startDate: new Date(eventStartDate.value),
          endDate: new Date(eventEndDate.value),
          category: eventCategorySelected.value,
        };

        events.value = [...events.value, newEvent];
        const updatePath = `${userAccount.value}.Todo.events`;
        await updateDoc(userRef.value, {
          [updatePath]: events.value.map((item) => ({
            id: item.id,
            title: item.title,
            startDate: item.startDate,
            endDate: item.endDate,
            category: item.category,
          })),
        });

        resetEventForm();
        showEventDialog.value = false;
        updateSelectedDayEvents();
      }
    }

    function isValidDate(dateString) {
      const date = new Date(dateString);
      return !isNaN(date.getTime());
    }

    function resetEventForm() {
      eventTitle.value = "";
      eventStartDate.value = "";
      eventEndDate.value = "";
      isEditing.value = false;
      editingEvent.value = null;
      eventCategorySelected.value = {};
    }

    function validateEndDate() {
      if (!isEndDateValid.value) {
        endDateErrorMessage.value = "結束日期不能早於起始日期";
      } else {
        endDateErrorMessage.value = "";
      }
    }

    function showDayEvents(day) {
      selectedDate.value = day.date;

      selectedDayItems.value = day.items;

      showDayEventsDialog.value = true;
    }

    function formatDate(date) {
      const days = ["日", "一", "二", "三", "四", "五", "六"];
      const dayOfWeek = days[date.getDay()];
      return `${date.getMonth() + 1}/${date.getDate()} (${dayOfWeek})`;
    }

    function editEvent(event) {
      editingEvent.value = { ...event };
      eventTitle.value = event.title;
      eventStartDate.value = formatDateForInput(event.startDate);
      eventEndDate.value = formatDateForInput(event.endDate);
      eventCategorySelected.value = event.category;
      isEditing.value = true;
      showEventDialog.value = true;
      showDayEventsDialog.value = false;
    }

    function formatDateForInput(date) {
      const d = new Date(date);
      let month = "" + (d.getMonth() + 1);
      let day = "" + d.getDate();
      const year = d.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      return [year, month, day].join("-");
    }

    async function saveEditedEvent() {
      const updatedEvent = {
        id: editingEvent.value.id,
        title: eventTitle.value,
        startDate: new Date(eventStartDate.value),
        endDate: new Date(eventEndDate.value),
        category: eventCategorySelected.value,
      };

      console.log(updatedEvent.startDate);

      // Find the index of the event with the same id
      const eventIndex = events.value.findIndex(
        (event) => event.id === updatedEvent.id
      );

      if (eventIndex !== -1) {
        // Replace the event at the found index
        events.value[eventIndex] = updatedEvent;
      } else {
        // If not found, add the new event (optional, depending on your requirements)
        events.value.push(updatedEvent);
      }

      const updatePath = `${userAccount.value}.Todo.events`;
      await updateDoc(userRef.value, {
        [updatePath]: events.value.map((item) => ({
          id: item.id,
          title: item.title,
          startDate: item.startDate,
          endDate: item.endDate,
          category: item.category,
        })),
      });

      //store.dispatch("updateEvent", updatedEvent);

      resetEventForm();
      showEventDialog.value = false;
      showDayEventsDialog.value = false;

      updateSelectedDayEvents();
    }

    async function updateSelectedDayEvents() {
      if (selectedDate.value) {
        userRef.value = doc(db, "User Data", "Userdata"); // Initialize userRef here
        const docSnap = await getDoc(userRef.value);
        userData.value = docSnap.data()[userAccount.value];
        const allEvents = userData.value["Todo"]["events"].map((event) => ({
          ...event,
          startDate: event.startDate.toDate(),
          endDate: event.endDate.toDate(),
        }));
        selectedDayEvents.value = allEvents.filter((event) => {
          const eventStart = new Date(event.startDate);
          const eventEnd = new Date(event.endDate);
          return (
            selectedDate.value >= eventStart && selectedDate.value <= eventEnd
          );
        });
      }
    }

    function confirmDelete() {
      showDeleteConfirmation.value = true;
    }

    async function deleteEvent() {
      if (editingEvent.value) {
        //store.dispatch("deleteEvent", editingEvent.value.id);
      }
      const eventIndex = events.value.findIndex(
        (event) => event.id === editingEvent.value.id
      );
      events.value.splice(eventIndex, 1);
      const updatePath = `${userAccount.value}.Todo.events`;
      await updateDoc(userRef.value, {
        [updatePath]: events.value.map((item) => ({
          id: item.id,
          title: item.title,
          startDate: item.startDate,
          endDate: item.endDate,
          category: item.category,
        })),
      });
      resetEventForm();
      showEventDialog.value = false;
      showDayEventsDialog.value = false;

      updateSelectedDayEvents();
    }

    async function addEventCategory() {
      if (newEventCategoryName.value && newEventCategoryColor.value) {
        const newCategory = {
          name: newEventCategoryName,
          color: newEventCategoryColor,
        };
        eventCategories.value = [...eventCategories.value, newCategory];
        const updatePath = `${userAccount.value}.Todo.eventCategories`;
        await updateDoc(userRef.value, {
          [updatePath]: eventCategories.value.map((item) => ({
            name: item.name,
            color: item.color,
          })),
        });
        userRef.value = doc(db, "User Data", "Userdata"); // Initialize userRef here
        const docSnap = await getDoc(userRef.value);
        userData.value = docSnap.data()[userAccount.value];
        eventCategories.value = userData.value["Todo"]["eventCategories"];
        /*
        store.dispatch("addEventCategory", {
          name: newEventCategoryName.value,
          color: newEventCategoryColor.value,
        });
        newEventCategoryName.value = "";
        newEventCategoryColor.value = "#ADADAD";
        */
      }
    }

    function deleteEventCategory(categoryName) {
      showDeleteEventCategoryConfirmationDialog(categoryName);
    }

    function showDeleteEventCategoryConfirmationDialog(categoryName) {
      eventCategoryToDelete.value = categoryName;
      showDeleteEventCategoryConfirmation.value = true;
    }

    async function confirmDeleteEventCategory() {
      if (eventCategoryToDelete.value) {
        //store.dispatch("deleteEventCategory", eventCategoryToDelete.value);
        console.log(eventCategoryToDelete.value);
        const eventIndex = eventCategories.value.findIndex(
          (event) => event.name === eventCategoryToDelete.value
        );
        console.log(eventIndex);
        eventCategories.value.splice(eventIndex, 1);
        const updatePath = `${userAccount.value}.Todo.eventCategories`;
        await updateDoc(userRef.value, {
          [updatePath]: eventCategories.value.map((item) => ({
            name: item.name,
            color: item.color,
          })),
        });
        userRef.value = doc(db, "User Data", "Userdata"); // Initialize userRef here
        const docSnap = await getDoc(userRef.value);
        userData.value = docSnap.data()[userAccount.value];
        eventCategories.value = userData.value["Todo"]["eventCategories"];
      }
      showDeleteEventCategoryConfirmation.value = false;
      eventCategoryToDelete.value = null;
    }

    function isToday(date) {
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }

    async function addTodo() {
      // Check if the todo date is valid
      if (todoDate.value && !isValidDate(todoDate.value)) {
        $q.notify({
          type: "negative",
          message: "Please enter a valid date.",
        });
        return;
      }

      const newTodo = {
        id: Date.now(),
        title: todoTitle.value,
        date: todoDate.value ? new Date(todoDate.value) : null,
        completed: false,
        category: todoCategorySelected.value
          ? todoCategorySelected.value
          : null,
      };
      todos.value = [...todos.value, newTodo];
      const updatePath = `${userAccount.value}.Todo.todos`;
      await updateDoc(userRef.value, {
        [updatePath]: todos.value.map((item) => ({
          id: item.id,
          title: item.title,
          date: item.date,
          completed: item.completed,
          category: item.category,
        })),
      });
      resetTodoForm();
      showTodoDialog.value = false;
    }

    function resetTodoForm() {
      todoTitle.value = "";
      todoDate.value = "";
      todoCategorySelected.value = null;
    }

    async function updateView(newView) {
      const updatePath = `${userAccount.value}.Todo.currentView`;
      await updateDoc(userRef.value, { [updatePath]: newView });
      //store.dispatch("updateCurrentView", newView);
    }

    async function onTodoCheck(todo) {
      todo.completed = true;
      //store.dispatch("deleteTodo", todo.id);
      $q.notify({
        type: "positive",
        message: "已完成",
      });
      const todoIndex = todos.value.findIndex((t) => t.id === todo.id);

      todos.value.splice(todoIndex, 1);

      const updatePath = `${userAccount.value}.Todo.todos`;

      await updateDoc(userRef.value, {
        [updatePath]: todos.value.map((item) => ({
          id: item.id,
          title: item.title,
          date: item.date,
          completed: item.completed,
          category: item.category,
        })),
      });
    }

    async function addTodoCategory() {
      // Log the new category name
      console.log(newTodoCategoryName.value);

      // Check if the new category name is not empty
      if (newTodoCategoryName.value) {
        // Create a new todo category object
        const todocat = { name: newTodoCategoryName.value };

        // Initialize todoCategories.value as an array if it's not already
        if (!Array.isArray(todoCategories.value)) {
          todoCategories.value = [];
        }

        // Add the new todo category to the list
        todoCategories.value = [...todoCategories.value, todocat];

        // Define the path to update
        const updatePath = `${userAccount.value}.Todo.todoCategories`;

        // Update Firestore with the new categories
        await updateDoc(userRef.value, {
          [updatePath]: todoCategories.value.map((item) => ({
            name: item.name,
          })),
        });

        // Initialize userRef here if needed (ensure this is correct)
        userRef.value = doc(db, "User Data", "Userdata");

        // Get the updated document snapshot
        const docSnap = await getDoc(userRef.value);

        // Update local userData with the fetched data
        userData.value = docSnap.data()[userAccount.value];

        // Update local todoCategories from the fetched data
        todoCategories.value = userData.value["Todo"]["todoCategories"];

        // Dispatch the addTodoCategory action with the new category
        /*
        store.dispatch("addTodoCategory", {
          name: newTodoCategoryName.value,
        });
        */

        // Clear the input value for new category name
        newTodoCategoryName.value = "";
      }
    }

    async function deleteTodoCategory(categoryName) {
      const eventIndex = todoCategories.value.findIndex(
        (event) => event.name === categoryName
      );
      console.log(eventIndex);
      todoCategories.value.splice(eventIndex, 1);
      const updatePath = `${userAccount.value}.Todo.todoCategories`;
      await updateDoc(userRef.value, {
        [updatePath]: todoCategories.value.map((item) => ({
          name: item.name,
        })),
      });
      userRef.value = doc(db, "User Data", "Userdata"); // Initialize userRef here
      const docSnap = await getDoc(userRef.value);
      userData.value = docSnap.data()[userAccount.value];
      eventCategories.value = userData.value["Todo"]["todoCategories"];
      //store.dispatch("deleteTodoCategory", categoryName);
    }

    function toggleSidebar() {
      leftDrawerOpen.value = !leftDrawerOpen.value;
    }

    function selectCategory(categoryName) {
      selectedCategory.value = categoryName;
      leftDrawerOpen.value = false;
    }

    function getTodosCountForCategory(categoryName) {
      return todos.value.filter(
        (todo) => todo.category && todo.category.name === categoryName
      ).length;
    }

    const todosCount = computed(() => {
      return todos.value ? todos.value.length : 0;
    });

    watch(eventStartDate, validateEndDate);
    watch(eventEndDate, validateEndDate);

    return {
      currentDate,
      weekdays,
      showMenu,
      showEventDialog,
      eventTitle,
      eventStartDate,
      eventEndDate,
      endDateErrorMessage,
      selectedDate,
      selectedDayEvents,
      showDayEventsDialog,
      editingEvent,
      isEditing,
      showDeleteConfirmation,
      eventCategorySelected,
      showEventCategoryDialog,
      newEventCategoryName,
      newEventCategoryColor,
      showDeleteEventCategoryConfirmation,
      eventCategoryToDelete,
      showTodoDialog,
      todoTitle,
      todoDate,
      todoCategorySelected,
      showTodoCategoryDialog,
      newTodoCategoryName,
      newTodoCategoryColor,
      leftDrawerOpen,
      selectedCategory,
      selectedDayItems,
      events,
      eventCategories,
      todos,
      currentView,
      currentMonthYear,
      calendarDays,
      isFormValid,
      isEndDateValid,
      filteredTodos,
      sortedTodos,
      todoCategories,
      todosCount,
      previousMonth,
      nextMonth,
      toggleMenu,
      openTodoDialog,
      openEventDialog,
      addEvent,
      resetEventForm,
      validateEndDate,
      showDayEvents,
      formatDate,
      editEvent,
      formatDateForInput,
      saveEditedEvent,
      updateSelectedDayEvents,
      confirmDelete,
      deleteEvent,
      addEventCategory,
      deleteEventCategory,
      showDeleteEventCategoryConfirmationDialog,
      confirmDeleteEventCategory,
      isToday,
      addTodo,
      resetTodoForm,
      updateView,
      onTodoCheck,
      addTodoCategory,
      deleteTodoCategory,
      toggleSidebar,
      selectCategory,
      getTodosCountForCategory,
      loading,
    };
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

.add-button-container {
  position: fixed;
  bottom: 85px;
  right: 20px;
  z-index: 1000;
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
.btn-move-down {
  margin-top: 8px;
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

.view-toggle-container {
  display: flex;
  justify-content: center;
  margin-top: 10px;
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

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Full viewport height */
}
</style>
