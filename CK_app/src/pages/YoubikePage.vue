<template>
  <q-page class="flex justify-center">
    <div class="justify-center">
      <q-card
        inline
        class="custom-card-margin"
        style="height: 125px; width: 350px"
        v-for="(station, key) in stations"
        :key="key"
      >
        <q-card-section>
          <!--站點名稱-->
          <div class="header" v-if="station.name in stationsNickname">
            {{ stationsNickname[station.name] }}
            <!--按鈕(修改暱稱)-->
            <q-btn
              size="10px"
              padding="xs"
              round
              color="deep-orange-3"
              icon="edit"
              @click="openEditNicknameDialog(station.name)"
            />
            <!--<q-btn size="10px" padding="xs" round color="blue-7" icon="info" />-->
          </div>
          <div class="header" v-else>
            {{ station.name.substr(11) }}
          </div>
          <!--資訊-->
          <div v-if="station.available_rent_bikes !== null">
            可借車輛: {{ station.available_rent_bikes }}
          </div>
          <div v-else>Loading...</div>
          <div v-if="station.available_return_bikes !== null">
            可還車輛: {{ station.available_return_bikes }}
          </div>
          <div v-else>Loading...</div>
          <div v-if="station.infoTime !== null">
            更新時間: {{ station.infoTime }}
          </div>
          <div v-else>Loading...</div>
        </q-card-section>
      </q-card>
    </div>

    <!--按鈕(新增站點)-->
    <q-page-sticky position="bottom-right" :offset="[16, 16]">
      <q-btn round color="red-5" icon="add" fab @click="showDialog = true" />
    </q-page-sticky>
    <!--對話框(新增站點)-->
    <q-dialog v-model="showDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">選擇新增之站點</div>
        </q-card-section>
        <q-card-section>
          <q-select
            v-model="selectedDistrict"
            :options="districtOptions"
            label="選擇行政區"
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
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import axios from "axios";

class Station {
  constructor(name) {
    this.name = name;
    this.available_rent_bikes = null;
    this.available_return_bikes = null;
    this.infoTime = null;
  }
}

export default defineComponent({
  data() {
    return {
      stations: {
        quan: new Station("YouBike2.0_泉州寧波西街口"),
        you: new Station("YouBike2.0_郵政博物館"),
        tai: new Station("YouBike2.0_植物園"),
        zhong: new Station("YouBike2.0_捷運中正紀念堂站(2號出口)"),
      },
      stationsNickname: {
        "YouBike2.0_泉州寧波西街口": "泉州寧波西街口(建中側門)",
        "YouBike2.0_郵政博物館": "郵政博物館",
        "YouBike2.0_植物園": "台北植物園",
        "YouBike2.0_捷運中正紀念堂站(2號出口)": "中正紀念堂站(2號出口)",
      },
      showDialog: false,
      showEditNicknameDialog: false,
      selectedStationForEdit: null,
      newNickname: "",
      selectedDistrict: null,
      selectedStation: null,
      districtOptions: [
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
      ],
      stationOptions: [],
    };
  },
  methods: {
    async fetchData() {
      try {
        const response = await axios.get(
          "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json"
        );
        const data = response.data;
        //將YouBike Json檔裡的Object抓到四個預設Station
        for (const key in this.stations) {
          const stationData = data.find(
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
    async addStation() {
      if (this.selectedStation) {
        const station = new Station(this.selectedStation["value"]);
        this.stations[this.selectedStation["value"]] = station;

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
            station.available_return_bikes = stationData.available_return_bikes;
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

        this.showDialog = false;
        this.selectedDistrict = null;
        this.selectedStation = null;
      }
    },
    async onDistrictChange() {
      if (this.selectedDistrict) {
        try {
          const response = await axios.get(
            "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json"
          );
          const data = response.data;

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
        this.stationsNickname = {
          ...this.stationsNickname,
          [this.selectedStationForEdit]: this.newNickname,
        };
      }
      this.showEditNicknameDialog = false;
    },
  },
  mounted() {
    this.fetchData();
  },
});
</script>

<style>
.header {
  font-weight: bold;
  color: orangered;
  font-size: 18px;
}
.q-page {
  padding-top: 16px; /* Adjust top padding for small margin from the top */
}
.custom-card-margin {
  margin: 10px 16px; /* Adjust top/bottom and left/right margins */
}
</style>
