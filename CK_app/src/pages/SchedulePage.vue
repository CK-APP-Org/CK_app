<template>
  <div v-if="loading" class="loading-spinner">
    <q-spinner size="3em" color="primary" />
  </div>
  <div v-else class="q-pa-md">
    <div class="custom-banner q-mb-md">
      <q-icon name="info" color="info" size="sm" class="q-mr-sm" />
      點擊課表格子可自訂科目、顏色和備註
    </div>
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
      hide-pagination
      hide-bottom
    >
      <template v-slot:top>
        <div class="row items-center justify-between q-mb-md">
          <div class="row items-center">
            <q-btn
              flat
              dense
              round
              icon="edit"
              color="primary"
              class="q-mr-sm"
              @click="confirmClassChangeDialog = true"
            />
            <div class="text-h5 text-bold">{{ userClass }} 課表 &thinsp;</div>
            <q-btn
              round
              size="sm"
              color="primary"
              outline
              icon="refresh"
              @click="confirmRegenerate"
            />
            <q-dialog v-model="confirmClassChangeDialog">
              <q-card style="min-width: 300px; max-width: 400px">
                <q-card-section class="row items-center q-pb-none">
                  <div class="text-h6 text-bold">設定班級</div>
                  <q-space />
                  <q-btn icon="close" flat round dense v-close-popup />
                </q-card-section>

                <q-card-section class="q-pt-md">
                  <q-select
                    filled
                    v-model="selectedClass"
                    :options="classOptions"
                    @update:model-value="confirmClassChange"
                    label="選擇班級"
                    use-input
                    input-debounce="0"
                    behavior="menu"
                  >
                    <template v-slot:prepend>
                      <q-icon name="school" color="primary" />
                    </template>
                  </q-select>
                </q-card-section>

                <q-card-section class="text-caption text-grey-8">
                  更改班級將重置當前的課表。
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn
                    flat
                    label="取消"
                    color="primary"
                    @click="classHelp = false"
                  />
                  <q-btn
                    flat
                    label="確認"
                    color="primary"
                    @click="updateUserClass"
                    :disable="!selectedClass"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>
          </div>
          <div class="row q-gutter-sm">
            <q-btn
              v-for="day in days"
              :key="day"
              :label="getDayLabel(day)"
              :color="visibleColumns.includes(day) ? 'primary' : 'grey-7'"
              @click="changeVisibleColumn(day)"
              dense
              outline
              no-caps
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
            { 'current-class': isCurrentClass(props.row, props.col.name) },
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
            <q-popup-edit v-model="props.row[props.col.name]" v-slot="scope">
              <div class="text-h6 q-mb-md">自訂課表</div>
              <q-input
                v-model="scope.value.subject"
                label="科目"
                dense
                class="q-mb-sm"
              />
              <q-input
                v-if="scope.value.subject === '自訂'"
                v-model="scope.value.customSubject"
                label="自訂科目名稱"
                dense
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
              <div class="row justify-end q-mt-md">
                <q-btn
                  label="儲存"
                  color="primary"
                  @click="saveCell(props.row, props.col.name, scope.value)"
                  v-close-popup
                />
              </div>
            </q-popup-edit>
          </template>
          <template v-else>
            {{ props.row[props.col.name] }}
          </template>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="regenerateConfirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm"
            >重新載入將會清除所有您對課表的修改。確定要繼續嗎？</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn
            flat
            label="確定"
            color="primary"
            @click="regenerateSchedule"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { onMounted, ref, computed } from "vue";
import { useQuasar } from "quasar";
import { useStore } from "vuex";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import loadingSchedule from "../data/loadingSchedule.json";
import axios from "axios";
import { Browser } from "@capacitor/browser";

const classOptions = [
  101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115,
  116, 117, 118, 119, 120, 121, 122, 123, 125, 126, 127, 128, 201, 202, 203,
  204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218,
  219, 220, 221, 222, 223, 225, 226, 227, 328, 301, 302, 303, 304, 305, 306,
  307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321,
  322, 323, 325, 326, 327, 328,
];

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

export default {
  setup() {
    const store = useStore();
    const $q = useQuasar();

    const confirmClassChangeDialog = ref(false);

    const userAccount = computed(() => store.getters.getUserAccount);
    const scheduleData = ref(loadingSchedule.schedule);

    const userClass = ref("");
    const selectedClass = ref("載入中");

    const userData = ref(null);
    const userRef = ref(null); // Declare userRef here
    const loading = ref(true);

    const SCHEDULE_URL =
      "https://raw.githubusercontent.com/CK-APP-Org/ScheduleData/main/ClassesSchedule.json";

    const regenerateConfirm = ref(false);
    const confirmRegenerate = () => {
      regenerateConfirm.value = true;
    };

    const regenerateSchedule = async () => {
      try {
        console.log("Fetching new schedule data...");
        const response = await axios.get(SCHEDULE_URL);
        console.log("Received response:", response.data);

        const newScheduleData = response.data[userClass.value]["schedule"];
        console.log("New schedule data:", newScheduleData);

        const updatePath2 = `${userAccount.value}.Schedule.ScheduleData`;
        await updateDoc(userRef.value, { [updatePath2]: newScheduleData });
        console.log("Firestore document updated");

        store.dispatch("loadSchedule");
        console.log("Vuex store updated");

        // Refresh user data and class
        userRef.value = doc(db, "User Data", "Userdata");
        const docSnap = await getDoc(userRef.value);
        userData.value = docSnap.data()[userAccount.value];
        userClass.value = userData.value["Schedule"]["userClass"];
        scheduleData.value = userData.value["Schedule"]["ScheduleData"];

        console.log("User data refreshed");

        $q.notify({
          message: "已重新匯入課表",
          color: "positive",
          position: "bottom",
          timeout: 2000,
        });
      } catch (error) {
        console.error("Error regenerating schedule:", error);
        $q.notify({
          message: "重新匯入課表時發生錯誤",
          color: "negative",
          position: "bottom",
          timeout: 2000,
        });
      }
    };

    const visibleColumns = ref([
      "name",
      [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][new Date().getDay()],
    ]);
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const changeVisibleColumn = (columnName) => {
      visibleColumns.value = ["name", columnName];
    };

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

      userRef.value = doc(db, "User Data", "Userdata"); // Initialize userRef here
      const docSnap = await getDoc(userRef.value);
      userData.value = docSnap.data()[userAccount.value];
      userClass.value = userData.value["Schedule"]["userClass"];
      scheduleData.value = userData.value["Schedule"]["ScheduleData"];
      console.log(userData.value["Schedule"]["ScheduleData"]);
      selectedClass.value = userClass.value;
      loading.value = false;
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

    const saveCell = async (row, colName, newValue) => {
      $q.notify({
        message: "儲存中",
        color: "yellow-7",
        position: "bottom",
        timeout: 2000,
      });

      const rowIndex = scheduleData.value.indexOf(row);
      store.dispatch("updateSchedule", { rowIndex, colName, newValue });
      const currentData = scheduleData.value;
      currentData[rowIndex][colName] = newValue;
      const updatePath = `${userAccount.value}.Schedule.ScheduleData`;
      await updateDoc(userRef.value, { [updatePath]: currentData });

      $q.notify({
        message: "已儲存更改",
        color: "positive",
        position: "bottom",
        timeout: 2000,
      });
    };

    const confirmClassChange = (newClass) => {
      selectedClass.value = newClass;
      confirmClassChangeDialog.value = true;
    };

    const updateUserClass = async () => {
      const updatePath = `${userAccount.value}.Schedule.userClass`;
      await updateDoc(userRef.value, { [updatePath]: selectedClass.value });
      store.dispatch("setUserClass", selectedClass.value);
      const response = await axios.get(SCHEDULE_URL);
      const scheduleData = response.data[selectedClass.value]["schedule"];
      const updatePath2 = `${userAccount.value}.Schedule.ScheduleData`;
      await updateDoc(userRef.value, { [updatePath2]: scheduleData });
      store.dispatch("loadSchedule");
      confirmClassChangeDialog.value = false;
      userRef.value = doc(db, "User Data", "Userdata"); // Initialize userRef here
      const docSnap = await getDoc(userRef.value);
      userData.value = docSnap.data()[userAccount.value];
      userClass.value = userData.value["Schedule"]["userClass"];
      scheduleData.value = userData.value["Schedule"]["ScheduleData"];
      $q.notify({
        message: `已成功更改班級為 ${selectedClass.value}`,
        color: "positive",
        position: "bottom",
        timeout: 2000,
      });
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
      const currentDay = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][now.getDay()];
      const currentHour = now.getHours();

      // Assuming classes start at 8 AM and each period is 1 hour
      const currentPeriod =
        ["一", "二", "三", "四", "五", "五", "六", "七"][currentHour - 8] ||
        "課後";

      return colName === currentDay && row.name === currentPeriod.toString();
    };

    return {
      visibleColumns,
      columns,
      scheduleData,
      userClass,
      colorOptions,
      getCellColor,
      getCellSubject,
      getCellNote,
      changeVisibleColumn,
      getDayLabel,
      getLabelValue,
      getFormattedColor,
      days,
      isCurrentClass,
      classHelp: ref(false),
      regenerateConfirm,
      confirmRegenerate,
      regenerateSchedule,
      userData,
      userAccount,
      selectedClass,
      confirmClassChange,
      classOptions,
      confirmClassChangeDialog,
      updateUserClass,
      saveCell,
      loading,
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
  font-size: 0.6em;
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

.q-item__label.text-italic {
  font-style: italic;
  color: #666;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Full viewport height */
}

.custom-banner {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.9em;
  display: flex;
  align-items: center;
}
</style>
