<template>
  <q-page class="flex justify-center">
    <q-card :style="cardStyle">
      <q-card-section style="height: 45px; width: 350px">
        <div class="title">熱食部</div>
      </q-card-section>
      <img src="https://i.imgur.com/ncM6IAg.jpeg" style="height: 265px; max-width: 800px" />
      <q-btn
        class="absolute-top-right status-btn"
        :label="statusLabel"
        icon="info"
        size="12px"
        padding="sm"
        :color="statusColor"
        unelevated
        @click="showDialog = true"
      />
    </q-card>
    <q-dialog v-model="showDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">熱食部營業時間</div>
          <p>
            熱食部營業時間為每日 {{ openHour }}:00 到 {{ closeHour }}:00<br />
            (註：實際營業資訊依熱食部公告為準，<br />本軟體不負任何法律責任)
          </p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="關閉" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      openHour: 8, //在這邊改營業時間
      closeHour: 16,
      showDialog: false,
    };
  },
  computed: {
    statusLabel() {
      const now = new Date();
      const hours = now.getHours();
      if (hours >= this.openHour && hours < this.closeHour) {
        return "營業中";
      } else {
        return "已歇業";
      }
    },
    statusColor() {
      const now = new Date();
      const hours = now.getHours();
      if (hours >= this.openHour && hours < this.closeHour) {
        return "green";
      } else {
        return "red";
      }
    },
    cardStyle() {
      const now = new Date();
      const hours = now.getHours();
      if (hours >= this.openHour && hours < this.closeHour) {
        return {};
      } else {
        return { opacity: 0.5 };
      }
    },
  },
};
</script>

<style>
.title {
  font-weight: bold;
  color: #000000;
  font-size: 20px;
}
.status-btn {
  margin-top: 15px;
  margin-right: 8px;
}
</style>
