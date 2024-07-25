<template>
  <div class="q-pa-md">
    <q-table
      flat
      bordered
      :title="userClass + ' 課表'"
      :rows="scheduleData"
      :columns="columns"
      row-key="name"
      :visible-columns="visibleColumns"
      class="my-custom-table"
      separator="cell"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h5 text-bold">{{ userClass }} 課表</div>
          <div class="row q-gutter-sm">
            <q-btn
              v-for="day in days"
              :key="day"
              :label="getDayLabel(day)"
              :color="visibleColumns.includes(day) ? 'primary' : 'grey'"
              @click="changeVisibleColumn(day)"
              dense
              outline
            />
          </div>
        </div>
      </template>

      <template v-slot:body-cell="props">
        <q-td
          :props="props"
          :class="[
            { 'split-cell': props.col.name !== 'name' },
            { 'thick-border-bottom': props.row.name === '五' },
            { 'current-class': isCurrentClass(props.row, props.col.name) }
          ]"
        >
          <template v-if="props.col.name !== 'name'">
            <div
              class="cell-content"
              :style="{
                backgroundColor: getLabelValue(
                  getCellColor(props.row, props.col.name)
                ),
              }"
            >
              <div class="subject-slot">
                {{ getCellSubject(props.row, props.col.name) }}
              </div>
              <div class="note-slot">
                {{ getCellNote(props.row, props.col.name) }}
              </div>
            </div>
            <q-popup-edit
              v-model="props.row[props.col.name]"
              auto-save
              v-slot="scope"
            >
              <div class="text-h6 q-mb-md">自訂課表</div>
              <q-select
                :options="options"
                v-model="scope.value.subject"
                label="科目"
                dense
                options-dense
                class="q-mb-sm"
                @update:model-value="
                  updateCell(props.row, props.col.name, {
                    ...scope.value,
                    subject: $event,
                  })
                "
              />
              <q-input
                v-model="scope.value.note"
                label="備註"
                dense
                class="q-mb-sm"
                @update:model-value="
                  updateCell(props.row, props.col.name, {
                    ...scope.value,
                    note: $event,
                  })
                "
              />
              <q-select
                :options="colorOptions"
                v-model="scope.value.color"
                label="顏色"
                dense
                options-dense
                @update:model-value="
                  updateCell(props.row, props.col.name, {
                    ...scope.value,
                    color: $event.label,
                  })
                "
              >
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
            </q-popup-edit>
          </template>
          <template v-else>
            {{ props.row[props.col.name] }}
          </template>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script>
import { onMounted, ref, computed } from "vue";
import store from "../store/index";

const columns = [
  {
    name: "name",
    required: true,
    label: "節數",
    align: "left",
    field: (row) => row.name,
    classes: "smaller-column",
  },
  { name: "Monday", align: "center", label: "星期一", field: "Monday" },
  { name: "Tuesday", align: "center", label: "星期二", field: "Tuesday" },
  { name: "Wednesday", align: "center", label: "星期三", field: "Wednesday" },
  { name: "Thursday", align: "center", label: "星期四", field: "Thursday" },
  { name: "Friday", align: "center", label: "星期五", field: "Friday" },
];

const colorOptions = [
  { label: "Default", value: "#f4f4f1" },
  { label: "Red", value: "#FFCCCB" },
  { label: "Orange", value: "#f5c884" },
  { label: "Yellow", value: "#FFFFE0" },
  { label: "Green", value: "#90EE90" },
  { label: "Blue", value: "#ADD8E6" },
  { label: "Purple", value: "#e299ff" },
  { label: "Pink", value: "#ffa1e4" },
];

const options = [
  "國文",
  "數學",
  "英文",
  "地理",
  "歷史",
  "公民",
  "生物",
  "物理",
  "化學",
  "地科",
  "音樂",
  "美術",
  "體育",
  "社團",
  "其他",
];

const classOptions = [217, 227];

export default {
  setup() {
    const visibleColumns = ref(["name", "Monday"]);
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const changeVisibleColumn = (columnName) => {
      visibleColumns.value = ["name", columnName];
    };

    const scheduleData = computed(() => store.getters.getScheduleData);
    const userClass = computed(() => store.getters.getUserClass);

    onMounted(() => {
      if (scheduleData.value.length === 0) {
        store.dispatch("loadSchedule");
      }
    });

    const getCellSubject = (row, colName) => {
      if (colName === "name") return row[colName];
      return row[colName] && row[colName].subject ? row[colName].subject : "";
    };
    const getCellColor = (row, colName) => {
      if (colName === "name") return "Default";
      return getFormattedColor(row[colName]?.color);
    };
    const getFormattedColor = (color) => {
      if (color && typeof color === "object" && color.label) {
        return color.label;
      }
      return color || "Default";
    };
    const getCellNote = (row, colName) => {
      if (colName === "name") return "";
      return row[colName] && row[colName].note ? row[colName].note : "";
    };
    const getLabelValue = (label) => {
      const option = colorOptions.find((opt) => opt.label === label);
      return option ? option.value : "#f4f4f1"; // Default color if not found
    };

    const updateCell = (row, colName, newValue) => {
      const rowIndex = scheduleData.value.indexOf(row);
      store.dispatch("updateSchedule", { rowIndex, colName, newValue });
    };

    const getDayLabel = (day) => {
      const labels = {
        Monday: "星期一",
        Tuesday: "星期二",
        Wednesday: "星期三",
        Thursday: "星期四",
        Friday: "星期五",
      };
      return labels[day] || day;
    };

    const isCurrentClass = (row, colName) => {
      const now = new Date();
      const currentDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()];
      const currentHour = now.getHours();

      // Assuming classes start at 8 AM and each period is 1 hour
      const currentPeriod = ["一", "二", "三", "四", "五", "六", "七"][currentHour - 9] || "課後";

      return colName === currentDay && row.name === currentPeriod.toString();
    };

    return {
      visibleColumns,
      columns,
      scheduleData,
      userClass,
      options,
      colorOptions,
      getCellColor,
      getCellSubject,
      updateCell,
      getCellNote,
      changeVisibleColumn,
      getDayLabel,
      getLabelValue,
      getFormattedColor,
      classOptions,
      days,
      isCurrentClass
    };
  },
};
</script>

<style>
.my-custom-table {
  background-color: var(--q-primary-accent);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #d0d0d0;
}

.my-custom-table .q-table__top {
  font-size: 1.5em;
  padding: 16px;
  background-color: #d9d9d9;
  color: rgb(0, 0, 0);
  border-bottom: 1px solid #d0d0d0;
}

.my-custom-table .q-table thead tr th {
  font-size: 1.6em;
  background-color: #d9d9d9;
  border: 1px solid #d0d0d0;
}

.my-custom-table .q-table tbody td {
  font-size: 1.5em;
  padding: 0;
  border: 1px solid #d0d0d0;
}

.my-custom-table .q-table tbody td.smaller-column {
  font-size: 1.5em;
  width: 20px;
  color: #353102;
  background-color: #d9d9d9;
  font-weight: bolder;
  padding: 0.2em;
  text-align: center;
  border: 1px solid #d0d0d0;
}

.split-cell {
  padding: 0 !important;
}

.cell-content {
  display: flex;
  height: 100%;
  transition: background-color 0.3s ease;
}

.subject-slot,
.note-slot {
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.subject-slot {
  font-weight: bold;
  flex: 3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 5em;
}

.note-slot {
  font-size: 0.8em;
  color: #00000085;
  flex: 2;
  border-left: 5px solid rgba(0, 0, 0, 0.12);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-content:hover {
  filter: brightness(0.9);
}

.q-table__top {
  flex-direction: column;
  align-items: stretch;
}

.q-table__top .row.q-gutter-sm {
  justify-content: center;
  margin-top: 8px;
}

.my-custom-table .q-table tbody td.thick-border-bottom {
  position: relative;
}

.my-custom-table .q-table tbody td.thick-border-bottom::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 1px;
  background-color: #d9d9d9;
  z-index: 1;
}

.current-class {
  position: relative;
}

.current-class::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid #423f40;
  pointer-events: none;
  z-index: 2;
}
</style>
