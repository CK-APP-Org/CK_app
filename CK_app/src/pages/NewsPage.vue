<template>
  <q-page class="q-pa-md">
    <q-table :rows="newsData" :columns="columns" row-key="title">
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
    <q-banner v-if="error" class="q-mt-md" type="negative" icon="error">
      {{ error }}
    </q-banner>
  </q-page>
</template>

<script>
import { ref, onMounted } from "vue";
import { fetchXMLData, parseXMLData } from "../utils/xmlUtils"; // Make sure the path is correct

export default {
  name: "NewsPage",
  setup() {
    const newsData = ref([]);
    const error = ref(null);
    const columns = [
      {
        name: "title",
        required: true,
        label: "Title",
        align: "left",
        field: (row) => row.title,
      },
      {
        name: "pubDate",
        required: true,
        label: "Publication Date",
        align: "left",
        field: (row) => row.pubDate,
      },
    ];

    onMounted(async () => {
      try {
        const xmlDoc = await fetchXMLData(
          "/nss/main/feeder/5abf2d62aa93092cee58ceb4/KG5mY0d9355?f=normal&%240=hhyrNQJ0110&vector=private&static=false"
        );
        if (xmlDoc) {
          newsData.value = parseXMLData(xmlDoc);
        } else {
          error.value = "Failed to fetch news data. Please try again later.";
        }
      } catch (err) {
        error.value = "An unexpected error occurred. Please try again later.";
        console.error(err);
      }
    });

    return {
      newsData,
      columns,
      error,
    };
  },
};
</script>
