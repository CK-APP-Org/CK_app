<template>
  <q-dialog v-model="isOpen" full-width>
    <q-layout view="Lhh lpR fff" container class="bg-white">
      <q-header elevated class="bg-primary text-white">
        <q-toolbar>
          <q-toolbar-title>餐廳列表</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
      </q-header>

      <q-page-container>
        <q-page class="q-pa-md">
          <q-list separator>
            <q-item v-for="restaurant in markers" :key="restaurant.name">
              <q-item-section>
                <q-item-label>{{ restaurant.name }}</q-item-label>
                <q-item-label caption>
                  今日營業: {{ restaurant.openingHours[getCurrentDay()] }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  :icon="
                    isFavorite(restaurant) ? 'favorite' : 'favorite_border'
                  "
                  flat
                  round
                  color="red"
                  @click="toggleFavorite(restaurant)"
                />
              </q-item-section>
              <q-item-section side>
                <q-btn
                  label="詳細資訊"
                  color="primary"
                  flat
                  @click="$emit('show-detail', restaurant)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-dialog>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { getCurrentDay } from "../../composables/useRestaurantHours";

defineProps({
  markers: { type: Array, required: true },
});

defineEmits(["show-detail"]);

const isOpen = defineModel({ type: Boolean, default: false });

const store = useStore();

const favoriteRestaurants = computed(
  () => store.getters.getFavoriteRestaurants
);

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
