<template>
  <q-dialog v-model="isOpen">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">地圖標記說明</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="legend-item">
          <img
            src="../../../public/food/marker-icon-open.png"
            alt="Open"
            style="width: 25px; height: 41px"
          />
          <span>正在營業</span>
        </div>
        <div class="legend-item">
          <img
            src="../../../public/food/marker-icon-closed.png"
            alt="Closed"
            style="width: 25px; height: 41px"
          />
          <span>已打烊</span>
        </div>
        <div class="legend-item">
          <img
            src="../../../public/food/marker-icon-open-var.png"
            alt="Closing Soon"
            style="width: 25px; height: 41px"
          />
          <span>即將打烊 (30分鐘內)</span>
        </div>
        <div class="legend-item">
          <img
            src="../../../public/food/marker-icon-closed-var.png"
            alt="Opening Soon"
            style="width: 25px; height: 41px"
          />
          <span>即將開業 (30分鐘內)</span>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div>註：營業時間僅供參考，此頁面無法反映店家真實營業資訊。</div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="關閉" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
const isOpen = defineModel({ type: Boolean, default: false });
</script>

<style scoped>
.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.legend-item img {
  margin-right: 10px;
}
</style>
