<template>
  <q-page>
    <q-card>
      <q-card-section>
        <div class="text-h6">YouBike 即時</div>
      </q-card-section>
      <!--
      泉州寧波西街口:   quan
      郵政博物館:       you
      台北植物園:       tai
      中正紀念堂站(2號):zhong
      -->

      <q-card-section>
        <div class="header">泉州寧波西街口</div>
        <div v-if="available_rent_bikes_quan !== null">
          可借車輛: {{ available_rent_bikes_quan }}
        </div>
        <div v-else>Loading...</div>
        <div v-if="available_return_bikes_quan !== null">
          可還車輛: {{ available_return_bikes_quan }}
        </div>
        <div v-else>Loading...</div>
        <div v-if="infoTime_quan !== null">更新時間: {{ infoTime_quan }}</div>
        <div v-else>Loading...</div>
      </q-card-section>

      <q-card-section>
        <div class="header">郵政博物館</div>
        <div v-if="available_rent_bikes_you !== null">
          可借車輛: {{ available_rent_bikes_you }}
        </div>
        <div v-else>Loading...</div>
        <div v-if="available_return_bikes_you !== null">
          可還車輛: {{ available_return_bikes_you }}
        </div>
        <div v-else>Loading...</div>
        <div v-if="infoTime_you !== null">更新時間: {{ infoTime_you }}</div>
        <div v-else>Loading...</div>
      </q-card-section>

      <q-card-section>
        <div class="header">台北植物園</div>
        <div v-if="available_rent_bikes_tai !== null">
          可借車輛: {{ available_rent_bikes_tai }}
        </div>
        <div v-else>Loading...</div>
        <div v-if="available_return_bikes_tai !== null">
          可還車輛: {{ available_return_bikes_tai }}
        </div>
        <div v-else>Loading...</div>
        <div v-if="infoTime_you !== null">更新時間: {{ infoTime_tai }}</div>
        <div v-else>Loading...</div>
      </q-card-section>

      <q-card-section>
        <div class="header">捷運中正紀念堂(2號出口)</div>
        <div v-if="available_rent_bikes_zhong !== null">
          可借車輛: {{ available_rent_bikes_zhong }}
        </div>
        <div v-else>Loading...</div>
        <div v-if="available_return_bikes_zhong !== null">
          可還車輛: {{ available_return_bikes_zhong }}
        </div>
        <div v-else>Loading...</div>
        <div v-if="infoTime_you !== null">更新時間: {{ infoTime_zhong }}</div>
        <div v-else>Loading...</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import axios from "axios";

export default defineComponent({
  data() {
    return {
      available_rent_bikes_quan: null,
      available_return_bikes_quan: null,
      infoTime_quan: null,
      available_rent_bikes_you: null,
      available_return_bikes_you: null,
      infoTime_you: null,
      available_rent_bikes_tai: null,
      available_return_bikes_tai: null,
      infoTime_tai: null,
      available_rent_bikes_zhong: null,
      available_return_bikes_zhong: null,
      infoTime_zhong: null,
    };
  },
  methods: {
    async fetchData() {
      try {
        const response = await axios.get(
          "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json"
        );
        const data = response.data;

        const station_quan = data.find(
          (station) => station.sna === "YouBike2.0_泉州寧波西街口"
        );
        const station_you = data.find(
          (station) => station.sna === "YouBike2.0_郵政博物館"
        );
        const station_tai = data.find(
          (station) => station.sna === "YouBike2.0_植物園"
        );
        const station_zhong = data.find(
          (station) => station.sna === "YouBike2.0_捷運中正紀念堂站(2號出口)"
        );

        if (station_quan) {
          this.available_rent_bikes_quan = station_quan.available_rent_bikes;
          this.available_return_bikes_quan =
            station_quan.available_return_bikes;
          this.infoTime_quan = station_quan.mday;
        } else {
          this.available_rent_bikes_quan = "Station not found";
          this.available_return_bikes_quan = "Station not found";
          this.infoTime_quan = "Station not found";
        }

        if (station_you) {
          this.available_rent_bikes_you = station_you.available_rent_bikes;
          this.available_return_bikes_you = station_you.available_return_bikes;
          this.infoTime_you = station_you.mday;
        } else {
          this.available_rent_bikes_you = "Station not found";
          this.available_return_bikes_you = "Station not found";
          this.infoTime_you = "Station not found";
        }

        if (station_tai) {
          this.available_rent_bikes_tai = station_tai.available_rent_bikes;
          this.available_return_bikes_tai = station_tai.available_return_bikes;
          this.infoTime_tai = station_tai.mday;
        } else {
          this.available_rent_bikes_tai = "Station not found";
          this.available_return_bikes_tai = "Station not found";
          this.infoTime_tai = "Station not found";
        }

        if (station_zhong) {
          this.available_rent_bikes_zhong = station_zhong.available_rent_bikes;
          this.available_return_bikes_zhong =
            station_zhong.available_return_bikes;
          this.infoTime_zhong = station_zhong.mday;
        } else {
          this.available_rent_bikes_zhong = "Station not found";
          this.available_return_bikes_zhong = "Station not found";
          this.infoTime_zhong = "Station not found";
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        this.available_rent_bikes_quan = "Error fetching data";
        this.available_return_bikes_quan = "Error fetching data";
        this.infoTime_quan = "Error fetching data";
        this.available_rent_bikes_you = "Error fetching data";
        this.available_return_bikes_you = "Error fetching data";
        this.infoTime_you = "Error fetching data";
        this.available_rent_bikes_tai = "Error fetching data";
        this.available_return_bikes_tai = "Error fetching data";
        this.infoTime_tai = "Error fetching data";
        this.available_rent_bikes_zhong = "Error fetching data";
        this.available_return_bikes_zhong = "Error fetching data";
        this.infoTime_zhong = "Error fetching data";
      }
    },
  },
  mounted() {
    this.fetchData();
  },
});
</script>

<style>
.header {
  font-weight: bold; /* Makes the text bold */
  color: orangered; /* Changes the text color to blue */
  font-size: 18px; /* Changes the font size to 20px */
}
</style>
