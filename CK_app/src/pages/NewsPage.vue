<template>
  <q-page class="q-pa-md">
    <q-table :rows="news" :columns="columns" row-key="title">
      <template v-slot:body-cell-title="props">
        <q-td :props="props">
          {{ props.row.title }}
        </q-td>
      </template>
      <template v-slot:body-cell-pubDate="props">
        <q-td :props="props">
          {{ props.row.pubDate }}
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";

export default {
  name: "NewsPage",
  setup() {
    const news = ref([]);
    const columns = [
      {
        name: "title",
        required: true,
        label: "Title",
        align: "left",
        field: (row) => row.title,
        format: (val) => `${val}`,
        sortable: true,
      },
      {
        name: "pubDate",
        required: true,
        label: "Publication Date",
        align: "left",
        field: (row) => row.pubDate,
        format: (val) => `${val}`,
        sortable: true,
      },
    ];

    const fetchNews = async () => {
      try {
        const response = await axios.get(
          "https://ck-web-news-9f40e6bce7de.herokuapp.com/proxy",
          {
            params: {
              url: "https://www.ck.tp.edu.tw/nss/main/feeder/5abf2d62aa93092cee58ceb4/KG5mY0d9355?f=normal&%240=hhyrNQJ0110&vector=private&static=false",
            },
          }
        );
        const parser = new DOMParser();
        const xml = parser.parseFromString(response.data, "text/xml");
        const items = Array.from(xml.querySelectorAll("item"));
        const newsData = items.map((item) => ({
          title: item.querySelector("title").textContent,
          pubDate: item.querySelector("pubDate").textContent,
        }));
        news.value = newsData;
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    onMounted(fetchNews);

    return {
      news,
      columns,
    };
  },
};
</script>

<style scoped>
.q-pa-md {
  padding: 16px;
}
</style>
