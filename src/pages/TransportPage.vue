<template>
  <q-page class="bg-grey-1 q-pa-sm">
    <youbike-section ref="youbikeSectionRef" />
    <metro-section ref="metroSectionRef" />

    <div class="add-button-container">
      <button class="add-button" @click="toggleMenu">+</button>
      <div v-if="showMenu" class="add-menu">
        <button class="menu-item" @click="openAddYoubikeStationDialog">
          <q-icon name="directions_bike" />&ensp;YouBike
        </button>
        <button class="menu-item" @click="openAddMetroStationDialog">
          <q-icon name="directions_subway" />&ensp;北捷
        </button>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import YoubikeSection from "../components/transport/YoubikeSection.vue";
import MetroSection from "../components/transport/MetroSection.vue";

const showMenu = ref(false);
const youbikeSectionRef = ref(null);
const metroSectionRef = ref(null);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const openAddYoubikeStationDialog = () => {
  youbikeSectionRef.value.openAddStationDialog();
  showMenu.value = false;
};

const openAddMetroStationDialog = () => {
  metroSectionRef.value.openAddStationDialog();
  showMenu.value = false;
};
</script>

<style scoped>
.add-button-container {
  position: fixed;
  bottom: 140px;
  right: 20px;
  z-index: 2000;
}

.add-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #c10015;
  color: white;
  font-size: 24px;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-menu {
  position: absolute;
  bottom: 70px;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 110px;
  z-index: 10;
}

.add-menu .menu-item {
  display: block;
  width: 100%;
  padding: 12px 10px;
  font-size: 17px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  text-align: center;
  white-space: nowrap;
}
</style>
