<template>
  <q-page class="q-pa-md">
    <h5>列車到站資訊</h5>
    <q-btn @click="fetchTrackInfo" color="primary" label="獲取資訊" />
    <q-card v-if="filteredTrackInfo" class="q-mt-md">
      <q-card-section>
        <pre>{{ filteredTrackInfo }}</pre>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { ref, computed } from "vue";
import axios from "axios";

export default {
  setup() {
    const trackInfo = ref(null);

    const filteredTrackInfo = computed(() => {
      if (!trackInfo.value) return null;

      try {
        // Extract the JSON part from the response
        const jsonPart = trackInfo.value.match(/\[.*\]/s);
        if (!jsonPart) return null;

        const parsedInfo = JSON.parse(jsonPart[0]);
        return parsedInfo.filter((info) => info.StationName === "中正紀念堂站");
      } catch (error) {
        console.error("Error parsing trackInfo:", error);
        return null;
      }
    });

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
      } catch (error) {
        console.error("Error fetching track info:", error);
        trackInfo.value = "Error fetching data";
      }
    };

    return {
      filteredTrackInfo,
      fetchTrackInfo,
    };
  },
};
</script>
