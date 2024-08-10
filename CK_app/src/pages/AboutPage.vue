<template>
  <q-page class="bg-grey-1">
    <q-carousel
      v-model="slide"
      transition-prev="slide-right"
      transition-next="slide-left"
      swipeable
      animated
      control-color="primary"
      prev-icon="chevron_left"
      next-icon="chevron_right"
      navigation-icon="lens"
      navigation
      padding
      arrows
      height="380px"
      class="bg-white text-primary shadow-3 rounded-borders q-mb-md"
    >
      <q-carousel-slide
        v-for="(slideContent, index) in carouselSlides"
        :key="index"
        :name="slideContent.name"
        class="column no-wrap flex-center"
      >
        <q-icon :name="slideContent.icon" size="56px" color="primary" />
        <div class="q-mt-md text-center text-h5 text-weight-bold">
          {{ slideContent.title }}
        </div>
        <div class="text-subtitle1 q-mt-md text-center q-px-lg">
          {{ slideContent.description }}
        </div>
      </q-carousel-slide>
    </q-carousel>

    <q-card class="q-ma-md">
      <q-card-section>
        <div class="text-h5 text-primary q-mb-md">關於這個APP</div>
        <p class="q-mb-sm">
          CK
          APP是一個革命性的建中校園應用程式，誕生於兩位高三學生幫助所有建中生的夢想。它不僅是個工具，更是每個建中生的得力助手、貼心夥伴和充滿智慧的嚮導。
        </p>
        <p>
          我們深知建中學子們肩負著沉重的學業壓力和對未來的期許。CK
          APP旨在減輕這份負擔，讓每一位建中人能夠更加從容地駕馭他們的學習生涯，將繁瑣的日常事務簡化為指尖輕觸的便利。
        </p>
      </q-card-section>
    </q-card>

    <q-card class="q-ma-md">
      <q-card-section class="row items-center">
        <div class="text-h5 text-primary">聯絡我們</div>
        <q-space />
        <q-btn
          color="primary"
          icon="mail"
          label="Gmail"
          @click="openGmailCompose"
        />
      </q-card-section>
    </q-card>

    <q-card class="q-ma-md">
      <q-card-section class="row items-center">
        <div class="text-h5 text-primary">版本資訊＆未來版本</div>
        <q-space />
        <q-btn
          color="primary"
          icon="info"
          label="2.0"
          @click="openVersionInfo = true"
        />
      </q-card-section>
    </q-card>

    <q-dialog v-model="openVersionInfo">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h5">版本資訊</div>
        </q-card-section>

        <q-card-section>
          <div class="text-h6">CK APP 當前版本： 2.0</div>
        </q-card-section>

        <q-card-section>
          <div class="item-info-title q-mb-sm">未來版本預計新增功能：</div>
          <q-list dense>
            <q-item
              v-for="(item, index) in futureFeatures"
              :key="index"
              class="item-info"
            >
              <q-item-section avatar>
                <q-icon name="add_circle_outline" color="primary" />
              </q-item-section>
              <q-item-section>{{ item }}</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="關閉" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref } from "vue";

export default {
  setup() {
    const slide = ref("Intro");
    const openVersionInfo = ref(false);
    const futureFeatures = ref([
      "熱食部/早餐部擁擠程度",
      "北捷/公車即時資訊",
      "圖書館剩餘座位資訊",
    ]);
    const carouselSlides = [
      {
        name: "Intro",
        icon: "school",
        title: "CK APP : 您專屬的校園助理",
        description: "向右滑以查看更多說明",
      },
      {
        name: "Schedule",
        icon: "book",
        title: "課表 : 輕鬆規劃，客製格式",
        description: "自訂科目名稱，加上註解並客製化每一格的顏色",
      },
      {
        name: "Calendar",
        icon: "calendar_month",
        title: "行事曆 : 輕鬆規劃每一天",
        description:
          "分成月曆和待辦兩個頁面，讓學生能夠有效掌握未來的所有活動和工作",
      },
      {
        name: "YouBike",
        icon: "directions_bike",
        title: "YouBike : 便捷查詢，車輛隨時掌握",
        description: "獲得各站點的即時資訊，客製化優先顯示的站點資料並更改暱稱",
      },
      {
        name: "Menu",
        icon: "restaurant_menu",
        title: "熱騰騰的菜單 : 輕鬆查詢，找到美味",
        description: "即時更新熱食部每月菜單與早餐部的菜單，並顯示營業時間",
      },
      {
        name: "Food",
        icon: "fastfood",
        title: "即時資訊，不再白跑一趟",
        description: "即時顯示建中附近餐廳之營業狀態及建中生之特殊優惠",
      },
      {
        name: "News",
        icon: "newspaper",
        title: "校網追蹤，即時更新",
        description:
          "追蹤校網的所有公告，自由已讀或釘選，不再漏接訊息或被不重要的訊息干擾",
      },
    ];

    const openGmailCompose = () => {
      const email = "ckappofficial@gmail.com";
      const subject = "Questions and Recommendations regarding CK_APP";
      const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        email
      )}&su=${encodeURIComponent(subject)}`;
      window.open(gmailComposeUrl, "_blank");
    };

    return {
      slide,
      carouselSlides,
      openGmailCompose,
      openVersionInfo,
      futureFeatures,
    };
  },
};
</script>

<style lang="scss">
.q-carousel {
  .q-carousel__slide {
    padding: 1rem;
  }
}
.item-info-title {
  font-size: 18px;
}
.item-info {
  font-size: 17px;
}
</style>
