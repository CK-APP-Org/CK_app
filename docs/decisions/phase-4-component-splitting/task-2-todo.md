# Task 2 (Phase 4): Split TodoPage.vue into CalendarView.vue + TodoListView.vue + EventDialog.vue + TodoDialog.vue

**Commits:**
- `da6ff91` — "refactor(todo): extract CalendarView.vue"
- `b1353f6` — "refactor(todo): extract TodoListView.vue"
- `90b4f5c` — "refactor(todo): extract EventDialog.vue"
- `c4473af` — "refactor(todo): extract TodoDialog.vue"
- `2630adf` — "refactor(todo): wire TodoPage.vue to the four new components"

## What changed, in plain language

`TodoPage.vue` was 1,393 lines and did four jobs at once: showing a month calendar, showing a filterable todo list, and running the two "add/edit" popup forms (one for calendar events, one for todos) — including each form's own "manage categories" sub-feature. It also had a real bug the refactor plan flagged ahead of time: the file mixed Vue's two different component styles together in one file (the older "Options API" — `data()`, `computed: {}`, `methods: {}` — and the newer "Composition API" — `setup()`), which Vue allows but which is a maintenance trap (two different places to look for the same kind of thing, depending on when a given piece of code was added).

We split it into four new files plus a much smaller `TodoPage.vue`:

1. **`src/components/todo/CalendarView.vue`** — the month grid, the `<`/`>` navigation, and the popup that appears when you click a day (listing that day's events and todos).
2. **`src/components/todo/TodoListView.vue`** — the todo list (grouped by date), the checkbox-and-strikethrough "complete a todo" animation, and the left-side category filter drawer.
3. **`src/components/todo/EventDialog.vue`** — the "add/edit an event" popup, its "delete this event?" confirmation, and the entire event-category management screen (list, add, delete).
4. **`src/components/todo/TodoDialog.vue`** — the "add a todo" popup and the todo-category management screen (list, add, delete).
5. **`src/pages/TodoPage.vue`** — shrunk from 1,393 lines to about 140. It now only holds the shared view-toggle button, the shared "+" FAB, and the two dialogs' open/closed state — everything else was handed off to the four new files above. It's also now **entirely** `<script setup>` (Composition API), which is what fixes the API-mixing bug the refactor plan called out.

## Why this is safe

Like the Transport split (`docs/decisions/phase-4-component-splitting/task-1-transport.md`), every function body and template block was copied from the original file, not rewritten from scratch. Converting from Options API (`this.foo`) to Composition API (`foo.value`) is a mechanical, well-understood transformation — it changes *how* you spell "read/write this piece of state," not what the state does. We verified this mechanically (see "Verification performed").

Two small, deliberate exceptions, both already flagged by the refactor plan or discovered and documented before writing any code:

- **The dead `fetchAndParseSchoolEvents` function and its commented-out `ICAL` import were deleted**, per the plan's explicit instruction. This ~30-line function was never actually called — the one line that would have called it (`onMounted(() => { fetchAndParseSchoolEvents(); })`) was itself commented out in the original file, so this code has never run in the shipped app. The `schoolEvents` list it would have populated is kept (it's still always empty, exactly as before) since the calendar still merges it in.
- **`newTodoCategoryColor` was dropped.** It was a leftover `data()` field that nothing in the whole file ever read or wrote (unlike `newEventCategoryColor`, which is a real, working color picker for event categories — todo categories apparently never got one). We confirmed this with a grep across the entire original file before writing the plan. Carrying a provably-dead variable into a brand new file would have failed this project's lint check (`no-unused-vars`), so it was dropped rather than ported.

A few originally-redundant lines (e.g., the original explicitly set `this.showEventDialog = false` in three different methods, in addition to a `v-close-popup` button attribute that *already* closes the same dialog on the same click) were not reproduced 1:1, since they were already having zero additional effect in the original file. This is called out explicitly, rather than silently, in the plan document.

## Concept explainer: why can't the parent just `v-if` between the calendar and the todo list?

This is the one genuinely tricky judgment call in this split, and it's worth understanding because it's easy to get backwards.

Before the split, `TodoPage.vue`'s template had:
```html
<div v-if="currentView === 'calendar'" class="calendar">...</div>
<div v-if="currentView === 'todoList'" class="todo-list">...</div>
```
Both blocks lived inside **the same component instance**. Vue's `v-if` here just skips rendering the inactive block — it doesn't destroy any state, because there's only ever one component (`TodoPage`), and all its state (`currentDate` for which month the calendar shows, `selectedCategory`/`leftDrawerOpen` for the todo list's filter) belongs to that one instance regardless of which `v-if` branch is currently visible. So toggling between views was "free" — nothing resets.

After the split, `currentDate` lives inside `CalendarView.vue`, and `selectedCategory`/`leftDrawerOpen` live inside `TodoListView.vue` — each is now its *own* component instance with its *own* internal state. Vue components have a lifecycle: when a `v-if` on a component goes from true to false, Vue doesn't just hide it, it **destroys** that component instance — and when the `v-if` flips back to true, Vue creates a **brand new** instance from scratch, with all state reset to its initial value.

So if `TodoPage.vue` had written:
```html
<calendar-view v-if="currentView === 'calendar'" ... />
<todo-list-view v-if="currentView === 'todoList'" ... />
```
...then every time a user toggled from 月曆 to 待辦 and back, `CalendarView` would be destroyed and recreated — silently resetting `currentDate` back to the current month, even if the user had navigated to a different month before switching away. That's a real, user-visible regression that has nothing to do with "cleaner code" — it would just be a bug this refactor introduced.

The fix is what's actually in the code: **both components are always rendered** by the parent (no `v-if` on the `<calendar-view>`/`<todo-list-view>` tags themselves), and each one is passed `currentView` as a prop, then does its OWN `v-if="currentView === '...'"` on its own root `<div>` inside its own template. This means both component *instances* stay alive at all times — only their visible markup toggles — so `currentDate`/`selectedCategory`/`leftDrawerOpen` survive every view switch, exactly like the original single-file version.

## Verification performed

- **Automated content check:** the original `TodoPage.vue` was pulled from git history (the commit just before this split) and its combined `data()`/`computed`/`methods`/`watch`/`setup()` content was diffed against the four new files' combined script content — with `this.` prefixes stripped from the original and `.value`/`props.` stripped from the new files first, to account for the expected Options-API-to-Composition-API syntax change. Every remaining difference was manually traced to one of: the deliberately-removed dead code (above), a pure declaration-syntax translation (e.g. `addEvent() {` → `const addEvent = () => {`), or an already-documented deliberate design choice (e.g. `editingEvent` renamed to `initialEvent` to match the plan's stated prop name; `todo.id` passed directly since `TodoListView` emits the id rather than the whole todo object). No unexplained differences were found in either direction (nothing silently dropped, nothing unexpectedly added).
- `grep` confirmed no leftover references to any moved-away name (`calendarDays`, `sortedTodos`, `fetchAndParseSchoolEvents`, `ICAL`, `newTodoCategoryColor`) in the new, slimmed-down `TodoPage.vue`.
- `yarn lint` — clean, no errors.
- Started the dev server and requested each new/changed file directly through Vite's dev server — all five (`TodoPage.vue` and the four new components) returned HTTP 200 with no compile or import-resolution errors.
- Manual interactive smoke test at `/#/todo` (performed by the project owner): confirmed no console errors; view-toggle works; calendar month navigation, day-popup, and event add/edit/delete/category-management all work; todo add/check-off/category-filter/category-management all work; and specifically confirmed that navigating the calendar to a different month, then toggling to the todo list and back, does **not** reset the calendar's month (and likewise for the todo list's category filter surviving a round-trip through the calendar view) — the one behavior this refactor could plausibly have broken, per the concept explainer above.
