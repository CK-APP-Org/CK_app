<template>
  <div class="q-pa-md">
    <q-table
      flat bordered
      title="Schedule"
      :rows="rows"
      :columns="columns"
      row-key="name"
      :visible-columns="visibleColumns"
      class="bg-amber-3 text-gray text-bold bigger-text"
      separator="cell"
      :rows-per-page-options=[0]
    >
      <template v-slot:top>
        <img
          style="height: 50px; width: 50px"
          src="https://cdn.iconscout.com/icon/free/png-512/free-book-1227-460350.png?f=webp&w=256"
        >
        <div class="text-h3 text-bold">{{userClass}}  課表</div>

        <q-space />

        <q-select
          v-model="visibleColumns"
          multiple
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
        />
      </template>

      <template v-slot:body-cell="props">
        <q-td :props="props" :style="{ backgroundColor: getCellColor(props.row, props.col.name) }">
          <q-popup-edit v-model="props.row[props.col.name]" auto-save v-slot="scope">
            <q-select
              :options="options"
              v-model="scope.value.subject"
              label="Subject"
              dense
              options-dense
              class="q-mb-md"
            />
            <q-select
              :options="colorOptions"
              v-model="scope.value.color"
              label="Color"
              dense
              options-dense
              @update:model-value="updateCellColor(props.row, props.col.name, $event)"
            >
              <template v-slot:option="{ itemProps, opt }">
                <q-item v-bind="itemProps">
                  <q-item-section side>
                    <q-chip :style="{ backgroundColor: opt.value }" square dense />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-popup-edit>
          {{ getCellSubject(props.row, props.col.name) }}
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
        Monday: { subject: "選修物理", color: "#ffecb3" },
        Tuesday: { subject: "選修物理", color: "#ffecb3" },
        Wednesday: { subject: "選修化學", color: "#ffecb3" },
        Thursday: { subject: "選修化學", color: "#ffecb3" },
        Friday: { subject: "多元選修", color: "#ffecb3" },
      },
      {
        name: '第二節',
        Monday: { subject: "選修物理", color: "#ffecb3" },
        Tuesday: { subject: "選修物理", color: "#ffecb3" },
        Wednesday: { subject: "選修化學", color: "#ffecb3" },
        Thursday: { subject: "選修化學", color: "#ffecb3" },
        Friday: { subject: "多元選修", color: "#ffecb3" },
      },
      {
        name: '第三節',
        Monday: { subject: "選修物理", color: "#ffecb3" },
        Tuesday: { subject: "選修物理", color: "#ffecb3" },
        Wednesday: { subject: "選修化學", color: "#ffecb3" },
        Thursday: { subject: "選修化學", color: "#ffecb3" },
        Friday: { subject: "多元選修", color: "#ffecb3" },
      },
      {
        name: '第四節',
        Monday: { subject: "選修物理", color: "#ffecb3" },
        Tuesday: { subject: "選修物理", color: "#ffecb3" },
        Wednesday: { subject: "選修化學", color: "#ffecb3" },
        Thursday: { subject: "選修化學", color: "#ffecb3" },
        Friday: { subject: "多元選修", color: "#ffecb3" },
      },
      {
        name: '第五節',
        Monday: { subject: "選修物理", color: "#ffecb3" },
        Tuesday: { subject: "選修物理", color: "#ffecb3" },
        Wednesday: { subject: "選修化學", color: "#ffecb3" },
        Thursday: { subject: "選修化學", color: "#ffecb3" },
        Friday: { subject: "多元選修", color: "#ffecb3" },
      },
      {
        name: '第六節',
        Monday: { subject: "選修物理", color: "#ffecb3" },
        Tuesday: { subject: "選修物理", color: "#ffecb3" },
        Wednesday: { subject: "選修化學", color: "#ffecb3" },
        Thursday: { subject: "選修化學", color: "#ffecb3" },
        Friday: { subject: "多元選修", color: "#ffecb3" },
      },
      {
        name: '第七節',
        Monday: { subject: "選修物理", color: "#ffecb3" },
        Tuesday: { subject: "選修物理", color: "#ffecb3" },
        Wednesday: { subject: "選修化學", color: "#ffecb3" },
        Thursday: { subject: "選修化學", color: "#ffecb3" },
        Friday: { subject: "多元選修", color: "#ffecb3" },
      },
    ])

    return {
      visibleColumns: ref(['name', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
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
    }

  }
}
</script>

<style>
.bigger-text .q-table tbody td {
  font-size: 2.5em;
}

.bigger-text .q-table thead tr th {
  font-size: 1.5em;
  color: rgb(176, 18, 18);
  font-weight: bold;
}

.bigger-text .q-table thead tr th.smaller-column,
.bigger-text .q-table tbody td.smaller-column {
  font-size: 1.35em;
  width: 40px;
  color:rgb(123, 201, 45)
}
</style>
