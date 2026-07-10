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
