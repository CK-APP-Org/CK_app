<template>
  <q-page class="q-pa-md bg-grey-1">
    <div
      v-for="station in stations"
      :key="station"
      class="station-section q-mb-xl q-pa-md bg-white rounded-borders"
    >
      <h4 class="text-h4 text-weight-bold q-mb-md q-mt-sm station-header">
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
                <span class="crowdedness-indicators q-ml-sm">
                  <q-badge
                    v-for="(level, index) in getTrainCrowdedness(
                      train.TrainNumber
                    )"
                    :key="index"
                    :color="getCrowdednessColor(level)"
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
    <div class="text-caption q-mt-md">
      擁擠程度:
      <q-badge color="light-green" class="q-mr-xs">&ensp;</q-badge> 低
      <q-badge color="amber-5" class="q-mr-xs q-ml-sm">&ensp;</q-badge> 中
      <q-badge color="orange-6" class="q-mr-xs q-ml-sm">&ensp;</q-badge> 高
      <q-badge color="deep-orange-10" class="q-mr-xs q-ml-sm">&ensp;</q-badge>
      極高
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
    const stations = ref([
      "圓山",
      "府中",
      "忠孝復興",
      "南港展覽館",
      "民權西路",
      "頭前庄",
      "亞東醫院",
      "淡水",
    ]); // Add more stations as needed

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

    const isValidCountDown = (countDown) => {
      return (
        countDown === "列車進站" ||
        countDown === "營運時間已過" ||
        /^\d+:\d+$/.test(countDown)
      );
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
        //console.log(trackInfo);
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
      fetchCarWeight();
      fetchCarWeightBR();
      intervalId = setInterval(() => {
        fetchTrackInfo();
        fetchCarWeight();
        fetchCarWeightBR();
      }, 10000);
    };

    const stopFetchingData = () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };

    const carWeightData = ref(null);

    const fetchCarWeight = async () => {
      const proxyUrl =
        "https://ck-web-news-9f40e6bce7de.herokuapp.com/metroProxy";
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
      const proxyUrl =
        "https://ck-web-news-9f40e6bce7de.herokuapp.com/metroProxy";
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
        console.log("Wenhu Line Car Weight Data:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching Wenhu Line car weight data:", error);
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
      carWeightData,
      getTrainCrowdedness,
      getCrowdednessColor,
      isValidCountDown,
      fetchCarWeightBR,
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
  width: 24px;
  height: 24px;
  vertical-align: middle;
}
.station-section {
  margin-bottom: 2rem;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
}
.station-header {
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
}
.crowdedness-indicators {
  display: inline-flex;
  align-items: center;
}
</style>
