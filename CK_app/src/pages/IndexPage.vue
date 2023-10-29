<template>
  <q-page>
    <div class="q-gutter-md">
      <div class="input-container">
        <q-input filled v-model="userTempClass" label="班級 (ex: 227)" />
        <q-btn color="secondary" label="確認班級" @click="confirmClass" />
      </div>
    </div>
    <h4 class="beautiful-text">{{ userClass }} 課表</h4>

    <h4 class="beautiful-text">{{ data }}</h4>
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
  color: #007bff;
  font-weight: bold;
  text-transform: uppercase;
  text-decoration: underline;
  font-family: "Arial", sans-serif; /* Use a specific font */
  letter-spacing: 2px; /* Increase letter spacing */
  margin-top: 10px; /* Add spacing above the text */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); /* Add a text shadow */
}
</style>
<script>
import { defineComponent } from "vue";
import jsonData from "src/assets/data.json";

export default {
  data() {
    return {
      userClass: "000",
      userTempClass: "227",
    };
  },
  methods: {
    confirmClass() {
      alert("成功更改班級為" + this.userTempClass);
      this.userClass = this.userTempClass;
    },
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
