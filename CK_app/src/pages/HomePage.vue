<template>
  <div class="app-container">
    <div class="header">
      <h5 class="font-weight-bold">歡迎使用 CK APP</h5>
      <h6>為你量身打造的專屬校園APP</h6>
    </div>
    <div class="icon-grid">
      <div v-for="item in items" :key="item.name" class="icon-item">
        <q-btn
          stack
          class="icon-btn"
          :rounded="true"
          @click="navigateTo(item.link)"
        >
          <q-icon :name="item.icon" size="2.5em" />
          <div class="text-content">{{ item.name }}</div>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { name: '課表', icon: 'book', link: '/schedule' },
        { name: '行事曆', icon: 'calendar_month', link: '/todo' },
        { name: 'Youbike', icon: 'directions_bike', link: '/todo' },
        { name: '熱食部', icon: 'dining', link: '/todo' },
        { name: '美食', icon: 'newspaper', link: '/todo' },
        { name: '校網', icon: 'newspaper', link: '/todo' },
        { name: '設定', icon: 'settings', link: '/todo' },
        { name: '關於', icon: 'info', link: '/todo' },
        { name: '無功能:(', icon: 'close', link: '/' },
      ]
    }
  },
  methods: {
    navigateTo(link) {
      this.$router.push(link);
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
  color: white;
  padding-top: 0.1em;
  padding-bottom: 0.1em;
  padding-left: 1em;
  border-radius: 15px;
  margin-bottom: 20px;
  background-image: url('https://i.imgur.com/dkAQeoi.jpeg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
  height: 200px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.icon-item {
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-btn {
  width: 100%;
  height: 0;
  padding-bottom: 100%; /* This makes the button square */
  position: relative;
  background-color: bisque;
}

.icon-btn ::v-deep .q-btn__content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.icon-btn ::v-deep .q-icon {
  margin-bottom: 5px;
}

.icon-btn ::v-deep .text-caption {
  font-size: 0.8em;
  line-height: 1.2;
}
</style>
