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
        class="bg-purple text-white shadow-1 rounded-borders"
      >
      <q-carousel-slide name="Intro" class="column no-wrap flex-center">
        <q-icon name="help" size="56px" />
        <div class="q-mt-md text-center text-h5">
          CK APP : 您專屬的校園助理
        </div>
        <div class="q-mt-md text-center">
          向右滑以查看更多說明
        </div>
      </q-carousel-slide>
      <q-carousel-slide name="Schedule" class="column no-wrap flex-center">
        <q-icon name="book" size="56px" />
        <div class="q-mt-md text-center text-h5">
          課表 : 輕鬆規劃，客製格式
        </div>
        <div class="q-mt-md text-center">
          透過位於首頁的課表功能，你不但能夠自訂每天的科目名稱，還能有針對課目加上註解並客製化每一個的顏色
        </div>
      </q-carousel-slide>
      <q-carousel-slide name="Youbike" class="column no-wrap flex-center">
        <q-icon name="directions_bike" size="56px" />
        <div class="q-mt-md text-center text-h5">
          Youbike : 便捷查詢，自行車輛隨時掌握
        </div>
        <div class="q-mt-md text-center">
          相較於官方APP，在這裡你不僅僅能獲得各站點的即時資訊，還能客製化優先顯示的站點資料並更改暱稱
        </div>
      </q-carousel-slide>
      <q-carousel-slide name="Menu" class="column no-wrap flex-center">
        <q-icon name="dining" size="56px" />
        <div class="q-mt-md text-center text-h5">
          熱騰騰的菜單 : 輕鬆查詢，找到美味
        </div>
        <div class="q-mt-md text-center">
          即時更新熱食部每周菜單與早餐部的菜單，並顯示營業時間
        </div>
      </q-carousel-slide>
    </q-carousel>

    <div class="q-mt-md"></div>

    <q-banner class="bg-secondary text-white">
      <div class="text-h5">關於這個APP</div>
      <div>CK APP是一個以便捷化建中學生在學校的日常為宗旨而製作的建中校園APP，MAYBE MORE WORDS IN THE FUTURE BUT I DON'T KNOW WHAT TO TYPE HERE :＜</div>
    </q-banner>

    <div class="q-mt-md"></div>

    <q-banner class="bg-primary text-white text-h5">
      <div class="text-h5">聯絡我們</div>
      <template v-slot:action>
        <q-btn flat color="white" label="Gmail" />
        <q-btn flat color="white" label="Line" />
      </template>
    </q-banner>


  </q-page>
</template>

<style>
</style>


<script>
import { ref } from 'vue'

export default {
  setup() {
    return{
      slide: ref('style'),
      lorem: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Itaque voluptatem totam, architecto cupiditate officia rerum, error dignissimos praesentium libero ab nemo.'
    }
  }
};
</script>
