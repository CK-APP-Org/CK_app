<template>
  <q-page class="q-pa-md">
    <!-- Pinned News Table -->
    <q-table
      v-if="pinnedNews.length > 0"
      :rows="pinnedNews"
      :columns="columns"
      row-key="title"
      class="my-custom-table-2 q-mb-md"
      :wrap-cells="true"
      :dense="$q.screen.lt.md"
      :rows-per-page-options="[0]"
      hide-pagination
    >
      <template v-slot:top>
        <div class="text-h6 div-header">已釘選</div>
      </template>

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            class="custom-header"
          >
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-btn
              size="sm"
              color="negative"
              round
              dense
              icon="push_pin"
              @click="unpinRow(props.row)"
            />
          </q-td>
          <q-td
            v-for="col in props.cols.slice(1)"
            :key="col.name"
            :props="props"
          >
            <a
              v-if="col.name === 'title'"
              :href="props.row.link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ col.value }}
            </a>
            <template v-else>{{ col.value }}</template>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <!-- Original News Table -->
    <q-table
      :rows="news"
      :columns="columns"
      row-key="title"
      class="my-custom-table-2"
      :wrap-cells="true"
      :dense="$q.screen.lt.md"
      :rows-per-page-options="[20, 50, 100, 0]"
      rows-per-page-label="每頁最大顯示數量:"
      v-model:pagination="pagination"
      :loading="isLoading"
    >
      <template v-slot:top>
        <div class="row items-center full-width q-px-sm q-py-md">
          <div class="col-4">
            <!-- Empty space to balance the layout -->
          </div>
          <div class="col-4 text-center">
            <div class="text-h5 text-weight-bold news-title">未讀訊息</div>
          </div>
          <div class="col-4 flex justify-end">
            <q-btn-group outline>
              <q-btn
                color="negative"
                icon="delete"
                @click="showDeleteDialog = true"
                dense
                flat
              >
              </q-btn>
              <q-btn
                color="positive"
                icon="restore"
                @click="showRecoverDialog = true"
                dense
                flat
              >
              </q-btn>
            </q-btn-group>
          </div>
        </div>
      </template>

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            class="custom-header"
          >
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-btn
              size="sm"
              color="primary"
              round
              dense
              icon="push_pin"
              @click="pinRow(props.row)"
            />
          </q-td>
          <q-td
            v-for="col in props.cols.slice(1)"
            :key="col.name"
            :props="props"
          >
            <a
              v-if="col.name === 'title'"
              :href="props.row.link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ col.value }}
            </a>
            <template v-else>{{ col.value }}</template>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center q-gutter-sm text-body1">
          沒有更新的公告
        </div>
      </template>
    </q-table>

    <!--對話框(已讀所有訊息)-->
    <q-dialog v-model="showDeleteDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">確認已讀所有訊息?</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" @click="showDeleteDialog = false" />
          <q-btn flat label="確認" @click="deleteAllNews" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showRecoverDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">確認恢復所有訊息?</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" @click="showRecoverDialog = false" />
          <q-btn flat label="確認" @click="recoverAllNews" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { format, register } from "timeago.js";
import zh_TW from "timeago.js/lib/lang/zh_TW";
import { onMounted, ref, computed } from "vue";
import { useQuasar } from "quasar";
import { useStore } from "vuex";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import axios from "axios";
import { Browser } from "@capacitor/browser";

export default {
  name: "NewsPage",
  setup() {
    const store = useStore();
    const $q = useQuasar();

    const userAccount = computed(() => store.getters.getUserAccount);
    const pinnedNews = ref([]);
    const lastClearedTime = ref(null);

    const userData = ref(null);
    const userRef = ref(null); // Declare userRef here

    const isLoading = ref(true);
    const news = ref([]);
    const showDeleteDialog = ref(false);
    const showRecoverDialog = ref(false);
    const columns = [
      {
        name: "pin",
        required: true,
        label: "",
        align: "left",
        field: () => null,
      },
      {
        name: "title",
        required: true,
        label: "公告標題",
        align: "left",
        field: (row) => row.title,
        format: (val) => `${val}`,
        sortable: false,
        classes: "title-cell",
      },
      {
        name: "pubDate",
        required: true,
        label: "時間",
        align: "right",
        field: (row) => row.pubDate,
        format: (val) => formatTimeAgo(val),
        sortable: true,
      },
    ];

    const pinRow = async (row) => {
      const index = news.value.findIndex((item) => item.title === row.title);
      if (index !== -1) {
        const pinnedItem = news.value.splice(index, 1)[0];
        pinnedNews.value = [...pinnedNews.value, pinnedItem];

        const updatePath = `${userAccount.value}.News.pinnedNews`;
        await updateDoc(userRef.value, {
          [updatePath]: pinnedNews.value.map((item) => ({
            title: item.title,
            pubDate: item.pubDate,
            link: item.link,
          })),
        });

        store.dispatch("pinNews", pinnedItem);
      }
    };

    const unpinRow = async (row) => {
      const index = pinnedNews.value.findIndex(
        (item) => item.title === row.title
      );
      if (index !== -1) {
        const unpinnedItem = pinnedNews.value.splice(index, 1)[0];
        news.value.push(unpinnedItem);

        const updatePath = `${userAccount.value}.News.pinnedNews`;
        await updateDoc(userRef.value, {
          [updatePath]: pinnedNews.value.map((item) => ({
            title: item.title,
            pubDate: item.pubDate,
            link: item.link,
          })),
        });

        store.dispatch("unpinNews", row.title);
      }
    };

    const pagination = ref({
      sortBy: "pubDate",
      descending: true,
      page: 1,
      rowsPerPage: 20,
    });

    const fetchNews = async () => {
      isLoading.value = true;
      const urls = [
        "https://www.ck.tp.edu.tw/nss/main/feeder/5abf2d62aa93092cee58ceb4/KG5mY0d9355?f=normal&%240=hhyrNQJ0110&vector=private&static=false", //重要公告
        "https://www.ck.tp.edu.tw/nss/main/feeder/5abf2d62aa93092cee58ceb4/IXZld9j7619?f=normal&%240=kpenVCJ9015&vector=private&static=false", //最新消息
      ];

      try {
        const promises = urls.map((url) =>
          axios.get("https://ck-web-news-9f40e6bce7de.herokuapp.com/proxy", {
            params: { url },
          })
        );

        const responses = await Promise.all(promises);
        let allNews = [];

        responses.forEach((response) => {
          const parser = new DOMParser();
          const xml = parser.parseFromString(response.data, "text/xml");
          const items = Array.from(xml.querySelectorAll("item"));
          const newsData = items
            .map((item) => ({
              title: item.querySelector("title").textContent,
              pubDate: new Date(item.querySelector("pubDate").textContent),
              link: item.querySelector("link").textContent,
            }))
            .filter(
              (item) =>
                !lastClearedTime.value ||
                item.pubDate > new Date(lastClearedTime.value)
            );
          allNews = allNews.concat(newsData);
        });

        allNews.sort((a, b) => b.pubDate - a.pubDate);

        news.value = allNews;
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        isLoading.value = false;
      }
    };

    const formatTimeAgo = (date) => {
      return format(date, "zh_TW");
    };

    const deleteAllNews = async () => {
      // Clear all unpinned news
      news.value = [];
      // Record the current time
      const currentTime = new Date();
      const updatePath = `${userAccount.value}.News.lastClearedTime`;
      await updateDoc(userRef.value, { [updatePath]: currentTime });
      store.dispatch("setLastClearedTime", currentTime);
      $q.notify({
        message: "已清空所有未讀訊息",
        color: "positive",
        position: "bottom",
        timeout: 2000,
      });

      showDeleteDialog.value = false;
    };

    const recoverAllNews = async () => {
      // Set lastClearedTime to null
      const updatePath = `${userAccount.value}.News.lastClearedTime`;
      await updateDoc(userRef.value, { [updatePath]: null });
      store.dispatch("setLastClearedTime", null);

      // Fetch all news again

      $q.notify({
        message: "已恢復所有訊息",
        color: "positive",
        position: "bottom",
        timeout: 2000,
      });
      userRef.value = doc(db, "User Data", "Userdata"); // Initialize userRef here
      const docSnap = await getDoc(userRef.value);
      userData.value = docSnap.data()[userAccount.value];
      pinnedNews.value = userData.value["News"]["pinnedNews"];
      lastClearedTime.value = userData.value["News"]["lastClearedTime"] 
        ? userData.value["News"]["lastClearedTime"].toDate() 
        : null;
      console.log(lastClearedTime.value);
      register("zh_TW", zh_TW);
      fetchNews();
      showRecoverDialog.value = false;
    };

    const firebaseConfig = {
        apiKey: "AIzaSyAfHEWoaKuz8fiMKojoTEeJWMUzJDgiuVU",
        authDomain: "ck-app-database.firebaseapp.com",
        projectId: "ck-app-database",
        storageBucket: "ck-app-database.appspot.com",
        messagingSenderId: "253500838094",
        appId: "1:253500838094:web:b6bfcf4975f3323ab8c09f",
        measurementId: "G-T79H6D7WRT",
      };

      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

    onMounted(async () => {
      console.log(userAccount.value);

      userRef.value = doc(db, "User Data", "Userdata"); // Initialize userRef here
      const docSnap = await getDoc(userRef.value);
      userData.value = docSnap.data()[userAccount.value];
      pinnedNews.value = userData.value["News"]["pinnedNews"];
      lastClearedTime.value = userData.value["News"]["lastClearedTime"] 
        ? userData.value["News"]["lastClearedTime"].toDate() 
        : null;
      console.log(lastClearedTime.value);
      register("zh_TW", zh_TW);
      fetchNews();
    });

    return {
      news,
      columns,
      formatTimeAgo,
      pagination,
      isLoading,
      pinnedNews,
      pinRow,
      unpinRow,
      showDeleteDialog,
      deleteAllNews,
      showRecoverDialog,
      recoverAllNews,
    };
  },
};
</script>

<style scoped>
.q-pa-md {
  padding: 11px;
}
.div-header {
  display: flex;
  justify-content: center;
  width: 100%;
  text-align: center;
}
.my-custom-table-2 .custom-header {
  font-weight: bold;
  font-size: 1.1em;
  color: #1976d2;
  background-color: #e3f2fd;
  text-transform: none;
}
.my-custom-table-2 .title-cell {
  max-width: 230px;
  white-space: normal;
  word-wrap: break-word;
}
/* Make the table responsive */
.my-custom-table-2 {
  width: 100%;
  max-width: 100%;
}
/* Ensure consistent padding in header and data cells */
.my-custom-table-2 .q-td,
.my-custom-table-2 .q-th {
  padding: 12px 8px;
}
</style>
