<template>
  <div class="q-pa-md">
    <q-table
      flat bordered
      title="Schedule"
      :rows="rows"
      :columns="columns"
      row-key="name"
      :visible-columns="visibleColumns"
      class="bg-yellow-1 text-gray text-bold bigger-text"
      hide-bottom
    >
      <template v-slot:top>
        <img
          style="height: 50px; width: 50px"
          src="https://cdn.iconscout.com/icon/free/png-512/free-book-1227-460350.png?f=webp&w=256"
        >
        <div class="text-h3">{{userClass}}課表</div>

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
    format: val => `${val}`,
    classes: 'smaller-column'
  },
  { name: 'Monday', align: 'center', label: '星期一', field: 'Monday'},
  { name: 'Tuesday', align: 'center', label: '星期二', field: 'Tuesday'},
  { name: 'Wednesday', align: 'center', label: '星期三', field: 'Wednesday' },
  { name: 'Thursday', align: 'center', label: '星期四', field: 'Thursday' },
  { name: 'Friday', align: 'center', label: '星期五', field: 'Friday' },
]

const rows = [
  {
    name: '第一節',
    Monday: "選修物理",
    Tuesday: "選修物理",
    Wednesday: "選修化學",
    Thursday: "選修化學",
    Friday: "多元選修",
  },
  {
    name: '第二節',
    Monday: "選修物理",
    Tuesday: "選修物理",
    Wednesday: "選修化學",
    Thursday: "選修化學",
    Friday: "多元選修",
  },
  {
    name: '第三節',
    Monday: "選修物理",
    Tuesday: "選修物理",
    Wednesday: "選修化學",
    Thursday: "選修化學",
    Friday: "多元選修",
  },
  {
    name: '第四節',
    Monday: "選修物理",
    Tuesday: "選修物理",
    Wednesday: "選修化學",
    Thursday: "選修化學",
    Friday: "多元選修",
  },
  {
    name: '第五節',
    Monday: "選修物理",
    Tuesday: "選修物理",
    Wednesday: "選修化學",
    Thursday: "選修化學",
    Friday: "多元選修",
  },
  {
    name: '第六節',
    Monday: "選修物理",
    Tuesday: "選修物理",
    Wednesday: "選修化學",
    Thursday: "選修化學",
    Friday: "多元選修",
  },
  {
    name: '第七節',
    Monday: "選修物理",
    Tuesday: "選修物理",
    Wednesday: "選修化學",
    Thursday: "選修化學",
    Friday: "多元選修",
  },
]

export default {
  setup () {
    return {
      visibleColumns: ref(['name', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
      columns,
      rows,
      userClass: "217"
    }
  },
}
</script>

<style>
.bigger-text .q-table tbody td {
  font-size: 2.5em;
}

.bigger-text .q-table thead tr th {
  font-size: 1.5em;
}

.bigger-text .q-table thead tr th.smaller-column,
.bigger-text .q-table tbody td.smaller-column {
  font-size: 1.35em;
  width: 40px;
}
</style>
