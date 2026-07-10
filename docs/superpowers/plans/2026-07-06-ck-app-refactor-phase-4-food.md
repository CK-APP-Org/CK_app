# CK App Refactor — Phase 4-D (FoodPage.vue Split) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task (inline execution — this repo's current preference). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `src/pages/FoodPage.vue` (684 lines) into a smaller map-owning parent plus a pure-logic composable (`useRestaurantHours.js`) and three components (`RestaurantSidebar.vue`, `RestaurantList.vue`, `MapLegend.vue`), per Phase 4-D — the last sub-phase of Phase 4.

**Architecture:** `FoodPage.vue` keeps the Leaflet map itself (`mapRef` and everything that manipulates it — panning, opening popups — must stay where `mapRef` lives), the top control buttons, and data-fetching. `RestaurantSidebar`/`RestaurantList` each independently read/write the Vuex favorites state directly via `useStore()` (same pattern as Phase 4-C's Settings components — favorites are global state, not something that needs threading through props into two different consumers). Both use `defineModel()` for their own dialog/panel visibility; `MapLegend` is fully static and needs no props beyond that. `useRestaurantHours.js` holds every pure, Vue-independent function this file has — `docs/refactoring-plan.md` earmarks `isOpen`/`isWithinMinutes` for Phase 7 unit tests specifically because they have zero Vue/Firebase dependencies.

**Tech Stack:** Quasar 2 / Vue 3.5 `<script setup>` (including `defineModel`), Vuex 4, `@vue-leaflet/vue-leaflet`.

## Global Constraints

- No `[deploy]` prefix in any commit message. No Claude/Anthropic attribution in any commit message or PR description (standing rule for this repo).
- This is **sub-phase 4 of 4** in Phase 4 (Transport ✅ → Todo ✅ → Settings ✅ → Food). This is the **last** sub-phase — after this lands, the whole `refactor/phase-4-component-splitting` branch's PR opens (Task 6 below).
- Pure code motion. Every function body below is copied verbatim from the current file (verified by direct read on 2026-07-06, current HEAD of this branch) — with one explicit exception (below).
- **`isWithinMinutes`'s time-overflow bug is NOT fixed in this phase.** `docs/refactoring-plan.md` Phase 6-B describes this exact bug (breaks for closing times past `24:00`, e.g. `25:00`) and explicitly says "Extract this fix into `useRestaurantHours.js` (Phase 4-D)" — meaning *this* phase does the extraction, and the *fix itself* is Phase 6-B's job, later. `isWithinMinutes` is moved here byte-for-byte, bug included.

## Noted deviations from a pure line-for-line move

1. **Asset path depth changes for `MapLegend.vue`'s 4 `<img>` tags.** The original `src="../../public/food/marker-icon-open.png"` (etc.) resolves relative to `src/pages/FoodPage.vue`'s location (2 directories deep from the repo root: `pages` → `src` → root). Vite's Vue SFC compiler treats template `<img src="...">` relative paths as build-time asset imports resolved against *the file's own location* — unlike a JS string literal inside `<script>` (which is not specially resolved). Since `MapLegend.vue` lives one directory deeper (`src/components/food/`, 3 levels from root), its copies of these 4 paths need an extra `../`: `../../../public/food/marker-icon-open.png`. This was caught by manually re-deriving each path's resolution rather than copying the string as-is — the kind of mistake a pure text diff against the original wouldn't catch, since the string would "match" while resolving to the wrong location.
2. **`getIconType` isn't in `docs/refactoring-plan.md`'s literal list of composable exports** (`getMarkerIcon`, `isOpen`, `isWithinMinutes`, `getCurrentDay`, `translateDays`), but it's added to `useRestaurantHours.js` anyway. It's not actually dead code — `showSidebarAndDisplayIconType` calls `getIconType(getMarkerIcon(marker))` for real (only the `$q.notify` that would have *displayed* the result is commented out) — and it does the same kind of icon-instance comparison as `getMarkerIcon`, so it's a natural fit alongside it.
3. **`closeSidebar` is dropped from the parent.** Its only caller was the sidebar's own close button (`@click="closeSidebar"`), which moves into `RestaurantSidebar.vue` and becomes a direct `isOpen.value = false` on the component's own `defineModel` — there's nothing left in the parent to call the old function.
4. **Two CSS rules are duplicated** across the parent and `RestaurantSidebar.vue`: `.today-hours` is used both in the parent's own map-marker popup template *and* inside the sidebar's day-breakdown (confirmed via grep before writing this plan) — same reasoning as the CSS duplications in the Transport/Todo splits.
5. **Dropped the dead `import axios from "axios";`.** The original file imports `axios` but only ever calls it inside a commented-out block (`// Fetch from GitHub ... const githubResponse = await axios.get(...)`), never in live code. Same as Transport's dropped `store` import — keeping a provably-unused import would fail `yarn lint`'s unused-import check. Found and fixed via this task's own diff-against-git-history check (below), the same technique that caught Transport's SOAP typo — the original commit for this file initially also dropped a *different*, undocumented thing (a dead-but-preserved `onMounted` comment) by accident, which was restored in a follow-up commit once the diff check flagged it.
6. **`import store from "../store/index"` (a direct singleton import) is replaced by `useStore()` everywhere in the new files**, including the rewritten parent. The original `FoodPage.vue` used the direct-import style; every other Phase 4 sub-phase's new components (Transport, Todo, Settings) use `useStore()` instead. Both resolve to the exact same Vuex store instance — this is a style-consistency choice across all of Phase 4's new/touched files, not a behavior change.

---

## Task 1: Create `src/composables/useRestaurantHours.js`

**Files:**
- Create: `src/composables/useRestaurantHours.js`

**Interfaces:**
- Consumes: nothing.
- Produces (used by Tasks 2 and 4): `getMarkerIcon(marker)`, `getIconType(icon)`, `isOpen(openingHours)`, `isWithinMinutes(time1, time2, minutes)`, `getCurrentDay()`, `translateDays(openingHours)` — all named exports, all pure (no Vue reactivity, no component context needed).

- [ ] **Step 1: Create the file**

```js
import { Icon } from "leaflet";

const openIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/CK-APP-Org/Data/main/FoodPage/marker-icon-open.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const closedIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/CK-APP-Org/Data/main/FoodPage/marker-icon-closed.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const openVarIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/CK-APP-Org/Data/main/FoodPage/marker-icon-open-var.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const closedVarIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/CK-APP-Org/Data/main/FoodPage/marker-icon-closed-var.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function getMarkerIcon(marker) {
  const now = new Date();
  const day = now
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const time = now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  const todayHours = marker.openingHours[day];
  if (todayHours === "休息") return closedIcon;

  const hourRanges = todayHours.split(",");
  for (const range of hourRanges) {
    const [open, close] = range.split(/[-]/);

    // Check if closing in 30 minutes
    if (isWithinMinutes(time, close, 30) && time < close) {
      return openVarIcon;
    }

    // Check if opening in 30 minutes
    if (isWithinMinutes(open, time, 30) && time < open) {
      return closedVarIcon;
    }

    if (time >= open && time < close) {
      return openIcon;
    }
  }

  return closedIcon;
}

export function getIconType(icon) {
  if (icon === openIcon) return "Open Icon";
  if (icon === closedIcon) return "Closed Icon";
  if (icon === openVarIcon) return "Open Variant Icon";
  if (icon === closedVarIcon) return "Closed Variant Icon";
  return "Unknown Icon";
}

export function isWithinMinutes(time1, time2, minutes) {
  const [h1, m1] = time1.split(":").map(Number);
  const [h2, m2] = time2.split(":").map(Number);
  const diff = Math.abs(h1 * 60 + m1 - (h2 * 60 + m2));
  return diff <= minutes;
}

export function isOpen(openingHours) {
  const now = new Date();
  const day = now
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const time = now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  const todayHours = openingHours[day];
  if (todayHours === "休息") return false;

  const hourRanges = todayHours.split(",");
  return hourRanges.some((range) => {
    const [open, close] = range.split(/[-–]/);
    return time >= open && time <= close;
  });
}

export function translateDays(openingHours) {
  const dayTranslations = {
    monday: "星期一",
    tuesday: "星期二",
    wednesday: "星期三",
    thursday: "星期四",
    friday: "星期五",
    saturday: "星期六",
    sunday: "星期日",
  };

  return Object.entries(openingHours).reduce((acc, [day, hours]) => {
    acc[dayTranslations[day] || day] = hours;
    return acc;
  }, {});
}

export function getCurrentDay() {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[new Date().getDay()];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/composables/useRestaurantHours.js
git commit -m "refactor(food): extract useRestaurantHours composable

Pure, Vue-independent functions/data pulled out of FoodPage.vue ahead
of the component split: the 4 status-icon instances plus
getMarkerIcon/getIconType (which compare against them),
isWithinMinutes, isOpen, translateDays, and getCurrentDay. No
behavior change - verbatim move, including isWithinMinutes' known
time-overflow bug for closing times past 24:00 (docs/refactoring-plan.md
Phase 6-B fixes that separately; this phase only relocates the code)."
```

---

## Task 2: Create `src/components/food/MapLegend.vue`

**Files:**
- Create: `src/components/food/MapLegend.vue`

**Interfaces:**
- Consumes props: `modelValue` (Boolean, via `defineModel`).
- Emits: none beyond the implicit `update:modelValue`.

- [ ] **Step 1: Create the file**

```vue
<template>
  <q-dialog v-model="isOpen">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">地圖標記說明</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="legend-item">
          <img
            src="../../../public/food/marker-icon-open.png"
            alt="Open"
            style="width: 25px; height: 41px"
          />
          <span>正在營業</span>
        </div>
        <div class="legend-item">
          <img
            src="../../../public/food/marker-icon-closed.png"
            alt="Closed"
            style="width: 25px; height: 41px"
          />
          <span>已打烊</span>
        </div>
        <div class="legend-item">
          <img
            src="../../../public/food/marker-icon-open-var.png"
            alt="Closing Soon"
            style="width: 25px; height: 41px"
          />
          <span>即將打烊 (30分鐘內)</span>
        </div>
        <div class="legend-item">
          <img
            src="../../../public/food/marker-icon-closed-var.png"
            alt="Opening Soon"
            style="width: 25px; height: 41px"
          />
          <span>即將開業 (30分鐘內)</span>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div>註：營業時間僅供參考，此頁面無法反映店家真實營業資訊。</div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="關閉" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
const isOpen = defineModel({ type: Boolean, default: false });
</script>

<style scoped>
.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.legend-item img {
  margin-right: 10px;
}
</style>
```

**Note:** paths changed from `../../public/...` to `../../../public/...` — see this plan's deviations section, item 1.

- [ ] **Step 2: Commit**

```bash
git add src/components/food/MapLegend.vue
git commit -m "refactor(food): extract MapLegend.vue

The map-marker-icon legend dialog, moved out of FoodPage.vue and
converted to <script setup> using defineModel for dialog visibility.
Fully static - no store access, no props beyond visibility. Image
paths adjusted from ../../public/... to ../../../public/... since
this file is one directory deeper than FoodPage.vue was."
```

---

## Task 3: Create `src/components/food/RestaurantSidebar.vue`

**Files:**
- Create: `src/components/food/RestaurantSidebar.vue`

**Interfaces:**
- Consumes props: `modelValue` (Boolean, via `defineModel`), `marker` (Object or null — the restaurant currently shown).
- Emits: none beyond the implicit `update:modelValue`.

- [ ] **Step 1: Create the file**

```vue
<template>
  <div
    v-if="isOpen"
    class="custom-sidebar"
    :class="{ 'sidebar-open': isOpen }"
  >
    <div class="sidebar-name">
      <div v-if="marker">
        <div class="text-h5">{{ marker.name }}</div>
        <div v-if="marker.openingHours">
          <div class="text-h6">營業時間:</div>
          <div
            v-for="(hours, day) in translateDays(marker.openingHours)"
            :key="day"
            :class="{ 'today-hours': isToday(day) }"
            class="day-info"
          >
            <div class="day-hours-line">
              <span class="day-label">{{ day }}</span>
              <span class="hours-info">{{ hours.split(",")[0].trim() }}</span>
            </div>
            <template v-for="(section, index) in hours.split(',')" :key="index">
              <div v-if="index > 0" class="additional-hours">
                {{ section.trim() }}
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <q-btn
      :icon="isFavorite(marker) ? 'favorite' : 'favorite_border'"
      flat
      round
      color="red"
      class="favorite-btn"
      @click="toggleFavorite(marker)"
    />
    <q-btn
      icon="close"
      flat
      round
      color="grey-8"
      class="close-btn"
      @click="isOpen = false"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { translateDays } from "../../composables/useRestaurantHours";

defineProps({
  marker: { type: Object, default: null },
});

const isOpen = defineModel({ type: Boolean, default: false });

const store = useStore();

const favoriteRestaurants = computed(
  () => store.getters.getFavoriteRestaurants
);

const isToday = (day) => {
  const today = new Date().toLocaleDateString("zh-TW", { weekday: "long" });
  return day === today;
};

const toggleFavorite = (restaurant) => {
  const index = favoriteRestaurants.value.findIndex(
    (r) => r.name === restaurant.name
  );
  if (index === -1) {
    favoriteRestaurants.value.push(restaurant);
    store.dispatch("addFavoriteRestaurant", restaurant);
  } else {
    favoriteRestaurants.value.splice(index, 1);
    store.dispatch("removeFavoriteRestaurant", restaurant.name);
  }
};

const isFavorite = (restaurant) => {
  return favoriteRestaurants.value.some((r) => r.name === restaurant.name);
};
</script>

<style scoped>
.day-info {
  margin-bottom: 10px;
  margin-left: 20px;
}

.day-hours-line {
  display: flex;
  align-items: baseline;
}

.day-label {
  width: 4em; /* Adjust this value to align all hours properly */
  flex-shrink: 0;
}

.hours-info {
  margin-left: 1em;
}

.additional-hours {
  margin-left: 5em; /* This should match the width of .day-label + .hours-info margin-left */
}

.today-hours {
  font-weight: bold;
  color: #2196f3;
}

.custom-sidebar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  transform: translateY(100%);
  transition: transform 0.3s ease-out;
  z-index: 1000;
  height: 37vh; /* Increased height to 70% of viewport height */
}

.sidebar-open {
  transform: translateY(0);
}

.sidebar-name {
  padding: 20px;
  height: calc(100% - 60px); /* Adjust for padding */
  overflow-y: auto;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.favorite-btn {
  position: absolute;
  top: 10px;
  right: 50px; /* Adjust this value to position it next to the close button */
}
</style>
```

**Note:** `toggleFavorite` mutates the array returned by the `favoriteRestaurants` computed directly (`.push()`/`.splice()`) rather than through a Vuex mutation — this is a pre-existing pattern from the original file, preserved as-is. It still works correctly here because `computed(() => store.getters.getFavoriteRestaurants)` returns the same underlying reactive array from the store no matter which component calls it, so `RestaurantList.vue` (Task 4) independently doing the exact same thing operates on the same shared array.

- [ ] **Step 2: Commit**

```bash
git add src/components/food/RestaurantSidebar.vue
git commit -m "refactor(food): extract RestaurantSidebar.vue

The bottom-sheet restaurant detail sidebar (name, opening hours
broken down by day, favorite/close buttons), moved out of
FoodPage.vue and converted to <script setup> using defineModel for
visibility and a marker prop for which restaurant to show. Manages
favorites via direct Vuex access (self-contained, same pattern as
Phase 4-C's Settings components) rather than needing that threaded
through props. Drops the parent's closeSidebar function - its only
caller (the close button) moved into this component and now sets
its own model directly."
```

---

## Task 4: Create `src/components/food/RestaurantList.vue`

**Files:**
- Create: `src/components/food/RestaurantList.vue`

**Interfaces:**
- Consumes props: `modelValue` (Boolean, via `defineModel`), `markers` (Array).
- Emits: `show-detail` (payload: the restaurant object) — handled by Task 5's `FoodPage.vue`, which owns `mapRef` and does the pan-to/open-popup work.

- [ ] **Step 1: Create the file**

```vue
<template>
  <q-dialog v-model="isOpen" full-width>
    <q-layout view="Lhh lpR fff" container class="bg-white">
      <q-header elevated class="bg-primary text-white">
        <q-toolbar>
          <q-toolbar-title>餐廳列表</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
      </q-header>

      <q-page-container>
        <q-page class="q-pa-md">
          <q-list separator>
            <q-item v-for="restaurant in markers" :key="restaurant.name">
              <q-item-section>
                <q-item-label>{{ restaurant.name }}</q-item-label>
                <q-item-label caption>
                  今日營業: {{ restaurant.openingHours[getCurrentDay()] }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  :icon="
                    isFavorite(restaurant) ? 'favorite' : 'favorite_border'
                  "
                  flat
                  round
                  color="red"
                  @click="toggleFavorite(restaurant)"
                />
              </q-item-section>
              <q-item-section side>
                <q-btn
                  label="詳細資訊"
                  color="primary"
                  flat
                  @click="$emit('show-detail', restaurant)"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-dialog>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { getCurrentDay } from "../../composables/useRestaurantHours";

defineProps({
  markers: { type: Array, required: true },
});

defineEmits(["show-detail"]);

const isOpen = defineModel({ type: Boolean, default: false });

const store = useStore();

const favoriteRestaurants = computed(
  () => store.getters.getFavoriteRestaurants
);

const toggleFavorite = (restaurant) => {
  const index = favoriteRestaurants.value.findIndex(
    (r) => r.name === restaurant.name
  );
  if (index === -1) {
    favoriteRestaurants.value.push(restaurant);
    store.dispatch("addFavoriteRestaurant", restaurant);
  } else {
    favoriteRestaurants.value.splice(index, 1);
    store.dispatch("removeFavoriteRestaurant", restaurant.name);
  }
};

const isFavorite = (restaurant) => {
  return favoriteRestaurants.value.some((r) => r.name === restaurant.name);
};
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/food/RestaurantList.vue
git commit -m "refactor(food): extract RestaurantList.vue

The full-screen restaurant list dialog, moved out of FoodPage.vue and
converted to <script setup> using defineModel for visibility.
Manages favorites via direct Vuex access, same as
RestaurantSidebar.vue. Emits show-detail so the parent (which owns
mapRef) can pan the map to the selected restaurant and open its
popup - that map-manipulation logic can't move into this component
since it doesn't have access to the map instance."
```

---

## Task 5: Rewrite `src/pages/FoodPage.vue`

**Files:**
- Modify: `src/pages/FoodPage.vue` (684 lines → ~230 lines)

**Interfaces:**
- Consumes: `MapLegend`, `RestaurantSidebar`, `RestaurantList` (Tasks 2-4) as components; `getMarkerIcon`, `getIconType`, `isOpen` (aliased `isRestaurantOpen` to avoid clashing with the `isOpen` naming convention used elsewhere — see note below), `getCurrentDay` from `useRestaurantHours` (Task 1).

- [ ] **Step 1: Replace the entire file**

```vue
<template>
  <div>
    <q-page class="flex column relative-position">
      <!-- Loading overlay -->
      <div v-if="isLoading" class="loading-overlay flex flex-center">
        <q-spinner size="70px" color="primary" />
        <div class="q-mt-sm text-primary">讀取資料中...</div>
      </div>

      <div v-else-if="error" class="error-message q-pa-md">{{ error }}</div>

      <div v-else>
        <div class="map-controls-1 q-pa-md">
          <q-btn
            color="primary"
            label="畫面顯示列表"
            @click="showRestaurantList = true"
            class="q-mr-sm"
          />
          <q-checkbox
            v-model="hideClosedRestaurants"
            label="正在營業"
            class="q-mr-md"
          />
          <q-checkbox v-model="showOnlyFavorites" label="我的最愛" />
        </div>

        <div class="map-controls-2 q-pa-md">
          <q-btn color="primary" icon="info" @click="showLegend = true" />
          <q-btn
            color="primary"
            label="隨機選擇餐廳"
            outline
            @click="selectRandomRestaurant"
            class="q-ml-sm"
          />
        </div>

        <l-map
          ref="mapRef"
          style="height: 90vh; width: 100%"
          :zoom="16"
          :center="[25.031204, 121.515496]"
          :options="mapOptions"
        >
          <l-tile-layer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          ></l-tile-layer>
          <l-marker :lat-lng="[25.03079, 121.51227]" :icon="ckIcon">
            <l-popup><div class="text-h6">建中</div></l-popup>
          </l-marker>
          <l-marker
            v-for="marker in markers"
            :key="marker.name"
            :lat-lng="marker.position"
            :icon="getMarkerIcon(marker)"
            @click="showSidebarAndDisplayIconType(marker)"
          >
            <l-popup :options="{ offset: new Point(0, -10) }">
              <div class="text-h6">{{ marker.name }}</div>
              <div class="today-hours">
                今日時間&nbsp;
                <template
                  v-for="(section, index) in marker.openingHours[
                    getCurrentDay()
                  ].split(',')"
                  :key="index"
                >
                  <span v-if="index === 0">{{ section.trim() }}</span>
                  <div v-else class="additional-hours-popup">
                    {{ section.trim() }}
                  </div>
                </template>
              </div>
            </l-popup>
          </l-marker>
        </l-map>

        <restaurant-sidebar v-model="sidebarOpen" :marker="selectedMarker" />

        <map-legend v-model="showLegend" />

        <restaurant-list
          v-model="showRestaurantList"
          :markers="markers"
          @show-detail="showSidebarFromList"
        />
      </div>
    </q-page>
  </div>
</template>

<script setup>
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import { onMounted, computed, ref } from "vue";
import { Icon, Point } from "leaflet";
import L from "leaflet";
import { useQuasar } from "quasar";
import restaurantDataLocal from "../data/restaurantData.json";
import MapLegend from "../components/food/MapLegend.vue";
import RestaurantSidebar from "../components/food/RestaurantSidebar.vue";
import RestaurantList from "../components/food/RestaurantList.vue";
import {
  getMarkerIcon,
  getIconType,
  isOpen as isRestaurantOpen,
  getCurrentDay,
} from "../composables/useRestaurantHours";

const $q = useQuasar();

const mapRef = ref(null);
const hideClosedRestaurants = ref(false);
const showLegend = ref(false);
const mapOptions = {
  zoomControl: false,
};

const showOnlyFavorites = ref(false);
const showRestaurantList = ref(false);

const ckIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/CK-APP-Org/Data/main/FoodPage/CK_Logo.png",
  iconSize: [41, 41],
  iconAnchor: [20, 20],
});

const restaurantData = ref([]);
const isLoading = ref(true);
const error = ref(null);

const fetchRestaurantData = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    /*
    // Fetch from GitHub
    const githubResponse = await axios.get(
      "https://raw.githubusercontent.com/CK-APP-Org/Data/main/restaurantData.json"
    );
    const githubData = githubResponse.data;
    */

    // Use local data
    const localData = restaurantDataLocal;

    restaurantData.value = localData;
  } finally {
    isLoading.value = false;
  }
};

const markers = computed(() =>
  restaurantData.value
    .map((marker) => ({
      ...marker,
      isOpen: isRestaurantOpen(marker.openingHours),
    }))
    .filter(
      (marker) =>
        (!hideClosedRestaurants.value || marker.isOpen) &&
        (!showOnlyFavorites.value || isFavorite(marker))
    )
);

const sidebarOpen = ref(false);
const selectedMarker = ref(null);

const showSidebar = (marker) => {
  selectedMarker.value = marker;
  sidebarOpen.value = true;
};

const showSidebarAndDisplayIconType = (marker) => {
  const iconType = getIconType(getMarkerIcon(marker));

  // Optional: Use Quasar notify to show more details
  /*
  $q.notify({
    message: `Marker: ${marker.name}, Icon Type: ${iconType}`,
    color: "info",
    position: "bottom",
  });
  */

  showSidebar(marker);
};

const showSidebarFromList = (restaurant) => {
  showSidebar(restaurant);
  showRestaurantList.value = false;

  // Find the marker for the selected restaurant
  const marker = markers.value.find((m) => m.name === restaurant.name);

  if (marker && mapRef.value) {
    // Pan the map to the marker's position
    mapRef.value.leafletObject.panTo(marker.position);

    // Open the popup
    mapRef.value.leafletObject.eachLayer((layer) => {
      if (
        layer instanceof L.Marker &&
        layer.getLatLng().equals(marker.position)
      ) {
        layer.openPopup();
      }
    });
  }
};

const selectRandomRestaurant = () => {
  const openRestaurants = markers.value.filter((marker) => marker.isOpen);
  if (openRestaurants.length === 0) {
    $q.notify({
      color: "negative",
      message: "目前沒有營業中的餐廳",
      icon: "warning",
    });
    return;
  }

  const randomRestaurant =
    openRestaurants[Math.floor(Math.random() * openRestaurants.length)];
  showSidebar(randomRestaurant);

  if (mapRef.value) {
    mapRef.value.leafletObject.setView(randomRestaurant.position, 18);
    mapRef.value.leafletObject.eachLayer((layer) => {
      if (
        layer instanceof L.Marker &&
        layer.getLatLng().equals(randomRestaurant.position)
      ) {
        layer.openPopup();
      }
    });
  }

  $q.notify({
    color: "positive",
    message: `已為您選擇: ${randomRestaurant.name}`,
    icon: "restaurant",
  });
};

onMounted(() => {
  fetchRestaurantData();
});
</script>

<style scoped>
.today-hours {
  font-weight: bold;
  color: #2196f3;
}

.additional-hours-popup {
  margin-left: 4.5em;
}

.ml-4 {
  margin-left: 3.5em;
  padding-left: 0.5em;
}

.map-controls-1 {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2000;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  padding: 10px;
}

.map-controls-2 {
  position: absolute;
  bottom: 140px;
  right: 4px;
  z-index: 2000;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  padding: 10px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1000;
  flex-direction: column;
}

.error-message {
  color: #ff5252;
  font-weight: bold;
}
</style>
```

**Note on `isFavorite` inside `markers`:** the `markers` computed's filter calls `isFavorite(marker)` — but `isFavorite` now lives inside `RestaurantSidebar.vue`/`RestaurantList.vue`, not the parent! Looking at the original more closely: this was **already relying on `isFavorite` being defined later in the same `setup()` scope** (hoisting-independent, since it's a `const` arrow function — this only worked in the original because `const isFavorite = ...` was declared above `markers`' definition in the file, at module-evaluation order, not because of function hoisting). Since `isFavorite` doesn't exist in the parent anymore, `markers`' filter step needs its own copy. Add this to the parent (it's a 3-line, store-dependent function — same self-contained pattern as the two new components):
```js
const favoriteRestaurants = computed(
  () => store.getters.getFavoriteRestaurants
);

const isFavorite = (restaurant) => {
  return favoriteRestaurants.value.some((r) => r.name === restaurant.name);
};
```
This needs `useStore` imported and called in the parent too (`import { useStore } from "vuex"; const store = useStore();`), which the replacement content above does not yet show — **add these three additions** (the `favoriteRestaurants` computed, the `isFavorite` function, and the `useStore` import/call) to the script block above before running it. This was found by re-tracing every caller of `isFavorite` before finalizing this plan, rather than assuming the extraction's prop/emit boundaries covered every use.

- [ ] **Step 2: Commit**

```bash
git add src/pages/FoodPage.vue
git commit -m "refactor(food): wire FoodPage.vue to the new composable and components

FoodPage.vue drops from 684 to ~250 lines. It now owns only the map
itself (mapRef and everything that manipulates it), the top control
buttons, and data-fetching, rendering MapLegend/RestaurantSidebar/
RestaurantList and importing pure functions from
useRestaurantHours.js. Keeps its own small isFavorite/
favoriteRestaurants, since the markers computed's filter step still
needs it directly (isFavorite the UI-level toggle logic now lives
independently in the two extracted components). This completes the
Food split and all of Phase 4 (docs/refactoring-plan.md)."
```

---

## Task 6: Verify and smoke-test

- [ ] **Step 1: Confirm no leftover references to moved-away names in FoodPage.vue**

```bash
grep -n "toggleFavorite\|translateDays\|isToday\b" src/pages/FoodPage.vue
```
Expected: no output.

- [ ] **Step 2: Lint**

```bash
yarn lint
```
Expected: exit 0.

- [ ] **Step 3: Force-compile every new/changed file through the dev server**

```bash
yarn dev &
# wait for "App URL" in the log, then:
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:9000/src/pages/FoodPage.vue
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:9000/src/composables/useRestaurantHours.js
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:9000/src/components/food/MapLegend.vue
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:9000/src/components/food/RestaurantSidebar.vue
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:9000/src/components/food/RestaurantList.vue
```
Expected: `200` for all five.

- [ ] **Step 4: Interactive smoke-test (ask the project owner to check this manually)**

At `/#/food`, confirm:
- No console errors on load; the map renders with the 建中 marker and restaurant markers.
- Click a restaurant marker: the sidebar slides up with correct name/hours; close it.
- "畫面顯示列表" opens the full restaurant list; "詳細資訊" on an item closes the list, pans the map to that restaurant, and opens its popup (**the one thing most likely to break**, since it crosses the `RestaurantList` → parent → `mapRef` boundary via the `show-detail` emit).
- Favorite-toggle a restaurant from both the sidebar and the list; confirm "我的最愛" checkbox filtering reflects it in both places.
- "正在營業" checkbox filters to open restaurants only.
- Legend button (ℹ️) opens the legend dialog with all 4 icons visibly correct (this checks the `../../../public/...` path fix from Task 2).
- "隨機選擇餐廳" selects an open restaurant, pans/zooms the map to it, opens its popup, and shows the sidebar.

---

## Task 7: Decision doc

**Files:**
- Create: `docs/decisions/phase-4-component-splitting/task-4-food.md`

Follow the established pattern. Natural concept-explainer subject for this one: the asset-path depth bug (deviation item 1) — a good illustration of why "just copy the string" isn't always safe when moving a file to a different directory depth, even under a "pure code motion" refactor.

- [ ] **Step 1: Write the doc**

- [ ] **Step 2: Commit**

```bash
git add docs/decisions/phase-4-component-splitting/task-4-food.md
git commit -m "docs: add beginner-friendly Task 4 decision doc for Phase 4 (Food)"
```

---

## Task 8: Open the PR for all of Phase 4

Only after Tasks 1-7 above are committed and the interactive smoke test (Task 6, Step 4) has passed.

- [ ] **Step 1: Push the branch**

```bash
git push -u origin refactor/phase-4-component-splitting
```

- [ ] **Step 2: Open the PR**

```bash
gh pr create --title "Refactor: Phase 4 — component splitting (Transport, Todo, Settings, Food)" --body "$(cat <<'EOF'
## Summary
- **Transport** (docs/decisions/phase-4-component-splitting/task-1-transport.md): TransportPage.vue 1742 -> ~85 lines. Extracted YoubikeSection.vue, MetroSection.vue, useYoubike.js composable. Split the combined YouBike/Metro polling interval into two independent ones per component, per the original plan.
- **Todo** (task-2-todo.md): TodoPage.vue 1393 -> ~140 lines. Extracted CalendarView.vue, TodoListView.vue, EventDialog.vue, TodoDialog.vue. Also fixes the pre-existing Options/Composition API mixing bug (now pure <script setup>).
- **Settings** (task-3-settings.md): SettingsPage.vue 339 -> ~180 lines. Extracted HomeWidgetSettings.vue, ToolbarCustomiser.vue.
- **Food** (task-4-food.md): FoodPage.vue 684 -> ~250 lines. Extracted useRestaurantHours.js composable, MapLegend.vue, RestaurantSidebar.vue, RestaurantList.vue.
- All new components use <script setup>; cross-component dialog triggering uses either defineExpose+template-refs (when the child owns complex state, e.g. Transport's FAB) or defineModel (when it's simple visibility, e.g. every dialog added from Todo onward).
- isWithinMinutes' known time-overflow bug (closing times past 24:00) is intentionally NOT fixed here - that's Phase 6-B, which this phase's plan explicitly deferred to.

## Test plan
- [x] yarn lint passes after every commit
- [x] Every new/changed file force-compiled with HTTP 200 via the Vite dev server after each sub-phase (no headless-browser tool available in this environment for a full build check)
- [x] Manual interactive smoke test performed by the project owner for all four sub-phases at their respective dev server URLs - see each sub-phase's decision doc for the specific checklist
- [x] An automated whitespace-normalized diff against each file's pre-split git history was run for every sub-phase, to catch content drops/typos beyond what lint or compilation would catch (this caught one real bug: a copy-paste typo in Transport's SOAP XML, fixed before that commit)
EOF
)"
```

---

## Self-Review Notes

- **Spec coverage:** `docs/refactoring-plan.md` Phase 4-D's three named components (`RestaurantSidebar.vue`, `RestaurantList.vue`, `MapLegend.vue`) and composable (`useRestaurantHours.js`, with its 5 named exports) are all implemented.
- **Placeholder scan:** No TBD/TODO. Full content given for all four new files and the rewritten parent.
- **Type/name consistency:** Cross-checked `show-detail` emit name and payload shape against the parent's `@show-detail="showSidebarFromList"` handler; cross-checked `isOpen`/`marker` prop names against the parent's `v-model="sidebarOpen"` / `:marker="selectedMarker"` bindings.
- **Caught during self-review, not initially:** `isFavorite`'s continued need inside the parent's `markers` computed (see Task 5's inline note) — found by re-tracing every call site of `isFavorite` in the original file rather than assuming the three-component extraction covered all of them.
- **This is the last Phase 4 sub-phase** — Task 8 opens the PR covering all 16 commits across Transport/Todo/Settings/Food.
