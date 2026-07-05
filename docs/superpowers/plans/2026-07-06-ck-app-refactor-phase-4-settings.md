# CK App Refactor — Phase 4-C (SettingsPage.vue Split) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task (inline execution — this repo's current preference). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `src/pages/SettingsPage.vue` (339 lines — much smaller than `docs/refactoring-plan.md`'s original ~600-line estimate, since Phase 3 already cut more than expected) into a smaller parent plus two self-contained dialog components (`HomeWidgetSettings.vue`, `ToolbarCustomiser.vue`), per Phase 4-C.

**Architecture:** Both new components are fully self-contained — each talks to the Vuex store directly (via `useStore()`) for its own toggles/reordering, exactly like the settings card items already did before this split. Neither needs any prop beyond dialog visibility, so each uses `defineModel()` (the same pattern established in Phase 4-B) as its only prop/emit. `SettingsPage.vue` keeps the "設定" card, both confirm dialogs (clear-data, class-change), and simply renders the two new components with `v-model` bound to its own `showHomeSettings`/`showToolbarSettings` refs — it doesn't need template refs or `defineExpose` here (unlike Phase 4-A/4-B), since there's no cross-component action to trigger beyond opening/closing.

**Tech Stack:** Quasar 2 / Vue 3.5 `<script setup>` (including `defineModel`), Vuex 4.

## Global Constraints

- No `[deploy]` prefix in any commit message. No Claude/Anthropic attribution in any commit message or PR description (standing rule for this repo).
- This is **sub-phase 3 of 4** in Phase 4 (Transport ✅ → Todo ✅ → Settings → Food). Lands as commits on the existing `refactor/phase-4-component-splitting` branch — **do not open a PR at the end of this plan.**
- Pure code motion. Every function body below is copied verbatim from the current file (verified by direct read on 2026-07-06, current HEAD of this branch).

## Noted deviations from a pure line-for-line move

1. **`SettingsPage.vue` itself converts from `<script>` + `export default { setup() {...} }` to `<script setup>`.** This wasn't mixing Options/Composition API like `TodoPage.vue` was (Phase 4-C's plan doesn't call this out the way 4-B's did) — it's a same-paradigm sugar conversion, done here purely for consistency with the other three Phase 4 parents (`TransportPage.vue`, `TodoPage.vue`), which are now all `<script setup>`.
2. **`themeColor`/`themeColors` stay in the parent, unused.** Neither is referenced anywhere in the current template (the one thing that would have used `themeColor` — a `watch` that applies it to `document.body.style` — is already commented out in the current file). They don't belong to either extracted dialog, so moving them anywhere would be arbitrary; they're left exactly where they already were. Not in scope to clean up in this phase.
3. **`.custom-menu-item` CSS stays in the parent, unused.** Confirmed via grep that no element in the current template (before or after this split) has this class. Same reasoning as item 2 — genuinely orphaned, not moved.

---

## Task 1: Create `src/components/settings/HomeWidgetSettings.vue`

**Files:**
- Create: `src/components/settings/HomeWidgetSettings.vue`

**Interfaces:**
- Consumes props: `modelValue` (Boolean, dialog visibility, via `defineModel`).
- Emits: none beyond the implicit `update:modelValue`.

- [ ] **Step 1: Create the file**

```vue
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/settings/HomeWidgetSettings.vue
git commit -m "refactor(settings): extract HomeWidgetSettings.vue

The three home-widget toggles (schedule/todo/school-news) dialog,
moved verbatim out of SettingsPage.vue and converted to
<script setup> using defineModel for dialog visibility. Fully
self-contained - reads/writes the Vuex store directly, same as it
did before this split.

SettingsPage.vue is not updated to use this yet."
```

---

## Task 2: Create `src/components/settings/ToolbarCustomiser.vue`

**Files:**
- Create: `src/components/settings/ToolbarCustomiser.vue`

**Interfaces:**
- Consumes props: `modelValue` (Boolean, via `defineModel`).
- Emits: none beyond the implicit `update:modelValue`.

- [ ] **Step 1: Create the file**

```vue
<template>
  <q-dialog v-model="isOpen">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">自訂工具列</div>
      </q-card-section>
      <q-card-section>
        <q-list separator>
          <q-item v-for="(item, index) in menuItems" :key="index">
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
            <q-item-section side>
              <q-toggle
                v-if="!item.fixed"
                v-model="item.visible"
                @update:model-value="(val) => toggleVisibility(index, val)"
                :disable="item.fixed"
              />
            </q-item-section>
            <q-item-section side>
              <q-btn-group flat>
                <q-btn
                  flat
                  dense
                  round
                  icon="arrow_upward"
                  @click="moveItem(index, -1)"
                  :disable="index === 0"
                />
                <q-btn
                  flat
                  dense
                  round
                  icon="arrow_downward"
                  @click="moveItem(index, 1)"
                  :disable="index === menuItems.length - 1"
                />
              </q-btn-group>
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

const menuItems = computed({
  get: () => store.getters.getMenuItems,
  set: (newItems) => store.dispatch("updateMenuItems", newItems),
});

const toggleVisibility = (index, newValue) => {
  store.dispatch("toggleMenuItemVisibility", { index, newValue });
};

const moveItem = (index, direction) => {
  const newItems = [...menuItems.value];
  const item = newItems.splice(index, 1)[0];
  newItems.splice(index + direction, 0, item);
  store.dispatch("updateMenuItems", newItems);
};
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/settings/ToolbarCustomiser.vue
git commit -m "refactor(settings): extract ToolbarCustomiser.vue

The toolbar reorder/visibility-toggle dialog, moved verbatim out of
SettingsPage.vue and converted to <script setup> using defineModel
for dialog visibility. Fully self-contained - reads/writes the Vuex
store directly, same as it did before this split.

SettingsPage.vue is not updated to use this yet."
```

---

## Task 3: Rewrite `src/pages/SettingsPage.vue`

**Files:**
- Modify: `src/pages/SettingsPage.vue` (339 lines → ~180 lines)

**Interfaces:**
- Consumes: `HomeWidgetSettings`, `ToolbarCustomiser` (Tasks 1-2) as components, each bound with a simple `v-model`.

- [ ] **Step 1: Replace the entire file**

```vue
<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6 col-md-4">
        <!-- Settings Cards -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">設定</div>
            <q-list>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="school" />
                </q-item-section>
                <q-item-section>
                  <q-select
                    disable
                    filled
                    @update:model-value="confirmClassChange"
                    :options="classOptions"
                    v-model="selectedClass"
                    label="選擇班級(用於課表資料匯入)"
                    style="padding: 8px 0"
                  />
                </q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="showHomeSettings = true">
                <q-item-section avatar>
                  <q-icon name="home" />
                </q-item-section>
                <q-item-section>首頁顯示項目設定</q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" />
                </q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="showToolbarSettings = true">
                <q-item-section avatar>
                  <q-icon name="build" />
                </q-item-section>
                <q-item-section>自訂工具列</q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <home-widget-settings v-model="showHomeSettings" />
    <toolbar-customiser v-model="showToolbarSettings" />

    <q-dialog v-model="confirmDialog">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">確定清除所有本地資料?注意，此動作無法復原</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn
            flat
            label="確定"
            color="negative"
            @click="clearAllData"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmClassChangeDialog">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm" style="font-size: 1.5rem"
            >確定更改班級為 <strong>{{ selectedClass }}</strong
            >?</span
          >
          <span class="q-ml-sm"
            >(請注意，本動作會導致所有過去自訂的顏色和標籤全部消失並無法復原)</span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" @click="cancelClassChange" />
          <q-btn flat label="確定" color="primary" @click="updateUserClass" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import HomeWidgetSettings from "../components/settings/HomeWidgetSettings.vue";
import ToolbarCustomiser from "../components/settings/ToolbarCustomiser.vue";

const classOptions = [
  101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115,
  116, 117, 118, 119, 120, 121, 122, 123, 125, 126, 127, 128, 201, 202, 203,
  204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218,
  219, 220, 221, 222, 223, 225, 226, 227, 328, 301, 302, 303, 304, 305, 306,
  307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321,
  322, 323, 325, 326, 327, 328,
];

const themeColors = [
  { label: "藍色", value: "#1976D2" },
  { label: "紅色", value: "#C10015" },
  { label: "綠色", value: "#4CAF50" },
  { label: "紫色", value: "#9C27B0" },
  { label: "橙色", value: "#FF9800" },
];

const $q = useQuasar();
const store = useStore();
const confirmDialog = ref(false);
const confirmClassChangeDialog = ref(false);
const userClass = computed(() => store.getters.getUserClass);
const selectedClass = ref(userClass.value);

const router = useRouter();

const showHomeSettings = ref(false);
const showToolbarSettings = ref(false);

// Theme color
const themeColor = ref("#1976D2"); // Default to blue

// Watch for theme color changes and apply them
/*
watch(
  themeColor,
  (newColor) => {
    $q.dark.set(false); // Ensure light mode is active
    document.body.style.setProperty("--q-primary", newColor);
  },
  { immediate: true }
);
*/

const confirmClear = () => {
  confirmDialog.value = true;
};

const clearAllData = () => {
  store.dispatch("clearALL");
  store.dispatch("loadSchedule");
  $q.notify({
    message: `已刪除所有資料`,
    color: "positive",
    position: "bottom",
    timeout: 2000,
  });
  router.push("/");
};

const confirmClassChange = (newClass) => {
  selectedClass.value = newClass;
  confirmClassChangeDialog.value = true;
};

const updateUserClass = () => {
  store.dispatch("setUserClass", selectedClass.value);
  store.dispatch("loadSchedule");
  confirmClassChangeDialog.value = false;

  $q.notify({
    message: `已成功更改班級為 ${selectedClass.value}`,
    color: "positive",
    position: "bottom",
    timeout: 2000,
  });
};

const cancelClassChange = () => {
  selectedClass.value = userClass.value;
  confirmClassChangeDialog.value = false;
};
</script>

<style scoped>
.custom-menu-item {
  padding: 8px 16px;
}
.custom-menu-item .q-item__section--side {
  padding-right: 0;
}
.custom-menu-item .q-item__section--avatar {
  min-width: 40px;
}
</style>
```

**Note:** `confirmClear` is kept even though nothing in the current template calls it (confirmed by grep — same pre-existing dead-but-harmless status as `themeColor`/`themeColors`; not in scope to remove here). `showHomeSettings = true`/`showToolbarSettings = true` (used directly in the two `q-item`'s `@click` handlers) still work exactly as before: they're plain refs owned by the parent, and `v-model` on `<home-widget-settings>`/`<toolbar-customiser>` reads/writes the same refs.

- [ ] **Step 2: Commit**

```bash
git add src/pages/SettingsPage.vue
git commit -m "refactor(settings): wire SettingsPage.vue to the two new components

SettingsPage.vue drops from 339 to ~180 lines and moves to
<script setup> (a same-paradigm sugar conversion for consistency with
the other three Phase 4 parents - this file wasn't mixing Options/
Composition API the way TodoPage.vue was). It now owns only the
settings card, the two confirm dialogs (clear-data, class-change),
and the two new dialogs' visibility, wiring HomeWidgetSettings/
ToolbarCustomiser in via simple v-model bindings. This completes the
Settings split (Phase 4-C)."
```

---

## Task 4: Verify and smoke-test

- [ ] **Step 1: Confirm no leftover references to moved-away names in SettingsPage.vue**

```bash
grep -n "showSchedule\|showTodo\b\|showSchoolNews\|menuItems\|toggleVisibility\|moveItem" src/pages/SettingsPage.vue
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
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:9000/src/pages/SettingsPage.vue
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:9000/src/components/settings/HomeWidgetSettings.vue
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:9000/src/components/settings/ToolbarCustomiser.vue
```
Expected: `200` for all three.

- [ ] **Step 4: Interactive smoke-test (ask the project owner to check this manually)**

At `/#/settings`, confirm:
- No console errors on load.
- "首頁顯示項目設定" opens the home-widget dialog; toggling any of the 3 switches immediately reflects on the Home page (check by navigating to `/#/` after toggling).
- "自訂工具列" opens the toolbar dialog; reordering items with the up/down arrows and toggling visibility both persist (check that the app's toolbar/menu reflects the change).
- Class selection still opens its confirm dialog and updates correctly; "清除所有本地資料" (if reachable from this page) still works.

---

## Task 5: Decision doc

**Files:**
- Create: `docs/decisions/phase-4-component-splitting/task-3-settings.md`

Follow the established pattern: "What changed" → "Why this is safe" → a short concept note (this task's natural subject: why these two new components needed *no* props at all beyond dialog visibility — because they talk to the Vuex store directly rather than being handed data through props, which is a valid and simpler alternative to prop-drilling when a component's data already lives in global state) → "Verification performed."

- [ ] **Step 1: Write the doc**

- [ ] **Step 2: Commit**

```bash
git add docs/decisions/phase-4-component-splitting/task-3-settings.md
git commit -m "docs: add beginner-friendly Task 3 decision doc for Phase 4 (Settings)"
```

---

## Self-Review Notes

- **Spec coverage:** `docs/refactoring-plan.md` Phase 4-C's two named components (`HomeWidgetSettings.vue`, `ToolbarCustomiser.vue`) are both implemented.
- **Placeholder scan:** No TBD/TODO. Full content given for both new files and the rewritten parent.
- **Type/name consistency:** Both new components' only prop (`modelValue` via `defineModel`) is bound identically (`v-model="showHomeSettings"` / `v-model="showToolbarSettings"`) in the parent template.
- **Next sub-phase:** Phase 4-D (`FoodPage.vue`) gets its own plan document, written after this one is executed and committed — the last sub-phase of Phase 4, after which the whole branch's PR opens.
