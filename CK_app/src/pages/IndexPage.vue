<template>
  <q-page>
    <div style="max-width: 200px;" class="q-gutter-md">
      <q-input filled v-model="userTempClass" label="Class(ex:227)" />
      <q-btn color="secondary" label="Confirm" @click="confirmClass"/>
    </div>
    <h4>{{userClass}} schedule</h4>
    <img
      alt="Quasar logo"
      src="~assets/227schedule.png"
      style="width: 450px; height: 600px"
    />
  </q-page>
</template>

<script>
import { defineComponent } from "vue";

export default{
  data(){
    return{
      userClass:'000',
      userTempClass: '227'
    }
  },
  methods: {
    confirmClass(){
      alert("Changing your class number to "+this.userTempClass)
      this.userClass = this.userTempClass
    }
  }
}
</script>
