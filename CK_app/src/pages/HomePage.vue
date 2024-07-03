<template>
  <div class="q-pa-md">
    <q-table
      flat
      bordered
      title="217 課表"
      :rows="rows"
      :columns="columns"
      row-key="name"
      :visible-columns="visibleColumns"
      class="my-custom-table"
      separator="cell"
      :rows-per-page-options=[0]
    >

      <template v-slot:top>
        <div class="text-h5 text-bold">{{userClass}}  課表</div>

        <q-space />

        <q-select
          v-model="visibleColumns"
          outlined
          dense
          options-dense
          :display-value="$q.lang.table.columns"
          emit-value
          map-options
          :options="columns"
          option-value="name"
          options-cover
          style="min-width: 150px"
          bg-color="purple-1"
        />
      </template>


      <template v-slot:body-cell="props">
        <q-td :props="props" :class="{ 'split-cell': props.col.name !== 'name' }">
          <template v-if="props.col.name !== 'name'">
            <div class="cell-content" :style="{ backgroundColor: getCellColor(props.row, props.col.name) }">
              <div class="subject-slot">{{ getCellSubject(props.row, props.col.name) }}</div>
              <div class="note-slot">{{ getCellNote(props.row, props.col.name) }}</div>
            </div>
            <q-popup-edit v-model="props.row[props.col.name]" auto-save v-slot="scope">
              <div class="text-h6 q-mb-md">自訂課表</div>
              <q-select
                :options="options"
                v-model="scope.value.subject"
                label="科目"
                dense
                options-dense
                class="q-mb-sm"
              />
              <q-input
                v-model="scope.value.note"
                label="備註"
                dense
                class="q-mb-sm"
              />
              <q-select
                :options="colorOptions"
                v-model="scope.value.color"
                label="顏色"
                dense
                options-dense
                @update:model-value="updateCellColor(props.row, props.col.name, $event)"
              >
                <template v-slot:option="{ itemProps, opt }">
                  <q-item v-bind="itemProps">
                    <q-item-section avatar>
                      <q-avatar :color="opt.value" size="xs" />
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
import { ref } from 'vue'

const columns = [
  {
    name: 'name',
    required: true,
    label: '節數',
    align: 'left',
    field: row => row.name,
    classes: 'smaller-column'
  },
  { name: 'Monday', align: 'center', label: '星期一', field: 'Monday'},
  { name: 'Tuesday', align: 'center', label: '星期二', field: 'Tuesday'},
  { name: 'Wednesday', align: 'center', label: '星期三', field: 'Wednesday' },
  { name: 'Thursday', align: 'center', label: '星期四', field: 'Thursday' },
  { name: 'Friday', align: 'center', label: '星期五', field: 'Friday' },
]

export default {
  setup () {
    const rows = ref([
      {
        name: '第一節',
        Monday: { subject: "選修物理", note: "", color: "#ffecb3" },
        Tuesday: { subject: "選修物理", note: "", color: "#ffecb3" },
        Wednesday: { subject: "選修化學", note: "", color: "#ffecb3" },
        Thursday: { subject: "選修化學", note: "", color: "#ffecb3" },
        Friday: { subject: "多元選修", note: "", color: "#ffecb3" },
      },
      {
        name: '第二節',
        Monday: { subject: "選修物理", note: "", color: "#ffecb3" },
        Tuesday: { subject: "選修物理", note: "", color: "#ffecb3" },
        Wednesday: { subject: "選修化學", note: "", color: "#ffecb3" },
        Thursday: { subject: "選修化學", note: "", color: "#ffecb3" },
        Friday: { subject: "多元選修", note: "", color: "#ffecb3" },
      },
      {
        name: '第三節',
        Monday: { subject: "選修物理", note: "", color: "#ffecb3" },
        Tuesday: { subject: "選修物理", note: "", color: "#ffecb3" },
        Wednesday: { subject: "選修化學", note: "", color: "#ffecb3" },
        Thursday: { subject: "選修化學", note: "", color: "#ffecb3" },
        Friday: { subject: "多元選修", note: "", color: "#ffecb3" },
      },
      {
        name: '第四節',
        Monday: { subject: "選修物理", note: "", color: "#ffecb3" },
        Tuesday: { subject: "選修物理", note: "", color: "#ffecb3" },
        Wednesday: { subject: "選修化學", note: "", color: "#ffecb3" },
        Thursday: { subject: "選修化學", note: "", color: "#ffecb3" },
        Friday: { subject: "多元選修", note: "", color: "#ffecb3" },
      },
      {
        name: '第五節',
        Monday: { subject: "選修物理", note: "", color: "#ffecb3" },
        Tuesday: { subject: "選修物理", note: "", color: "#ffecb3" },
        Wednesday: { subject: "選修化學", note: "", color: "#ffecb3" },
        Thursday: { subject: "選修化學", note: "", color: "#ffecb3" },
        Friday: { subject: "多元選修", note: "", color: "#ffecb3" },
      },
      {
        name: '第六節',
        Monday: { subject: "選修物理", note: "", color: "#ffecb3" },
        Tuesday: { subject: "選修物理", note: "", color: "#ffecb3" },
        Wednesday: { subject: "選修化學", note: "", color: "#ffecb3" },
        Thursday: { subject: "選修化學", note: "", color: "#ffecb3" },
        Friday: { subject: "多元選修", note: "", color: "#ffecb3" },
      },
      {
        name: '第七節',
        Monday: { subject: "選修物理", note: "", color: "#ffecb3" },
        Tuesday: { subject: "選修物理", note: "", color: "#ffecb3" },
        Wednesday: { subject: "選修化學", note: "", color: "#ffecb3" },
        Thursday: { subject: "選修化學", note: "", color: "#ffecb3" },
        Friday: { subject: "多元選修", note: "", color: "#ffecb3" },
      },
      {
        name: '課後',
        Monday: { subject: "補習", note: "", color: "#ffecb3" },
        Tuesday: { subject: "補習", note: "", color: "#ffecb3" },
        Wednesday: { subject: "補習", note: "", color: "#ffecb3" },
        Thursday: { subject: "補習", note: "", color: "#ffecb3" },
        Friday: { subject: "補習", note: "", color: "#ffecb3" },
      },
    ])

    return {
      visibleColumns: ref(['name', 'Monday']),
      columns,
      rows,
      userClass: "217",
      options: [
        '國文', '數學', '英文', '地理', '歷史', '公民', '生物', '物理', '化學', '地科', '音樂', '美術'
      ],
      colorOptions: [
        { label: 'Default', value: '#ffecb3' },
        { label: 'Red', value: '#FFCCCB' },
        { label: 'Green', value: '#90EE90' },
        { label: 'Blue', value: '#ADD8E6' },
        { label: 'Yellow', value: '#FFFFE0' },
        { label: 'Purple', value: '#C26FF9' }
      ]
    }
  },
  methods: {
    getCellColor(row, colName) {
      if (colName === 'name') return ''; // No color for the first column
      return row[colName] && row[colName].color ? row[colName].color : '#ffecb3';
    },
    getCellSubject(row, colName) {
      if (colName === 'name') return row[colName]; // Return the period number for the first column
      return row[colName] && row[colName].subject ? row[colName].subject : '';
    },
    updateCellColor(row, colName, newColor) {
      if (row[colName]) {
        row[colName].color = newColor.value;
        console.log(newColor)
      }
    },
    getCellNote(row, colName) {
      if (colName === 'name') return '';
      return row[colName] && row[colName].note ? row[colName].note : '';
    },

  }
}
</script>

<style>
.my-custom-table {
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.my-custom-table .q-table__top {
  font-size: 1.5em;
  padding: 16px;
  background-color: #4a148c;
  color: white;
}

.my-custom-table .q-table thead tr th {
  font-size: 1.2em;
  background-color: #7e57c2;
  color: white;
}

.my-custom-table .q-table tbody td {
  font-size: 1.5em;
  padding: 0;
}

.my-custom-table .q-table tbody td.smaller-column {
  font-size: 1em;
  width: 40px;
  color: #4a148c;
  font-weight: bold;
  padding: 8px;
}

.split-cell {
  padding: 0 !important;
}

.cell-content {
  display: flex;
  height: 100%;
  transition: background-color 0.3s ease;
}

.subject-slot, .note-slot {
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
</style>
