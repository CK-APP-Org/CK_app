<template>
  <q-page class="flex justify-center">
    <div class="justify-center">
      <q-card
        inline
        class="custom-card-margin"
        style="height: 127px; width: 350px"
        v-for="(station, key) in sortedStations"
        :key="key"
      >
        <q-card-section>
          <!--站點名稱-->
          <div class="header">
            <span v-if="station.name in stationsNickname">
              {{ stationsNickname[station.name] }}&nbsp;
            </span>
            <span v-else> {{ station.name.substr(11) }}&nbsp; </span>
          </div>

          <!-- Loading indicator -->
          <div v-if="isLoading" class="flex flex-center" style="height: 80px">
            <q-spinner color="primary" size="3em" />
          </div>

          <!-- Station information (only show when not loading) -->
          <template v-else>
            <!--資訊-->
            <div class="text" v-if="station.available_rent_bikes !== null">
              可借車輛:
              <q-chip
                :color="getChipColor(station.available_rent_bikes)"
                text-color="white"
                >{{ station.available_rent_bikes }}</q-chip
              >
            </div>
            <div
              class="row justify-between items-center text"
              v-if="station.available_return_bikes !== null"
            >
              <div>
                可停車位:
                <q-chip
                  :color="getChipColor(station.available_return_bikes)"
                  text-color="white"
                  >{{ station.available_return_bikes }}</q-chip
                >
              </div>
              <div v-if="station.infoTime !== null" class="update-time">
                <q-icon name="update" size="sm" />
                {{ timeAgo(station.infoTime) }}
              </div>
            </div>
          </template>
        </q-card-section>
        <q-btn class="absolute-top-right menu-btn" color="primary" flat round>
          <q-icon name="more_vert" />
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item
                clickable
                v-close-popup
                @click="openEditNicknameDialog(station.name)"
              >
                <q-item-section>修改暱稱</q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                @click="openDeleteStationDialog(key)"
              >
                <q-item-section>刪除此站</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-card>
      <div class="flex justify-center q-mt-md">
        <q-btn
          icon="search"
          color="primary"
          label="尋找最近的五個站點"
          @click="findNearestStations"
        />
      </div>
    </div>

    <!--按鈕(新增站點)-->
    <div class="add-button-container">
      <button class="add-button" @click="showAddStationDialog = true">+</button>
    </div>

    <!--對話框(新增站點)-->
    <q-dialog v-model="showAddStationDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">選擇新增之站點</div>
        </q-card-section>
        <q-card-section>
          <q-select
            v-model="selectedCity"
            :options="cityOptions"
            label="選擇縣市"
            @update:model-value="onCityChange"
          />
          <q-select
            v-model="selectedDistrict"
            :options="districtOptions"
            label="選擇行政區"
            :disable="!selectedCity"
            @update:model-value="onDistrictChange"
          />
          <q-select
            v-model="selectedStation"
            :options="stationOptions"
            label="選擇站點"
            :disable="!selectedDistrict"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="確認" @click="addStation" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!--對話框(修改暱稱)-->
    <q-dialog v-model="showEditNicknameDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">編輯站點暱稱</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="newNickname"
            label="輸入新暱稱"
            autofocus
            @keyup.enter="updateNickname"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" @click="showEditNicknameDialog = false" />
          <q-btn flat label="確認" @click="updateNickname" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!--對話框(刪除站點)-->
    <q-dialog v-model="showDeleteStationDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">確認刪除此站點?</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" @click="showDeleteStationDialog = false" />
          <q-btn
            flat
            label="確認"
            @click="deleteStation(selectedStationForDelete)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!--對話框(最近站點)-->
    <q-dialog v-model="showNearestStationsDialog">
      <q-card style="width: 300px">
        <q-card-section>
          <div class="text-h6">最近的站點</div>
        </q-card-section>
        <q-card-section>
          <div
            v-for="(station, index) in nearestStations"
            :key="index"
            class="q-mb-sm"
          >
            <div class="row items-center justify-between">
              <div>
                {{ index + 1 }}. {{ station.sna.substr(11) }} -
                {{ (station.distance * 1000).toFixed(0) }} m
              </div>
              <q-btn
                color="primary"
                label="Add"
                size="sm"
                @click="addNearestStation(station)"
                :disable="isStationInList(station.sna)"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-section>
          <l-map
            v-if="userPosition"
            style="height: 270px; width: 100%"
            :zoom="mapZoom"
            :center="mapCenter"
            :options="mapOptions"
          >
            <l-tile-layer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            ></l-tile-layer>
            <l-marker :lat-lng="userPosition" :icon="userIcon">
              <l-popup>Your Location</l-popup>
            </l-marker>
            <l-marker
              v-for="station in nearestStations"
              :key="station.sna"
              :lat-lng="[parseFloat(station.lat), parseFloat(station.lng)]"
              :icon="youbikeIcon"
            >
              <l-popup>
                <div class="text-bold">{{ station.sna.substr(11) }}</div>
                <div>可借車輛: {{ station.sbi }}</div>
                <div>可還車輛: {{ station.bemp }}</div>
              </l-popup>
            </l-marker>
          </l-map>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="關閉" @click="showNearestStationsDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  reactive,
  nextTick,
} from "vue";
import { useQuasar } from "quasar";
import axios from "axios";
import { formatDistanceToNow, parseISO, parse } from "date-fns";
import { zhTW } from "date-fns/locale";
import { useStore } from "vuex";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";

class Station {
  constructor(name) {
    this.name = name;
    this.available_rent_bikes = null;
    this.available_return_bikes = null;
    this.infoTime = null;
  }
}

export default defineComponent({
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
  },
  setup() {
    const $q = useQuasar();
    const store = useStore();
    const userAccount = computed(() => store.getters.getUserAccount);
    const stationList = computed(() => store.getters.getStationList);
    const StationList = ref({
      "YouBike2.0_泉州寧波西街口": {
        nickname: "泉州寧波西街口(建中側門)",
        city: "臺北市",
        order: new Date("2024-01-01T00:00:00").getTime(),
      },
      "YouBike2.0_捷運中正紀念堂站(2號出口)": {
        nickname: "中正紀念堂站(2號出口)",
        city: "臺北市",
        order: new Date("2024-01-01T00:01:00").getTime(),
      },
      "YouBike2.0_郵政博物館": {
        nickname: "郵政博物館",
        city: "臺北市",
        order: new Date("2024-01-01T00:02:00").getTime(),
      },
      "YouBike2.0_植物園": {
        nickname: "台北植物園",
        city: "臺北市",
        order: new Date("2024-01-01T00:03:00").getTime(),
      },
    });

    const sortedStations = computed(() => {
      return Object.fromEntries(
        Object.entries(stations.value).sort((a, b) => {
          const orderA = StationList.value[a[0]]?.order || 0;
          const orderB = StationList.value[b[0]]?.order || 0;
          return orderA - orderB;
        })
      );
    });

    const userRef = ref(null); // Declare userRef here
    const userData = ref(null);

    function escapeFirebaseKey(key) {
      return key.replace(/\./g, "%2E");
    }
    function unescapeFirebaseKey(key) {
      return key.replace(/%2E/g, ".");
    }

    onMounted(async () => {
      isLoading.value = true;
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
      StationList.value = userData.value["Youbike"]["stationList"];
      console.log(userData.value["Youbike"]["stationList"]);
      fetchData();
    });

    const stations = ref({});
    const stationsNickname = ref({});
    const showAddStationDialog = ref(false);
    const showEditNicknameDialog = ref(false);
    const showDeleteStationDialog = ref(false);
    const selectedStationForEdit = ref(null);
    const newNickname = ref("");
    const selectedStationForDelete = ref(null);
    const selectedCity = ref(null);
    const selectedDistrict = ref(null);
    const selectedStation = ref(null);
    const isLoading = ref(true);
    const stationOptions = ref([]);

    const cityOptions = [
      { label: "臺北市", value: "臺北市" },
      { label: "新北市", value: "新北市" },
    ];

    const districtOptionsTPC = [
      { label: "大安區", value: "大安區" },
      { label: "中正區", value: "中正區" },
      { label: "萬華區", value: "萬華區" },
      { label: "信義區", value: "信義區" },
      { label: "南港區", value: "南港區" },
      { label: "文山區", value: "文山區" },
      { label: "大同區", value: "大同區" },
      { label: "中山區", value: "中山區" },
      { label: "松山區", value: "松山區" },
      { label: "內湖區", value: "內湖區" },
      { label: "士林區", value: "士林區" },
      { label: "北投區", value: "北投區" },
      { label: "臺大公館校區", value: "臺大公館校區" },
    ];

    const districtOptionsNTC = [
      { label: "八里區", value: "八里區" },
      { label: "三芝區", value: "三芝區" },
      { label: "三重區", value: "三重區" },
      { label: "三峽區", value: "三峽區" },
      { label: "土城區", value: "土城區" },
      { label: "中和區", value: "中和區" },
      { label: "五股區", value: "五股區" },
      { label: "永和區", value: "永和區" },
      { label: "石門區", value: "石門區" },
      { label: "石碇區", value: "石碇區" },
      { label: "汐止區", value: "汐止區" },
      { label: "金山區", value: "金山區" },
      { label: "林口區", value: "林口區" },
      { label: "坪林區", value: "坪林區" },
      { label: "板橋區", value: "板橋區" },
      { label: "泰山區", value: "泰山區" },
      { label: "淡水區", value: "淡水區" },
      { label: "深坑區", value: "深坑區" },
      { label: "萬里區", value: "萬里區" },
      { label: "瑞芳區", value: "瑞芳區" },
      { label: "新店區", value: "新店區" },
      { label: "新莊區", value: "新莊區" },
      { label: "樹林區", value: "樹林區" },
      { label: "雙溪區", value: "雙溪區" },
      { label: "蘆洲區", value: "蘆洲區" },
      { label: "鶯歌區", value: "鶯歌區" },
    ];

    const districtOptions = computed(() => {
      if (selectedCity.value) {
        if (selectedCity.value.value === "臺北市") {
          return districtOptionsTPC;
        } else if (selectedCity.value.value === "新北市") {
          return districtOptionsNTC;
        }
      }
      return [];
    });

    const fetchData = async () => {
      isLoading.value = true;
      const stationList = StationList.value;
      stations.value = Object.fromEntries(
        Object.keys(stationList).map((name) => [name, new Station(name)])
      );
      stationsNickname.value = Object.fromEntries(
        Object.entries(stationList).map(([key, value]) => [key, value.nickname])
      );
      try {
        //Fetch data from TPC API
        const responseTPC = await axios.get(
          "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json"
        );
        const dataTPC = responseTPC.data;
        //Fetch data from NTC API
        let responseNTC;
        let dataNTC;
        responseNTC = await axios.get(
          "https://data.ntpc.gov.tw/api/datasets/010e5b15-3823-4b20-b401-b1cf000550c5/json?size=1000"
        );
        dataNTC = responseNTC.data;
        //Fetch the data of the second page of the NTC API
        responseNTC = await axios.get(
          "https://data.ntpc.gov.tw/api/datasets/010e5b15-3823-4b20-b401-b1cf000550c5/json?page=1&size=1000"
        );
        dataNTC = [...dataNTC, ...responseNTC.data]; //Merging the two arrays of objects together

        //Fetch data for each station
        for (const key in stations.value) {
          if (stationList[key].city == "臺北市") {
            const stationData = dataTPC.find(
              (station) =>
                station.sna === unescapeFirebaseKey(stations.value[key].name)
            );

            if (stationData) {
              stations.value[key].available_rent_bikes =
                stationData.available_rent_bikes;
              stations.value[key].available_return_bikes =
                stationData.available_return_bikes;
              stations.value[key].infoTime = stationData.mday;
            } else {
              stations.value[key].available_rent_bikes = "Station not found";
              stations.value[key].available_return_bikes = "Station not found";
              stations.value[key].infoTime = "Station not found";
            }
          } else if (stationList[key].city == "新北市") {
            const stationData = dataNTC.find(
              (station) =>
                station.sna === unescapeFirebaseKey(stations.value[key].name)
            );

            if (stationData) {
              stations.value[key].available_rent_bikes = stationData.sbi;
              stations.value[key].available_return_bikes = stationData.bemp;
              stations.value[key].infoTime = stationData.mday;
            } else {
              stations.value[key].available_rent_bikes = "Station not found";
              stations.value[key].available_return_bikes = "Station not found";
              stations.value[key].infoTime = "Station not found";
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        for (const key in stations.value) {
          stations.value[key].available_rent_bikes = "Error fetching data";
          stations.value[key].available_return_bikes = "Error fetching data";
          stations.value[key].infoTime = "Error fetching data";
        }
      } finally {
        isLoading.value = false;
      }
    };

    const addStation = async () => {
      if (selectedStation.value) {
        const station = new Station(selectedStation.value.value);
        const newStationName = selectedStation.value.value;

        // Create the new station data
        const newStationData = {
          nickname: selectedStation.value.label,
          city: selectedCity.value.value,
          order: Date.now(),
        };

        // Update local state
        stations.value[newStationName] = station;
        StationList.value[newStationName] = newStationData;

        // Fetch and update station data
        await fetchStationData(station, selectedCity.value.value);

        // Update store and Firestore
        const updatePath = `${
          userAccount.value
        }.Youbike.stationList.${escapeFirebaseKey(newStationName)}`;
        await updateDoc(userRef.value, { [updatePath]: newStationData });

        store.dispatch("addStation", {
          stationName: newStationName,
          stationData: newStationData,
        });

        $q.notify({
          message: "已儲存更改",
          color: "positive",
          position: "bottom",
          timeout: 2000,
        });

        // Force re-computation of sortedStations
        nextTick(() => {
          const temp = { ...stations.value };
          stations.value = {};
          stations.value = temp;
        });

        showAddStationDialog.value = false;
        selectedCity.value = null;
        selectedDistrict.value = null;
        selectedStation.value = null;
      }
    };

    // Helper function to fetch station data
    const fetchStationData = async (station, city) => {
      let apiUrl, data;
      if (city === "臺北市") {
        apiUrl =
          "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json";
      } else if (city === "新北市") {
        apiUrl =
          "https://data.ntpc.gov.tw/api/datasets/010e5b15-3823-4b20-b401-b1cf000550c5/json?size=1000";
      }

      try {
        const response = await axios.get(apiUrl);
        data = response.data;

        if (city === "新北市") {
          const response2 = await axios.get(
            "https://data.ntpc.gov.tw/api/datasets/010e5b15-3823-4b20-b401-b1cf000550c5/json?page=1&size=1000"
          );
          data = [...data, ...response2.data];
        }

        const stationData = data.find((s) => s.sna === station.name);

        if (stationData) {
          if (city === "臺北市") {
            station.available_rent_bikes = stationData.available_rent_bikes;
            station.available_return_bikes = stationData.available_return_bikes;
            station.infoTime = stationData.mday;
          } else {
            station.available_rent_bikes = stationData.sbi;
            station.available_return_bikes = stationData.bemp;
            station.infoTime = stationData.mday;
          }
        } else {
          station.available_rent_bikes = "Station not found";
          station.available_return_bikes = "Station not found";
          station.infoTime = "Station not found";
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        station.available_rent_bikes = "Error fetching data";
        station.available_return_bikes = "Error fetching data";
        station.infoTime = "Error fetching data";
      }
    };

    const onCityChange = () => {
      selectedDistrict.value = null;
      selectedStation.value = null;
      stationOptions.value = [];
    };

    const onDistrictChange = async () => {
      selectedStation.value = null;
      stationOptions.value = [];
      if (selectedDistrict.value) {
        let apiUrl;
        if (selectedCity.value.value === "臺北市") {
          apiUrl =
            "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json";
        } else if (selectedCity.value.value === "新北市") {
          apiUrl =
            "https://data.ntpc.gov.tw/api/datasets/010e5b15-3823-4b20-b401-b1cf000550c5/json?size=1000";
        }
        try {
          let response;
          let data;
          response = await axios.get(apiUrl);
          data = response.data;

          //Because NTC API has two pages
          if (selectedCity.value.value === "新北市") {
            const response = await axios.get(
              "https://data.ntpc.gov.tw/api/datasets/010e5b15-3823-4b20-b401-b1cf000550c5/json?page=1&size=1000"
            );
            data = [...data, ...response.data];
          }

          // Filter stations by selected district
          const filteredStations = data.filter(
            (station) => station.sarea === selectedDistrict.value.value
          );

          // Map the filtered stations to station options
          stationOptions.value = filteredStations.map((station) => ({
            label: station.sna.substr(11),
            value: station.sna,
          }));
        } catch (error) {
          console.error("Error fetching data:", error);
          stationOptions.value = [];
        }
      } else {
        stationOptions.value = [];
      }
    };

    const openEditNicknameDialog = (stationName) => {
      selectedStationForEdit.value = stationName;
      newNickname.value = stationsNickname.value[stationName] || "";
      showEditNicknameDialog.value = true;
    };

    const updateNickname = async () => {
      if (selectedStationForEdit.value && newNickname.value) {
        // Update local state
        stationsNickname.value = {
          ...stationsNickname.value,
          [selectedStationForEdit.value]: newNickname.value,
        };
        const updatePath = `${
          userAccount.value
        }.Youbike.stationList.${escapeFirebaseKey(
          selectedStationForEdit.value
        )}.nickname`;
        await updateDoc(userRef.value, { [updatePath]: newNickname.value });
        $q.notify({
          message: "已儲存更改",
          color: "positive",
          position: "bottom",
          timeout: 2000,
        });

        // Update store
        store.dispatch("updateStationNickname", {
          stationName: selectedStationForEdit.value,
          newNickname: newNickname.value,
        });
      }
      showEditNicknameDialog.value = false;
    };

    const openDeleteStationDialog = (stationName) => {
      selectedStationForDelete.value = stationName;
      showDeleteStationDialog.value = true;
    };

    const deleteStation = async (key) => {
      showDeleteStationDialog.value = false;

      if (stations.value[key]) {
        const stationName = stations.value[key].name;
        // Remove from local component state
        delete stationsNickname.value[stationName];
        delete stations.value[key];
        delete StationList.value[stationName];

        // Update store
        const deletePath = `${
          userAccount.value
        }.Youbike.stationList.${escapeFirebaseKey(stationName)}`;
        await updateDoc(userRef.value, { [deletePath]: deleteField() });
        store.dispatch("deleteStation", stationName);
      }
    };

    const parseTimestamp = (timestamp) => {
      if (typeof timestamp === "string") {
        // Check if the timestamp matches the 新北市 format (YYYYMMDDHHMMSS)
        if (/^\d{14}$/.test(timestamp)) {
          return parse(timestamp, "yyyyMMddHHmmss", new Date());
        } else {
          // Then it's in 臺北市's ISO 8601 format
          return parseISO(timestamp);
        }
      }
      // If it's not a string, return it as is (it might already be a Date object)
      return timestamp;
    };

    const timeAgo = (time) => {
      const parsedTime = parseTimestamp(time);
      return formatDistanceToNow(parsedTime, { locale: zhTW }) + "前";
    };

    const getChipColor = (value) => {
      if (value === 0) return "red-9";
      if (value >= 1 && value <= 3) return "orange-8";
      return "green";
    };

    //Three nearest stations:
    const nearestStations = ref([]);
    const showNearestStationsDialog = ref(false);

    const findNearestStations = async () => {
      try {
        // Get user's current position
        const position = await getCurrentPosition();
        console.log(position);
        const { latitude: userLat, longitude: userLng } = position.coords;

        userPosition.value = [userLat, userLng];
        mapCenter.value = [userLat, userLng];

        // Fetch all stations data
        const allStations = await fetchAllStationsData();

        // Calculate distances and sort
        const stationsWithDistances = allStations.map((station) => ({
          ...station,
          distance: calculateDistance(
            userLat,
            userLng,
            station.lat,
            station.lng
          ),
        }));

        stationsWithDistances.sort((a, b) => a.distance - b.distance);

        // Get the three nearest stations
        nearestStations.value = stationsWithDistances.slice(0, 5);

        // Show the result
        showNearestStationsDialog.value = true;
      } catch (error) {
        console.error("Error finding nearest stations:", error);
        $q.notify({
          message: "無法搜尋最近站點",
          color: "negative",
          position: "bottom",
          timeout: 2000,
        });
      }
    };

    const getCurrentPosition = () => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by this browser."));
        } else {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }
      });
    };

    const fetchAllStationsData = async () => {
      try {
        // Fetch Taipei City data
        const tpcResponse = await axios.get(
          "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json"
        );
        const tpcData = tpcResponse.data.map((station) => ({
          ...station,
          lat: station.latitude,
          lng: station.longitude,
          city: "臺北市",
        }));

        // Fetch New Taipei City data (both pages)
        const ntcResponse1 = await axios.get(
          "https://data.ntpc.gov.tw/api/datasets/010e5b15-3823-4b20-b401-b1cf000550c5/json?size=1000"
        );
        const ntcResponse2 = await axios.get(
          "https://data.ntpc.gov.tw/api/datasets/010e5b15-3823-4b20-b401-b1cf000550c5/json?page=1&size=1000"
        );
        const ntcData = [...ntcResponse1.data, ...ntcResponse2.data].map(
          (station) => ({
            ...station,
            lat: parseFloat(station.lat),
            lng: parseFloat(station.lng),
            city: "新北市",
          })
        );

        return [...tpcData, ...ntcData];
      } catch (error) {
        console.error("Error fetching all stations data:", error);
        throw error;
      }
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of the earth in km
      const dLat = deg2rad(lat2 - lat1);
      const dLon = deg2rad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
          Math.cos(deg2rad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c; // Distance in km
      return d;
    };

    const deg2rad = (deg) => {
      return deg * (Math.PI / 180);
    };

    const userPosition = ref(null);
    const mapCenter = ref([25.031204, 121.515966]); // Default center (you can adjust this)
    const mapZoom = ref(15);

    const mapOptions = {
      zoomControl: false,
    };

    const youbikeIcon = new Icon({
      iconUrl: "https://imgur.com/jZN5Ph6.png", // Replace with actual YouBike icon URL
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    const userIcon = new Icon({
      iconUrl: "https://imgur.com/de9dxzv.png", // Replace with actual user icon URL
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    const addNearestStation = async (station) => {
      const newStationName = station.sna;
      const newStationData = {
        nickname: station.sna.substr(11),
        city: station.city,
        order: Date.now(),
      };

      // Update local state
      stations.value[newStationName] = new Station(newStationName);
      StationList.value[newStationName] = newStationData;

      // Fetch and update station data
      await fetchStationData(stations.value[newStationName], station.city);

      // Update store and Firestore
      const updatePath = `${
        userAccount.value
      }.Youbike.stationList.${escapeFirebaseKey(newStationName)}`;
      await updateDoc(userRef.value, { [updatePath]: newStationData });

      store.dispatch("addStation", {
        stationName: newStationName,
        stationData: newStationData,
      });

      $q.notify({
        message: "站點已新增至您的清單",
        color: "positive",
        position: "bottom",
        timeout: 2000,
      });

      // Force re-computation of sortedStations
      nextTick(() => {
        const temp = { ...stations.value };
        stations.value = {};
        stations.value = temp;
      });
    };

    const isStationInList = (stationName) => {
      // Normalize the input stationName by replacing '.' with '%2E'
      const normalizedStationName = stationName.replace(/\./g, "%2E");

      // Check if the normalized name exists in StationList.value
      return Object.keys(StationList.value).some(
        (key) => key === normalizedStationName || key === stationName
      );
    };

    return {
      stations,
      stationsNickname,
      showAddStationDialog,
      showEditNicknameDialog,
      showDeleteStationDialog,
      selectedStationForEdit,
      newNickname,
      selectedStationForDelete,
      selectedCity,
      selectedDistrict,
      selectedStation,
      cityOptions,
      districtOptions,
      stationOptions,
      isLoading,
      StationList,
      sortedStations,
      showNearestStationsDialog,
      nearestStations,
      userPosition,
      mapCenter,
      mapZoom,
      mapOptions,
      youbikeIcon,
      userIcon,
      addNearestStation,
      isStationInList,
      findNearestStations,
      fetchData,
      addStation,
      onCityChange,
      onDistrictChange,
      openEditNicknameDialog,
      updateNickname,
      openDeleteStationDialog,
      deleteStation,
      timeAgo,
      getChipColor,
    };
  },
});
</script>

<style>
.header {
  font-weight: Bold;
  color: #03328d;
  font-size: 21px;
  margin-bottom: 2px;
}
.text {
  font-size: 17px;
  font-weight: medium;
}
.red-text {
  font-weight: Bold;
  color: #c10015;
}
.q-page {
  padding-top: 16px;
}
.custom-card-margin {
  margin: 10px 16px;
  background-color: rgb(239, 246, 254);
}
.delete-btn {
  margin-bottom: 8px;
  margin-right: 8px;
}
.menu-btn {
  margin-top: 10px;
  margin-right: 6px;
}
.add-button-container {
  position: fixed;
  bottom: 85px;
  right: 20px;
  z-index: 1000;
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

.update-time {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
}
.update-time .q-icon {
  margin-right: 4px;
}
</style>
