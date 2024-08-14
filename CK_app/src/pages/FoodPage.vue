<template>
  <div>
    <q-page class="flex column relative-position">
      <!-- Loading overlay -->
      <div v-if="isLoading" class="loading-overlay flex flex-center">
        <q-spinner size="70px" color="primary" />
        <div class="q-mt-sm text-primary">讀取資料中...</div>
      </div>

      <div v-else-if="error" class="error-message q-pa-md">{{ error }}</div>

      <div v-else>
        <div class="map-controls-1 q-pa-md">
          <q-btn
            color="primary"
            label="畫面顯示列表"
            @click="showRestaurantList = true"
            class="q-mr-sm"
          />
          <q-checkbox
            v-model="hideClosedRestaurants"
            label="正在營業"
            class="q-mr-md"
          />
          <q-checkbox v-model="showOnlyFavorites" label="我的最愛" />
        </div>

        <div class="map-controls-2 q-pa-md">
          <q-btn color="primary" icon="info" @click="showLegend = true" />
          <q-btn
            color="primary"
            label="隨機選擇餐廳"
            outline
            @click="selectRandomRestaurant"
            class="q-ml-sm"
          />
        </div>

        <l-map
          ref="mapRef"
          style="height: 90vh; width: 100%"
          :zoom="16"
          :center="[25.031204, 121.515496]"
          :options="mapOptions"
        >
          <l-tile-layer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          ></l-tile-layer>
          <l-marker :lat-lng="[25.03079, 121.51227]" :icon="ckIcon">
            <l-popup><div class="text-h6">建中</div></l-popup>
          </l-marker>
          <l-marker
            v-for="marker in markers"
            :key="marker.name"
            :lat-lng="marker.position"
            :icon="getMarkerIcon(marker)"
            @click="showSidebar(marker)"
          >
            <l-popup :options="{ offset: new Point(0, -10) }">
              <div class="text-h6">{{ marker.name }}</div>
              <div class="today-hours">
                今日營業&nbsp;
                <template
                  v-for="(section, index) in marker.openingHours[
                    getCurrentDay()
                  ].split(',')"
                  :key="index"
                >
                  <span v-if="index === 0">{{ section.trim() }}</span>
                  <div v-else class="additional-hours-popup">
                    {{ section.trim() }}
                  </div>
                </template>
              </div>
            </l-popup>
          </l-marker>
        </l-map>

        <!-- Custom Sidebar -->
        <div
          v-if="sidebarOpen"
          class="custom-sidebar"
          :class="{ 'sidebar-open': sidebarOpen }"
        >
          <div class="sidebar-name">
            <div v-if="selectedMarker">
              <div class="text-h5">{{ selectedMarker.name }}</div>
              <div v-if="selectedMarker.openingHours">
                <div class="text-h6">營業時間:</div>
                <div
                  v-for="(hours, day) in translateDays(
                    selectedMarker.openingHours
                  )"
                  :key="day"
                  :class="{ 'today-hours': isToday(day) }"
                  class="day-info"
                >
                  <div class="day-hours-line">
                    <span class="day-label">{{ day }}</span>
                    <span class="hours-info">{{
                      hours.split(",")[0].trim()
                    }}</span>
                  </div>
                  <template
                    v-for="(section, index) in hours.split(',')"
                    :key="index"
                  >
                    <div v-if="index > 0" class="additional-hours">
                      {{ section.trim() }}
                    </div>
                  </template>
                </div>
                <div class="text-h6">
                  建中優惠: {{ selectedMarker.discount }}
                </div>
              </div>
            </div>
          </div>
          <q-btn
            :icon="isFavorite(selectedMarker) ? 'favorite' : 'favorite_border'"
            flat
            round
            color="red"
            class="favorite-btn"
            @click="toggleFavorite(selectedMarker)"
          />
          <q-btn
            icon="close"
            flat
            round
            color="grey-8"
            class="close-btn"
            @click="closeSidebar"
          />
        </div>
        <q-dialog v-model="showLegend">
          <q-card style="min-width: 350px">
            <q-card-section>
              <div class="text-h6">地圖標記說明</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="legend-item">
                <img
                  src="https://imgur.com/jZN5Ph6.png"
                  alt="Open"
                  style="width: 25px; height: 41px"
                />
                <span>正在營業</span>
              </div>
              <div class="legend-item">
                <img
                  src="https://imgur.com/de9dxzv.png"
                  alt="Closed"
                  style="width: 25px; height: 41px"
                />
                <span>已打烊</span>
              </div>
              <div class="legend-item">
                <img
                  src="https://imgur.com/hizjEaj.png"
                  alt="Closing Soon"
                  style="width: 25px; height: 41px"
                />
                <span>即將打烊 (30分鐘內)</span>
              </div>
              <div class="legend-item">
                <img
                  src="https://imgur.com/upabpUD.png"
                  alt="Opening Soon"
                  style="width: 25px; height: 41px"
                />
                <span>即將開業 (30分鐘內)</span>
              </div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div>註：營業時間僅供參考，此頁面無法反映店家真實營業資訊。</div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="關閉" color="primary" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
        <q-dialog v-model="showRestaurantList" full-width>
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
                          isFavorite(restaurant)
                            ? 'favorite'
                            : 'favorite_border'
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
                        @click="showSidebarFromList(restaurant)"
                      />
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-page>
            </q-page-container>
          </q-layout>
        </q-dialog>
      </div>
    </q-page>
  </div>
</template>

<script setup>
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import { onMounted, computed, ref } from "vue";
import axios from "axios";
import { Icon, Point } from "leaflet";
import store from "../store/index";
import L from "leaflet";
import { useQuasar } from "quasar";
const $q = useQuasar();

const mapRef = ref(null);
const hideClosedRestaurants = ref(false);
const showLegend = ref(false);
const mapOptions = {
  zoomControl: false,
};

const favoriteRestaurants = computed(
  () => store.getters.getFavoriteRestaurants
);

const showOnlyFavorites = ref(false);
const showRestaurantList = ref(false);

const openIcon = new Icon({
  iconUrl: "https://imgur.com/jZN5Ph6.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const closedIcon = new Icon({
  iconUrl: "https://imgur.com/de9dxzv.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const openVarIcon = new Icon({
  iconUrl: "https://imgur.com/hizjEaj.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const closedVarIcon = new Icon({
  iconUrl: "https://imgur.com/upabpUD.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const ckIcon = new Icon({
  iconUrl: "https://imgur.com/pN46NOS.png",
  iconSize: [41, 41],
  iconAnchor: [20, 20],
});

const getMarkerIcon = (marker) => {
  const now = new Date();
  const day = now
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const time = now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  const todayHours = marker.openingHours[day];
  if (todayHours === "休息") return closedIcon;

  const hourRanges = todayHours.split(",");
  for (const range of hourRanges) {
    const [open, close] = range.split(/[-–]/);

    // Check if closing in 30 minutes
    if (isWithinMinutes(time, close, 30) && time < close) {
      return openVarIcon;
    }

    // Check if opening in 30 minutes
    if (isWithinMinutes(open, time, 30) && time < open) {
      return closedVarIcon;
    }

    if (time >= open && time < close) {
      return openIcon;
    }
  }

  return closedIcon;
};

const isWithinMinutes = (time1, time2, minutes) => {
  const [h1, m1] = time1.split(":").map(Number);
  const [h2, m2] = time2.split(":").map(Number);
  const diff = Math.abs(h1 * 60 + m1 - (h2 * 60 + m2));
  return diff <= minutes;
};

const isOpen = (openingHours) => {
  const now = new Date();
  const day = now
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const time = now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  const todayHours = openingHours[day];
  if (todayHours === "休息") return false;

  const hourRanges = todayHours.split(",");
  return hourRanges.some((range) => {
    const [open, close] = range.split(/[-–]/);
    return time >= open && time <= close;
  });
};

const isToday = (day) => {
  const today = new Date().toLocaleDateString("zh-TW", { weekday: "long" });
  return day === today;
};

const translateDays = (openingHours) => {
  const dayTranslations = {
    monday: "星期一",
    tuesday: "星期二",
    wednesday: "星期三",
    thursday: "星期四",
    friday: "星期五",
    saturday: "星期六",
    sunday: "星期日",
  };

  return Object.entries(openingHours).reduce((acc, [day, hours]) => {
    acc[dayTranslations[day] || day] = hours;
    return acc;
  }, {});
};

const getCurrentDay = () => {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[new Date().getDay()];
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

const restaurantData = ref([]);
const isLoading = ref(true);
const error = ref(null);

const fetchRestaurantData = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    const response = await axios.get(
      "https://raw.githubusercontent.com/CK-APP-Org/Data/main/restaurantData.json"
    );
    restaurantData.value = response.data;
  } catch (err) {
    console.error("Error fetching restaurant data:", err);
    error.value = "Failed to load restaurant data. Please try again later.";
  } finally {
    isLoading.value = false;
  }
};

const markers = computed(() =>
  restaurantData.value
    .map((marker) => ({
      ...marker,
      isOpen: isOpen(marker.openingHours),
    }))
    .filter(
      (marker) =>
        (!hideClosedRestaurants.value || marker.isOpen) &&
        (!showOnlyFavorites.value || isFavorite(marker))
    )
);

const sidebarOpen = ref(false);
const selectedMarker = ref(null);

const showSidebar = (marker) => {
  selectedMarker.value = marker;
  sidebarOpen.value = true;
};

const closeSidebar = () => {
  sidebarOpen.value = false;
};

const showSidebarFromList = (restaurant) => {
  showSidebar(restaurant);
  showRestaurantList.value = false;

  // Find the marker for the selected restaurant
  const marker = markers.value.find((m) => m.name === restaurant.name);

  if (marker && mapRef.value) {
    // Pan the map to the marker's position
    mapRef.value.leafletObject.panTo(marker.position);

    // Open the popup
    mapRef.value.leafletObject.eachLayer((layer) => {
      if (
        layer instanceof L.Marker &&
        layer.getLatLng().equals(marker.position)
      ) {
        layer.openPopup();
      }
    });
  }
};

const selectRandomRestaurant = () => {
  const openRestaurants = markers.value.filter((marker) => marker.isOpen);
  if (openRestaurants.length === 0) {
    $q.notify({
      color: "negative",
      message: "目前沒有營業中的餐廳",
      icon: "warning",
    });
    return;
  }

  const randomRestaurant =
    openRestaurants[Math.floor(Math.random() * openRestaurants.length)];
  showSidebar(randomRestaurant);

  if (mapRef.value) {
    mapRef.value.leafletObject.setView(randomRestaurant.position, 18);
    mapRef.value.leafletObject.eachLayer((layer) => {
      if (
        layer instanceof L.Marker &&
        layer.getLatLng().equals(randomRestaurant.position)
      ) {
        layer.openPopup();
      }
    });
  }

  $q.notify({
    color: "positive",
    message: `已為您選擇: ${randomRestaurant.name}`,
    icon: "restaurant",
  });
};

onMounted(() => {
  fetchRestaurantData();
  delete Icon.Default.prototype._getIconUrl;
  Icon.Default.mergeOptions({
    iconRetinaUrl: new URL("https://imgur.com/2bk3D5t.png", import.meta.url)
      .href,
    iconUrl: new URL("https://imgur.com/0ZsD2ff.png", import.meta.url).href,
    shadowUrl: new URL("https://imgur.com/qKgJSmB.png", import.meta.url).href,
  });
});
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

.additional-hours-popup {
  margin-left: 4.5em;
}

.today-hours {
  font-weight: bold;
  color: #2196f3;
}

.ml-4 {
  margin-left: 3.5em;
  padding-left: 0.5em;
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

.map-controls-1 {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  padding: 10px;
}

.map-controls-2 {
  position: absolute;
  bottom: 57px;
  right: 4px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  padding: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.legend-item img {
  margin-right: 10px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1000;
  flex-direction: column;
}

.error-message {
  color: #ff5252;
  font-weight: bold;
}
</style>
