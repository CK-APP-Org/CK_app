# CK App Refactor — Phase 3 (Remove Dead Login/Account Feature) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete the dead admin-login/backup/import feature entirely — `LoginPage.vue`, the `/login` route, the `account` Vuex module, all login/backup/import UI and logic inside `SettingsPage.vue`, the dead `isLogin`/`admins` remnants in `HomePage.vue` — and then remove the `firebase` npm dependency and its two now-fully-unused boot/config files, since this feature was the last live consumer of Firebase in the app.

**Architecture:** Deletion-only work across 6 files plus a dependency removal. No new abstractions. The trickiest file is `SettingsPage.vue` (975 lines), which mixes this dead feature with several actively-used settings features in the same `setup()` function — Task 2 is scoped narrowly to avoid touching anything still in use.

**Tech Stack:** Quasar 2 / Vue 3, Vuex 4, Vue Router 4, yarn.

## Global Constraints

- No `[deploy]` prefix in any commit message. No Claude/Anthropic attribution in any commit message or PR description (standing rule for this repo).
- This is a **confirmed product decision**, not a tentative cleanup: the login/account feature is being deleted, not fixed or preserved. (Decided during the brainstorming phase of this refactor, 2026-07-03.)
- Every deletion in this plan was verified against the actual current file content (post Phase 0/1/2 merge) before this plan was written — every "before" snippet quoted below is exact, not reconstructed from memory or an older audit.
- Task 2 (SettingsPage.vue) must NOT touch: class selection, clear-data, home-widget toggles, toolbar customization, or theme-color code — all confirmed still in active use and explicitly out of scope.

## Deviation from `docs/refactoring-plan.md` as written

The original Phase 3 write-up didn't anticipate that removing this feature would make **all of Firebase** dead code. Investigation for this plan found:
- `src/boot/firebase.js` is already **not** in `quasar.config.js`'s `boot: [...]` array (`boot: ["i18n", "axios"]`) — it has never been loaded by the running app, regardless of this refactor.
- The root `CK_app/firebase.js` is not imported by anything under `src/`.
- After this phase's deletions, a repo-wide check confirms zero remaining imports of `firebase/*` anywhere in `src/`.

This plan adds a Task 4 (not in the original Phase 3 write-up) to remove the now-fully-dead `firebase` npm dependency and both of these files, since leaving them would just be new dead weight this same phase created.

---

## Task 1: Delete `LoginPage.vue`, the `/login` route, and the `account` Vuex module

**Files:**
- Delete: `CK_app/src/pages/LoginPage.vue` (whole file, 324 lines)
- Delete: `CK_app/src/store/modules/account.js` (whole file, 39 lines)
- Modify: `CK_app/src/router/routes.js:65-69`
- Modify: `CK_app/src/store/index.js:7` and `:18`

**Interfaces:**
- Consumes: nothing from another task.
- Produces: nothing another task needs — Task 2 removes the callers of this module's getters/actions independently (verified below that nothing outside the files this plan touches references the account module).

**Verified before starting:** a repo-wide grep for `getUserAccount|getPassword|getEmail\b|setUserAccount|setUserEmail|setUserPassword|SET_USER_ACCOUNT|SET_USER_EMAIL|SET_USER_PASSWORD` across `CK_app/src/` returns matches only in `SettingsPage.vue`, `HomePage.vue`, `LoginPage.vue`, and `account.js` itself — the four files this plan touches (Tasks 1-3). Nothing else in the codebase depends on this module.

- [ ] **Step 1: Delete `LoginPage.vue`**

```bash
git rm CK_app/src/pages/LoginPage.vue
```

- [ ] **Step 2: Delete `account.js`**

```bash
git rm CK_app/src/store/modules/account.js
```

- [ ] **Step 3: Remove the `/login` route from `CK_app/src/router/routes.js`**

Change:
```js
  //New---------------
  {
    path: "/login",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/LoginPage.vue") }],
  },
  {
    path: "/help",
```
to:
```js
  //New---------------
  {
    path: "/help",
```
(Keep the `//New---------------` / `//to here-----------` comment markers around the `/help` and commented-out `/metro` entries — they're an unrelated grouping, not part of this deletion.)

- [ ] **Step 4: Remove the `account` module from `CK_app/src/store/index.js`**

Change:
```js
import { createStore } from "vuex";
import youbikeModule from "./modules/youbike";
import newsModule from "./modules/news";
import scheduleModule from "./modules/schedule";
import todoModule from "./modules/todo";
import foodModule from "./modules/food";
import accountModule from "./modules/account";
import settingsModule from "./modules/settings";
import metroModule from "./modules/metro";
```
to:
```js
import { createStore } from "vuex";
import youbikeModule from "./modules/youbike";
import newsModule from "./modules/news";
import scheduleModule from "./modules/schedule";
import todoModule from "./modules/todo";
import foodModule from "./modules/food";
import settingsModule from "./modules/settings";
import metroModule from "./modules/metro";
```

Change:
```js
const modules = {
  youbike: youbikeModule,
  news: newsModule,
  schedule: scheduleModule,
  todo: todoModule,
  food: foodModule,
  account: accountModule,
  settings: settingsModule,
  metro: metroModule,
};
```
to:
```js
const modules = {
  youbike: youbikeModule,
  news: newsModule,
  schedule: scheduleModule,
  todo: todoModule,
  food: foodModule,
  settings: settingsModule,
  metro: metroModule,
};
```

Note: `CLEAR_DATA` (later in this same file) resets state via `Object.keys(modules).forEach(...)` — fully generic, no special-cased reference to `account`, so this change needs no follow-up edit there.

- [ ] **Step 5: Verify**

```bash
cd CK_app
grep -rn "LoginPage\|modules/account\|accountModule" src/
```
Expected: no output (confirms no other file still imports either deleted file).

```bash
yarn lint
```
Expected: this will likely FAIL at this point, because `SettingsPage.vue` and `HomePage.vue` still reference things like `router.push("/login")` and `store.getters.getUserAccount` that depend on what you just deleted — that's expected and gets fixed in Tasks 2-3. Run it anyway and note the failures in your report so the reviewer can confirm they're exactly the expected ones (references inside `SettingsPage.vue`/`HomePage.vue` to the now-deleted route/module), not something unrelated.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: delete LoginPage.vue, /login route, and account Vuex module

Part 1 of removing the dead admin-login feature (confirmed product
decision, not a tentative cleanup). SettingsPage.vue and HomePage.vue
still reference the deleted route/module at this point — cleaned up
in the next two commits on this branch."
```

---

## Task 2: Strip the login/backup/import feature out of `SettingsPage.vue`

**Files:**
- Modify: `CK_app/src/pages/SettingsPage.vue` (975 lines → ~700 lines)

**Interfaces:**
- Consumes: nothing from Task 1 directly (this task's edits are independent text changes; combined with Task 1, the file will no longer reference anything deleted).
- Produces: nothing another task needs.

**Explicitly out of scope — do not touch:** the "設定" card and class-selection dropdown, the clear-data confirm dialog and `clearAllData`/`confirmClear`, the class-change confirm dialog and `updateUserClass`/`cancelClassChange`/`confirmClassChange`, the home-widget-settings dialog and `showSchedule`/`showTodo`/`showSchoolNews`, the toolbar-customization dialog and `menuItems`/`toggleVisibility`/`moveItem`/`showToolbarSettings`, `themeColor`/`themeColors`. All of these are active features used elsewhere in this same file and must survive unchanged.

Apply the following edits in order (each is independent; the order given avoids any edit accidentally invalidating a later one's exact-text match).

- [ ] **Step 1: Remove the standalone "登入功能僅供管理員使用" banner**

Change:
```html
<template>
  <q-page class="q-pa-md">
    <div class="custom-banner q-mb-md">
      <q-icon name="warning" color="info" size="sm" class="q-mr-sm" />
      登入功能僅供管理員使用
    </div>
    <div class="row q-col-gutter-md">
```
to:
```html
<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
```

- [ ] **Step 2: Remove the "管理員登入" (Admin Login) card**

Change:
```html
      <div class="col-12 col-sm-6 col-md-4">
        <!-- Account Information Card -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">管理員登入</div>
            <div v-if="isLoggedIn" class="column q-gutter-y-sm">
              <div class="adminbackground row items-center q-gutter-x-md">
                <q-icon name="manage_accounts" size="50px"/>
                <div class="column">
                  <div class="admin-username">{{ userAccount }}</div>
                  <div class="admin-email">{{ email }}</div>
                </div>
              </div>
              <q-btn
                color="negative"
                label="登出"
                @click="logout"
                class="full-width q-mt-md"
              />
            </div>
            <div v-else class="column q-gutter-y-sm">
              <q-btn
                color="primary"
                label="登入"
                @click="goToLoginPage"
                class="full-width q-mt-md"
              />
            </div>
          </q-card-section>
        </q-card>
        <!-- Settings Cards -->
        <q-card class="q-mb-md">
```
to:
```html
      <div class="col-12 col-sm-6 col-md-4">
        <!-- Settings Cards -->
        <q-card class="q-mb-md">
```

- [ ] **Step 3: Remove the three import/backup dialogs**

These sit immediately after the class-change confirm dialog's closing `</q-dialog>` and immediately before the page's closing `</q-page>`. Change:
```html
    </q-dialog>

    <!--<q-dialog v-model="showBackupDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">註冊成功！歡迎您的加入</div>
        </q-card-section>

        <q-card-section>
          現在您可以備份您的帳號資料了。這將幫助您在更換設備或重新安裝CK
          APP時恢復您的資料。
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="稍後再說" v-close-popup />
          <q-btn
            flat
            label="立即備份"
            color="primary"
            @click="initiateBackup"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>-->

    <q-dialog v-model="showImportDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">歡迎回來，{{ userAccount }}！</div>
        </q-card-section>

        <q-card-section>
          您現在可以匯入之前備份的帳號資料。這將恢復您先前保存的所有設定和資訊。
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="稍後再說" v-close-popup />
          <q-btn
            flat
            label="立即匯入"
            color="primary"
            @click="initiateImport"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showImportWarningDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">警告！</div>
        </q-card-section>

        <q-card-section>
          此操作將使用您最近備份的資料替換當前的本地資料。您的本地資料將會被刪除。是否確定要繼續？
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="確定" color="negative" @click="confirmImport" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
```
to:
```html
    </q-dialog>
  </q-page>
</template>
```

- [ ] **Step 4: Remove the Firebase imports and the now-unused `onMounted`/`useRoute` imports**

Change:
```js
import { computed, ref, onMounted } from "vue";
import { useStore } from "vuex";
import { useQuasar } from "quasar";
import { useRouter, useRoute } from "vue-router";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
```
to:
```js
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
```

- [ ] **Step 5: Remove `route`, the local `firebaseConfig`/`app`/`db`, and the login-state refs/computeds**

Change:
```js
    const router = useRouter();
    const route = useRoute();

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

    const isLoggedIn = ref(false);
    const userName = ref("");
    const userEmail = ref("");

    const userAccount = computed(() => store.getters.getUserAccount);
    const password = computed(() => store.getters.getPassword);
    const email = computed(() => store.getters.getEmail);
    const userRef = ref(null);

    const favoriteRestaurants = computed(
```
to:
```js
    const router = useRouter();

    const favoriteRestaurants = computed(
```

- [ ] **Step 6: Remove the 11 backup-only computed wrappers, keeping `showHomeSettings`/`showToolbarSettings` (used by the still-active toolbar/home-widget dialogs)**

Change:
```js
    const favoriteRestaurants = computed(
      () => store.getters.getFavoriteRestaurants
    );

    const pinnedNews = computed(() => store.getters.getPinnedNews);
    const lastClearedTime = computed(() => store.getters.getLastClearedTime);

    const events = computed(() => store.getters.getEvents);
    const eventCategories = computed(() => store.getters.getEventCategories);
    const todos = computed(() => store.getters.getTodos);
    const todoCategories = computed(() => store.getters.getTodoCategories);
    const currentView = computed(() => store.getters.getCurrentView);

    const stationList = computed(() => store.getters.getStationList);

    const scheduleData = computed(() => store.getters.getScheduleData);

    const showHomeSettings = ref(false);
    const showToolbarSettings = ref(false);

    const metroStationList = computed(() => store.getters.getMetroStationList);

    // Theme color
```
to:
```js
    const showHomeSettings = ref(false);
    const showToolbarSettings = ref(false);

    // Theme color
```

**Why these are safe to remove:** each is a thin per-file `computed()` wrapper around a Vuex getter (e.g. `getFavoriteRestaurants`, `getPinnedNews`), used ONLY inside `confirmImport`/`saveData` (both deleted in Step 7) — never in this file's template and never in its `return {}`. The underlying Vuex getters/modules themselves are untouched and keep working for the other pages that use them (Food, News, Todo, Youbike, Metro) — you're only deleting `SettingsPage.vue`'s local, unused-elsewhere copies.

- [ ] **Step 7: Delete `importData`, `confirmImport`, and the five backup/import dialog refs (the large block)**

This block spans from the `importData` declaration through `showImportWarningDialog`'s declaration — it contains `confirmImport`, a ~250-line function that builds a Firebase import flow. Do not reproduce its body; delete the entire span between the two anchors below.

The block starts with (this text stays — it's the end of the still-active `cancelClassChange`, do not delete this part):
```js
    const cancelClassChange = () => {
      selectedClass.value = userClass.value;
      confirmClassChangeDialog.value = false;
    };

    const importData = () => {
```
Everything from `const importData = () => {` through the end of the block below must be deleted — that's `importData` (a 3-line function), then `confirmImport` (an `async` function containing its own local `firebaseConfig`, Firestore reads/writes, and per-module data merging — this is the ~250-line function), then `showBackupDialog`, `initiateBackup`, `showImportDialog`, `initiateImport`, and `showImportWarningDialog`.

The block ends with (this exact line is the LAST line to delete):
```js
    const showImportWarningDialog = ref(false);
```
which is immediately followed by (this text stays — the start of the still-active toolbar feature, do not delete this part):
```js

    const toggleVisibility = (index, newValue) => {
      store.dispatch("toggleMenuItemVisibility", { index, newValue });
    };
```

**How to do this precisely:** open the file, find `const importData = () => {`, and delete every line from there down to and including `const showImportWarningDialog = ref(false);` — do not delete the blank line immediately after it, and do not delete `const toggleVisibility = ...` or anything after it. After deleting, the file should read `cancelClassChange`'s closing `};`, then a blank line, then directly `const toggleVisibility = (index, newValue) => {`.

- [ ] **Step 8: Delete `onMounted`, `saveData`, `logout`, and `goToLoginPage` (the second large block)**

This block starts right after the still-active `moveItem` function and spans through `goToLoginPage`. Again, do not reproduce `saveData`'s ~130-line body — delete the entire span between the anchors.

The text immediately before the block (stays, do not delete):
```js
    const moveItem = (index, direction) => {
      const newItems = [...menuItems.value];
      const item = newItems.splice(index, 1)[0];
      newItems.splice(index + direction, 0, item);
      store.dispatch("updateMenuItems", newItems);
    };

    onMounted(() => {
```
Everything from `onMounted(() => {` through the end of the block must be deleted — that's the `onMounted` callback (which sets `isLoggedIn` and checks `route.query` for `justLoggedIn`/`newAccount`), then `saveData` (the ~130-line Firebase backup function), then `logout`, then `goToLoginPage`.

The last line to delete:
```js
    const goToLoginPage = () => {
      router.push("/login");
    };
```
immediately followed by (stays — the start of the `return {}` object):
```js

    return {
```

**How to do this precisely:** find `onMounted(() => {` (the one right after `moveItem`, NOT any other `onMounted` — there's only one in this file) and delete every line from there down through and including the `goToLoginPage` function's closing `};`. After deleting, the file should read `moveItem`'s closing `};`, then a blank line, then directly `return {`.

- [ ] **Step 9: Remove the 15 deleted names from the `return {}` object**

Change:
```js
    return {
      confirmDialog,
      confirmClassChangeDialog,
      confirmClear,
      clearAllData,
      classOptions,
      confirmClassChange,
      updateUserClass,
      cancelClassChange,
      userClass,
      selectedClass,
      showSchedule,
      showTodo,
      showSchoolNews,
      themeColor,
      themeColors,
      isLoggedIn,
      userName,
      saveData,
      logout,
      goToLoginPage,
      userAccount,
      email,
      password,
      importData,
      showBackupDialog,
      initiateBackup,
      showImportDialog,
      initiateImport,
      showImportWarningDialog,
      confirmImport,
      menuItems,
      toggleVisibility,
      moveItem,
      showHomeSettings,
      showToolbarSettings,
    };
  },
```
to:
```js
    return {
      confirmDialog,
      confirmClassChangeDialog,
      confirmClear,
      clearAllData,
      classOptions,
      confirmClassChange,
      updateUserClass,
      cancelClassChange,
      userClass,
      selectedClass,
      showSchedule,
      showTodo,
      showSchoolNews,
      themeColor,
      themeColors,
      menuItems,
      toggleVisibility,
      moveItem,
      showHomeSettings,
      showToolbarSettings,
    };
  },
```

- [ ] **Step 10: Remove the now-dead CSS for the deleted banner and admin card**

Change:
```css
.custom-banner {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.9em;
  display: flex;
  align-items: center;
}
.adminbackground {
  display: "flex";
  align-items: "center";
  gap: "12px";
  padding: "12px";
  border-radius:  "12px";
  box-shadow: "0 2px 6px rgba(0,0,0,0.1)";
  margin-bottom: 0;
}
.admin-username {
  margin: 0;
  font-weight: bold;
  font-size: 1rem;
  color: #333;
}
.admin-email {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
}
```
to: (delete entirely — nothing replaces it; whatever CSS rule precedes `.custom-banner` in the file should now be immediately followed by the file's closing `</style>` tag, or the next remaining rule, whichever comes next in the original file)

- [ ] **Step 11: Verify**

```bash
cd CK_app
grep -n "isLoggedIn\|isLogin\b\|userAccount\|goToLoginPage\|logout\b\|saveData\|confirmImport\|importData\|showBackupDialog\|initiateBackup\|showImportDialog\|initiateImport\|showImportWarningDialog\|firebaseConfig\|initializeApp\|getFirestore\|useRoute\|onMounted" src/pages/SettingsPage.vue
```
Expected: no output (every one of these names should be fully gone from this file now).

```bash
yarn lint
```
Expected: exit 0. If this still fails, the error message will point at whatever reference wasn't fully cleaned up — do not guess, re-read the surrounding code and fix precisely.

Also confirm nothing legitimate got caught in the cross-fire:
```bash
grep -n "menuItems\|toggleVisibility\|moveItem\|showHomeSettings\|showToolbarSettings\|clearAllData\|confirmClear\|updateUserClass\|showSchedule\|showTodo\|showSchoolNews\|themeColor" src/pages/SettingsPage.vue | wc -l
```
Expected: a healthy number of matches (these are the features that must still be fully intact — if this count looks anomalously low compared to before your edit, something legitimate got deleted by mistake).

- [ ] **Step 12: Smoke-test**

```bash
yarn dev
```
Via browser automation, navigate to `/#/settings` and confirm:
- No console errors.
- The admin-login card is gone; the page opens directly on the "設定" (Settings) card.
- Class selection dropdown, "首頁顯示項目設定" dialog, "自訂工具列" dialog, and clear-data all still open and work exactly as before.

- [ ] **Step 13: Commit**

```bash
git add src/pages/SettingsPage.vue
git commit -m "refactor: remove login/backup/import feature from SettingsPage.vue

Removes the admin-login card, the three backup/import dialogs, all
Firebase-backed backup/import logic (confirmImport, saveData), login
state (isLoggedIn/userAccount/etc.), and their now-dead CSS. The
legitimate settings features on this page (class selection, home
widgets, toolbar customization, clear data) are untouched."
```

---

## Task 3: Remove the dead `isLogin`/`admins` remnants from `HomePage.vue`

**Files:**
- Modify: `CK_app/src/pages/HomePage.vue`

**Interfaces:** none.

- [ ] **Step 1: Remove the dead commented-out Firebase/vuex/quasar/router import block**

Change:
```js
import { ref, computed, onMounted } from "vue";
/*import { useStore } from "vuex";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";*/
import store from "../store/index";
```
to:
```js
import { ref, computed, onMounted } from "vue";
import store from "../store/index";
```

**Why:** this block has been dead since before this refactor — `useStore`/`useQuasar`/`useRouter` are never invoked anywhere in this file, which imports the store singleton directly instead. It's also the last remaining textual match for `firebase` in `src/` once `LoginPage.vue`, `SettingsPage.vue`, and `src/boot/firebase.js` are handled by Tasks 1, 2, and 4 — left in place, it would make Task 4 Step 1's `grep -rln "from [\"']firebase" src/` verification fail (grep matches text inside comments too) and falsify the Deviation section's "zero remaining imports of `firebase/*` anywhere in `src/`" claim. (Found via independent re-verification of this plan against current file content before execution began.)

- [ ] **Step 2: Remove the `admins` array from `data()`**

Change:
```js
        { name: "選擇障礙小幫手", icon: "help", link: "/help" }
        // { name: "設定", icon: "settings", link: "/settings" },
        // { name: "關於", icon: "info", link: "/about" },
      ],
      admins: [
        { name: "管理資訊", icon: "info", link: "/adminpost" },
      ],
    };
  },
```
to:
```js
        { name: "選擇障礙小幫手", icon: "help", link: "/help" }
        // { name: "設定", icon: "settings", link: "/settings" },
        // { name: "關於", icon: "info", link: "/about" },
      ],
    };
  },
```

- [ ] **Step 3: Remove the commented-out template block that referenced `isLogin`/`admins`**

Change:
```html
      <!--<div v-if="isLogin">
        <div v-for="admin in admins" :key="admin.name" class="icon-item">
          <q-btn
            stack
            class="icon-btn"
            :rounded="true"
            @click="navigateTo(admin.link)"
          >
            <q-icon :name="admin.icon" size="2.5em" />
            <div class="text-content text-capitalize">{{ admin.name }}</div>
          </q-btn>
        </div>
      </div>-->
    </div>
  </div>
</template>
```
to:
```html
    </div>
  </div>
</template>
```

- [ ] **Step 4: Remove the `isLogin` computed**

Change:
```js
    // 從 Vuex store 獲取登入狀態
    const isLogin = computed(() => {
      const userAccount = store.getters.getUserAccount;
      return userAccount !== null && userAccount !== undefined && userAccount !== '';
    });

    const currentClass = computed(() => {
```
to:
```js
    const currentClass = computed(() => {
```

- [ ] **Step 5: Remove `isLogin` from the `return {}` object**

Change:
```js
    return {
      isLogin,
      currentClass,
```
to:
```js
    return {
      currentClass,
```

- [ ] **Step 6: Verify**

```bash
cd CK_app
grep -n "isLogin\|admins\b" src/pages/HomePage.vue
grep -n "firebase" src/pages/HomePage.vue
```
Expected: no output from either command.

```bash
yarn lint
```
Expected: exit 0.

- [ ] **Step 7: Smoke-test**

```bash
yarn dev
```
Via browser automation, load `/#/` and confirm the Home page renders identically to before (same icon grid, same widgets) with no console errors.

- [ ] **Step 8: Commit**

```bash
git add src/pages/HomePage.vue
git commit -m "refactor: remove dead isLogin/admins remnants from HomePage.vue

Both were only ever referenced inside an already-commented-out
template block — no live behavior change. Also removes a dead,
already-commented-out Firebase/vuex/quasar/router import block left
over from an earlier version of this file — the last remaining
textual reference to firebase in src/ before Task 4 removes the
package."
```

---

## Task 4: Remove the now-fully-dead Firebase dependency and boot files

**Why now:** after Tasks 1-3, nothing in `src/` imports from `firebase/*` anymore. `CK_app/src/boot/firebase.js` was never in `quasar.config.js`'s `boot` array to begin with (`boot: ["i18n", "axios"]`), so it has never executed. The root `CK_app/firebase.js` has no importers anywhere in `src/`. Both become safe, overdue deletions; the `firebase` npm package can come out too.

**Files:**
- Delete: `CK_app/src/boot/firebase.js`
- Delete: `CK_app/firebase.js`
- Modify: `CK_app/package.json`
- Modify: `CK_app/yarn.lock` (regenerated by `yarn remove`)

**Interfaces:** none.

- [ ] **Step 1: Confirm zero remaining Firebase imports (defense against drift since this plan was written)**

```bash
cd CK_app
grep -rln "from [\"']firebase" src/
```
Expected: no output. If this finds anything, STOP — Tasks 1-3 weren't fully applied, or something else in the codebase started using Firebase since this plan was written. Do not proceed with this task until you understand why.

```bash
grep -rn "boot/firebase\|require(.*firebase\.js.\)\|from [\"']\.\./firebase[\"']\|from [\"']\./firebase[\"']" src/ quasar.config.js
```
Expected: no output (confirms nothing imports either file being deleted by path).

- [ ] **Step 2: Delete the two dead files**

```bash
git rm CK_app/src/boot/firebase.js
git rm CK_app/firebase.js
```

- [ ] **Step 3: Remove the `firebase` dependency**

```bash
yarn remove firebase
```

- [ ] **Step 4: Verify**

```bash
grep -n "firebase" package.json
```
Expected: no output.

```bash
yarn install --frozen-lockfile
yarn lint
```
Expected: both exit 0.

- [ ] **Step 5: Smoke-test**

```bash
yarn dev
```
Confirm the app boots with no error (removing a completely-unused dependency and two never-loaded files should have zero runtime effect). Spot-check `/#/`, `/#/settings`, and one or two other pages for console errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: remove now-dead firebase dependency and boot files

src/boot/firebase.js was never in quasar.config.js's boot array and
has never executed. Root firebase.js had no importers. Both became
fully dead once the login/account feature (their only real consumer)
was removed in this branch's earlier commits."
```

---

## Task 5: Open the PR

- [ ] **Step 1: Push the branch**

```bash
git push -u origin refactor/phase-3-remove-login
```

- [ ] **Step 2: Open the PR**

```bash
gh pr create --title "Refactor: Phase 3 — remove dead login/account feature" --body "$(cat <<'EOF'
## Summary
- Deletes LoginPage.vue, the /login route, and the account Vuex module entirely (confirmed product decision — this feature was dead: plaintext-password auth against a single shared Firestore document, superseded by nothing, with the team having already started commenting out its UI elsewhere).
- Strips all login/backup/import UI and logic out of SettingsPage.vue (admin-login card, 3 dialogs, ~350 lines of Firebase-backed backup/import code) while leaving every other settings feature (class selection, home widgets, toolbar customization, clear data) untouched.
- Removes dead isLogin/admins remnants from HomePage.vue (only ever referenced inside an already-commented-out block).
- Removes the now-fully-dead `firebase` npm dependency, `src/boot/firebase.js` (never in the boot array, never executed), and root `firebase.js` (no importers) — this feature was the last live Firebase consumer in the app.

## Security context
This also resolves two of the three Critical findings from the original codebase evaluation (docs/EVALUATION.md): plaintext password storage/comparison, and the entire user database living in one shared, unruled Firestore document — both problems disappear because the feature that caused them no longer exists.

## Test plan
- [x] `yarn install --frozen-lockfile` and `yarn lint` pass after each commit
- [x] `yarn dev` smoke-tested: Home (icon grid unchanged), Settings (opens directly on the Settings card, all remaining dialogs/toggles work), no console errors
- [x] Confirmed zero remaining references to any deleted symbol (isLoggedIn, userAccount, saveData, confirmImport, isLogin, admins, etc.) anywhere in the touched files
- [x] Confirmed zero remaining `firebase/*` imports anywhere in src/ before removing the dependency
EOF
)"
```

---

## Self-Review Notes

- **Spec coverage:** All of `docs/refactoring-plan.md` Phase 3's named items (SettingsPage.vue admin card/dialogs, orphaned setup vars, router entry, LoginPage.vue deletion, HomePage.vue's `isLogin`, account module deletion) are covered, plus the deviation (Task 4, Firebase cleanup) is explicitly called out and justified.
- **Placeholder scan:** No TBD/TODO. The two largest deletions (confirmImport, saveData bodies) are boundary-anchored rather than fully reproduced — this is a deliberate exception for wholesale deletions of 100+ line blocks, not a placeholder: exact first/last lines are given, plus a grep-based verification step, so there's no ambiguity about what gets removed.
- **Type/name consistency:** N/A — deletion-only phase. Cross-checked that nothing kept (`router`, `userClass`, `showSchedule`/`showTodo`/`showSchoolNews`, `menuItems`) is accidentally swept up in the two boundary-anchored deletions — verified by reading the actual file content at every boundary before writing this plan, not assumed from the earlier investigation report alone.
