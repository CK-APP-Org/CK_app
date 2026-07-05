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
