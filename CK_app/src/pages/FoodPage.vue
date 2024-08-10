<template>
  <q-page class="flex flex-center">
    <l-map
      style="height: 600px; width: 100%"
      :zoom="16"
      :center="[25.030004, 121.515866]"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      ></l-tile-layer>
      <l-marker :lat-lng="[25.03079, 121.5123]" :icon="customIcon">
        <l-popup>建中</l-popup>
      </l-marker>
      <l-marker :lat-lng="[25.030181, 121.51412]" :icon="customIcon">
        <l-popup>林乾</l-popup>
      </l-marker>
    </l-map>
  </q-page>
</template>

<script setup>
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import { onMounted, ref } from "vue";
import { Icon } from "leaflet";

const customIcon = ref(null);

onMounted(() => {
  customIcon.value = new Icon({
    iconUrl: "https://imgur.com/jZN5Ph6.png", // Use the direct image link
    iconSize: [25, 41], // Size of the icon, adjust as needed
    iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
  });
});
</script>
