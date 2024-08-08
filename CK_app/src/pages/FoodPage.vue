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
          <q-btn
            color="primary"
            icon="info"
            @click="showLegend = true"
            class="q-mr-sm"
          />
        </div>

        <l-map
          ref="mapRef"
          style="height: 90vh; width: 100%"
          :zoom="16"
          :center="[25.031204, 121.515966]"
          :options="mapOptions"
        >
          <l-tile-layer
            url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          ></l-tile-layer>
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
              <div class="rating-section">
                <q-btn
                  :label="
                    getUserRating(selectedMarker)
                      ? '您的評分: ' + getUserRating(selectedMarker)
                      : '評分'
                  "
                  color="primary"
                  outline
                  class="Rating-btn"
                  @click="showRatingDialog"
                />
              </div>
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

            <q-card-actions align="right">
              <q-btn flat label="關閉" color="primary" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
        <q-dialog v-model="showRestaurantList" full-width>
          <q-card>
            <q-card-section>
              <div class="text-h6">餐廳列表</div>
            </q-card-section>
            <q-card-section class="q-pa-none">
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
                      @click="showSidebarFromList(restaurant)"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="關閉" color="primary" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
        <q-dialog v-model="showRatingPrompt">
          <q-card>
            <q-card-section>
              <div class="text-h6">Rate {{ selectedMarker.name }}</div>
            </q-card-section>
            <q-card-section>
              <q-rating
                v-model="userRating"
                :max="5"
                size="3em"
                color="yellow"
              />
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="取消" color="primary" v-close-popup />
              <q-btn flat label="送出" color="primary" @click="submitRating" />
            </q-card-actions>
          </q-card>
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
import { useQuasar } from "quasar";
import { useStore } from "vuex";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";

import L from "leaflet";

const mapRef = ref(null);

const hideClosedRestaurants = ref(false);

const showLegend = ref(false);

const mapOptions = {
  zoomControl: false,
};

// const favoriteRestaurants = computed(
//   () => store.getters.getFavoriteRestaurants
// );
const $q = useQuasar();
const userData = ref(null);
const userRef = ref(null); // Declare userRef here

const userAccount = computed(() => store.getters.getUserAccount);

const favoriteRestaurants = ref([]);

const showOnlyFavorites = ref(false);

const showRestaurantList = ref(false);

const openIcon = new Icon({
  iconUrl: "https://imgur.com/jZN5Ph6.png",
  iconSize: [18, 30],
  iconAnchor: [9, 25],
});

const closedIcon = new Icon({
  iconUrl: "https://imgur.com/de9dxzv.png",
  iconSize: [18, 30],
  iconAnchor: [9, 25],
});

const openVarIcon = new Icon({
  iconUrl: "https://imgur.com/hizjEaj.png",
  iconSize: [18, 30],
  iconAnchor: [9, 25],
});

const closedVarIcon = new Icon({
  iconUrl: "https://imgur.com/upabpUD.png",
  iconSize: [18, 30],
  iconAnchor: [9, 25],
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

const toggleFavorite = async (restaurant) => {
  try {
    console.log("Current favoriteRestaurants:", favoriteRestaurants.value);
    console.log("Toggling favorite for restaurant:", restaurant);

    const updatePath = `${userAccount.value}.Food.favoriteRestaurants`;

    if (!Array.isArray(favoriteRestaurants.value)) {
      console.error(
        "favoriteRestaurants is not an array:",
        favoriteRestaurants.value
      );
      favoriteRestaurants.value = [];
    }

    const index = favoriteRestaurants.value.findIndex(
      (r) => r.name === restaurant.name
    );

    if (index === -1) {
      // Add to favorites
      console.log("Adding restaurant to favorites");
      favoriteRestaurants.value = [...favoriteRestaurants.value, restaurant];
    } else {
      // Remove from favorites
      console.log("Removing restaurant from favorites");
      favoriteRestaurants.value = favoriteRestaurants.value.filter(
        (r) => r.name !== restaurant.name
      );
    }

    console.log("Updated favoriteRestaurants:", favoriteRestaurants.value);
    console.log("Updating Firestore document");

    await updateDoc(userRef.value, {
      [updatePath]: favoriteRestaurants.value.map((r) => ({
        name: r.name,
        // Include other necessary fields here
      })),
    });

    console.log("Firestore update successful");

    if (index === -1) {
      store.dispatch("addFavoriteRestaurant", restaurant);
    } else {
      store.dispatch("removeFavoriteRestaurant", restaurant.name);
    }
  } catch (error) {
    console.error("Error in toggleFavorite:", error);
    // Handle the error (e.g., show a notification to the user)
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

//Rating section
const showRatingPrompt = ref(false);
const userRating = ref(0);

const getAverageScore = (restaurant) => {
  if (!restaurant.ratings || restaurant.ratings.numberOfRatings === 0) {
    return "Not rated";
  }
  return (
    restaurant.ratings.totalScore / restaurant.ratings.numberOfRatings
  ).toFixed(1);
};

const getUserRating = (restaurant) => {
  return userData.value?.Food?.userRatings?.[restaurant.name] || null;
};

const showRatingDialog = () => {
  userRating.value = getUserRating(selectedMarker.value) || 0;
  showRatingPrompt.value = true;
};

const submitRating = async () => {
  try {
    const userRatingPath = `${userAccount.value}.Food.userRatings.${selectedMarker.value.name}`;

    // Update user's rating
    await updateDoc(userRef.value, {
      [userRatingPath]: userRating.value,
    });

    // Update local state
    if (!userData.value.Food.userRatings) {
      userData.value.Food.userRatings = {};
    }
    userData.value.Food.userRatings[selectedMarker.value.name] =
      userRating.value;

    showRatingPrompt.value = false;
    $q.notify({
      color: "positive",
      message: "評分已送出",
    });
  } catch (error) {
    console.error("Error submitting rating:", error);
    $q.notify({
      color: "negative",
      message: "無法送出評分，請重試",
    });
  }
};

onMounted(async () => {
  console.log(userAccount.value);
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

  userRef.value = doc(db, "User Data", "Userdata"); // Initialize userRef here
  const docSnap = await getDoc(userRef.value);
  userData.value = docSnap.data()[userAccount.value];
  favoriteRestaurants.value = userData.value["Food"]["favoriteRestaurants"];
  console.log(userData.value["Food"]["favoriteRestaurants"]);

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
  bottom: 50px;
  right: 8px;
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

.Rating-btn {
  margin-top: 5px;
  margin-bottom: 5px;
}
</style>
