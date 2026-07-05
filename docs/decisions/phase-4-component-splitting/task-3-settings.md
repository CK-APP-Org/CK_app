# Task 3 (Phase 4): Split SettingsPage.vue into HomeWidgetSettings.vue + ToolbarCustomiser.vue

**Commits:**
- `89b2ff4` — "refactor(settings): extract HomeWidgetSettings.vue"
- `570d828` — "refactor(settings): extract ToolbarCustomiser.vue"
- `441656e` — "refactor(settings): wire SettingsPage.vue to the two new components"

## What changed, in plain language

`SettingsPage.vue` was already fairly small (339 lines, after Phase 3 removed the dead login/backup feature — noticeably smaller than the refactoring plan's original ~600-line estimate for this task, since Phase 3 cut more than expected). It held three things: the main "設定" card (class selection, plus two menu items that open sub-dialogs), a dialog with 3 on/off toggles for what shows on the Home page, and a dialog for reordering/hiding toolbar items.

We split it into two new files plus a smaller parent:

1. **`src/components/settings/HomeWidgetSettings.vue`** — the "首頁顯示項目設定" dialog (3 toggles: 目前課程/今日待辦事項/釘選校網內容).
2. **`src/components/settings/ToolbarCustomiser.vue`** — the "自訂工具列" dialog (reorder items with up/down arrows, toggle each item's visibility).
3. **`src/pages/SettingsPage.vue`** — shrunk from 339 to about 180 lines. It keeps the main settings card and the two confirmation dialogs (clear-data, class-change), and renders the two new components.

This was the smallest of the four Phase 4 sub-phases — no polling loops (unlike Transport), no cross-view state-persistence concerns (unlike Todo), and no cross-component action-triggering beyond simple show/hide.

## Why this is safe

Same verbatim-move approach as the Transport and Todo splits (see the other two decision docs in this folder). One additional check specific to this task: converting `SettingsPage.vue` from `export default { setup() {...} }` to `<script setup>` removes the `return {...}` block, which in the old style is what told Vue "these variables are visible to the template." A few variables in that `return` block (`confirmClear`, `themeColor`, `themeColors`) turned out to already be unused by the template even *before* this split — they were already-orphaned code, just sitting in `return` where nothing flags them as unused. After removing `return`, we specifically verified with `yarn lint` that keeping these harmless-but-unused variables as plain top-level `<script setup>` bindings doesn't trip an unused-variable lint error (Vue's ESLint tooling is written to expect exactly this pattern — declared for potential future/template use, not necessarily called — so it passed clean). Nothing was deleted here that wasn't already effectively dead before this refactor touched the file.

## Concept note: why don't these two dialogs need any props?

Unlike the Todo split's `EventDialog`/`TodoDialog` (which needed props like `eventCategories`, since that data comes from elsewhere and gets *combined* with dialog-local state), `HomeWidgetSettings` and `ToolbarCustomiser` need **zero** data passed down from the parent. Every piece of state they touch (`getShowSchedule`, `getShowTodo`, `getShowSchoolNews`, `getMenuItems`) is a Vuex *getter* — global application state, not something owned by `SettingsPage.vue` itself. So instead of `SettingsPage.vue` reading the store and handing the values down as props (which would mean two components both need to know about that data, for no benefit), each new component calls `useStore()` directly and talks to Vuex itself, exactly like it already did when this code lived in one file.

This is a normal, valid choice in component design: **props are for data a specific parent owns and hands down; direct store access is for state that's genuinely global** and would otherwise need to be threaded through every layer for no reason. The only thing that *does* need to cross the parent/child boundary here is "is this dialog currently open?" — which isn't global state, it's local UI state that belongs to whoever is deciding to show the dialog (the parent, reacting to a menu-item click) — hence the one prop both components have: `modelValue`, via `defineModel()`, the same pattern used for `EventDialog`/`TodoDialog` in the Todo split.

## Verification performed

- **Automated content check:** the original `SettingsPage.vue` (pulled from git history, the commit just before this split) had its `setup()` content diffed — with `this.`/`.value` stripped from both sides to account for the (pre-existing, unrelated to this split) Options-vs-`<script setup>` syntax difference — against the combined script content of the two new files and the rewritten parent. The only differences found were the removed `return {}` boilerplate (expected — `<script setup>` doesn't need it) and the new files' own `useStore()`/`defineModel` setup code. Nothing was silently dropped or unexpectedly added.
- `grep` confirmed no leftover references to any moved-away name (`showSchedule`, `showTodo`, `showSchoolNews`, `menuItems`, `toggleVisibility`, `moveItem`) in the new, slimmed-down `SettingsPage.vue`.
- `yarn lint` — clean, no errors (specifically checked that the unused-but-harmless `confirmClear`/`themeColor`/`themeColors` bindings don't trigger a lint failure now that they're no longer inside a `return {}` object — see "Why this is safe" above).
- Started the dev server and requested each new/changed file directly through Vite's dev server — all three returned HTTP 200 with no compile or import-resolution errors.
- Manual interactive smoke test at `/#/settings` (performed by the project owner): confirmed no console errors; both dialogs open correctly from the settings card; toggling a home-widget switch is reflected on the Home page; reordering/toggling toolbar items persists; class selection's confirm dialog still works.
