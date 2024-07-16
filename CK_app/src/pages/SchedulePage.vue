<template>
  <div class="q-pa-md">
    <q-table
      flat
      bordered
      title="217 課表"
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
          <q-btn v-for="day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']"
            :key="day"
            :label="getDayLabel(day)"
            :color="visibleColumns.includes(day) ? 'primary' : 'secondary'"
            @click="changeVisibleColumn(day)"
            dense
            outline />
        </div>
      </div>

    </template>

      <template v-slot:body-cell="props">
        <q-td
          :props="props"
          :class="{ 'split-cell': props.col.name !== 'name' }"
        >
          <template v-if="props.col.name !== 'name'">
            <div
              class="cell-content"
              :style="{
                backgroundColor: getCellColor(props.row, props.col.name),
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
                @update:model-value="updateCell(props.row, props.col.name, {...scope.value, subject: $event})"
              />
              <q-input
                v-model="scope.value.note"
                label="備註"
                dense
                class="q-mb-sm"
                @update:model-value="updateCell(props.row, props.col.name, {...scope.value, note: $event})"
              />
              <q-select
                :options="colorOptions"
                v-model="scope.value.color"
                label="顏色"
                dense
                options-dense
                @update:model-value="updateCell(props.row, props.col.name, {...scope.value, color: $event.value})"
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
import store from '../store/store';


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
export default {
  setup() {
    const visibleColumns = ref(["name", "Monday"]);
    const changeVisibleColumn = (columnName) => {
      visibleColumns.value = ["name", columnName];
    };


    const scheduleData = computed(() => store.getters.getScheduleData);
    const userClass = computed(() => store.getters.getUserClass);
    const options = computed(() => store.getters.getOptions);
    const colorOptions = computed(() => store.getters.getColorOptions);
    onMounted(() => {
      if (store.state.scheduleData.length === 0) {
        store.dispatch('loadScheduleData');
      }
    });

    const getCellColor = (row, colName) => {
      if (colName === "name") return "";
      return row[colName] && row[colName].color
        ? row[colName].color
        : "#ffecb3";
    };

    const getCellSubject = (row, colName) => {
      if (colName === "name") return row[colName];
      return row[colName] && row[colName].subject ? row[colName].subject : "";
    };

    const updateCell = (row, colName, newValue) => {
      const rowIndex = scheduleData.value.indexOf(row);
      store.commit('UPDATE_CELL', { rowIndex, colName, newValue });
    };

    const getCellNote = (row, colName) => {
      if (colName === "name") return "";
      return row[colName] && row[colName].note ? row[colName].note : "";
    };

    const getDayLabel = (day) => {
      const labels = {
        Monday: '星期一',
        Tuesday: '星期二',
        Wednesday: '星期三',
        Thursday: '星期四',
        Friday: '星期五'
      };
      return labels[day] || day;
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
      getDayLabel
    };
  },
};
</script>



<style>
.my-custom-table {
  background-color: var(--q-primary-accent);
  border-radius: 8px;
  overflow: hidden;
}

.my-custom-table .q-table__top {
  font-size: 1.5em;
  padding: 16px;
  background-color: #ebd57d;
  color: white;
}

.my-custom-table .q-table thead tr th {
  font-size: 1.6em;
  background-color: #ebd57d;
}

.my-custom-table .q-table tbody td {
  font-size: 1.5em;
  padding: 0;
}

.my-custom-table .q-table tbody td.smaller-column {
  font-size: 1.5em;
  width: 20px;
  color: #efcf4e;
  font-weight: bolder;
  padding: 0.2em;
  text-align: center; /* Add this line to center the text */
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
  color: #616161;
  flex: 2;
  border-left: 1px solid rgba(0, 0, 0, 0.12);
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
</style>
