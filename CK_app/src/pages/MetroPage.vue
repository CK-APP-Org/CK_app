<template>
  <q-page class="q-pa-md">
    <div
      v-for="station in stations"
      :key="station"
      class="station-section q-mb-xl"
    >
      <h4 class="text-h4 text-center q-mb-md">
        {{ station }}
        <span
          v-for="line in getLineOfStation(station)"
          :key="line"
          class="station-line-icon"
        >
          <img :src="getLineIcon(line)" :alt="line" class="line-icon" />
        </span>
      </h4>
      <div v-if="initialLoading" class="text-center">
        <q-spinner color="primary" size="3em" />
        <p>載入中...</p>
      </div>
      <div v-else-if="error[station]" class="text-negative">
        {{ error[station] }}
      </div>
      <div v-else>
        <q-list bordered separator>
          <q-item
            v-for="train in getFilteredTrackInfo(station)"
            :key="train.TrainNumber"
          >
            <q-item-section>
              <q-item-label class="text-h6 text-weight-bold">
                <q-icon name="arrow_forward" color="primary" size="1em" />
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
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label
                class="text-h6 text-weight-bold text-primary countdown-display"
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
                <span v-else>
                  {{ formatCountDown(train.CountDown).minutes
                  }}<span class="small-unit">分</span>
                  {{ formatCountDown(train.CountDown).seconds
                  }}<span class="small-unit">秒</span>
                </span>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="train" color="primary" size="2em" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue";
import axios from "axios";
import { metroLines, stationLines } from "../data/metroData";

export default {
  setup() {
    const trackInfo = ref(null);
    const loading = ref({});
    const initialLoading = ref(true);
    const error = ref({});
    const stations = ref(["中正紀念堂", "台北車站", "忠孝復興"]); // Add more stations as needed

    const getLineOfStation = (station) => {
      return stationLines[station] || [];
    };

    const getLineIcon = (line) => {
      const iconPlaceholders = {
        BR: "https://imgur.com/X5gxkdJ.png",
        R: "https://imgur.com/OKqw2RD.png",
        G: "https://imgur.com/cOXYDOL.png",
        O: "https://imgur.com/RLPyHZO.png",
        BL: "https://imgur.com/zNzZdpj.png",
        Y: "https://imgur.com/9ZVjixb.png",
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

    const fetchTrackInfo = async () => {
      const proxyUrl =
        "https://ck-web-news-9f40e6bce7de.herokuapp.com/metroProxy";
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
        if (initialLoading.value) {
          stations.value.forEach((station) => {
            loading.value[station] = true;
            error.value[station] = null;
          });
        }

        const response = await axios.post(
          proxyUrl,
          {
            url: apiUrl,
            xmlData: xmlData,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        trackInfo.value = response.data;
        if (initialLoading.value) {
          stations.value.forEach((station) => {
            loading.value[station] = false;
          });
          initialLoading.value = false;
        }
        console.log("Data fetched");
      } catch (error) {
        console.error("Error fetching track info:", error);
        if (initialLoading.value) {
          stations.value.forEach((station) => {
            error.value[station] = "無法獲取資料，請稍後再試。";
            loading.value[station] = false;
          });
          initialLoading.value = false;
        }
      }
    };

    const getLineColor = (destinationName, currentStation, trainNumber) => {
      const destination = destinationName.slice(0, -1);
      const destLines = stationLines[destination] || [];
      const currentLines = stationLines[currentStation] || [];

      if (currentStation === "忠孝復興" && destination === "南港展覽館") {
        return trainNumber === "" ? metroLines["BR"] : metroLines["BL"];
      }

      const commonLines = destLines.filter((line) =>
        currentLines.includes(line)
      );

      if (commonLines.length > 0) {
        return metroLines[commonLines[0]];
      } else if (destLines.length > 0) {
        return metroLines[destLines[0]];
      }

      return "inherit";
    };

    let intervalId = null;

    const startFetchingData = () => {
      fetchTrackInfo();
      intervalId = setInterval(fetchTrackInfo, 10000);
    };

    const stopFetchingData = () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };

    onMounted(() => {
      startFetchingData();
    });

    onUnmounted(() => {
      stopFetchingData();
    });

    return {
      stations,
      loading,
      initialLoading,
      error,
      formatCountDown,
      getLineColor,
      getLineOfStation,
      getLineIcon,
      getFilteredTrackInfo,
    };
  },
};
</script>

<style scoped>
.countdown-display {
  display: inline-flex;
  align-items: center;
}
.small-unit {
  font-size: 0.7em;
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
  width: 30px;
  height: 30px;
  vertical-align: middle;
}
.station-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #ddd;
}
.station-section:last-child {
  border-bottom: none;
}
</style>
