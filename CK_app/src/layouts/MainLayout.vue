<template>
  <meta
    name="google-site-verification"
    content="HowzUtdxDiec7CaWGmTlF_hNH7zkdBgcY69xn27ijKg"
  />
  <q-layout view="hHh lpR fFf">
    <q-header elevated :class="isAndroid ? 'pad-header':''">
      <q-toolbar>
        <q-btn
          flat
          dense
          icon="info"
          href="/#/about"
        />
        <q-toolbar-title class="text-center"> CK APP </q-toolbar-title>
        <q-btn
          flat
          dense
          icon="settings"
          href="/#/settings"
        />
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

    <q-page-container :class="isAndroid ? 'pad-footer' : ''">
      <router-view />
    </q-page-container>

    <q-footer v-if="!isHomePage" :class="isAndroid ? 'pad-footer' : ''">
      <q-tabs>
        <q-route-tab
          v-for="item in visibleMenuItems"
          :key="item.link"
          :to="item.link"
          :icon="item.icon"
          :label="item.label"
          no-caps
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent, computed } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "MainLayout",

  setup() {
    const store = useStore();
    const route = useRoute();

    const visibleMenuItems = computed(() => store.getters.getVisibleMenuItems);
    const isHomePage = computed(() => route.path === "/");
    const isAndroid = window && window.Capacitor && window.Capacitor.getPlatform() === 'android';

    return {
      visibleMenuItems,
      isHomePage,
      isAndroid,
    };
  },
});
</script>

<style>
/* No need for media query, we're using Quasar's responsive classes */
.pad-header {
  padding-top: env(safe-area-inset-top);
}
.pad-footer {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
