<template>
  <q-page class="flex justify-center">
    <div class="justify-center">
      <q-card
        inline
        class="secondary-light custom-card-margin"
        style="height: 125px; width: 350px"
        v-for="(station, key) in stations"
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
          <!--資訊-->
          <div class="text" v-if="station.available_rent_bikes !== null">
            可借車輛:
            <span :class="{ 'red-text': station.available_rent_bikes <= 3 }">{{
              station.available_rent_bikes
            }}</span>
          </div>
          <div v-else>Loading...</div>
          <div class="text" v-if="station.available_return_bikes !== null">
            可停車位:
            <span
              :class="{ 'red-text': station.available_return_bikes <= 3 }"
              >{{ station.available_return_bikes }}</span
            >
          </div>
          <div v-else>Loading...</div>
          <div class="text" v-if="station.infoTime !== null">
            更新時間: {{ timeAgo(station.infoTime) }}
          </div>
          <div v-else>Loading...</div>
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
        <!--狀態圓形-->
        <q-btn
          class="absolute-bottom-right circle"
          size="10px"
          round
          unelevated
          :color="getStatusColor(station)"
        ></q-btn>
      </q-card>
    </div>

    <!--按鈕(新增站點)-->
    <q-page-sticky position="bottom-right" :offset="[16, 16]">
      <q-btn
        round
        color="negative"
        icon="add"
        size="md"
        @click="showAddStationDialog = true"
      />
    </q-page-sticky>
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
  </q-page>
</template>

<script>
import { defineComponent, computed } from "vue";
import axios from "axios";
import { formatDistanceToNow, parseISO, parse } from "date-fns";
import { zhTW } from "date-fns/locale";
import store from "../store/store";

class Station {
  constructor(name) {
    this.name = name;
    this.available_rent_bikes = null;
    this.available_return_bikes = null;
    this.infoTime = null;
  }
}

export default defineComponent({
  setup() {
    const StationList = computed(() => store.getters.getStationList);
    return { StationList };
  },
  data() {
    return {
      stations: {},
      stationsNickname: {},
      showAddStationDialog: false,
      showEditNicknameDialog: false,
      showDeleteStationDialog: false,
      selectedStationForEdit: null,
      newNickname: "",
      selectedStationForDelete: null,
      selectedCity: null,
      selectedDistrict: null,
      selectedStation: null,
      cityOptions: [
        { label: "臺北市", value: "臺北市" },
        { label: "新北市", value: "新北市" },
      ],
      districtOptionsTPC: [
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
      ],
      districtOptionsNTC: [
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
      ],
      stationOptions: [],
    };
  },
  //根據選擇的城市設定行政區的選項
  computed: {
    districtOptions() {
      if (this.selectedCity) {
        if (this.selectedCity["value"] === "臺北市") {
          return this.districtOptionsTPC;
        } else if (this.selectedCity["value"] === "新北市") {
          return this.districtOptionsNTC;
        }
      }
      return [];
    },
    statusColor() {
      return "green";
    },
  },
  methods: {
    async fetchData() {
      console.log(JSON.parse(localStorage.getItem("store")));
      const stationList = this.StationList;
      this.stations = Object.fromEntries(
        Object.keys(stationList).map((name) => [name, new Station(name)])
      );
      this.stationsNickname = Object.fromEntries(
        Object.entries(stationList).map(([key, value]) => [key, value.nickname])
      );
      try {
        //Fetch data from TPC API
        const responseTPC = await axios.get(
          "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json"
        );
        const dataTPC = responseTPC.data;
        //Fetch data from NTC API
        var responseNTC;
        var dataNTC;
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
        for (const key in this.stations) {
          if (stationList[key].city == "臺北市") {
            const stationData = dataTPC.find(
              (station) => station.sna === this.stations[key].name
            );

            if (stationData) {
              this.stations[key].available_rent_bikes =
                stationData.available_rent_bikes;
              this.stations[key].available_return_bikes =
                stationData.available_return_bikes;
              this.stations[key].infoTime = stationData.mday;
            } else {
              this.stations[key].available_rent_bikes = "Station not found";
              this.stations[key].available_return_bikes = "Station not found";
              this.stations[key].infoTime = "Station not found";
            }
          } else if (stationList[key].city == "新北市") {
            const stationData = dataNTC.find(
              (station) => station.sna === this.stations[key].name
            );

            if (stationData) {
              this.stations[key].available_rent_bikes = stationData.sbi;
              this.stations[key].available_return_bikes = stationData.bemp;
              this.stations[key].infoTime = stationData.mday;
            } else {
              this.stations[key].available_rent_bikes = "Station not found";
              this.stations[key].available_return_bikes = "Station not found";
              this.stations[key].infoTime = "Station not found";
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        for (const key in this.stations) {
          this.stations[key].available_rent_bikes = "Error fetching data";
          this.stations[key].available_return_bikes = "Error fetching data";
          this.stations[key].infoTime = "Error fetching data";
        }
      }
    },
    getStatusColor(station) {
      if (
        station.available_rent_bikes > 0 &&
        station.available_return_bikes > 0
      ) {
        return "light-green-14";
      } else if (station.available_rent_bikes == 0) {
        return "amber-8";
      } else if (station.available_return_bikes == 0) {
        return "red-10";
      }
      return "grey";
    },
    async addStation() {
      if (this.selectedStation) {
        const station = new Station(this.selectedStation["value"]);
        this.stations[this.selectedStation["value"]] = station;
        //臺北市&新北市使用不同API
        if (this.selectedCity["value"] === "臺北市") {
          try {
            const response = await axios.get(
              "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json"
            );
            const data = response.data;

            const stationData = data.find(
              (s) => s.sna === this.selectedStation["value"]
            );

            if (stationData) {
              station.available_rent_bikes = stationData.available_rent_bikes;
              station.available_return_bikes =
                stationData.available_return_bikes;
              station.infoTime = stationData.mday;
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
        } else if (this.selectedCity["value"] === "新北市") {
          try {
            let response;
            let data;
            response = await axios.get(
              "https://data.ntpc.gov.tw/api/datasets/010e5b15-3823-4b20-b401-b1cf000550c5/json?size=1000"
            );
            data = response.data;
            //fetch the data of the second page of the NTC API
            response = await axios.get(
              "https://data.ntpc.gov.tw/api/datasets/010e5b15-3823-4b20-b401-b1cf000550c5/json?page=1&size=1000"
            );
            data = [...data, ...response.data]; //Merging the two arrays of objects together

            const stationData = data.find(
              (s) => s.sna === this.selectedStation["value"]
            );

            if (stationData) {
              station.available_rent_bikes = stationData.sbi;
              station.available_return_bikes = stationData.bemp;
              station.infoTime = stationData.mday;
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
        } else {
          console.error("Unknown city selected");
          return;
        }

        // Update store
        store.dispatch("addStation", {
          stationName: this.selectedStation["value"],
          stationData: {
            nickname: this.selectedStation.label,
            city: this.selectedCity.value,
          },
        });

        this.showAddStationDialog = false;
        this.selectedCity = null;
        this.selectedDistrict = null;
        this.selectedStation = null;
      }
    },
    //選完行政區後抓站點選項
    async onDistrictChange() {
      if (this.selectedDistrict) {
        let apiUrl;
        if (this.selectedCity["value"] === "臺北市") {
          apiUrl =
            "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json";
        } else if (this.selectedCity["value"] === "新北市") {
          apiUrl =
            "https://data.ntpc.gov.tw/api/datasets/010e5b15-3823-4b20-b401-b1cf000550c5/json?size=1000";
        }
        try {
          let response;
          let data;
          response = await axios.get(apiUrl);
          data = response.data;

          //Because NTC API has two pages
          if (this.selectedCity["value"] === "新北市") {
            const response = await axios.get(
              "https://data.ntpc.gov.tw/api/datasets/010e5b15-3823-4b20-b401-b1cf000550c5/json?page=1&size=1000"
            );
            data = [...data, ...response.data];
          }

          // Filter stations by selected district
          const filteredStations = data.filter(
            (station) => station.sarea === this.selectedDistrict["value"]
          );

          // Map the filtered stations to station options
          this.stationOptions = filteredStations.map((station) => ({
            label: station.sna.substr(11),
            value: station.sna,
          }));
        } catch (error) {
          console.error("Error fetching data:", error);
          this.stationOptions = [];
        }
      } else {
        this.stationOptions = [];
      }
    },
    openEditNicknameDialog(stationName) {
      this.selectedStationForEdit = stationName;
      this.newNickname = this.stationsNickname[stationName] || "";
      this.showEditNicknameDialog = true;
    },
    updateNickname() {
      if (this.selectedStationForEdit && this.newNickname) {
        // Update local state
        this.stationsNickname = {
          ...this.stationsNickname,
          [this.selectedStationForEdit]: this.newNickname,
        };

        // Update store
        store.dispatch("updateStationNickname", {
          stationName: this.selectedStationForEdit,
          newNickname: this.newNickname,
        });
      }
      this.showEditNicknameDialog = false;
    },
    openDeleteStationDialog(stationName) {
      this.selectedStationForDelete = stationName;
      this.showDeleteStationDialog = true;
    },
    deleteStation(key) {
      if (this.stations[key]) {
        const stationName = this.stations[key].name;

        // Remove from local component state
        delete this.stationsNickname[stationName];
        delete this.stations[key];

        // Update store
        store.dispatch("deleteStation", stationName);
      } else {
        // If the station is not in the local state, it might be directly in the store
        store.dispatch("deleteStation", key);
      }
      this.showDeleteStationDialog = false;
    },
    parseTimestamp(timestamp) {
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
    },
    timeAgo(time) {
      const parsedTime = this.parseTimestamp(time);
      return formatDistanceToNow(parsedTime, { locale: zhTW }) + "前";
    },
  },
  mounted() {
    // store.dispatch("clearALL");
    this.fetchData();
  },
});
</script>

<style>
.header {
  font-weight: Bold;
  color: #a58d36;
  font-size: 20px;
}
.text {
  font-size: 16px;
}
.red-text {
  font-weight: Bold;
  color: #c10015;
}
.q-page {
  padding-top: 16px; /* Adjust top padding for small margin from the top */
}
.custom-card-margin {
  margin: 10px 16px; /* Adjust top/bottom and left/right margins */
}
.delete-btn {
  margin-bottom: 8px;
  margin-right: 8px;
}
.menu-btn {
  margin-top: 10px;
  margin-right: 6px;
}
.circle {
  margin-bottom: 10px;
  margin-right: 12px;
}
</style>
