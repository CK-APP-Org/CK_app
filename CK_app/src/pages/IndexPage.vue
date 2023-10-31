<template>
  <q-page>
    <div class="q-gutter-md">
      <div class="input-container">
        <q-input filled v-model="userTempClass" label="班級 (ex: 227)" />
        <q-btn color="secondary" label="確認班級" @click="confirmClass" />
      </div>
    </div>
    <h4 class="beautiful-text">{{ userClass }} 課表, double click class to customize</h4>
    <div class="table-container">
      <table class="responsive-table">
        <tr v-for="row in scheduleData[userClass]" :key="row">
          <td class="class-text" v-for="col in row" :key="col" @dblclick="customLabel">{{ col }}</td>
        </tr>
      </table>
    </div>
    <img
      alt="class schedule"
      :src="getClassScheduleImageURL"
      class="responsive-image"
    />
  </q-page>
</template>


<style scoped>
.input-container {
  display: flex;
  align-items: center;
}

.q-input {
  flex: 1;
  margin-right: 10px;
}

.responsive-image {
  width: 100%;
  height: auto;
}

.beautiful-text {
  font-size: 24px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #1683f7;
  font-weight: bold;
  text-transform: uppercase;
  text-decoration: underline;
  letter-spacing: 2px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.class-text{
  font-size: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #fc7e00;
  font-weight: bold;
  letter-spacing: auto;
}
.responsive-table {
  border-collapse: collapse;
  width: 100%; /* Make the table width 100% of its container */
  height: 500px;
}

.responsive-table td {
  border: 1px solid #000;
  padding: 5px;
  text-align: center;
}
.table-container {
  overflow-x: auto; /* Add horizontal scrollbar if the table overflows the screen */
}
</style>
<script>
import { defineComponent } from "vue";
import jsonData from "src/assets/data.json";

export default {
  data() {
    return {
      userClass: 227,
      userTempClass: 227,
      scheduleData: jsonData,
    };
  },
  methods: {
    confirmClass() {
      alert("成功更改班級為" + this.userTempClass);
      this.userClass = this.userTempClass;
    },
    customLabel() {
      alert("Still in development")
    }
  },
  computed: {
    getClassScheduleImageURL() {
      const imageURL = `src/assets/schedule/${this.userClass}/page-1.jpg`;
      console.log("Image URL:", imageURL);
      return imageURL;
    },
  },
};
</script>
