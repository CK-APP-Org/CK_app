# CK App Refactor — Phase 2 (Quick Wins) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the production debug-logging plugin and CLEAR_DATA console output, fix a duplicate Vuex mutation, strip 15 production `console.log` calls (several of which log plaintext account credentials) across 7 files, and remove 2 genuinely-unused dependencies.

**Architecture:** No runtime architecture changes — this is deletion-only work (removing debug code, a duplicate mutation definition, and unused package.json entries). Nothing here changes a public interface or data flow.

**Tech Stack:** Quasar 2 / Vue 3, Vuex 4, yarn.

## Global Constraints

- No commit in this branch uses the `[deploy]` prefix. (Source: `docs/superpowers/specs/2026-07-03-ck-app-refactor-design.md`)
- No commit message or PR description attributes Claude/Anthropic (no `Co-Authored-By` trailer or similar). (Standing instruction for this repo.)
- Keep `console.error` calls — only remove `console.log`. (Source: `docs/refactoring-plan.md` Phase 2-C)
- Use `yarn remove`, not `npm uninstall` — this project is yarn-only (`yarn.lock` is the lockfile CI trusts; introducing `npm` would create a conflicting `package-lock.json`).

## Deviation from `docs/refactoring-plan.md` as written

**Phase 2-D (remove unused deps):** the plan lists `pinia`, `vuex-persistedstate`, and `timeago.js` as all unused. Investigation for this task found `timeago.js` is genuinely used — `src/App.vue:9-12` imports `register` and calls it to set up the `zh_TW` locale, and `src/pages/NewsPage.vue:198,321,351` imports both `format` and `register` and calls `format(date, "zh_TW")` to render relative timestamps. Removing it would break the build (unresolvable import) and remove working functionality (relative "N minutes ago" timestamps on the news feed). This plan removes only `pinia` and `vuex-persistedstate`, both confirmed to have zero imports anywhere in `src/` or `quasar.config.js`.

## Branch

This phase branches from the current tip of `origin/main` (the same base Phase 0/1's branch used — Phase 0/1's PR #14 has not merged yet at the time of writing). Branch name: `refactor/phase-2-quick-wins`.

**Merge-order note:** this phase and Phase 0/1 (PR #14) both touch `src/pages/TransportPage.vue`, at non-overlapping line ranges (Phase 0/1: the three SOAP credential blocks around lines 1234-1402; this phase: two `console.log` lines around 1017-1020 and one around line 1265). Whichever PR merges second may need a trivial rebase, but the changes don't conflict semantically.

---

## Task 1: Store layer cleanup — remove debug plugin, CLEAR_DATA logging, and the duplicate mutation

**Why this matters:** `storeWatcherPlugin` deep-clones and `console.log`s the **entire Vuex state** — including the account module's plaintext password — on every single mutation, in production. `CLEAR_DATA` separately logs the full `localStorage` contents after every "clear data" action. `SET_SHOW_TODO` is defined twice in the same mutations object; the second definition silently shadows the first (harmless here since both do the same thing, but it's dead, confusing code).

**Files:**
- Modify: `CK_app/src/store/index.js`
- Modify: `CK_app/src/store/modules/todo.js:42` and `:60`

**Interfaces:**
- Consumes: nothing from another task.
- Produces: nothing another task depends on — this is leaf cleanup.

- [ ] **Step 1: Remove `storeWatcherPlugin` from `CK_app/src/store/index.js`**

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
import { localStoragePlugin } from "./localStoragePlugin";

const storeWatcherPlugin = (store) => {
  store.watch(
    (state) => state,
    (newValue) => {
      console.log(
        "Store scheduleData changed:",
        JSON.parse(JSON.stringify(newValue))
      );
    },
    { deep: true }
  );
};

const modules = {
```
to:
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
import { localStoragePlugin } from "./localStoragePlugin";

const modules = {
```

- [ ] **Step 2: Update the `plugins` array in the same file**

Change:
```js
export default createStore({
  plugins: [storeWatcherPlugin, localStoragePlugin],
  modules,
```
to:
```js
export default createStore({
  plugins: [localStoragePlugin],
  modules,
```

- [ ] **Step 3: Remove the two `console.log` calls in `CLEAR_DATA`, same file**

Change:
```js
      console.log("Data cleared from state and localStorage");
      console.log(JSON.parse(localStorage.getItem("store")));
    },
  },
  actions: {
```
to:
```js
    },
  },
  actions: {
```

- [ ] **Step 4: Remove the duplicate `SET_SHOW_TODO` mutation in `CK_app/src/store/modules/todo.js`**

The mutation is defined twice, identically, at lines 42 and 60:
```js
    SET_SHOW_TODO(state, value) {
      state.displayTodoWidget = value;
    },
```
Keep the **first** occurrence (line 42, right after `DELETE_EVENT_CATEGORY`). Remove the **second** occurrence — it currently sits between `DELETE_TODO` and `SET_CURRENT_VIEW`:
```js
    DELETE_TODO(state, todoId) {
      state.todos = state.todos.filter((t) => t.id !== todoId);
    },
    SET_SHOW_TODO(state, value) {
      state.displayTodoWidget = value;
    },
    SET_CURRENT_VIEW(state, view) {
```
becomes:
```js
    DELETE_TODO(state, todoId) {
      state.todos = state.todos.filter((t) => t.id !== todoId);
    },
    SET_CURRENT_VIEW(state, view) {
```

- [ ] **Step 5: Verify**

```bash
cd CK_app
grep -n "storeWatcherPlugin\|SET_SHOW_TODO" src/store/index.js src/store/modules/todo.js
```
Expected: `storeWatcherPlugin` — no output (fully removed). `SET_SHOW_TODO` — exactly one match, in `todo.js`.

```bash
yarn lint
```
Expected: exit 0.

- [ ] **Step 6: Smoke-test**

```bash
yarn dev
```
Via browser automation: open `http://localhost:9000/#/`, trigger a few store mutations (toggle a Settings checkbox, add/remove a Todo), and confirm via `read_console_messages` that no `"Store scheduleData changed"` or `"Data cleared from state and localStorage"` log lines appear. Confirm no new console errors were introduced.

Then specifically exercise the Settings page's "顯示待辦事項" (show todo widget) toggle and the Todo page, since `SET_SHOW_TODO` is the mutation just deduplicated — confirm both still work identically (widget visibility toggles, Todo page renders).

- [ ] **Step 7: Commit**

```bash
git add src/store/index.js src/store/modules/todo.js
git commit -m "refactor: remove debug logging plugin and duplicate Vuex mutation

storeWatcherPlugin deep-cloned and console.logged the entire store
state (including the account module's plaintext password) on every
mutation in production. CLEAR_DATA separately logged the full
localStorage contents. SET_SHOW_TODO was defined twice identically in
todo.js's mutations object."
```

---

## Task 2: Remove production `console.log` calls

**Why this matters:** these are debug statements left in production code; several log plaintext account credentials (username, email, password) to the browser/device console. `console.error` calls are untouched — only `console.log`.

**Files:**
- Modify: `CK_app/src/store/modules/account.js` (5 occurrences)
- Modify: `CK_app/src/store/modules/youbike.js` (2 occurrences)
- Modify: `CK_app/src/services/newsService.js:45`
- Modify: `CK_app/src/utils/xmlUtils.js:9`
- Modify: `CK_app/src/pages/SettingsPage.vue:338,452,727`
- Modify: `CK_app/src/pages/TransportPage.vue:1017,1020,1265`
- Modify: `CK_app/src/pages/MenuPage.vue:108`

**Note on scope:** `account.js` and the two `SettingsPage.vue` sites at line 452 and 727 are inside the dead login/account feature that a later phase (Phase 3) deletes in its entirety. Removing these `console.log` calls now is still worthwhile — it's a one-line deletion each, and it stops these specific lines from logging plaintext credentials to the console in the meantime, regardless of when Phase 3 lands. This is different from the Phase 1-A situation (which would have required non-trivial refactoring of code about to be deleted) — there's no design work being thrown away here, just a few lines removed slightly early.

**Interfaces:** none — leaf cleanup, no other task depends on these files.

- [ ] **Step 1: `CK_app/src/store/modules/account.js`**

Change:
```js
  mutations: {
    SET_USER_ACCOUNT(state, newAccount) {
      console.log(newAccount);
      state.userName = newAccount;
    },
    SET_USER_EMAIL(state, email) {
      console.log(email);
      state.email = email;
    },
    SET_USER_PASSWORD(state, password) {
      console.log(password);
      state.password = password;
    },
  },

  actions: {
    setUserAccount({ commit }, newAccount) {
      commit("SET_USER_ACCOUNT", newAccount);
      localStorage.setItem("userName", newAccount);
    },
    setUserEmail({ commit }, mail) {
      commit("SET_USER_EMAIL", mail);
      localStorage.setItem("email", mail);
      console.log(2);
    },
    setUserPassword({ commit }, password) {
      console.log(1);
      commit("SET_USER_PASSWORD", password);
      localStorage.setItem("password", password);
    },
  },
```
to:
```js
  mutations: {
    SET_USER_ACCOUNT(state, newAccount) {
      state.userName = newAccount;
    },
    SET_USER_EMAIL(state, email) {
      state.email = email;
    },
    SET_USER_PASSWORD(state, password) {
      state.password = password;
    },
  },

  actions: {
    setUserAccount({ commit }, newAccount) {
      commit("SET_USER_ACCOUNT", newAccount);
      localStorage.setItem("userName", newAccount);
    },
    setUserEmail({ commit }, mail) {
      commit("SET_USER_EMAIL", mail);
      localStorage.setItem("email", mail);
    },
    setUserPassword({ commit }, password) {
      commit("SET_USER_PASSWORD", password);
      localStorage.setItem("password", password);
    },
  },
```

- [ ] **Step 2: `CK_app/src/store/modules/youbike.js`**

Change:
```js
    DELETE_STATION(state, stationName) {
      if (state.stationList[stationName]) {
        delete state.stationList[stationName];
        console.log(JSON.parse(localStorage.getItem("store")));
      }
    },
```
to:
```js
    DELETE_STATION(state, stationName) {
      if (state.stationList[stationName]) {
        delete state.stationList[stationName];
      }
    },
```

Change:
```js
    deleteStation({ commit }, stationName) {
      commit("DELETE_STATION", stationName);
      console.log(JSON.parse(localStorage.getItem("store")));
    },
```
to:
```js
    deleteStation({ commit }, stationName) {
      commit("DELETE_STATION", stationName);
    },
```

- [ ] **Step 3: `CK_app/src/services/newsService.js`**

Change:
```js
      store.dispatch("setFetchedNews", allNews);
      store.dispatch("setLastFetchTime", new Date());
      console.log("News fetched");
    } catch (error) {
```
to:
```js
      store.dispatch("setFetchedNews", allNews);
      store.dispatch("setLastFetchTime", new Date());
    } catch (error) {
```

- [ ] **Step 4: `CK_app/src/utils/xmlUtils.js`**

Change:
```js
    const xmlText = await response.text();
    console.log("XML Data:", xmlText);
    const parser = new DOMParser();
```
to:
```js
    const xmlText = await response.text();
    const parser = new DOMParser();
```

- [ ] **Step 5: `CK_app/src/pages/SettingsPage.vue` — 3 sites**

Change (around line 338):
```js
    const userAccount = computed(() => store.getters.getUserAccount);
    console.log("484", userAccount);
    const password = computed(() => store.getters.getPassword);
```
to:
```js
    const userAccount = computed(() => store.getters.getUserAccount);
    const password = computed(() => store.getters.getPassword);
```

Change (around line 452, inside `confirmImport`, immediately before the `initializeApp` call):
```js
          measurementId: "G-T79H6D7WRT",
        };

        console.log(userAccount.value);

        const app = initializeApp(firebaseConfig);
```
to:
```js
          measurementId: "G-T79H6D7WRT",
        };

        const app = initializeApp(firebaseConfig);
```

Change (around line 727, inside `onMounted`):
```js
    onMounted(() => {
      console.log(email.value);
      isLoggedIn.value = userAccount.value != "Default";
```
to:
```js
    onMounted(() => {
      isLoggedIn.value = userAccount.value != "Default";
```

- [ ] **Step 6: `CK_app/src/pages/TransportPage.vue` — 3 sites**

Change (around line 1017-1020):
```js
    const handleLocationSelected = async ({ latlng }) => {
      console.log("Click event latlng:", latlng);
      const userLat = latlng.lat;
      const userLng = latlng.lng;
      console.log("User position:", userLat, userLng);

      userPosition.value = [userLat, userLng];
```
to:
```js
    const handleLocationSelected = async ({ latlng }) => {
      const userLat = latlng.lat;
      const userLng = latlng.lng;

      userPosition.value = [userLat, userLng];
```

Change (around line 1265):
```js
          metroInitialLoading.value = false;
        }
        console.log("Data fetched");
        //console.log(trackInfo);
      } catch (error) {
```
to:
```js
          metroInitialLoading.value = false;
        }
      } catch (error) {
```

Leave the commented-out `//console.log(...)` lines elsewhere in this file (around lines 1351 and 1418) untouched — they're already inert (commented out), not active production logging, and outside this task's scope.

- [ ] **Step 7: `CK_app/src/pages/MenuPage.vue`**

Change:
```js
      const url = `${this.baseMenuUrl}${weekStart}_${day}.png?t=${timestamp}`;
      console.log(url);
      return { url, key: `${weekStart}_${day}` };
```
to:
```js
      const url = `${this.baseMenuUrl}${weekStart}_${day}.png?t=${timestamp}`;
      return { url, key: `${weekStart}_${day}` };
```

- [ ] **Step 8: Verify no active production `console.log` remains in the targeted files**

```bash
cd CK_app
grep -n "console\.log" src/store/modules/account.js src/store/modules/youbike.js src/services/newsService.js src/utils/xmlUtils.js src/pages/SettingsPage.vue
grep -n "console\.log" src/pages/TransportPage.vue
grep -n "console\.log" src/pages/MenuPage.vue
```
Expected: first two commands return no output. Third command (`TransportPage.vue`) should show only the two pre-existing **commented-out** lines (`//console.log(trackInfo);` and similar) — confirm no active (non-commented) `console.log` remains.

```bash
yarn lint
```
Expected: exit 0.

- [ ] **Step 9: Smoke-test**

```bash
yarn dev
```
Via browser automation, exercise each touched page and confirm no console errors (functional behavior is unchanged — these were pure debug logs):
- `/#/` (News fetch triggers on boot — confirms `newsService.js`/`xmlUtils.js` paths still work)
- `/#/transport` (click the map to trigger `handleLocationSelected`; let Metro data fetch once)
- `/#/menu` (confirms `MenuPage.vue`'s image URL construction still works — image loads)
- `/#/settings` (page loads without error — confirms the removed `SettingsPage.vue` logs didn't sit inside anything load-bearing)

- [ ] **Step 10: Commit**

```bash
git add src/store/modules/account.js src/store/modules/youbike.js src/services/newsService.js src/utils/xmlUtils.js src/pages/SettingsPage.vue src/pages/TransportPage.vue src/pages/MenuPage.vue
git commit -m "refactor: remove production console.log calls

Several of these logged plaintext account credentials (username,
email, password) to the console/device logs. console.error calls are
untouched."
```

---

## Task 3: Remove unused dependencies

**Files:**
- Modify: `CK_app/package.json`
- Modify: `CK_app/yarn.lock` (regenerated by `yarn remove`, not hand-edited)

**Interfaces:** none.

- [ ] **Step 1: Confirm zero usage one more time (defense against drift since planning time)**

```bash
cd CK_app
grep -rln "from [\"']pinia[\"']\|require([\"']pinia[\"'])\|createPinia" src/ quasar.config.js
grep -rln "vuex-persistedstate" src/ quasar.config.js
```
Expected: both commands produce no output (no matches — the `grep -l` exit code will be 1, meaning "no matches found", which is what you want here).

Do **not** run the equivalent check for `timeago.js` and remove it — it IS used (`src/App.vue:9-12`, `src/pages/NewsPage.vue:198,321,351`). Confirm this for yourself if you want:
```bash
grep -n "timeago" src/App.vue src/pages/NewsPage.vue
```
Expected: several matches — this dependency stays in `package.json`.

- [ ] **Step 2: Remove the two unused packages**

```bash
yarn remove pinia vuex-persistedstate
```
This updates both `package.json` and `yarn.lock` in one step.

- [ ] **Step 3: Verify**

```bash
grep -n "pinia\|vuex-persistedstate" package.json yarn.lock
```
Expected: no output in either file.

```bash
yarn install --frozen-lockfile
```
Expected: exit 0 (confirms the regenerated lockfile is internally consistent).

```bash
yarn lint
```
Expected: exit 0.

- [ ] **Step 4: Smoke-test**

```bash
yarn dev
```
Confirm the app still boots with no console errors (removing unused deps shouldn't change runtime behavior, but this confirms nothing was silently relying on either package via a transitive side-effect import).

- [ ] **Step 5: Commit**

```bash
git add package.json yarn.lock
git commit -m "refactor: remove unused pinia and vuex-persistedstate dependencies

Both were declared and locked but never imported anywhere in src/ or
quasar.config.js — the app uses Vuex plus a hand-rolled
localStoragePlugin, not Pinia or vuex-persistedstate.

Note: timeago.js, also listed as unused in docs/refactoring-plan.md,
is NOT removed here — it's actually used in App.vue and NewsPage.vue
for relative timestamp formatting. That line item in the original
plan was incorrect."
```

---

## Task 4: Open the PR

- [ ] **Step 1: Push the branch**

```bash
git push -u origin refactor/phase-2-quick-wins
```

- [ ] **Step 2: Open the PR**

```bash
gh pr create --title "Refactor: Phase 2 quick wins (debug logging, duplicate mutation, unused deps)" --body "$(cat <<'EOF'
## Summary
- Removes storeWatcherPlugin, which deep-cloned and console.logged the entire Vuex state (including the account module's plaintext password) on every mutation in production.
- Removes the two CLEAR_DATA console.log calls in the same file.
- Removes a duplicate SET_SHOW_TODO mutation definition in todo.js.
- Removes 15 production console.log calls across 7 files (account.js, youbike.js, newsService.js, xmlUtils.js, SettingsPage.vue, TransportPage.vue, MenuPage.vue) — several logged plaintext account credentials. console.error calls are untouched.
- Removes 2 unused dependencies: pinia, vuex-persistedstate.

## Correction to docs/refactoring-plan.md
Phase 2-D also listed `timeago.js` as unused. It is not — `App.vue` and `NewsPage.vue` both import and call it for relative timestamp formatting on the news feed. It is NOT removed in this PR. docs/refactoring-plan.md should be corrected to drop that line item.

## Test plan
- [x] `yarn install --frozen-lockfile` and `yarn lint` pass after each commit
- [x] `yarn dev` smoke-tested: Home (news fetch), Transport (map click + Metro fetch), Menu (image load), Settings (page load + show-todo-widget toggle), Todo (add/remove) — no console errors, no functional regressions
- [x] Confirmed zero remaining active console.log in every touched file (commented-out pre-existing lines in TransportPage.vue intentionally left alone)
EOF
)"
```

---

## Self-Review Notes

- **Spec coverage:** All of Phase 2 (2-A storeWatcherPlugin, 2-B duplicate mutation, 2-C console.log removal across all 8 files listed in the plan's table — store/index.js's CLEAR_DATA lines are covered in Task 1, the other 7 files in Task 2 — and 2-D dependency removal) is covered, with one corrected deviation (timeago.js kept, documented and justified).
- **Placeholder scan:** No TBD/TODO; every step shows exact before/after code or an exact command with expected output.
- **Type/name consistency:** N/A — this phase deletes code rather than introducing new names/signatures; nothing here is consumed by a later task.
