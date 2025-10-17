<template>
  <q-page class="bg-grey-1 q-pa-sm">
    <!-- Youbike Section -->
    <h3 class="text-h5 q-mb-md" style="font-weight: bold">
      <q-icon name="directions_bike" size="sm" class="q-mr-sm" />
      YouBike 站點
    </h3>
    <div class="row q-col-gutter-sm">
      <div v-for="(station, key) in stations" :key="key" class="col-6">
        <q-card class="station-card">
          <q-card-section class="q-pr-none q-pl-md">
            <div class="row justify-between items-center">
              <div class="header">
                {{
                  (
                    stationsNickname[station.name] || station.name.substr(11)
                  ).slice(0, 7)
                }}
              </div>
              <q-btn flat dense round color="primary" icon="more_vert">
                <q-menu>
                  <q-list style="min-width: 100px">
                    <q-item
                      dense
                      clickable
                      v-close-popup
                      @click="openEditNicknameDialog(station.name)"
                      style="height: 40px"
                    >
                      <q-item-section>修改暱稱</q-item-section>
                    </q-item>
                    <q-item
                      dense
                      clickable
                      v-close-popup
                      @click="openDeleteStationDialog(key)"
                      style="height: 40px"
                    >
                      <q-item-section>刪除此站</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>

            <!-- Loading indicator -->
            <div
              v-if="isStationLoading(station.name)"
              class="flex flex-center"
              style="height: 33px"
            >
              <q-spinner color="primary" size="2.5em" />
            </div>

            <!-- Station information (always show when not initial loading) -->
            <template v-else>
              <div class="row q-mt-xs items-center">
                <div class="col-6">
                  <q-icon name="pedal_bike" size="xs" color="primary" />
                  <q-chip
                    dense
                    :color="getChipColor(station.available_rent_bikes)"
                    text-color="white"
                    class="q-ml-xs"
                  >
                    <div class="text">{{ station.available_rent_bikes }}</div>
                  </q-chip>
                </div>
                <div class="col-6">
                  <q-icon name="local_parking" size="xs" color="primary" />
                  <q-chip
                    dense
                    :color="getChipColor(station.available_return_bikes)"
                    text-color="white"
                    class="q-ml-xs"
                  >
                    <div class="text">{{ station.available_return_bikes }}</div>
                  </q-chip>
                </div>
              </div>
            </template>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Metro Section -->
    <h3 class="text-h5 q-mb-md" style="font-weight: bold">
      <q-icon name="directions_subway" size="sm" class="q-mr-sm" />
      北捷車站
    </h3>

    <div class="q-mt-md">
      <transition-group name="station-list" tag="div">
        <div
          v-for="station in metroStations"
          :key="station"
          class="station-wrapper"
        >
          <div class="station-section q-mb-xl q-pa-md rounded-borders">
            <q-btn
              class="absolute-top-right menu-btn"
              color="primary"
              flat
              round
            >
              <q-icon name="more_vert" />
              <q-menu>
                <q-list style="min-width: 100px">
                  <q-item
                    clickable
                    v-close-popup
                    @click="deleteMetroStation(station)"
                  >
                    <q-item-section>刪除此站</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
            <h4 class="text-h6 text-weight-bold q-mb-md q-mt-xs station-header">
              {{ station }}
              <span
                v-for="line in getLineOfStation(station)"
                :key="line"
                class="station-line-icon"
              >
                <img :src="getLineIcon(line)" :alt="line" class="line-icon" />
              </span>
            </h4>
            <div v-if="metroInitialLoading" class="text-center">
              <q-spinner color="primary" size="3em" />
            </div>
            <div v-else-if="metroError[station]" class="text-negative">
              {{ metroError[station] }}
            </div>
            <div v-else>
              <q-list bordered separator>
                <q-item
                  v-for="train in getFilteredTrackInfo(station)"
                  :key="train.TrainNumber"
                >
                  <q-item-section>
                    <q-item-label class="text-h6 text-weight-bold">
                      <div>
                        <q-icon
                          name="arrow_forward"
                          color="primary"
                          size="1em"
                        />
                        <span
                          :style="{
                            color: getLineColor(
                              train.DestinationName,
                              station,
                              train.TrainNumber
                            ),
                          }"
                        >
                          {{ train.DestinationName.slice(0, -1) }}
                        </span>
                      </div>
                      <span
                        v-if="train.TrainNumber"
                        class="crowdedness-indicators q-ml-sm"
                      >
                        <q-badge
                          v-for="(level, index) in getTrainCrowdedness(
                            train.TrainNumber
                          )"
                          :key="index"
                          :color="getCrowdednessColor(level)"
                          :class="{ 'first-car': index === 0 }"
                          class="q-mr-xs"
                        >
                          &ensp;
                        </q-badge>
                      </span>
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-item-label
                      class="text-h6 text-weight-medium text-primary countdown-display"
                      :class="{
                        'non-operational': train.CountDown === '營運時間已過',
                      }"
                    >
                      <span v-if="train.CountDown === '列車進站'">{{
                        train.CountDown
                      }}</span>
                      <span
                        v-else-if="train.CountDown === '營運時間已過'"
                        class="non-operational-text"
                      >
                        {{ train.CountDown }}
                      </span>
                      <span v-else-if="isValidCountDown(train.CountDown)">
                        {{ formatCountDown(train.CountDown).minutes }}
                        <span class="small-unit">分</span>
                        {{ formatCountDown(train.CountDown).seconds }}
                        <span class="small-unit">秒</span>
                      </span>
                      <span v-else>資料擷取中</span>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </div>
        <div :key="'legend'" class="text-caption q-mt-md">
          <div class="text-caption q-mt-md">
            擁擠程度:
            <q-badge color="light-green" class="q-mr-xs">&ensp;</q-badge> 低
            <q-badge color="amber-5" class="q-mr-xs q-ml-sm">&ensp;</q-badge> 中
            <q-badge color="orange-6" class="q-mr-xs q-ml-sm">&ensp;</q-badge>
            高
            <q-badge color="deep-orange-10" class="q-mr-xs q-ml-sm"
              >&ensp;</q-badge
            >
            極高
          </div>
        </div>
      </transition-group>
    </div>

    <div class="add-button-container">
      <button class="add-button" @click="toggleMenu">+</button>
      <div v-if="showMenu" class="add-menu">
        <button class="menu-item" @click="openAddYoubikeStationDialog">
          <q-icon name="directions_bike" />&ensp;YouBike
        </button>
        <button class="menu-item" @click="openAddMetroStationDialog">
          <q-icon name="directions_subway" />&ensp;北捷
        </button>
      </div>
    </div>
    <!--對話框(新增站點)-->
    <q-dialog v-model="showAddYoubikeStationDialog" full-width>
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
          <div class="separator-or">或</div>
          <div class="row justify-center q-mt-md">
            <q-btn
              icon="search"
              color="primary"
              label="尋找最近的九個站點"
              @click="findNearestStationsFromDialog"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="取消"
            @click="showAddYoubikeStationDialog = false"
          />
          <q-btn flat label="確認" @click="addYoubikeStation" />
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
            label="輸入新暱稱 (至多顯示七個字)"
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
    <q-dialog v-model="showNearestStationsDialog" full-width>
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
            <l-circle
              :lat-lng="userPosition"
              :radius="circleRadius"
              color="red"
              dashArray="10, 10"
              :opacity="0.45"
              :fill="true"
              fillColor="red"
              :fillOpacity="0.05"
            ></l-circle>
            <l-marker :lat-lng="userPosition" :icon="userIcon">
              <l-popup>您的位置</l-popup>
            </l-marker>
            <l-marker
              v-for="station in nearestStations"
              :key="station.sna"
              :lat-lng="[parseFloat(station.lat), parseFloat(station.lng)]"
              :icon="youbikeIcon"
            >
              <l-popup>
                <div class="text-bold">
                  {{ station.sna.substr(11) }}
                </div>
                <div
                  v-if="
                    districtOptionsTPC.some(
                      (option) => option.label === station.sarea
                    )
                  "
                >
                  可借車輛: {{ station.available_rent_bikes }}
                </div>
                <div v-else>可借車輛: {{ station.sbi }}</div>

                <div
                  v-if="
                    districtOptionsTPC.some(
                      (option) => option.label === station.sarea
                    )
                  "
                >
                  可還車輛: {{ station.available_return_bikes }}
                </div>
                <div v-else>可還車輛: {{ station.bemp }}</div>
              </l-popup>
            </l-marker>
          </l-map>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="關閉" @click="showNearestStationsDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showLocationPickerDialog" full-width>
      <q-card style="width: 300px">
        <q-card-section>
          <div class="text-h6">選擇您的位置</div>
        </q-card-section>
        <q-card-section>
          <l-map
            style="height: 300px; width: 100%"
            :zoom="13"
            :center="mapCenter"
            @click="handleLocationSelected"
          >
            <l-tile-layer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            ></l-tile-layer>
          </l-map>
          <div v-if="isLoadingNearestStations" class="text-center q-mt-md">
            <q-spinner color="primary" size="3em" />
            <div class="text-subtitle1 q-mt-sm">正在搜尋站點...</div>
          </div>
        </q-card-section>
        <q-card-section>
          <div v-if="!isLoadingNearestStations" class="text-center">
            點擊地圖上的位置來選擇您的位置
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showAddMetroStation">
      <q-card class="q-pa-md" style="min-width: 350px">
        <q-card-section>
          <div class="text-h5">新增車站</div>
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-md">
            <div>
              <div class="text-h6 q-mb-sm">選擇路線:</div>
              <div class="row q-gutter-xs">
                <q-btn
                  v-for="line in metroLines"
                  :key="line"
                  @click="selectedMetroLine = line"
                  class="line-button"
                  :class="{ selected: selectedMetroLine === line }"
                  flat
                  round
                >
                  <q-avatar size="40px" class="line-icon">
                    <img :src="getLineIcon(line)" :alt="line" />
                  </q-avatar>
                </q-btn>
              </div>
            </div>
            <q-select
              v-if="selectedMetroLine"
              filled
              v-model="selectedMetroStation"
              :options="stationsForSelectedMetroLine"
              label="選擇車站"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn
            flat
            label="新增"
            color="primary"
            @click="addMetroStation"
            :disabled="!selectedMetroStation"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted } from "vue";
import axios from "axios";
import { formatDistanceToNow, parseISO, parse } from "date-fns";
import { zhTW } from "date-fns/locale";
import store from "../store/index";
import { useStore } from "vuex";
import { metroLineColors, stationLines } from "../data/metroData";
import { useQuasar } from "quasar";

import {
  LMap,
  LTileLayer,
  LMarker,
  LPopup,
  LCircle,
} from "@vue-leaflet/vue-leaflet";
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
    LCircle,
  },
  setup() {
    const $q = useQuasar();
    const store = useStore();
    const showMenu = ref(false);

    //YouBike data
    const StationList = computed(() => store.getters.getStationList);
    const stations = ref({});
    const stationsNickname = ref({});
    const isInitialLoad = ref(true);
    const isLoading = ref(true);
    const tpcLoading = ref({});
    const ntcLoading = ref({});
    const showAddYoubikeStationDialog = ref(false);
    const showEditNicknameDialog = ref(false);
    const showDeleteStationDialog = ref(false);
    const selectedStationForEdit = ref(null);
    const newNickname = ref("");
    const selectedStationForDelete = ref(null);
    const selectedCity = ref(null);
    const selectedDistrict = ref(null);
    const selectedStation = ref(null);
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
      { label: "板橋區", value: "板橋區" },
      { label: "三重區", value: "三重區" },
      { label: "中和區", value: "中和區" },
      { label: "永和區", value: "永和區" },
      { label: "蘆洲區", value: "蘆洲區" },
      { label: "新莊區", value: "新莊區" },
      { label: "新店區", value: "新店區" },
      { label: "土城區", value: "土城區" },
      { label: "樹林區", value: "樹林區" },
      { label: "五股區", value: "五股區" },
      { label: "泰山區", value: "泰山區" },
      { label: "汐止區", value: "汐止區" },
      { label: "深坑區", value: "深坑區" },
      { label: "石碇區", value: "石碇區" },
      { label: "三峽區", value: "三峽區" },
      { label: "淡水區", value: "淡水區" },
      { label: "八里區", value: "八里區" },
      { label: "三芝區", value: "三芝區" },
      { label: "石門區", value: "石門區" },
      { label: "金山區", value: "金山區" },
      { label: "林口區", value: "林口區" },
      { label: "坪林區", value: "坪林區" },
      { label: "萬里區", value: "萬里區" },
      { label: "瑞芳區", value: "瑞芳區" },
      { label: "雙溪區", value: "雙溪區" },
      { label: "鶯歌區", value: "鶯歌區" },
    ];
    const stationOptions = ref([]);
    const showNearestStationsDialog = ref(false);
    const nearestStations = ref(null);
    const userPosition = ref(null);
    const isLoadingNearestStations = ref(false);
    const mapCenter = ref([25.031204, 121.515966]);
    const mapZoom = ref(15);
    const mapOptions = {
      zoomControl: false,
    };
    const youbikeIcon = new Icon({
      iconUrl: "../../food/marker-icon-open.png",
      iconSize: [25, 41],
      iconAnchor: [12, 30],
    });
    const userIcon = new Icon({
      iconUrl: "../../food/marker-icon-closed.png",
      iconSize: [25, 41],
      iconAnchor: [12, 30],
    });
    const circleRadius = ref(0);
    const showLocationPickerDialog = ref(false);

    // Metro data
    const metroStations = computed(() => store.getters.getMetroStationList);
    const trackInfo = ref(null);
    const metroLoading = ref({});
    const metroInitialLoading = ref(true);

    const metroError = ref({});
    const carWeightData = ref(null);
    const showAddMetroStation = ref(false);
    const metroLines = ["BR", "R", "G", "O", "BL", "Y"];
    const selectedMetroLine = ref(null);
    const selectedMetroStation = ref(null);

    // Computed properties
    const districtOptions = computed(() => {
      if (selectedCity.value) {
        return selectedCity.value.value === "臺北市"
          ? districtOptionsTPC
          : districtOptionsNTC;
      }
      return [];
    });

    const stationsForSelectedMetroLine = computed(() => {
      if (!selectedMetroLine.value) return [];
      return Object.keys(stationLines).filter(
        (station) =>
          stationLines[station].includes(selectedMetroLine.value) &&
          !metroStations.value.includes(station)
      );
    });

    //Mutual methods
    const toggleMenu = () => {
      showMenu.value = !showMenu.value;
    };

    const openAddYoubikeStationDialog = () => {
      showAddYoubikeStationDialog.value = true;
      showMenu.value = false;
    };

    const openAddMetroStationDialog = () => {
      showAddMetroStation.value = true;
      showMenu.value = false;
    };

    // Youbike methods
    const fetchYoubikeData = async () => {
      const stationList = StationList.value;

      if (!stationList) {
        console.error("StationList is undefined");
        isLoading.value = false;
        return;
      }

      // Initialize stations and loading states if needed
      if (Object.keys(stations.value).length === 0) {
        stations.value = Object.fromEntries(
          Object.keys(stationList).map((name) => [name, new Station(name)])
        );
        stationsNickname.value = Object.fromEntries(
          Object.entries(stationList).map(([key, value]) => [
            key,
            value.nickname,
          ])
        );

        // Initialize loading states for each station based on their city
        Object.entries(stationList).forEach(([name, data]) => {
          if (data.city === "臺北市") {
            tpcLoading.value[name] = true;
          } else if (data.city === "新北市") {
            ntcLoading.value[name] = true;
          }
        });
      }

      // Function to update station data
      const updateStationData = (stationKey, stationData, isTPCData = true) => {
        if (stationData) {
          stations.value[stationKey].available_rent_bikes = isTPCData
            ? stationData.available_rent_bikes
            : stationData.sbi;
          stations.value[stationKey].available_return_bikes = isTPCData
            ? stationData.available_return_bikes
            : stationData.bemp;
          stations.value[stationKey].infoTime = stationData.mday;
        }
      };

      try {
        // Fetch TPC data using corsproxy.io
        const tpcDataPromise = axios.get(
          `https://corsproxy.io/?${encodeURIComponent(
            "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json"
          )}`
        );

        // Fetch NTC data in parallel using corsproxy.io
        const ntcDataPromises = [
          axios.get(
            `https://corsproxy.io/?${encodeURIComponent(
              "https://data.ntpc.gov.tw/api/datasets/010e5b15-3823-4b20-b401-b1cf000550c5/json?size=1000"
            )}`
          ),
          axios.get(
            `https://corsproxy.io/?${encodeURIComponent(
              "https://data.ntpc.gov.tw/api/datasets/010e5b15-3823-4b20-b401-b1cf000550c5/json?page=1&size=1000"
            )}`
          ),
        ];

        // Handle TPC data
        const tpcResponse = await tpcDataPromise;
        const dataTPC = tpcResponse.data;

        // Update TPC stations
        for (const key in stations.value) {
          if (stationList[key].city === "臺北市") {
            const stationData = dataTPC.find(
              (station) => station.sna === stations.value[key].name
            );
            updateStationData(key, stationData, true);
            tpcLoading.value[key] = false;
          }
        }

        // Handle NTC data
        Promise.all(ntcDataPromises)
          .then(([response1, response2]) => {
            const dataNTC = [...response1.data, ...response2.data];

            // Update NTC stations
            for (const key in stations.value) {
              if (stationList[key].city === "新北市") {
                const stationData = dataNTC.find(
                  (station) => station.sna === stations.value[key].name
                );
                updateStationData(key, stationData, false);
                ntcLoading.value[key] = false;
              }
            }
          })
          .catch((error) => {
            console.error("Error fetching NTC data:", error);
            // Mark all NTC stations as not loading on error
            Object.keys(ntcLoading.value).forEach((key) => {
              ntcLoading.value[key] = false;
            });
          });
      } catch (error) {
        console.error("Error fetching TPC data:", error);
        // Mark all stations as not loading on error
        Object.keys(tpcLoading.value).forEach((key) => {
          tpcLoading.value[key] = false;
        });
        Object.keys(ntcLoading.value).forEach((key) => {
          ntcLoading.value[key] = false;
        });
      }
    };

    // Compute whether a station is loading based on its city
    const isStationLoading = (stationName) => {
      const stationData = StationList.value[stationName];
      if (!stationData) {
        return false; // Return false if station data is not yet in StationList
      }
      if (stationData.city === "臺北市") {
        return tpcLoading.value[stationName];
      } else if (stationData.city === "新北市") {
        return ntcLoading.value[stationName];
      }
      return false;
    };

    const addYoubikeStation = async () => {
      if (selectedStation.value) {
        const stationName = selectedStation.value["value"];
        const city = selectedCity.value["value"];

        // Initialize the station in local state
        stations.value[stationName] = new Station(stationName);

        // Initialize loading state based on city
        if (city === "臺北市") {
          tpcLoading.value[stationName] = true;
        } else if (city === "新北市") {
          ntcLoading.value[stationName] = true;
        }

        // Update store first to ensure StationList has the data
        await store.dispatch("addStation", {
          stationName: stationName,
          stationData: {
            nickname: selectedStation.value.label,
            city: city,
          },
        });

        // Then fetch the data
        showAddYoubikeStationDialog.value = false;

        try {
          if (city === "臺北市") {
            const response = await axios.get(
              `https://corsproxy.io/?${encodeURIComponent(
                "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json"
              )}`
            );
            const data = response.data;
            const stationData = data.find((s) => s.sna === stationName);

            if (stationData) {
              stations.value[stationName].available_rent_bikes =
                stationData.available_rent_bikes;
              stations.value[stationName].available_return_bikes =
                stationData.available_return_bikes;
              stations.value[stationName].infoTime = stationData.mday;
            }
            tpcLoading.value[stationName] = false;
          } else if (city === "新北市") {
            const [response1, response2] = await Promise.all([
              axios.get(
                `https://corsproxy.io/?${encodeURIComponent(
                  "https://data.ntpc.gov.tw/api/datasets/010e5b15-3823-4b20-b401-b1cf000550c5/json?size=1000"
                )}`
              ),
              axios.get(
                `https://corsproxy.io/?${encodeURIComponent(
                  "https://data.ntpc.gov.tw/api/datasets/010e5b15-3823-4b20-b401-b1cf000550c5/json?page=1&size=1000"
                )}`
              ),
            ]);

            const data = [...response1.data, ...response2.data];
            const stationData = data.find((s) => s.sna === stationName);

            if (stationData) {
              stations.value[stationName].available_rent_bikes =
                stationData.sbi;
              stations.value[stationName].available_return_bikes =
                stationData.bemp;
              stations.value[stationName].infoTime = stationData.mday;
            }
            ntcLoading.value[stationName] = false;
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          if (city === "臺北市") {
            tpcLoading.value[stationName] = false;
          } else if (city === "新北市") {
            ntcLoading.value[stationName] = false;
          }
        }

        // Reset the form
        selectedCity.value = null;
        selectedDistrict.value = null;
        selectedStation.value = null;
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
        if (selectedCity.value["value"] === "臺北市") {
          apiUrl = `https://corsproxy.io/?${encodeURIComponent(
            "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json"
          )}`;
        } else if (selectedCity.value["value"] === "新北市") {
          apiUrl = `https://corsproxy.io/?${encodeURIComponent(
            "https://data.ntpc.gov.tw/api/datasets/010e5b15-3823-4b20-b401-b1cf000550c5/json?size=1000"
          )}`;
        }
        try {
          let response = await axios.get(apiUrl);
          let data = response.data;

          //Because NTC API has two pages
          if (selectedCity.value["value"] === "新北市") {
            const response2 = await axios.get(
              `https://corsproxy.io/?${encodeURIComponent(
                "https://data.ntpc.gov.tw/api/datasets/010e5b15-3823-4b20-b401-b1cf000550c5/json?page=1&size=1000"
              )}`
            );
            data = [...data, ...response2.data];
          }

          // Filter stations by selected district
          const filteredStations = data.filter(
            (station) => station.sarea === selectedDistrict.value["value"]
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

    const updateNickname = () => {
      if (selectedStationForEdit.value && newNickname.value) {
        // Update local state
        stationsNickname.value = {
          ...stationsNickname.value,
          [selectedStationForEdit.value]: newNickname.value,
        };

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

    const deleteStation = (key) => {
      if (stations.value[key]) {
        const stationName = stations.value[key].name;

        // Remove from local component state
        delete stationsNickname.value[stationName];

        // Use Vue's reactivity system to trigger an update
        stations.value = { ...stations.value };
        delete stations.value[key];

        // Update store
        store.dispatch("deleteStation", stationName);
      } else {
        // If the station is not in the local state, it might be directly in the store
        store.dispatch("deleteStation", key);
      }
      showDeleteStationDialog.value = false;
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

    const findNearestStations = () => {
      showLocationPickerDialog.value = true;
    };

    const handleLocationSelected = async ({ latlng }) => {
      console.log("Click event latlng:", latlng);
      const userLat = latlng.lat;
      const userLng = latlng.lng;
      console.log("User position:", userLat, userLng);

      userPosition.value = [userLat, userLng];
      mapCenter.value = [userLat, userLng];

      isLoadingNearestStations.value = true;

      try {
        const allStations = await fetchAllStationsData();

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

        nearestStations.value = stationsWithDistances.slice(0, 9);

        circleRadius.value = nearestStations.value[8].distance * 1100;

        showLocationPickerDialog.value = false;
        showNearestStationsDialog.value = true;
      } catch (error) {
        console.error("Error finding nearest stations:", error);
        $q.notify({
          message: "無法取得附近站點，請稍後再試",
          color: "negative",
          position: "bottom",
        });
      } finally {
        isLoadingNearestStations.value = false;
      }
    };

    const fetchAllStationsData = async () => {
      try {
        const tpcResponse = await axios.get(
          `https://corsproxy.io/?${encodeURIComponent(
            "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json"
          )}`
        );

        const tpcData = tpcResponse.data.map((station) => ({
          ...station,
          lat: station.latitude,
          lng: station.longitude,
          city: "臺北市",
        }));

        const ntcResponse1 = await axios.get(
          `https://corsproxy.io/?${encodeURIComponent(
            "https://data.ntpc.gov.tw/api/datasets/010e5b15-3823-4b20-b401-b1cf000550c5/json?size=1000"
          )}`
        );

        const ntcResponse2 = await axios.get(
          `https://corsproxy.io/?${encodeURIComponent(
            "https://data.ntpc.gov.tw/api/datasets/010e5b15-3823-4b20-b401-b1cf000550c5/json?page=1&size=1000"
          )}`
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
      const R = 6371;
      const dLat = deg2rad(lat2 - lat1);
      const dLon = deg2rad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
          Math.cos(deg2rad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c;
      return d;
    };

    const deg2rad = (deg) => {
      return deg * (Math.PI / 180);
    };

    const addNearestStation = (station) => {
      const newStationName = station.sna;
      const newStationData = {
        nickname: station.sna.substr(11),
        city: station.city,
      };

      // Update local state
      stations.value = {
        ...stations.value,
        [newStationName]: new Station(newStationName),
      };

      // Update local stationsNickname
      stationsNickname.value = {
        ...stationsNickname.value,
        [newStationName]: newStationData.nickname,
      };

      // Update store
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

      fetchYoubikeData();
    };

    const isStationInList = (stationName) => {
      return Object.keys(stations.value).includes(stationName);
    };

    const findNearestStationsFromDialog = () => {
      showAddYoubikeStationDialog.value = false;
      findNearestStations();
    };

    //Metro Methods
    const getLineOfStation = (station) => {
      return stationLines[station] || [];
    };

    const getLineIcon = (line) => {
      const iconPlaceholders = {
        BR: "../../metro/BR.png",
        R: "../../metro/R.png",
        G: "../../metro/G.png",
        O: "../../metro/O.png",
        BL: "../../metro/BL.png",
        Y: "../../metro/Y.png",
      };
      return iconPlaceholders[line] || "";
    };

    const getFilteredTrackInfo = (station) => {
      if (!trackInfo.value) return [];

      try {
        const jsonPart = trackInfo.value.match(/\[.*\]/s);
        if (!jsonPart) return [];

        const parsedInfo = JSON.parse(jsonPart[0]);
        return parsedInfo.filter((info) => {
          const stationNameToMatch =
            station === "台北車站" ? station : station.concat("站");
          return info.StationName === stationNameToMatch;
        });
      } catch (error) {
        console.error("Error parsing trackInfo:", error);
        return [];
      }
    };

    const formatCountDown = (countDown) => {
      if (countDown === "列車進站" || countDown === "營運時間已過")
        return countDown;

      const [minutes, seconds] = countDown.split(":").map(Number);
      let totalSeconds = minutes * 60 + seconds;
      totalSeconds = Math.round(totalSeconds / 5) * 5;
      const roundedMinutes = Math.floor(totalSeconds / 60);
      const roundedSeconds = totalSeconds % 60;

      return {
        minutes: roundedMinutes,
        seconds: roundedSeconds.toString().padStart(2, "0"),
      };
    };

    const isValidCountDown = (countDown) => {
      return (
        countDown === "列車進站" ||
        countDown === "營運時間已過" ||
        /^\d+:\d+$/.test(countDown)
      );
    };

    const fetchTrackInfo = async () => {
      const apiUrl = "https://api.metro.taipei/metroapi/TrackInfo.asmx";
      const xmlData = `<?xml version="1.0" encoding="utf-8"?>
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
  <getTrackInfo xmlns="http://tempuri.org/">
  <userName>diegopeng0426@gmail.com</userName>
  <passWord>Hn2pJ2511N</passWord>
  </getTrackInfo>
  </soap:Body>
  </soap:Envelope>`;

      try {
        if (metroInitialLoading.value) {
          metroStations.value.forEach((station) => {
            metroLoading.value[station] = true;
            metroError.value[station] = null;
          });
        }

        const response = await axios.post(
          `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`,
          xmlData,
          {
            headers: {
              "Content-Type": "text/xml; charset=utf-8",
              SOAPAction: "http://tempuri.org/getTrackInfo",
            },
          }
        );
        trackInfo.value = response.data;
        if (metroInitialLoading.value) {
          metroStations.value.forEach((station) => {
            metroLoading.value[station] = false;
          });
          metroInitialLoading.value = false;
        }
        console.log("Data fetched");
        //console.log(trackInfo);
      } catch (error) {
        console.error("Error fetching track info:", error);
        if (metroInitialLoading.value) {
          metroStations.value.forEach((station) => {
            metroError.value[station] = "無法獲取資料，請稍後再試。";
            metroLoading.value[station] = false;
          });
          metroInitialLoading.value = false;
        }
      }
    };

    const getLineColor = (destinationName, currentStation, trainNumber) => {
      const destination = destinationName.slice(0, -1);
      const destLines = stationLines[destination] || [];
      const currentLines = stationLines[currentStation] || [];

      if (currentStation === "忠孝復興" && destination === "南港展覽館") {
        return trainNumber === ""
          ? metroLineColors["BR"]
          : metroLineColors["BL"];
      }

      const commonLines = destLines.filter((line) =>
        currentLines.includes(line)
      );

      if (commonLines.length > 0) {
        return metroLineColors[commonLines[0]];
      } else if (destLines.length > 0) {
        return metroLineColors[destLines[0]];
      }

      return "inherit";
    };

    let intervalId = null;

    const startFetchingData = () => {
      fetchTrackInfo();
      fetchCarWeight();
      fetchCarWeightBR();
      fetchYoubikeData();

      intervalId = setInterval(() => {
        fetchTrackInfo();
        fetchCarWeight();
        fetchCarWeightBR();
        fetchYoubikeData();
      }, 10000);
    };

    const stopFetchingData = () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };

    const fetchCarWeight = async () => {
      const apiUrl = "https://api.metro.taipei/metroapi/CarWeight.asmx";
      const xmlData = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xmlns:xsd="http://www.w3.org/2001/XMLSchema"
xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
<soap:Body>
<getCarWeightByInfoEx xmlns="http://tempuri.org/">
<userName>diegopeng0426@gmail.com</userName>
<passWord>Hn2pJ2511N</passWord>
</getCarWeightByInfoEx>
</soap:Body>
</soap:Envelope>`;

      try {
        const response = await axios.post(
          `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`,
          xmlData,
          {
            headers: {
              "Content-Type": "text/xml; charset=utf-8",
              SOAPAction: "http://tempuri.org/getCarWeightByInfoEx",
            },
          }
        );
        carWeightData.value = response.data;
        //console.log("Car Weight Data:", carWeightData.value);
      } catch (error) {
        console.error("Error fetching car weight data:", error);
      }
    };

    const getTrainCrowdedness = (trainNumber) => {
      if (!carWeightData.value) return [];

      try {
        const jsonPart = carWeightData.value.match(/\[.*\]/s);
        if (!jsonPart) return [];

        const parsedData = JSON.parse(jsonPart[0]);
        const trainData = parsedData.find(
          (train) => train.TrainNumber === trainNumber
        );

        if (!trainData) return [];

        return [
          trainData.Cart1L,
          trainData.Cart2L,
          trainData.Cart3L,
          trainData.Cart4L,
          trainData.Cart5L,
          trainData.Cart6L,
        ];
      } catch (error) {
        console.error("Error parsing carWeightData:", error);
        return [];
      }
    };

    const getCrowdednessColor = (level) => {
      const intLevel = parseInt(level);
      if (intLevel <= 1) return "light-green";
      if (intLevel === 2) return "amber-5";
      if (intLevel === 3) return "orange-6";
      return "deep-orange-10";
    };

    const fetchCarWeightBR = async () => {
      const apiUrl = "https://api.metro.taipei/metroapi/CarWeightBR.asmx";
      const xmlData = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xmlns:xsd="http://www.w3.org/2001/XMLSchema"
xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
<soap:Body>
<getCarWeightBRInfo xmlns="http://tempuri.org/">
<userName>diegopeng0426@gmail.com</userName>
<passWord>Hn2pJ2511N</passWord>
</getCarWeightBRInfo>
</soap:Body>
</soap:Envelope>`;

      try {
        const response = await axios.post(
          `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`,
          xmlData,
          {
            headers: {
              "Content-Type": "text/xml; charset=utf-8",
              SOAPAction: "http://tempuri.org/getCarWeightBRInfo",
            },
          }
        );
        //console.log("Wenhu Line Car Weight Data:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching Wenhu Line car weight data:", error);
      }
    };

    const addMetroStation = () => {
      if (selectedMetroStation.value) {
        store.dispatch("addMetroStation", selectedMetroStation.value);
        cancelAddMetroStation();
      }
    };

    const cancelAddMetroStation = () => {
      showAddMetroStation.value = false;
      selectedMetroLine.value = null;
      selectedMetroStation.value = null;
    };

    const deleteMetroStation = (stationName) => {
      store.dispatch("deleteMetroStation", stationName);
    };

    onMounted(() => {
      startFetchingData();
    });

    onUnmounted(() => {
      stopFetchingData();
    });

    return {
      // Youbike data
      stations,
      stationsNickname,
      isLoading,
      isInitialLoad,
      StationList,
      showAddYoubikeStationDialog,
      showEditNicknameDialog,
      showDeleteStationDialog,
      selectedStationForEdit,
      newNickname,
      selectedStationForDelete,
      selectedCity,
      selectedDistrict,
      selectedStation,
      cityOptions,
      districtOptionsTPC,
      districtOptionsNTC,
      stationOptions,
      showNearestStationsDialog,
      nearestStations,
      isLoadingNearestStations,
      userPosition,
      mapCenter,
      mapZoom,
      mapOptions,
      youbikeIcon,
      userIcon,
      circleRadius,
      showLocationPickerDialog,

      // Metro data
      metroStations,
      trackInfo,
      metroLoading,
      metroInitialLoading,
      metroError,
      carWeightData,
      showAddMetroStation,
      metroLines,
      selectedMetroLine,
      selectedMetroStation,

      // Computed properties
      districtOptions,
      stationsForSelectedMetroLine,

      // Youbike methods
      fetchYoubikeData,
      isStationLoading,
      addYoubikeStation,
      onCityChange,
      onDistrictChange,
      openEditNicknameDialog,
      updateNickname,
      openDeleteStationDialog,
      deleteStation,
      parseTimestamp,
      timeAgo,
      getChipColor,
      findNearestStations,
      handleLocationSelected,
      fetchAllStationsData,
      calculateDistance,
      deg2rad,
      addNearestStation,
      isStationInList,
      findNearestStationsFromDialog,

      // Metro methods
      formatCountDown,
      getLineColor,
      getLineOfStation,
      getLineIcon,
      getFilteredTrackInfo,
      getTrainCrowdedness,
      getCrowdednessColor,
      isValidCountDown,
      fetchCarWeightBR,
      addMetroStation,
      cancelAddMetroStation,
      deleteMetroStation,

      // Utility methods and libraries
      formatDistanceToNow,
      parseISO,
      parse,
      zhTW,
      showMenu,
      toggleMenu,
      openAddYoubikeStationDialog,
      openAddMetroStationDialog,

      // Constants
      stationLines,
    };
  },
});
</script>

<style scoped>
.header {
  font-weight: Bold;
  color: #03328d;
  font-size: 19px;
  margin-bottom: 2px;
}
.text {
  font-size: 15px;
  font-weight: bold;
}

.custom-card-margin {
  margin: 10px 10px;
  background-color: rgb(239, 246, 254);
}

.add-button-container {
  position: fixed;
  bottom: 100px;
  right: 20px;
  z-index: 2000;
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

.separator-or {
  display: flex;
  align-items: center;
  text-align: center;
  margin-top: 32px;
}
.separator-or::before,
.separator-or::after {
  content: "";
  flex: 1;
  border-bottom: 3px double #e0e0e0;
}
.separator-or::before {
  margin-right: 0.5em;
}
.separator-or::after {
  margin-left: 0.5em;
}

.search-btn {
  margin-top: 10px;
  margin-bottom: 20px;
  height: 36px;
}

.menu-btn {
  top: 10px;
  right: 6px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.station-card {
  height: 100%;
  background-color: #f8f8f8;
}

.find-nearest-btn {
  margin-top: 16px;
  margin-bottom: 16px;
}

/* Metro */
.countdown-display {
  display: inline-flex;
  align-items: center;
}
.small-unit {
  font-size: 0.8em;
  vertical-align: middle;
}
.non-operational {
  font-weight: normal;
}
.non-operational-text {
  font-style: italic;
  color: #999;
}
.station-line-icon {
  display: inline-block;
  margin-left: 5px;
}
.line-icon {
  width: 28px;
  height: 28px;
  vertical-align: middle;
  margin-bottom: 5px;
}
.station-section {
  position: relative;
  margin-bottom: 1rem;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
  background-color: #f8f8f8;
}
.station-header {
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
}
.crowdedness-indicators {
  display: inline-flex;
  align-items: center;
}
.line-button {
  padding: 0;
  transition: all 0.3s ease;
}

.line-button.selected {
  background-color: rgba(0, 0, 0, 0.1);
  border: 2px solid #1976d2;
  transform: scale(1.1);
}

.menu-btn {
  position: absolute;
  top: 20px;
  right: 12px;
}
.station-list-enter-active,
.station-list-leave-active {
  transition: all 0.4s cubic-bezier(0.55, 0, 0.1, 1);
}

.station-list-enter-from {
  opacity: 0;
  transform: translate(30px, 0);
}

.station-list-leave-to {
  opacity: 0;
  transform: translate(30px, 0);
}

.station-list-move {
  transition: transform 0.4s;
}

.first-car {
  clip-path: polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%);
}

.add-menu {
  position: absolute;
  bottom: 70px;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 110px;
  z-index: 10;
}

.add-menu .menu-item {
  display: block;
  width: 100%;
  padding: 12px 10px;
  font-size: 17px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  text-align: center;
  white-space: nowrap;
}
</style>
