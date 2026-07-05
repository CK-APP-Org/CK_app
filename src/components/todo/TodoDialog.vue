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
