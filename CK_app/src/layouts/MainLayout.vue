<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleDrawer"
          v-if="$q.screen.gt.sm"
        />
        <q-toolbar-title class="absolute-center">
          CK APP
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
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
                >選單</q-item-label
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
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="lt-md">
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
          label: "Youbike即時",
          icon: "directions_bike",
          link: "/Youbike",
        },
        {
          label: "熱食部菜單",
          icon: "dining",
          link: "/menu",
        },
        {
          label: "設定",
          icon: "settings",
          link: "/settings",
        },
      ],
    };
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
