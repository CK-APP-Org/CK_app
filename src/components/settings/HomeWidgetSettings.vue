<template>
  <q-dialog v-model="isOpen">
    <q-card>
      <q-card-section>
        <div class="text-h6">首頁顯示項目設定</div>
      </q-card-section>
      <q-card-section>
        <q-list>
          <q-item tag="label" v-ripple>
            <q-item-section>
              <q-item-label>目前課程</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="showSchedule" color="primary" />
            </q-item-section>
          </q-item>
          <q-item tag="label" v-ripple>
            <q-item-section>
              <q-item-label>今日待辦事項</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="showTodo" color="primary" />
            </q-item-section>
          </q-item>
          <q-item tag="label" v-ripple>
            <q-item-section>
              <q-item-label>釘選校網內容</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="showSchoolNews" color="primary" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="關閉" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

const isOpen = defineModel({ type: Boolean, default: false });

const store = useStore();

const showSchedule = computed({
  get: () => store.getters.getShowSchedule,
  set: (value) => store.commit("SET_SHOW_SCHEDULE", value),
});

const showTodo = computed({
  get: () => store.getters.getShowTodo,
  set: (value) => store.commit("SET_SHOW_TODO", value),
});

const showSchoolNews = computed({
  get: () => store.getters.getShowSchoolNews,
  set: (value) => store.commit("SET_SHOW_NEWS", value),
});
</script>
