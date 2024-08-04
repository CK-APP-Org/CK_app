<template>
  <q-page class="flex">
    <l-map
      style="height: 600px; width: 100%"
      :zoom="16"
      :center="[25.031204, 121.515966]"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      ></l-tile-layer>
      <l-marker
        v-for="marker in markers"
        :key="marker.content"
        :lat-lng="marker.position"
        :icon="getMarkerIcon(marker)"
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
    <div class="q-mt-md q-ml-md">
      <q-checkbox
        v-model="hideClosedRestaurants"
        label="Hide closed restaurants"
      />
    </div>
  </q-page>
</template>

<script setup>
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import { onMounted, computed, ref } from "vue";
import { Icon } from "leaflet";

const hideClosedRestaurants = ref(false);

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

const markersData = ref([
  //重慶南路西側
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
    content: "廣炒",
    position: [25.030349528143947, 121.514101],
    openingHours: {
      monday: "休息",
      tuesday: "11:00–13:30,17:00–18:30",
      wednesday: "11:00–13:30,17:00–18:30",
      thursday: "11:00–13:30,17:00–18:30",
      friday: "11:00–13:30",
      saturday: "休息",
      sunday: "休息",
    },
  },
  {
    content: "呷尚寶",
    position: [25.02948, 121.514145],
    openingHours: {
      monday: "06:00–13:30",
      tuesday: "06:00–13:30",
      wednesday: "06:00–13:30",
      thursday: "06:00–13:30",
      friday: "06:00–13:30",
      saturday: "休息",
      sunday: "06:00–13:30",
    },
  },
  {
    content: "烤上台大",
    position: [25.029351, 121.514166],
    openingHours: {
      monday: "11:00–14:00",
      tuesday: "11:00–14:00",
      wednesday: "11:00–14:00",
      thursday: "11:00–14:00",
      friday: "11:00–14:00",
      saturday: "休息",
      sunday: "休息",
    },
  },
  {
    content: "搭伙",
    position: [25.0292, 121.514201],
    openingHours: {
      monday: "11:00–21:00",
      tuesday: "11:00–21:00",
      wednesday: "11:00–21:00",
      thursday: "11:00–21:00",
      friday: "11:00–21:00",
      saturday: "休息",
      sunday: "休息",
    },
  },
  {
    content: "建中黑砂糖刨冰",
    position: [25.029342, 121.514371],
    openingHours: {
      monday: "11:00–18:00",
      tuesday: "11:00–18:00",
      wednesday: "11:00–18:00",
      thursday: "11:00–18:00",
      friday: "11:00–18:00",
      saturday: "11:00–18:00",
      sunday: "11:00–18:00",
    },
  },
  {
    content: "雲南小廚",
    position: [25.02924, 121.514397],
    openingHours: {
      monday: "11:00–14:00,17:00–19:30",
      tuesday: "11:00–14:00,17:00–19:30",
      wednesday: "11:00–14:00,17:00–19:30",
      thursday: "11:00–14:00,17:00–19:30",
      friday: "11:00–14:00,17:00–19:30",
      saturday: "休息",
      sunday: "休息",
    },
  },
  {
    content: "老建中麵店",
    position: [25.029075, 121.514415],
    openingHours: {
      monday: "11:30–14:30,16:30–19:30",
      tuesday: "11:30–14:30,16:30–19:30",
      wednesday: "11:30–14:30,16:30–19:30",
      thursday: "11:30–14:30,16:30–19:30",
      friday: "11:30–14:30,16:30–19:30",
      saturday: "休息",
      sunday: "休息",
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
  //重慶南路東側，牯嶺街西側
  {
    content: "福井麵疙瘩",
    position: [25.029983198664322, 121.51575229827415],
    openingHours: {
      monday: "11:00–14:00,17:00–20:00",
      tuesday: "11:00–14:00,17:00–20:00",
      wednesday: "11:00–14:00,17:00–20:00",
      thursday: "11:00–14:00,17:00–20:00",
      friday: "11:00–14:00,17:00–20:00",
      saturday: "11:00–14:30,17:00–20:00",
      sunday: "休息",
    },
  },
  {
    content: "原馨牛排",
    position: [25.030025, 121.515951],
    openingHours: {
      monday: "11:00–15:00,17:00–21:30",
      tuesday: "11:00–15:00,17:00–21:30",
      wednesday: "11:00–15:00,17:00–21:30",
      thursday: "11:00–15:00,17:00–21:30",
      friday: "11:00–15:00,17:00–21:30",
      saturday: "11:00–15:00,17:00–21:30",
      sunday: "11:00–15:00,17:00–21:30",
    },
  },
  {
    content: "吉坤便當",
    position: [25.0300408767271, 121.51608257525113],
    openingHours: {
      monday: "09:00–13:30,16:30–19:30",
      tuesday: "09:00–13:30,16:30–19:30",
      wednesday: "09:00–13:30,16:30–19:30",
      thursday: "09:00–13:30,16:30–19:30",
      friday: "09:00–13:30,16:30–19:30",
      saturday: "休息",
      sunday: "休息",
    },
  },
  {
    content: "春天涼麵",
    position: [25.030074900948268, 121.51622137977701],
    openingHours: {
      monday: "10:00–14:00,16:30–20:00",
      tuesday: "10:00–14:00,16:30–20:00",
      wednesday: "10:00–14:00,16:30–20:00",
      thursday: "10:00–14:00,16:30–20:00",
      friday: "10:00–14:00,16:30–20:00",
      saturday: "休息",
      sunday: "10:00–14:00,16:30–20:00",
    },
  },
  {
    content: "麥味登",
    position: [25.029738608507763, 121.5155428647885],
    openingHours: {
      monday: "07:00–19:00",
      tuesday: "07:00–19:00",
      wednesday: "07:00–19:00",
      thursday: "07:00–19:00",
      friday: "07:00–19:00",
      saturday: "休息",
      sunday: "休息",
    },
  },
  {
    content: "懿品小珍",
    position: [25.029804, 121.515746],
    openingHours: {
      monday: "11:00–15:00,16:30–20:40",
      tuesday: "11:00–15:00,16:30–20:40",
      wednesday: "11:00–15:00,16:30–20:40",
      thursday: "11:00–15:00,16:30–20:40",
      friday: "11:00–15:00,16:30–20:40",
      saturday: "11:00–15:00,16:30–20:40",
      sunday: "休息",
    },
  },
  {
    content: "昇客雞肉",
    position: [25.029822454357795, 121.51584461333881],
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
    content: "Ebisu curry&coffee",
    position: [25.029952, 121.516382],
    openingHours: {
      monday: "11:00-14:30,17:00-19:30",
      tuesday: "11:00-14:30,17:00-19:30",
      wednesday: "11:00-14:30,17:00-19:30",
      thursday: "11:00-14:30,17:00-19:30",
      friday: "11:00-14:30,17:00-19:30",
      saturday: "11:00-14:30,17:00-19:30",
      sunday: "休息",
    },
  },
  {
    content: "豪季水餃",
    position: [25.0298393536911, 121.516452],
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
  //牯嶺街東側，南昌路西側
  {
    content: "早安美芝城",
    position: [25.030067172137052, 121.516562],
    openingHours: {
      monday: "06:00–13:30",
      tuesday: "06:00–13:30",
      wednesday: "06:00–13:30",
      thursday: "06:00–13:30",
      friday: "06:00–13:30",
      saturday: "休息",
      sunday: "06:00–13:30",
    },
  },
  {
    content: "由紀(日本料理)",
    position: [25.03010362673569, 121.51665011786834],
    openingHours: {
      monday: "休息",
      tuesday: "12:00–19:30",
      wednesday: "12:00–19:30",
      thursday: "12:00–19:30",
      friday: "12:00–19:30",
      saturday: "11:30–19:00",
      sunday: "11:30–19:00",
    },
  },
  {
    content: "金牛王",
    position: [25.03015648602184, 121.51677349946341],
    openingHours: {
      monday: "10:45–14:00,16:00–19:30",
      tuesday: "10:45–14:00,16:00–19:30",
      wednesday: "10:45–14:00,16:00–19:30",
      thursday: "10:45–14:00,16:00–19:30",
      friday: "10:45–14:00,16:00–19:30",
      saturday: "休息",
      sunday: "休息",
    },
  },
  {
    content: "郝家食堂",
    position: [25.030266290530147, 121.51694835822461],
    openingHours: {
      monday: "11:00–14:00,17:00–20:00",
      tuesday: "11:00–14:00,17:00–20:00",
      wednesday: "11:00–14:00,17:00–20:00",
      thursday: "11:00–14:00,17:00–20:00",
      friday: "11:00–14:00,17:00–20:00",
      saturday: "休息",
      sunday: "休息",
    },
  },
  {
    content: "虹品鍋貼水餃",
    position: [25.030155, 121.516418],
    openingHours: {
      monday: "07:00–18:30",
      tuesday: "07:00–18:30",
      wednesday: "07:00–18:30",
      thursday: "07:00–18:30",
      friday: "07:00–18:30",
      saturday: "09:00–18:30",
      sunday: "09:00–18:30",
    },
  },
  {
    content: "福記港式燒臘",
    position: [25.03020371249294, 121.51652987356393],
    openingHours: {
      monday: "11:00–20:00",
      tuesday: "11:00–20:00",
      wednesday: "11:00–20:00",
      thursday: "11:00–20:00",
      friday: "11:00–20:00",
      saturday: "休息",
      sunday: "11:00–20:00",
    },
  },
  {
    content: "CoCo",
    position: [25.03020371249294, 121.51652987356393],
    openingHours: {
      monday: "10:00–20:15",
      tuesday: "10:00–20:15",
      wednesday: "10:00–20:15",
      thursday: "10:00–20:15",
      friday: "10:00–20:15",
      saturday: "10:30–19:45",
      sunday: "10:30–19:45",
    },
  },
  {
    content: "養鍋",
    position: [25.030315200074597, 121.51673711834518],
    openingHours: {
      monday: "11:30–13:30,17:00–21:00",
      tuesday: "11:30–13:30,17:00–21:00",
      wednesday: "11:30–13:30,17:00–21:00",
      thursday: "11:30–13:30,17:00–21:00",
      friday: "11:30–13:30,17:00–21:00",
      saturday: "11:00–21:00",
      sunday: "11:00–21:00",
    },
  },
  {
    content: "城市盒子",
    position: [25.030368, 121.516846],
    openingHours: {
      monday: "10:00–14:00,16:00–19:30",
      tuesday: "10:00–14:00,16:00–19:30",
      wednesday: "10:00–14:00,16:00–19:30",
      thursday: "10:00–14:00,16:00–19:30",
      friday: "10:00–14:00,16:00–19:30",
      saturday: "10:00–14:00",
      sunday: "休息",
    },
  },
  {
    content: "便當王",
    position: [25.030602474377098, 121.51657448689377],
    openingHours: {
      monday: "11:00–13:50,16:40–19:15",
      tuesday: "11:00–13:50,16:40–19:15",
      wednesday: "11:00–13:50,16:40–19:15",
      thursday: "11:00–13:50,16:40–19:15",
      friday: "11:00–13:50,16:40–19:15",
      saturday: "休息",
      sunday: "休息",
    },
  },
  {
    content: "必勝客",
    position: [25.030733819724723, 121.51603505015856],
    openingHours: {
      monday: "11:00–22:00",
      tuesday: "11:00–22:00",
      wednesday: "11:00–22:00",
      thursday: "11:00–22:00",
      friday: "11:00–22:00",
      saturday: "休息",
      sunday: "休息",
    },
  },
  {
    content: "桃屋日本料理",
    position: [25.03038343881961, 121.51714130644875],
    openingHours: {
      monday: "09:00–17:30",
      tuesday: "09:00–17:30",
      wednesday: "09:00–17:30",
      thursday: "09:00–17:30",
      friday: "09:00–17:30",
      saturday: "09:00–14:00",
      sunday: "09:00–14:00",
    },
  },
  {
    content: "飴盛禾",
    position: [25.03050646572006, 121.51705156758634],
    openingHours: {
      monday: "11:00–13:30,16:30–20:00",
      tuesday: "11:00–13:30,16:30–20:00",
      wednesday: "11:00–13:30,16:30–20:00",
      thursday: "11:00–13:30,16:30–20:00",
      friday: "11:00–13:30,16:30–20:00",
      saturday: "休息",
      sunday: "休息",
    },
  },
  {
    content: "四兩刈包",
    position: [25.030654227479125, 121.51728495953597],
    openingHours: {
      monday: "11:40–20:30",
      tuesday: "11:40–20:30",
      wednesday: "11:40–20:30",
      thursday: "11:40–20:30",
      friday: "11:40–20:30",
      saturday: "11:40–20:30",
      sunday: "休息",
    },
  },
  {
    content: "曼鯊鯊",
    position: [25.030870470759332, 121.51699783134352],
    openingHours: {
      monday: "11:00–14:00,17:00–20:00",
      tuesday: "11:00–14:00,17:00–20:00",
      wednesday: "11:00–14:00,17:00–20:00",
      thursday: "11:00–14:00,17:00–20:00",
      friday: "11:00–14:00,17:00–20:00",
      saturday: "11:00–14:00,17:00–20:00",
      sunday: "休息",
    },
  },
  {
    content: "本味拉麵",
    position: [25.031020290826692, 121.51724170894916],
    openingHours: {
      monday: "休息",
      tuesday: "11:00–14:00,17:00–20:30",
      wednesday: "11:00–14:00,17:00–20:30",
      thursday: "11:00–14:00,17:00–20:30",
      friday: "11:00–14:00,17:00–20:30",
      saturday: "11:00–14:00,17:00–20:30",
      sunday: "11:00–14:00,17:00–20:30",
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
    content: "鬍鬚張魯肉飯",
    position: [25.031176437044987, 121.51717130095058],
    openingHours: {
      monday: "10:00–21:30",
      tuesday: "10:00–21:30",
      wednesday: "10:00–21:30",
      thursday: "10:00–21:30",
      friday: "10:00–21:30",
      saturday: "10:00–21:30",
      sunday: "10:00–21:30",
    },
  },
  //南昌路東側
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
  {
    content: "夯堡",
    position: [25.03107844024507, 121.51832451478535],
    openingHours: {
      monday: "08:00–21:00",
      tuesday: "08:00–21:00",
      wednesday: "08:00–21:00",
      thursday: "08:00–21:00",
      friday: "08:00–21:00",
      saturday: "08:00–21:00",
      sunday: "08:00–21:00",
    },
  },
  {
    content: "奇福扁食",
    position: [25.031318431436787, 121.51843582645411],
    openingHours: {
      monday: "10:30–14:30,16:30–20:00",
      tuesday: "10:30–14:30,16:30–20:00",
      wednesday: "10:30–14:30,16:30–20:00",
      thursday: "10:30–14:30,16:30–20:00",
      friday: "10:30–14:30,16:30–20:00",
      saturday: "10:30–14:30,16:30–20:00",
      sunday: "10:30–14:30,16:30–20:00",
    },
  },
  {
    content: "三元堂拉麵",
    position: [25.031308887643682, 121.51771957931884],
    openingHours: {
      monday: "11:40–13:40,16:30–20:30",
      tuesday: "11:40–13:40,16:30–20:30",
      wednesday: "11:40–13:40,16:30–20:30",
      thursday: "11:40–13:40,16:30–20:30",
      friday: "11:40–13:40,16:30–20:30",
      saturday: "11:40–13:40,16:30–20:30",
      sunday: "休息",
    },
  },
  {
    content: "小松鍋燒麵",
    position: [25.031672025211932, 121.51811902562679],
    openingHours: {
      monday: "10:00–15:00,17:00–20:00",
      tuesday: "10:00–15:00,17:00–20:00",
      wednesday: "10:00–15:00,17:00–20:00",
      thursday: "10:00–15:00,17:00–20:00",
      friday: "10:00–15:00,17:00–20:00",
      saturday: "休息",
      sunday: "休息",
    },
  },
  {
    content: "金峰魯肉飯",
    position: [25.032044958751985, 121.51849530640874],
    openingHours: {
      monday: "00:00-01:00",
      tuesday: "11:00–24:00",
      wednesday: "00:00-01:00,11:00–24:00",
      thursday: "00:00-01:00,11:00–24:00",
      friday: "00:00-01:00,11:00–24:00",
      saturday: "00:00-01:00,11:00–24:00",
      sunday: "00:00-01:00,11:00–24:00",
    },
  },
  //南海路
  {
    content: "八方雲集",
    position: [25.03202841061271, 121.51519603862796],
    openingHours: {
      monday: "10:00–22:00",
      tuesday: "10:00–22:00",
      wednesday: "10:00–22:00",
      thursday: "10:00–22:00",
      friday: "10:00–22:00",
      saturday: "10:00–22:00",
      sunday: "10:00-22:00",
    },
  },
  {
    content: "好味涼亭",
    position: [25.032062323492937, 121.51573119446294],
    openingHours: {
      monday: "11:00–14:30,16:00–19:30",
      tuesday: "11:00–14:30,16:00–19:30",
      wednesday: "11:00–14:30,16:00–19:30",
      thursday: "11:00–14:30,16:00–19:30",
      friday: "11:00–14:30,16:00–19:30",
      saturday: "11:00–19:00",
      sunday: "休息",
    },
  },
  {
    content: "老熊牛肉麵",
    position: [25.032157104036347, 121.5157948969418],
    openingHours: {
      monday: "11:00–19:30",
      tuesday: "11:00–19:30",
      wednesday: "11:00–19:30",
      thursday: "11:00–19:30",
      friday: "11:00–19:30",
      saturday: "11:00–19:30",
      sunday: "11:00–19:00",
    },
  },
  {
    content: "肯德基",
    position: [25.03224667128567, 121.51632808148645],
    openingHours: {
      monday: "10:00–23:00",
      tuesday: "10:00–23:00",
      wednesday: "10:00–23:00",
      thursday: "10:00–23:00",
      friday: "10:00–23:00",
      saturday: "10:00–23:00",
      sunday: "10:00–23:00",
    },
  },
  {
    content: "麵匡匡拉麵",
    position: [25.032113966750952, 121.51554880425996],
    openingHours: {
      monday: "11:00-15:00,17:00-21:00",
      tuesday: "11:00-15:00,17:00-21:00",
      wednesday: "11:00-15:00,17:00-21:00",
      thursday: "11:00-15:00,17:00-21:00",
      friday: "11:00-15:00,17:00-21:00",
      saturday: "11:00-15:00,17:00-21:00",
      sunday: "11:00-15:00,17:00-21:00",
    },
  },
  {
    content: "摩斯漢堡",
    position: [25.03173653449798, 121.51673133961954],
    openingHours: {
      monday: "06:00–22:00",
      tuesday: "06:00–22:00",
      wednesday: "06:00–22:00",
      thursday: "06:00–22:00",
      friday: "06:00–22:00",
      saturday: "06:00–22:00",
      sunday: "06:00–22:00",
    },
  },
  {
    content: "三商巧福",
    position: [25.031625, 121.516786],
    openingHours: {
      monday: "11:00–21:00",
      tuesday: "11:00–21:00",
      wednesday: "11:00–21:00",
      thursday: "11:00–21:00",
      friday: "11:00–21:00",
      saturday: "11:00–21:00",
      sunday: "11:00–21:00",
    },
  },
]);

const markers = computed(() =>
  markersData.value
    .map((marker) => ({
      ...marker,
      isOpen: isOpen(marker.openingHours),
    }))
    .filter((marker) => !hideClosedRestaurants.value || marker.isOpen)
);

onMounted(() => {
  console.log(markersData.value.length);
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
.today-hours {
  font-weight: bold;
  color: #2196f3;
}

.ml-4 {
  margin-left: 3em; /*indentation*/
  padding-left: 0.5em;
}
</style>
