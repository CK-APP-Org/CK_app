<template>
  <meta
    name="google-site-verification"
    content="HowzUtdxDiec7CaWGmTlF_hNH7zkdBgcY69xn27ijKg"
  />
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="info"
          href="/#/about"
          class="absolute-left q-ml-md"
        />
        <q-btn
          flat
          dense
          round
          icon="settings"
          href="/#/settings"
          class="absolute-right q-mr-md"
        />
        <q-toolbar-title class="absolute-center"> CK APP </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- <q-drawer
      v-if="!isHomePage"
      v-model="drawer"
      show-if-above
      :width="200"
      bordered
      :behavior="$q.screen.gt.sm ? 'desktop' : 'mobile'"
    >
      <q-scroll-area class="fit">
        <q-list>
          <q-item class="q-pa-md">
            <q-item-section>
              <q-item-label class="text-h6 text-weight-bold text-gray"
                >功能選單</q-item-label
              >
            </q-item-section>
          </q-item>
          <template v-for="(menuItem, index) in menuItems" :key="index">
            <q-item
              clickable
              :active="$route.path === menuItem.link"
              v-ripple
              :to="menuItem.link"
            >
              <q-item-section avatar>
                <q-icon :name="menuItem.icon" />
              </q-item-section>
              <q-item-section>
                {{ menuItem.label }}
              </q-item-section>
            </q-item>
            <q-separator :key="'sep' + index" v-if="menuItem.separator" />
          </template>
        </q-list>
      </q-scroll-area>
    </q-drawer> -->

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="" v-if="!isHomePage">
      <q-tabs>
        <q-route-tab
          v-for="item in menuItems"
          :key="item.link"
          :to="item.link"
          :icon="item.icon"
          :label="item.label"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script>
export default {
  name: "MainLayout",
  data() {
    return {
      drawer: false,
      menuItems: [
        {
          label: "首頁",
          icon: "home",
          link: "/",
        },
        {
          label: "課表",
          icon: "book",
          link: "/schedule",
        },
        {
          label: "行事曆",
          icon: "calendar_month",
          link: "/todo",
        },
        {
          label: "Youbike",
          icon: "directions_bike",
          link: "/Youbike",
        },
        {
          label: "熱食部",
          icon: "restaurant_menu",
          link: "/menu",
        },
        {
          label: "美食",
          icon: "fastfood",
          link: "/food",
        },
        {
          label: "校網",
          icon: "newspaper",
          link: "/news",
        },
        // {
        //   label: "美食",
        //   icon: "info",
        //   link: "/about",
        // },
      ],
    };
  },
  computed: {
    isHomePage() {
      return this.$route.path === "/";
    },
  },
  methods: {
    toggleDrawer() {
      this.drawer = !this.drawer;
    },
  },
};
</script>

<style>
/* No need for media query, we're using Quasar's responsive classes */
</style>
