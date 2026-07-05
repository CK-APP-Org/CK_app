<template>
  <div
    v-if="isOpen"
    class="custom-sidebar"
    :class="{ 'sidebar-open': isOpen }"
  >
    <div class="sidebar-name">
      <div v-if="marker">
        <div class="text-h5">{{ marker.name }}</div>
        <div v-if="marker.openingHours">
          <div class="text-h6">營業時間:</div>
          <div
            v-for="(hours, day) in translateDays(marker.openingHours)"
            :key="day"
            :class="{ 'today-hours': isToday(day) }"
            class="day-info"
          >
            <div class="day-hours-line">
              <span class="day-label">{{ day }}</span>
              <span class="hours-info">{{ hours.split(",")[0].trim() }}</span>
            </div>
            <template v-for="(section, index) in hours.split(',')" :key="index">
              <div v-if="index > 0" class="additional-hours">
                {{ section.trim() }}
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <q-btn
      :icon="isFavorite(marker) ? 'favorite' : 'favorite_border'"
      flat
      round
      color="red"
      class="favorite-btn"
      @click="toggleFavorite(marker)"
    />
    <q-btn
      icon="close"
      flat
      round
      color="grey-8"
      class="close-btn"
      @click="isOpen = false"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { translateDays } from "../../composables/useRestaurantHours";

defineProps({
  marker: { type: Object, default: null },
});

const isOpen = defineModel({ type: Boolean, default: false });

const store = useStore();

const favoriteRestaurants = computed(
  () => store.getters.getFavoriteRestaurants
);

const isToday = (day) => {
  const today = new Date().toLocaleDateString("zh-TW", { weekday: "long" });
  return day === today;
};

const toggleFavorite = (restaurant) => {
  const index = favoriteRestaurants.value.findIndex(
    (r) => r.name === restaurant.name
  );
  if (index === -1) {
    favoriteRestaurants.value.push(restaurant);
    store.dispatch("addFavoriteRestaurant", restaurant);
  } else {
    favoriteRestaurants.value.splice(index, 1);
    store.dispatch("removeFavoriteRestaurant", restaurant.name);
  }
};

const isFavorite = (restaurant) => {
  return favoriteRestaurants.value.some((r) => r.name === restaurant.name);
};
</script>

<style scoped>
.day-info {
  margin-bottom: 10px;
  margin-left: 20px;
}

.day-hours-line {
  display: flex;
  align-items: baseline;
}

.day-label {
  width: 4em; /* Adjust this value to align all hours properly */
  flex-shrink: 0;
}

.hours-info {
  margin-left: 1em;
}

.additional-hours {
  margin-left: 5em; /* This should match the width of .day-label + .hours-info margin-left */
}

.today-hours {
  font-weight: bold;
  color: #2196f3;
}

.custom-sidebar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  transform: translateY(100%);
  transition: transform 0.3s ease-out;
  z-index: 1000;
  height: 37vh; /* Increased height to 70% of viewport height */
}

.sidebar-open {
  transform: translateY(0);
}

.sidebar-name {
  padding: 20px;
  height: calc(100% - 60px); /* Adjust for padding */
  overflow-y: auto;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.favorite-btn {
  position: absolute;
  top: 10px;
  right: 50px; /* Adjust this value to position it next to the close button */
}
</style>
