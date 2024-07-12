<template>
  <div class="app-container">
    <div class="header">
      <h5>歡迎使用 CK APP</h5>
      <h6>為你量身打造的專屬校園APP</h6>
    </div>
    <div class="icon-grid">
      <div v-for="item in items" :key="item.name" class="icon-item">
        <img :src="item.icon" :alt="item.name">
        <span>{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { name: 'Ride', icon: 'ride-icon.svg' },
        { name: 'Food', icon: 'food-icon.svg' },
        { name: 'Package', icon: 'package-icon.svg' },
        { name: 'Reserve', icon: 'reserve-icon.svg' },
        { name: 'Transit', icon: 'transit-icon.svg' },
        { name: 'Rent', icon: 'rent-icon.svg' },
        { name: 'Travel', icon: 'travel-icon.svg' },
        { name: 'More', icon: 'more-icon.svg' },
      ]
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
  font-weight: bold;
}

.header {
  background-color:chocolate;
  color: white;
  padding-top: 0.1em;
  padding-bottom: 0.1em;
  padding-left: 1em;
  border-radius: 15px;
  margin-bottom: 20px;
  font-weight: bolder;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.icon-item img {
  width: 50px;
  height: 50px;
  margin-bottom: 5px;
}
</style>
