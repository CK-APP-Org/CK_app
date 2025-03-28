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
                <!--
                <div class="text-h6">
                  建中優惠: {{ selectedMarker.discount }}
                </div>
                -->
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
                  src="../../public/food/marker-icon-open.png"
                  alt="Open"
                  style="width: 25px; height: 41px"
                />
                <span>正在營業</span>
              </div>
              <div class="legend-item">
                <img
                  src="../../public/food/marker-icon-closed.png"
                  alt="Closed"
                  style="width: 25px; height: 41px"
                />
                <span>已打烊</span>
              </div>
              <div class="legend-item">
                <img
                  src="../../public/food/marker-icon-open-var.png"
                  alt="Closing Soon"
                  style="width: 25px; height: 41px"
                />
                <span>即將打烊 (30分鐘內)</span>
              </div>
              <div class="legend-item">
                <img
                  src="../../public/food/marker-icon-closed-var.png"
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
import restaurantDataLocal from "../data/restaurantData.json";
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
  iconUrl:
    "https://raw.githubusercontent.com/CK-APP-Org/Data/main/FoodPage/marker-icon-open.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const closedIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/CK-APP-Org/Data/main/FoodPage/marker-icon-closed.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const openVarIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/CK-APP-Org/Data/main/FoodPage/marker-icon-open-var.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const closedVarIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/CK-APP-Org/Data/main/FoodPage/marker-icon-closed-var.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const ckIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/CK-APP-Org/Data/main/FoodPage/CK_Logo.png",
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
    const [open, close] = range.split(/[-]/);

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

    /*
    // Fetch from GitHub
    const githubResponse = await axios.get(
      "https://raw.githubusercontent.com/CK-APP-Org/Data/main/restaurantData.json"
    );
    const githubData = githubResponse.data;
    */

    // Use local data
    //const localData = restaurantDataLocal;

    const localData = [
      {
        name: "林家乾麵(林乾)",
        position: [25.030181, 121.51412],
        openingHours: {
          monday: "休息",
          tuesday: "06:00-14:00,16:30-19:30",
          wednesday: "06:00-14:00,16:30-19:30",
          thursday: "06:00-14:00,16:30-19:30",
          friday: "06:00-14:00,16:30-19:30",
          saturday: "06:00-14:00",
          sunday: "06:00-14:00",
        },
      },
      {
        name: "建中側門漢堡餐車",
        position: [25.030418688051526, 121.51399964581553],
        openingHours: {
          monday: "05:45-10:30",
          tuesday: "05:45-10:30",
          wednesday: "05:45-10:30",
          thursday: "05:45-10:30",
          friday: "05:45-10:30",
          saturday: "休息",
          sunday: "休息",
        },
      },
      {
        name: "建中側抓",
        position: [25.030385879007643, 121.51413375618512],
        openingHours: {
          monday: "15:00-19:30",
          tuesday: "15:00-19:30",
          wednesday: "15:00-19:30",
          thursday: "15:00-19:30",
          friday: "15:00-19:30",
          saturday: "休息",
          sunday: "休息",
        },
      },
      {
        name: "廣東小吃(廣炒)",
        position: [25.030279, 121.514101],
        openingHours: {
          monday: "11:00-13:30,17:00-18:30",
          tuesday: "11:00-13:30,17:00-18:30",
          wednesday: "11:00-13:30,17:00-18:30",
          thursday: "11:00-13:30,17:00-18:30",
          friday: "11:00-13:30",
          saturday: "休息",
          sunday: "休息",
        },
      },
      {
        name: "呷尚寶(泉州店)",
        position: [25.02948, 121.514145],
        openingHours: {
          monday: "06:00-13:00",
          tuesday: "06:00-13:00",
          wednesday: "06:00-13:00",
          thursday: "06:00-13:00",
          friday: "06:00-13:00",
          saturday: "休息",
          sunday: "06:00-13:00",
        },
      },
      {
        name: "烤上台大",
        position: [25.029351, 121.514166],
        openingHours: {
          monday: "11:00-14:00",
          tuesday: "11:00-14:00",
          wednesday: "11:00-14:00",
          thursday: "11:00-14:00",
          friday: "11:00-14:00",
          saturday: "休息",
          sunday: "休息",
        },
      },
      {
        name: "搭伙",
        position: [25.0292, 121.514201],
        openingHours: {
          monday: "11:00-21:00",
          tuesday: "11:00-21:00",
          wednesday: "11:00-21:00",
          thursday: "11:00-21:00",
          friday: "11:00-21:00",
          saturday: "休息",
          sunday: "休息",
        },
      },
      {
        name: "建中黑砂糖刨冰",
        position: [25.029342, 121.514371],
        openingHours: {
          monday: "11:30-18:00",
          tuesday: "11:30-18:00",
          wednesday: "11:30-18:00",
          thursday: "11:30-18:00",
          friday: "11:30-18:00",
          saturday: "11:30-18:00",
          sunday: "11:30-18:00",
        },
      },
      {
        name: "雲南小廚",
        position: [25.029241, 121.514397],
        openingHours: {
          monday: "09:00-14:00,16:00-20:00",
          tuesday: "09:00-14:00,16:00-20:00",
          wednesday: "09:00-14:00,16:00-20:00",
          thursday: "09:00-14:00,16:00-20:00",
          friday: "09:00-14:00,16:00-20:00",
          saturday: "休息",
          sunday: "09:00-14:00,16:00-20:00",
        },
      },
      {
        name: "老建中麵店",
        position: [25.029075, 121.514415],
        openingHours: {
          monday: "11:30-14:30,16:30-19:30",
          tuesday: "11:30-14:30,16:30-19:30",
          wednesday: "11:30-14:30,16:30-19:30",
          thursday: "11:30-14:30,16:30-19:30",
          friday: "11:30-14:30,16:30-19:30",
          saturday: "休息",
          sunday: "休息",
        },
      },
      {
        name: "建中豆漿補給站(建豆)",
        position: [25.029101, 121.512884],
        openingHours: {
          monday: "05:30-13:00",
          tuesday: "05:30-13:00",
          wednesday: "05:30-13:00",
          thursday: "05:30-13:00",
          friday: "05:30-13:00",
          saturday: "休息",
          sunday: "休息",
        },
      },
      {
        name: "Q Burger(中正寧波店)",
        position: [25.029501, 121.514521],
        openingHours: {
          monday: "06:00-13:30",
          tuesday: "06:00-13:30",
          wednesday: "06:00-13:30",
          thursday: "06:00-13:30",
          friday: "06:00-13:30",
          saturday: "06:00-14:00",
          sunday: "休息",
        },
      },

      {
        name: "萬香烤鴨莊(重慶店)",
        position: [25.029721, 121.515461],
        openingHours: {
          monday: "10:00-20:00",
          tuesday: "10:00-20:00",
          wednesday: "10:00-20:00",
          thursday: "10:00-20:00",
          friday: "10:00-20:00",
          saturday: "10:00-20:00",
          sunday: "10:00-20:00",
        },
      },
      {
        name: "胖老爹(中正重慶店)",
        position: [25.029633, 121.515474],
        openingHours: {
          monday: "00:00-03:00,11:30-27:00",
          tuesday: "00:00-03:00,11:30-27:00",
          wednesday: "00:00-03:00,11:30-27:00",
          thursday: "00:00-03:00,11:30-27:00",
          friday: "00:00-03:00,11:30-27:00",
          saturday: "00:00-03:00,11:30-27:00",
          sunday: "00:00-03:00,11:30-27:00",
        },
      },
      {
        name: "福井麵疙瘩",
        position: [25.0299545, 121.515655],
        openingHours: {
          monday: "11:00-14:00,17:00-20:00",
          tuesday: "11:00-14:00,17:00-20:00",
          wednesday: "11:00-14:00,17:00-20:00",
          thursday: "11:00-14:00,17:00-20:00",
          friday: "11:00-14:00,17:00-20:00",
          saturday: "11:00-14:30,17:00-20:00",
          sunday: "休息",
        },
      },
      {
        name: "江浙四海包子店",
        position: [25.029987, 121.515811],
        openingHours: {
          monday: "09:00-15:00,17:00-20:00",
          tuesday: "09:00-15:00,17:00-20:00",
          wednesday: "09:00-15:00,17:00-20:00",
          thursday: "09:00-15:00,17:00-20:00",
          friday: "09:00-15:00,17:00-20:00",
          saturday: "09:00-15:00,17:00-20:00",
          sunday: "休息",
        },
      },
      {
        name: "麵老大",
        position: [25.030025, 121.515951],
        openingHours: {
          monday: "11:00-20:30",
          tuesday: "11:00-20:30",
          wednesday: "11:00-20:30",
          thursday: "11:00-20:30",
          friday: "11:00-20:30",
          saturday: "11:00-20:30",
          sunday: "11:00-20:30",
        },
      },
      {
        name: "吉坤便當",
        position: [25.030041, 121.516082],
        openingHours: {
          monday: "09:00-13:30,16:30-19:30",
          tuesday: "09:00-13:30,16:30-19:30",
          wednesday: "09:00-13:30,16:30-19:30",
          thursday: "09:00-13:30,16:30-19:30",
          friday: "09:00-13:30,16:30-19:30",
          saturday: "休息",
          sunday: "休息",
        },
      },
      {
        name: "春天涼麵",
        position: [25.030074, 121.516221],
        openingHours: {
          monday: "10:00-14:00,16:30-20:00",
          tuesday: "10:00-14:00,16:30-20:00",
          wednesday: "10:00-14:00,16:30-20:00",
          thursday: "10:00-14:00,16:30-20:00",
          friday: "10:00-14:00,16:30-20:00",
          saturday: "休息",
          sunday: "10:00-14:00,16:30-20:00",
        },
      },
      {
        name: "麥味登(中正寧波店)",
        position: [25.029753, 121.515572],
        openingHours: {
          monday: "07:00-14:00",
          tuesday: "07:00-14:00",
          wednesday: "07:00-14:00",
          thursday: "07:00-14:00",
          friday: "07:00-14:00",
          saturday: "07:00-14:00",
          sunday: "休息",
        },
      },
      {
        name: "Woo 現烤甜甜圈",
        position: [25.02979333110343, 121.51566878251151],
        openingHours: {
          monday: "休息",
          tuesday: "休息",
          wednesday: "10:00-19:30",
          thursday: "10:00-19:30",
          friday: "10:00-19:30",
          saturday: "10:00-18:00",
          sunday: "休息",
        },
      },
      {
        name: "懿品小珍",
        position: [25.029804, 121.515746],
        openingHours: {
          monday: "11:00-15:00,16:30-20:40",
          tuesday: "11:00-15:00,16:30-20:40",
          wednesday: "11:00-15:00,16:30-20:40",
          thursday: "11:00-15:00,16:30-20:40",
          friday: "11:00-15:00,16:30-20:40",
          saturday: "11:00-15:00,16:30-20:40",
          sunday: "休息",
        },
      },
      {
        name: "昇客雞肉",
        position: [25.029822, 121.515844],
        openingHours: {
          monday: "09:00-20:00",
          tuesday: "09:00-20:00",
          wednesday: "09:00-20:00",
          thursday: "09:00-20:00",
          friday: "09:00-20:00",
          saturday: "10:00-19:30",
          sunday: "休息",
        },
      },
      {
        name: "蓮德品素天地",
        position: [25.029877, 121.515936],
        openingHours: {
          monday: "11:00-14:00,17:00-21:00",
          tuesday: "11:00-14:00,17:00-21:00",
          wednesday: "11:00-14:00,17:00-21:00",
          thursday: "11:00-14:00,17:00-21:00",
          friday: "11:00-14:00,17:00-21:00",
          saturday: "11:00-14:00,17:00-21:00",
          sunday: "休息",
        },
      },
      {
        name: "京席素食料理",
        position: [25.02991322462106, 121.51607472951969],
        openingHours: {
          monday: "10:00-14:00,17:00-20:00",
          tuesday: "10:00-14:00,17:00-20:00",
          wednesday: "10:00-14:00,17:00-20:00",
          thursday: "10:00-14:00,17:00-20:00",
          friday: "10:00-14:00,17:00-20:00",
          saturday: "10:00-14:00,17:00-20:00",
          sunday: "休息",
        },
      },
      {
        name: "中正雞肉飯",
        position: [25.02993270781019, 121.5162180651042],
        openingHours: {
          monday: "11:00-20:30",
          tuesday: "11:00-20:30",
          wednesday: "11:00-20:30",
          thursday: "11:00-20:30",
          friday: "11:00-20:30",
          saturday: "11:00-20:30",
          sunday: "11:00-20:30",
        },
      },
      {
        name: "蛋白盒子(寧波西店)",
        position: [25.029941132483785, 121.51631152342331],
        openingHours: {
          monday: "10:30-14:00,16:00-20:00",
          tuesday: "10:30-14:00,16:00-20:00",
          wednesday: "10:30-14:00,16:00-20:00",
          thursday: "10:30-14:00,16:00-20:00",
          friday: "10:30-14:00,16:00-20:00",
          saturday: "10:30-14:00,16:00-20:00",
          sunday: "10:30-14:00,16:00-20:00",
        },
      },
      {
        name: "Ebisu curry&coffee",
        position: [25.029902, 121.516422],
        openingHours: {
          monday: "11:00-14:30,17:00-19:30",
          tuesday: "11:00-14:30,17:00-19:30",
          wednesday: "11:00-14:30,17:00-19:30",
          thursday: "11:00-14:30,17:00-19:30",
          friday: "11:00-14:30,17:00-19:30",
          saturday: "11:00-14:30,17:00-19:30",
          sunday: "11:00-14:30,17:00-19:30",
        },
      },
      {
        name: "Ebisu Kitchen",
        position: [25.030409840204676, 121.516916],
        openingHours: {
          monday: "11:00-14:30,17:00-19:30",
          tuesday: "11:00-14:30,17:00-19:30",
          wednesday: "11:00-14:30,17:00-19:30",
          thursday: "11:00-14:30,17:00-19:30",
          friday: "11:00-14:30,17:00-19:30",
          saturday: "11:00-14:30,17:00-19:30",
          sunday: "11:00-14:30,17:00-19:30",
        },
      },
      {
        name: "豪季水餃",
        position: [25.029709, 121.516492],
        openingHours: {
          monday: "11:00-15:00,16:30-20:00",
          tuesday: "11:00-15:00,16:30-20:00",
          wednesday: "11:00-15:00,16:30-20:00",
          thursday: "11:00-15:00,16:30-20:00",
          friday: "11:00-15:00,16:30-20:00",
          saturday: "11:00-15:00,16:30-20:00",
          sunday: "休息",
        },
      },
      {
        name: "劉媽媽麵館",
        position: [25.029544, 121.516719],
        openingHours: {
          monday: "11:30-14:30,17:00-20:00",
          tuesday: "11:30-14:30,17:00-20:00",
          wednesday: "11:30-14:30,17:00-20:00",
          thursday: "11:30-14:30,17:00-20:00",
          friday: "11:30-14:30,17:00-20:00",
          saturday: "休息",
          sunday: "11:30-14:30,17:00-20:00",
        },
      },
      {
        name: "黄龍莊",
        position: [25.03000881957471, 121.5165503303962],
        openingHours: {
          monday: "休息",
          tuesday: "10:00-20:30",
          wednesday: "10:00-20:30",
          thursday: "10:00-20:30",
          friday: "10:00-20:30",
          saturday: "10:00-20:30",
          sunday: "10:00-20:30",
        },
      },
      {
        name: "金全城自助餐",
        position: [25.02972038089551, 121.5167548880475],
        openingHours: {
          monday: "10:30-14:00,16:30-19:40",
          tuesday: "10:30-14:00,16:30-19:40",
          wednesday: "10:30-14:00,16:30-19:40",
          thursday: "10:30-14:00,16:30-19:40",
          friday: "10:30-14:00,16:30-19:40",
          saturday: "休息",
          sunday: "休息",
        },
      },
      {
        name: "鮑汁燜雞米飯",
        position: [25.03012, 121.51743],
        openingHours: {
          monday: "11:30-14:00,17:00-20:30",
          tuesday: "11:30-14:00,17:00-20:30",
          wednesday: "11:30-14:00",
          thursday: "11:30-20:30",
          friday: "11:30-14:00,17:00-20:30",
          saturday: "11:30-14:00,17:00-20:30",
          sunday: "休息",
        },
      },
      {
        name: "桔子花咖哩",
        position: [25.030187001186075, 121.51754312224892],
        openingHours: {
          monday: "11:30-14:00,17:30-20:00",
          tuesday: "11:30-14:00,17:30-20:00",
          wednesday: "11:30-14:00,17:30-20:00",
          thursday: "11:30-14:00,17:30-20:00",
          friday: "11:30-14:00,17:30-20:00",
          saturday: "11:30-14:00",
          sunday: "休息",
        },
      },
      {
        name: "鮮食坊",
        position: [25.030265, 121.51765],
        openingHours: {
          monday: "11:30-14:00,17:00-20:00",
          tuesday: "11:30-14:00,17:00-20:00",
          wednesday: "11:30-14:00,17:00-20:00",
          thursday: "11:30-14:00,17:00-20:00",
          friday: "11:30-14:00,17:00-20:00",
          saturday: "休息",
          sunday: "11:30-14:00,17:00-20:00",
        },
      },
      {
        name: "早安美芝城(寧波店)",
        position: [25.030067, 121.516562],
        openingHours: {
          monday: "06:00-13:30",
          tuesday: "06:00-13:30",
          wednesday: "06:00-13:30",
          thursday: "06:00-13:30",
          friday: "06:00-13:30",
          saturday: "休息",
          sunday: "06:00-13:30",
        },
      },
      {
        name: "由紀(YUKI)",
        position: [25.030103, 121.516651],
        openingHours: {
          monday: "休息",
          tuesday: "12:00-19:00",
          wednesday: "12:00-19:00",
          thursday: "12:00-19:00",
          friday: "12:00-19:00",
          saturday: "11:30-19:00",
          sunday: "11:30-19:00",
        },
      },
      {
        name: "金牛王",
        position: [25.030156, 121.516773],
        openingHours: {
          monday: "10:45-14:00,16:00-18:40",
          tuesday: "10:45-14:00,16:00-18:30",
          wednesday: "10:45-14:00,16:00-19:30",
          thursday: "10:45-14:00,16:00-19:30",
          friday: "10:45-14:00,16:00-19:30",
          saturday: "休息",
          sunday: "休息",
        },
      },
      {
        name: "郝家食堂",
        position: [25.02984, 121.51667],
        openingHours: {
          monday: "10:45-13:45,16:45-19:30",
          tuesday: "10:45-13:45,16:45-19:30",
          wednesday: "10:45-13:45,16:45-19:30",
          thursday: "10:45-13:45,16:45-19:30",
          friday: "10:45-13:45,16:45-19:30",
          saturday: "11:30-13:30",
          sunday: "休息",
        },
      },
      {
        name: "虹品鍋貼水餃",
        position: [25.030165, 121.516368],
        openingHours: {
          monday: "07:00-18:30",
          tuesday: "07:00-18:30",
          wednesday: "07:00-18:30",
          thursday: "07:00-18:30",
          friday: "07:00-18:30",
          saturday: "09:00-18:30",
          sunday: "09:00-18:30",
        },
      },
      {
        name: "福記港式燒臘",
        position: [25.030203, 121.516529],
        openingHours: {
          monday: "11:00-20:00",
          tuesday: "11:00-20:00",
          wednesday: "11:00-20:00",
          thursday: "11:00-20:00",
          friday: "11:00-20:00",
          saturday: "休息",
          sunday: "11:00-20:00",
        },
      },
      {
        name: "鐘圓環肉羹",
        position: [25.030182, 121.516449],
        openingHours: {
          monday: "10:30-19:30",
          tuesday: "10:30-19:30",
          wednesday: "10:30-19:30",
          thursday: "10:30-19:30",
          friday: "10:30-19:30",
          saturday: "10:30-19:30",
          sunday: "10:30-19:30",
        },
      },
      {
        name: "CoCo(南昌店)",
        position: [25.030253, 121.516639],
        openingHours: {
          monday: "10:00-20:15",
          tuesday: "10:00-20:15",
          wednesday: "10:00-20:15",
          thursday: "10:00-20:15",
          friday: "10:00-20:15",
          saturday: "10:30-19:45",
          sunday: "10:30-19:45",
        },
      },
      {
        name: "養鍋",
        position: [25.0303152, 121.516737],
        openingHours: {
          monday: "11:30-13:30,17:00-21:00",
          tuesday: "11:30-13:30,17:00-21:00",
          wednesday: "11:30-13:30,17:00-21:00",
          thursday: "11:30-13:30,17:00-21:00",
          friday: "11:30-13:30,17:00-21:00",
          saturday: "11:00-21:00",
          sunday: "11:00-21:00",
        },
      },
      {
        name: "城市盒子",
        position: [25.030368, 121.516846],
        openingHours: {
          monday: "10:00-19:00",
          tuesday: "10:00-19:00",
          wednesday: "10:00-19:00",
          thursday: "10:00-19:00",
          friday: "10:00-19:00",
          saturday: "10:00-19:00",
          sunday: "10:00-19:00",
        },
      },
      {
        name: "便當王",
        position: [25.030602, 121.516574],
        openingHours: {
          monday: "11:00-13:50,16:40-19:15",
          tuesday: "11:00-13:50,16:40-19:15",
          wednesday: "11:00-13:50,16:40-19:15",
          thursday: "11:00-13:50,16:40-19:15",
          friday: "11:00-13:50,16:40-19:15",
          saturday: "休息",
          sunday: "休息",
        },
      },
      {
        name: "必勝客(南昌外送店)",
        position: [25.030733819724723, 121.51603505015856],
        openingHours: {
          monday: "11:00-22:00",
          tuesday: "11:00-22:00",
          wednesday: "11:00-22:00",
          thursday: "11:00-22:00",
          friday: "11:00-22:00",
          saturday: "11:00-22:00",
          sunday: "11:00-22:00",
        },
      },
      {
        name: "原味咖哩屋",
        position: [25.030730781911107, 121.5158607065656],
        openingHours: {
          monday: "休息",
          tuesday: "休息",
          wednesday: "12:00-14:30,17:40-20:00",
          thursday: "12:00-14:30,17:40-20:00",
          friday: "12:00-14:30,17:40-20:00",
          saturday: "12:00-14:30,17:40-20:00",
          sunday: "休息",
        },
      },
      {
        name: "桃屋日本料理",
        position: [25.03038343881961, 121.51714130644875],
        openingHours: {
          monday: "09:00-17:30",
          tuesday: "09:00-17:30",
          wednesday: "09:00-17:30",
          thursday: "09:00-17:30",
          friday: "09:00-17:30",
          saturday: "09:00-14:00",
          sunday: "09:00-14:00",
        },
      },
      {
        name: "飴盛禾",
        position: [25.03050646572006, 121.51705156758634],
        openingHours: {
          monday: "11:00-13:45,16:30-19:45",
          tuesday: "11:00-13:45,16:30-19:45",
          wednesday: "11:00-13:45,16:30-19:45",
          thursday: "11:00-13:45,16:30-19:45",
          friday: "11:00-13:45,16:30-19:45",
          saturday: "09:00-16:30",
          sunday: "休息",
        },
      },
      {
        name: "成雞單",
        position: [25.030563450528884, 121.51715178821496],
        openingHours: {
          monday: "11:30-14:30,16:30-20:30",
          tuesday: "11:30-14:30,16:30-20:30",
          wednesday: "11:30-14:30,16:30-20:30",
          thursday: "11:30-14:30,16:30-20:30",
          friday: "11:30-14:30,16:30-20:30",
          saturday: "休息",
          sunday: "休息",
        },
      },
      {
        name: "四兩刈包",
        position: [25.030624, 121.517234],
        openingHours: {
          monday: "11:40-20:30",
          tuesday: "11:40-20:30",
          wednesday: "11:40-20:30",
          thursday: "11:40-20:30",
          friday: "11:40-20:30",
          saturday: "11:40-19:30",
          sunday: "休息",
        },
      },
      {
        name: "寧波餐盒",
        position: [25.03068819276531, 121.51733447889629],
        openingHours: {
          monday: "10:30-14:00,16:30-19:30",
          tuesday: "10:30-14:00,16:30-19:30",
          wednesday: "10:30-14:00,16:30-19:30",
          thursday: "10:30-14:00,16:30-19:30",
          friday: "10:30-14:00,16:30-19:30",
          saturday: "休息",
          sunday: "休息",
        },
      },
      {
        name: "鴨香煲",
        position: [25.030736296964708, 121.51743034347368],
        openingHours: {
          monday: "11:30-20:00",
          tuesday: "11:30-20:00",
          wednesday: "11:30-20:00",
          thursday: "11:30-20:00",
          friday: "11:30-20:00",
          saturday: "11:30-20:00",
          sunday: "休息",
        },
      },

      {
        name: "曼鯊鯊",
        position: [25.030870470759332, 121.51699783134352],
        openingHours: {
          monday: "10:30-14:00,16:30-20:00",
          tuesday: "10:30-14:00,16:30-20:00",
          wednesday: "10:30-14:00,16:30-20:00",
          thursday: "10:30-14:00,16:30-20:00",
          friday: "10:30-14:00,16:30-20:00",
          saturday: "10:30-14:00,16:30-20:00",
          sunday: "休息",
        },
      },
      {
        name: "本味拉麵",
        position: [25.031020290826692, 121.51724170894916],
        openingHours: {
          monday: "休息",
          tuesday: "11:00-14:00,17:00-20:30",
          wednesday: "11:00-14:00,17:00-20:30",
          thursday: "11:00-14:00,17:00-20:30",
          friday: "11:00-14:00,17:00-20:30",
          saturday: "11:00-14:00,17:00-20:30",
          sunday: "11:00-14:00,17:00-20:30",
        },
      },
      {
        name: "嘉義第一名火雞肉飯",
        position: [25.031106, 121.51715],
        openingHours: {
          monday: "11:00-22:00",
          tuesday: "11:00-22:00",
          wednesday: "11:00-22:00",
          thursday: "11:00-22:00",
          friday: "11:00-22:00",
          saturday: "11:00-22:00",
          sunday: "11:00-22:00",
        },
      },
      {
        name: "鬍鬚張魯肉飯(南昌店)",
        position: [25.0312, 121.51705],
        openingHours: {
          monday: "10:00-22:00",
          tuesday: "10:00-22:00",
          wednesday: "10:00-22:00",
          thursday: "10:00-22:00",
          friday: "10:00-22:00",
          saturday: "10:00-22:00",
          sunday: "10:00-22:00",
        },
      },

      {
        name: "麥當勞(南昌店)",
        position: [25.0294, 121.51865],
        openingHours: {
          monday: "06:00-23:00",
          tuesday: "06:00-23:00",
          wednesday: "06:00-23:00",
          thursday: "06:00-23:00",
          friday: "06:00-23:00",
          saturday: "06:00-23:00",
          sunday: "06:00-23:00",
        },
      },
      {
        name: "拿坡里披薩(南昌店)",
        position: [25.029301870925266, 121.51876481837384],
        openingHours: {
          monday: "11:00-21:00",
          tuesday: "11:00-21:00",
          wednesday: "11:00-21:00",
          thursday: "11:00-21:00",
          friday: "11:00-21:00",
          saturday: "11:00-21:00",
          sunday: "11:00-21:00",
        },
      },
      {
        name: "夯堡",
        position: [25.03107844024507, 121.51832451478535],
        openingHours: {
          monday: "08:00-21:00",
          tuesday: "08:00-21:00",
          wednesday: "08:00-21:00",
          thursday: "08:00-21:00",
          friday: "08:00-21:00",
          saturday: "08:00-21:00",
          sunday: "08:00-21:00",
        },
      },
      {
        name: "50嵐(寧波店)",
        position: [25.030929731588213, 121.51775984466323],
        openingHours: {
          monday: "10:00-22:00",
          tuesday: "10:00-22:00",
          wednesday: "10:00-22:00",
          thursday: "10:00-22:00",
          friday: "10:00-22:00",
          saturday: "10:00-22:00",
          sunday: "10:00-22:00",
        },
      },
      {
        name: "迷客夏(臺北南昌店)",
        position: [25.03076541343751, 121.5177717805471],
        openingHours: {
          monday: "10:00-22:00",
          tuesday: "10:00-22:00",
          wednesday: "10:00-22:00",
          thursday: "10:00-22:00",
          friday: "10:00-22:00",
          saturday: "10:00-22:00",
          sunday: "10:00-22:00",
        },
      },
      {
        name: "鶴茶樓(中正寧波西店)",
        position: [25.030868397250778, 121.51796959337601],
        openingHours: {
          monday: "09:00-21:00",
          tuesday: "09:00-21:00",
          wednesday: "09:00-21:00",
          thursday: "09:00-21:00",
          friday: "09:00-21:00",
          saturday: "10:00-22:00",
          sunday: "10:00-22:00",
        },
      },
      {
        name: "起家雞(中正寧波店)",
        position: [25.031169159344792, 121.5181020129375],
        openingHours: {
          monday: "10:30-20:00",
          tuesday: "10:30-20:00",
          wednesday: "10:30-20:00",
          thursday: "10:30-20:00",
          friday: "10:30-20:00",
          saturday: "10:30-20:00",
          sunday: "10:30-20:00",
        },
      },
      {
        name: "奇福扁食",
        position: [25.031318431436787, 121.51843582645411],
        openingHours: {
          monday: "10:30-14:30,16:30-20:00",
          tuesday: "10:30-14:30,16:30-20:00",
          wednesday: "10:30-14:30,16:30-20:00",
          thursday: "10:30-14:30,16:30-20:00",
          friday: "10:30-14:30,16:30-20:00",
          saturday: "10:30-14:30,16:30-20:00",
          sunday: "10:30-14:30,16:30-20:00",
        },
      },
      {
        name: "有煎餃子館",
        position: [25.031473386862487, 121.51864170544567],
        openingHours: {
          monday: "11:00-20:30",
          tuesday: "11:00-20:30",
          wednesday: "11:00-20:30",
          thursday: "11:00-20:30",
          friday: "11:00-20:30",
          saturday: "11:00-20:30",
          sunday: "11:00-20:30",
        },
      },
      {
        name: "火炬 串燒炸物",
        position: [25.0315792199834, 121.51880770818255],
        openingHours: {
          monday: "17:00-23:30",
          tuesday: "17:00-23:30",
          wednesday: "17:00-23:30",
          thursday: "17:00-23:30",
          friday: "17:00-24:00",
          saturday: "00:00-12:00,17:00-24:00",
          sunday: "00:00-12:00,17:00-23:30",
        },
      },
      {
        name: "三元堂拉麵",
        position: [25.031308887643682, 121.51771957931884],
        openingHours: {
          monday: "11:40-13:40,16:30-20:30",
          tuesday: "11:40-13:40,16:30-20:30",
          wednesday: "11:40-13:40,16:30-20:30",
          thursday: "11:40-13:40,16:30-20:30",
          friday: "11:40-13:40,16:30-20:30",
          saturday: "11:40-13:40,16:30-20:30",
          sunday: "休息",
        },
      },
      {
        name: "金泰刀削小廚",
        position: [25.031444209358376, 121.51760611482375],
        openingHours: {
          monday: "11:00-14:00,17:00-21:00",
          tuesday: "11:00-14:00,17:00-21:00",
          wednesday: "11:00-14:00,17:00-21:00",
          thursday: "11:00-14:00,17:00-21:00",
          friday: "11:00-14:00,17:00-21:00",
          saturday: "11:00-14:00,17:00-21:00",
          sunday: "11:00-14:00,17:00-21:00",
        },
      },
      {
        name: "100+義式廚房",
        position: [25.031379673762277, 121.51784569269692],
        openingHours: {
          monday: "11:00-15:30,16:30-20:00",
          tuesday: "11:00-15:30,16:30-20:00",
          wednesday: "11:00-15:30,16:30-20:00",
          thursday: "11:00-15:30,16:30-20:00",
          friday: "11:00-15:30,16:30-20:00",
          saturday: "休息",
          sunday: "休息",
        },
      },
      {
        name: "小松鍋燒麵",
        position: [25.031672025211932, 121.51811902562679],
        openingHours: {
          monday: "10:30-15:00,17:00-20:00",
          tuesday: "10:30-15:00,17:00-20:00",
          wednesday: "10:30-15:00,17:00-20:00",
          thursday: "10:30-15:00,17:00-20:00",
          friday: "10:30-15:00,17:00-20:00",
          saturday: "休息",
          sunday: "休息",
        },
      },
      {
        name: "南門福州傻瓜乾麵",
        position: [25.03192131864971, 121.51823982595026],
        openingHours: {
          monday: "11:00-14:30,17:00-20:30",
          tuesday: "11:00-14:30,17:00-20:30",
          wednesday: "11:00-14:30,17:00-20:30",
          thursday: "11:00-14:30,17:00-20:30",
          friday: "11:00-14:30,17:00-20:30",
          saturday: "11:00-14:30,17:00-20:30",
          sunday: "11:00-14:30",
        },
      },
      {
        name: "28廣東粥鍋燒麵",
        position: [25.031875521694147, 121.51845284581562],
        openingHours: {
          monday: "休息",
          tuesday: "11:00-19:30",
          wednesday: "11:00-19:30",
          thursday: "11:00-19:30",
          friday: "11:00-19:30",
          saturday: "11:00-19:30",
          sunday: "11:00-19:30",
        },
      },
      {
        name: "初 拉麵&煎餃",
        position: [25.031447643059626, 121.51798265476811],
        openingHours: {
          monday: "11:30-14:00,17:30-21:00",
          tuesday: "11:30-14:00,17:30-21:00",
          wednesday: "11:30-14:00,17:30-21:00",
          thursday: "11:30-14:00,17:30-21:00",
          friday: "11:30-14:00,17:30-21:00",
          saturday: "11:30-14:00,17:30-21:00",
          sunday: "休息",
        },
      },
      {
        name: "金峰魯肉飯",
        position: [25.032044958751985, 121.51849530640874],
        openingHours: {
          monday: "休息",
          tuesday: "11:00-25:00",
          wednesday: "00:00-01:00,11:00-25:00",
          thursday: "00:00-01:00,11:00-25:00",
          friday: "00:00-01:00,11:00-25:00",
          saturday: "00:00-01:00,11:00-25:00",
          sunday: "00:00-01:00,11:00-23:00",
        },
      },
      {
        name: "可不可(中正南昌店)",
        position: [25.031498379480308, 121.51716641196012],
        openingHours: {
          monday: "10:00-21:00",
          tuesday: "10:00-21:00",
          wednesday: "10:00-21:00",
          thursday: "10:00-21:00",
          friday: "10:00-21:00",
          saturday: "10:00-21:00",
          sunday: "10:00-20:30",
        },
      },
      {
        name: "珍煮丹(中正南門店)",
        position: [25.031958523886896, 121.51857440680428],
        openingHours: {
          monday: "10:00-20:00",
          tuesday: "10:00-20:00",
          wednesday: "10:00-21:00",
          thursday: "10:00-21:00",
          friday: "10:00-21:00",
          saturday: "10:00-21:00",
          sunday: "10:00-21:00",
        },
      },
      {
        name: "八方雲集(南海店)",
        position: [25.03202841061271, 121.51519603862796],
        openingHours: {
          monday: "10:00-21:30",
          tuesday: "10:00-21:30",
          wednesday: "10:00-21:30",
          thursday: "10:00-21:30",
          friday: "10:00-21:30",
          saturday: "10:00-21:30",
          sunday: "10:00-21:30",
        },
      },
      {
        name: "八方雲集(南昌店)",
        position: [25.02971609455992, 121.5184514471431],
        openingHours: {
          monday: "11:00-20:30",
          tuesday: "11:00-20:30",
          wednesday: "11:00-20:30",
          thursday: "11:00-20:30",
          friday: "11:00-20:30",
          saturday: "11:00-20:30",
          sunday: "11:00-20:30",
        },
      },
      {
        name: "好味涼亭",
        position: [25.032062323492937, 121.51573119446294],
        openingHours: {
          monday: "11:00-14:30,16:30-19:30",
          tuesday: "11:00-14:30,16:30-19:30",
          wednesday: "11:00-14:30,16:30-19:30",
          thursday: "11:00-14:30,16:30-19:30",
          friday: "11:00-14:30,16:30-19:30",
          saturday: "11:00-14:30,16:30-19:30",
          sunday: "休息",
        },
      },
      {
        name: "老熊牛肉麵",
        position: [25.032157104036347, 121.5157948969418],
        openingHours: {
          monday: "11:00-19:30",
          tuesday: "11:00-19:30",
          wednesday: "11:00-19:30",
          thursday: "11:00-19:30",
          friday: "11:00-19:30",
          saturday: "11:00-19:30",
          sunday: "11:00-19:00",
        },
      },
      {
        name: "肯德基(南昌店)",
        position: [25.03224667128567, 121.51632808148645],
        openingHours: {
          monday: "10:00-23:00",
          tuesday: "10:00-23:00",
          wednesday: "10:00-23:00",
          thursday: "10:00-23:00",
          friday: "10:00-23:00",
          saturday: "10:00-23:00",
          sunday: "10:00-23:00",
        },
      },
      {
        name: "蛋白盒子(南海店)",
        position: [25.032344997264623, 121.51674653828465],
        openingHours: {
          monday: "10:30-14:00,16:00-20:00",
          tuesday: "10:30-14:00,16:00-20:00",
          wednesday: "10:30-14:00,16:00-20:00",
          thursday: "10:30-14:00,16:00-20:00",
          friday: "10:30-14:00,16:00-20:00",
          saturday: "10:30-14:00,16:00-20:00",
          sunday: "10:30-14:00,16:00-20:00",
        },
      },
      {
        name: "麵匡匡拉麵(南海店)",
        position: [25.032113966750952, 121.51554880425996],
        openingHours: {
          monday: "11:00-20:30",
          tuesday: "11:00-20:30",
          wednesday: "11:00-20:30",
          thursday: "11:00-20:30",
          friday: "11:00-20:30",
          saturday: "11:00-20:30",
          sunday: "11:00-20:30",
        },
      },
      {
        name: "東門鴨莊",
        position: [25.03182751658159, 121.51666074571753],
        openingHours: {
          monday: "10:00-14:30,15:30-19:30",
          tuesday: "10:00-14:30,15:30-19:30",
          wednesday: "10:00-14:30,15:30-19:30",
          thursday: "10:00-14:30,15:30-19:30",
          friday: "10:00-14:30,15:30-19:30",
          saturday: "10:00-14:30,15:30-19:30",
          sunday: "10:00-14:30,15:30-19:30",
        },
      },
      {
        name: "樂饕饕自助餐",
        position: [25.03217460829858, 121.51642196283997],
        openingHours: {
          monday: "10:00-14:00,16:30-20:00",
          tuesday: "10:00-14:00,16:30-20:00",
          wednesday: "10:00-14:00,16:30-20:00",
          thursday: "10:00-14:00,16:30-20:00",
          friday: "10:00-14:00,16:30-20:00",
          saturday: "10:00-14:00,16:30-20:00",
          sunday: "10:00-14:00,16:30-20:00",
        },
      },
      {
        name: "摩斯漢堡(南昌店)",
        position: [25.03173653449798, 121.51673133961954],
        openingHours: {
          monday: "06:00-21:00",
          tuesday: "06:00-21:00",
          wednesday: "06:00-21:00",
          thursday: "06:00-21:00",
          friday: "06:00-21:00",
          saturday: "06:00-21:00",
          sunday: "06:00-21:00",
        },
      },
      {
        name: "三商巧福(南昌店)",
        position: [25.031625, 121.516786],
        openingHours: {
          monday: "11:00-21:00",
          tuesday: "11:00-21:00",
          wednesday: "11:00-21:00",
          thursday: "11:00-21:00",
          friday: "11:00-21:00",
          saturday: "11:00-21:00",
          sunday: "11:00-21:00",
        },
      },
      {
        name: "吉仕達義麵房",
        position: [25.031554725216726, 121.51686542310746],
        openingHours: {
          monday: "11:30-14:00,16:30-20:00",
          tuesday: "11:30-14:00,16:30-20:00",
          wednesday: "11:30-14:00,16:30-20:00",
          thursday: "11:30-14:00,16:30-20:00",
          friday: "11:30-14:00,16:30-20:00",
          saturday: "休息",
          sunday: "11:30-14:00,16:30-20:00",
        },
      },
    ];

    restaurantData.value = localData;
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
  // delete Icon.Default.prototype._getIconUrl;
  // Icon.Default.mergeOptions({
  //   iconRetinaUrl: new URL("https://imgur.com/2bk3D5t.png", import.meta.url)
  //     .href,
  //   iconUrl: new URL("https://imgur.com/0ZsD2ff.png", import.meta.url).href,
  //   shadowUrl: new URL("https://imgur.com/qKgJSmB.png", import.meta.url).href,
  // });
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
