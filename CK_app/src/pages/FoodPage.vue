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
      <l-marker :lat-lng="[25.03079, 121.5123]">
        <l-popup>建中</l-popup>
      </l-marker>
      <l-marker :lat-lng="[25.030181, 121.51412]">
        <l-popup>林乾</l-popup>
      </l-marker>
      <l-marker :lat-lng="[25.0291, 121.512884]">
        <l-popup>建豆</l-popup>
      </l-marker>
      <l-marker :lat-lng="[25.029501, 121.51452]">
        <l-popup>Q Burger</l-popup>
      </l-marker>
      <l-marker :lat-lng="[25.031106, 121.51715]">
        <l-popup>嘉義第一名火雞肉飯</l-popup>
      </l-marker>
      <l-marker :lat-lng="[25.0294, 121.51865]">
        <l-popup>麥當勞</l-popup>
      </l-marker>
    </l-map>
  </q-page>
</template>

<script setup>
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import { onMounted } from "vue";
import { Icon } from "leaflet";

onMounted(() => {
  delete Icon.Default.prototype._getIconUrl;
  Icon.Default.mergeOptions({
    iconRetinaUrl: new URL(
      "leaflet/dist/images/marker-icon-2x.png",
      import.meta.url
    ).href,
    iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url)
      .href,
    shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url)
      .href,
  });
});
</script>
