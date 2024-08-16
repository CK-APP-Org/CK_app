<template>
  <q-page class="q-pa-md">
    <h4 class="text-h4 text-center q-mb-md">{{ stationName }}</h4>
    <div v-if="loading" class="text-center">
      <q-spinner color="primary" size="3em" />
      <p>載入中...</p>
    </div>
    <div v-else-if="error" class="text-negative">
      {{ error }}
    </div>
    <div v-else>
      <q-list bordered separator>
        <q-item v-for="train in filteredTrackInfo" :key="train.TrainNumber">
          <q-item-section>
            <q-item-label class="text-h6 text-weight-bold">
              <q-icon name="arrow_forward" color="primary" size="1em" />
              <span
                :style="{
                  color: getLineColor(
                    train.DestinationName,
                    stationName,
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
            >
              <span v-if="train.CountDown === '列車進站'">{{
                train.CountDown
              }}</span>
              <span v-else>
                {{ formatCountDown(train.CountDown).minutes
                }}<span class="small-unit">分</span
                >{{ formatCountDown(train.CountDown).seconds
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
  </q-page>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue";
import axios from "axios";
import { metroLines, stationLines } from "../data/metroData";

export default {
  setup() {
    const trackInfo = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const stationName = ref("中正紀念堂站");

    const filteredTrackInfo = computed(() => {
      if (!trackInfo.value) return [];

      try {
        const jsonPart = trackInfo.value.match(/\[.*\]/s);
        if (!jsonPart) return [];

        const parsedInfo = JSON.parse(jsonPart[0]);
        return parsedInfo.filter(
          (info) => info.StationName === stationName.value
        );
      } catch (error) {
        console.error("Error parsing trackInfo:", error);
        return [];
      }
    });
    console.log("filteredTrackInfo", filteredTrackInfo);

    const formatCountDown = (countDown) => {
      if (countDown === "列車進站") return countDown;

      const [minutes, seconds] = countDown.split(":").map(Number);

      // Convert to total seconds
      let totalSeconds = minutes * 60 + seconds;

      // Round to nearest 5 seconds
      totalSeconds = Math.round(totalSeconds / 5) * 5;

      // Convert back to minutes and seconds
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
        loading.value = false;
        console.log("Data fetched");
      } catch (error) {
        console.error("Error fetching track info:", error);
        error.value = "無法獲取資料，請稍後再試。";
        loading.value = false;
      }
    };

    const getLineColor = (destinationName, currentStation, trainNumber) => {
      const destination = destinationName.slice(0, -1);
      const destLines = stationLines[destination] || [];
      const currentLines = stationLines[currentStation] || [];

      // Special case for 忠孝復興站 to 南港展覽館
      if (currentStation === "忠孝復興站" && destination === "南港展覽館") {
        return trainNumber === "" ? metroLines["BR"] : metroLines["BL"];
      }

      // Find common lines between current station and destination
      const commonLines = destLines.filter((line) =>
        currentLines.includes(line)
      );

      if (commonLines.length > 0) {
        // If there are common lines, use the first common line's color
        return metroLines[commonLines[0]];
      } else if (destLines.length > 0) {
        // If no common lines, use the destination's first line color
        return metroLines[destLines[0]];
      }

      return "inherit"; // Default color if no matching line is found
    };

    let intervalId = null;

    const startFetchingData = () => {
      fetchTrackInfo();
      intervalId = setInterval(fetchTrackInfo, 10000); // 10000 milliseconds = 10 seconds
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
      filteredTrackInfo,
      loading,
      error,
      stationName,
      formatCountDown,
      getLineColor,
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
</style>
