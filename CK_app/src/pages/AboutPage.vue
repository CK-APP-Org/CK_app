<template>
  <q-page>
    <q-carousel
      v-model="slide"
      transition-prev="jump-right"
      transition-next="jump-left"
      swipeable
      animated
      control-color="white"
      prev-icon="arrow_left"
      next-icon="arrow_right"
      navigation-icon="radio_button_unchecked"
      navigation
      padding
      arrows
      height="300px"
      class="text-white shadow-1 rounded-borders"
      style="
        background-image: linear-gradient(to Left, #c5b061 0%, #d9c88b 100%);
      "
    >
      <q-carousel-slide name="Intro" class="column no-wrap flex-center">
        <q-icon name="help" size="56px" />
        <div class="q-mt-md text-center text-h5">CK APP : 您專屬的校園助理</div>
        <div class="q-mt-md text-center">向右滑以查看更多說明</div>
      </q-carousel-slide>
      <q-carousel-slide name="Schedule" class="column no-wrap flex-center">
        <q-icon name="book" size="56px" />
        <div class="q-mt-md text-center text-h5">課表 : 輕鬆規劃，客製格式</div>
        <div class="q-mt-md text-center">
          你不但能夠自訂每天的科目名稱，還能針對課目加上註解並客製化每一格的顏色
        </div>
      </q-carousel-slide>
      <q-carousel-slide name="Youbike" class="column no-wrap flex-center">
        <q-icon name="directions_bike" size="56px" />
        <div class="q-mt-md text-center text-h5">
          Youbike : 便捷查詢，車輛隨時掌握
        </div>
        <div class="q-mt-md text-center">
          在這裡你不僅僅能獲得各站點的即時資訊，還能客製化優先顯示的站點資料並更改暱稱
        </div>
      </q-carousel-slide>
      <q-carousel-slide name="Menu" class="column no-wrap flex-center">
        <q-icon name="dining" size="56px" />
        <div class="q-mt-md text-center text-h5">
          熱騰騰的菜單 : 輕鬆查詢，找到美味
        </div>
        <div class="q-mt-md text-center">
          即時更新熱食部每週菜單與早餐部的菜單，並顯示營業時間
        </div>
      </q-carousel-slide>
      <q-carousel-slide name="News" class="column no-wrap flex-center">
        <q-icon name="newspaper" size="56px" />
        <div class="q-mt-md text-center text-h5">校網追蹤，及時更新</div>
        <div class="q-mt-md text-center">
          在這裡追蹤校網的所有公告，還能自由已讀或釘選，讓你再也不用擔心漏接訊息或被不重要的訊息干擾
        </div>
      </q-carousel-slide>
    </q-carousel>

    <div class="q-mt-md"></div>

    <q-banner
      class="text-white"
      style="
        background-image: linear-gradient(to Left, #c5b061 0%, #d9c88b 100%);
      "
    >
      <div class="text-h5">關於這個APP</div>
      <div>
        &ensp;&ensp;&ensp;&ensp;CK
        APP是一個革命性的建中校園應用程式，它的誕生源於兩位高三學生想要幫助所有建中生的夢想。
        這款app不僅僅是個工具，它是每個建中生的得力助手、貼心夥伴和充滿智慧的嚮導。
      </div>
      <div>
        &ensp;&ensp;&ensp;&ensp;我們深知，建中學子們肩負著沉重的學業壓力和對未來的期許。正是為了減輕這份負擔，為了讓每一位建中人能夠更加從容地駕馭他們的學習生涯，CK
        APP應運而生，將繁瑣的日常事務簡化為指尖輕觸的便利。
      </div>
    </q-banner>

    <div class="q-mt-md"></div>

    <q-banner
      class="text-white text-h5"
      style="
        background-image: linear-gradient(to Left, #c5b061 0%, #d9c88b 100%);
      "
    >
      <div class="text-h5">聯絡我們</div>
      <template v-slot:action>
        <q-btn flat color="white" label="Gmail" @click="openGmailCompose" />
      </template>
    </q-banner>
  </q-page>
</template>

<style></style>

<script>
import { ref } from "vue";

export default {
  setup() {
    const openGmailCompose = () => {
      const email = "ckappofficial@gmail.com";
      const subject = "Questions and Recommendations regarding CK_APP";

      const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        email
      )}&su=${encodeURIComponent(subject)}`;

      window.open(gmailComposeUrl, "_blank");
    };
    return {
      slide: ref("Intro"),
      openGmailCompose,
    };
  },
};
</script>
