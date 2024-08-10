<template>
  <q-page class="flex flex-center">
    <l-map
      style="height: 600px; width: 100%"
      :zoom="16"
      :center="[25.030004, 121.515866]"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      ></l-tile-layer>
      <l-marker
        v-for="marker in markers"
        :key="marker.content"
        :lat-lng="marker.position"
        :icon="marker.isOpen ? openIcon : closedIcon"
      >
        <l-popup>
          <div class="text-h5">
            {{ marker.content }}
          </div>
          <div v-if="marker.openingHours">
            <div class="text-h6">營業時間:</div>
            <div
              v-for="(hours, day) in translateDays(marker.openingHours)"
              :key="day"
              :class="{ 'today-hours': isToday(day) }"
            >
              {{ day }}: {{ hours.split(",")[0].trim() }}
              <template
                v-for="(section, index) in hours.split(',')"
                :key="index"
              >
                <div v-if="index > 0" class="ml-4">
                  {{ section.trim() }}
                </div>
              </template>
            </div>
          </div>
        </l-popup>
      </l-marker>
    </l-map>
  </q-page>
</template>

<script setup>
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import { onMounted, computed, ref } from "vue";
import { Icon } from "leaflet";

const openIcon = new Icon({
  iconUrl: new URL(
    "../../node_modules/leaflet/dist/images/marker-icon-open.png",
    import.meta.url
  ).href,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const closedIcon = new Icon({
  iconUrl: new URL(
    "../../node_modules/leaflet/dist/images/marker-icon-closed.png",
    import.meta.url
  ).href,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

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
    const [open, close] = range.split("-");
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

const markersData = ref([
  {
    content: "林乾",
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
    content: "建豆",
    position: [25.0291, 121.512884],
    openingHours: {
      monday: "05:30-13:00",
      tuesday: "05:30-13:00",
      wednesday: "05:30-13:00",
      thursday: "05:30-13:00",
      friday: "05:30-13:00",
      saturday: "05:30-11:00",
      sunday: "休息",
    },
  },
  {
    content: "Q Burger",
    position: [25.029501, 121.51452],
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
    content: "嘉義第一名火雞肉飯",
    position: [25.031106, 121.51715],
    openingHours: {
      monday: "11:00–22:00",
      tuesday: "11:00–22:00",
      wednesday: "11:00–22:00",
      thursday: "11:00–22:00",
      friday: "11:00–22:00",
      saturday: "11:00–22:00",
      sunday: "11:00–22:00",
    },
  },
  {
    content: "麥當勞",
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
]);

const markers = computed(() =>
  markersData.value.map((marker) => ({
    ...marker,
    isOpen: isOpen(marker.openingHours),
  }))
);

onMounted(() => {
  delete Icon.Default.prototype._getIconUrl;
  Icon.Default.mergeOptions({
    iconRetinaUrl: new URL(
      "leaflet/dist/images/marker-icon-2x.png",
      import.meta.url
    ).href,
    iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url)
      .href,
    shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url)
      .href,
  });
});
</script>

<style scoped>
.today-hours {
  font-weight: bold;
  color: #2196f3;
}

.ml-4 {
  margin-left: 3em; /*indentation*/
  padding-left: 0.5em;
}
</style>
