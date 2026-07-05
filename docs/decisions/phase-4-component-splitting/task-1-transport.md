# Task 1 (Phase 4): Split TransportPage.vue into YoubikeSection.vue + MetroSection.vue

**Commits:**
- `938cedc` — "refactor(transport): extract useYoubike composable"
- `900ce71` — "refactor(transport): extract YoubikeSection.vue"
- `267a0a5` — "refactor(transport): extract MetroSection.vue"
- `678b06d` — "refactor(transport): wire TransportPage.vue to the two new sections"

## What changed, in plain language

`TransportPage.vue` was 1,742 lines and did two unrelated jobs at once: showing YouBike bike-share stations, and showing MRT (subway) arrival times. Nothing about those two features actually depends on each other — they poll different government/transit APIs, keep separate lists of stations, and open separate "add a station" dialogs. The only thing tying them together was that they'd both been written into the same file, and shared one `+` button (a floating action button, or "FAB") in the corner that lets you add either kind of station.

We split it into four files:

1. **`src/composables/useYoubike.js`** — small, self-contained helper code that doesn't touch Vue at all: a `Station` data shape, the two lists of Taipei/New Taipei districts used in the "add a YouBike station" dropdown, and three small math/date functions (`calculateDistance`, `deg2rad`, `parseTimestamp`/`timeAgo`). None of this needs to live inside a component — it's just data and functions, so it can be tested on its own later (Phase 7 of the refactor plan already earmarks it for that).
2. **`src/components/transport/YoubikeSection.vue`** — everything YouBike-related: the station cards, all 5 of its dialogs (add, edit nickname, delete, "nearest stations" map, "pick my location" map), and its own 10-second polling loop.
3. **`src/components/transport/MetroSection.vue`** — everything Metro-related: the station list with live arrival countdowns, the crowdedness legend, the "add a station" dialog, and its own 10-second polling loop.
4. **`src/pages/TransportPage.vue`** — shrunk from 1,742 lines to about 85 (most of which is now just the FAB's CSS). It renders the two new components and owns only the shared `+` button.

## Why this is safe

This was a **pure move**, not a rewrite — every function body, every line of template markup, and every CSS rule was copied verbatim into its new home. Nothing about *what* the code does changed, only *where* it lives. We verified this mechanically (see "Verification performed" below), not just by eye.

One real behavior change was made deliberately, and it's called out here so it isn't mistaken for an accident: the original file ran **one shared** 10-second timer that fetched both YouBike and Metro data together. Now each new component runs its **own** 10-second timer. The refactor plan (`docs/refactoring-plan.md`, Phase 4-A) asked for this explicitly, since the two features hit unrelated APIs and have no reason to be coupled through a shared timer — if YouBike's API is slow, it shouldn't be able to delay Metro's updates, and vice versa.

A few pieces of CSS and one dead top-level import (`import store from "../store/index"`, which was immediately overwritten by a second `store` variable a few lines later and never used again) were dropped, since they were already fully unused before this refactor touched the file — see the plan document (`docs/superpowers/plans/2026-07-05-ck-app-refactor-phase-4-transport.md`) for the exact list.

## Concept explainer: how does a shared "+" button open a dialog that lives in a *different* file?

This is the one tricky part of this split, so it's worth understanding even if you're new to Vue.

Before the split, everything — the FAB, its two menu buttons, and both "add a station" dialogs — lived in one file, so a button click could just flip a boolean variable (`showAddYoubikeStationDialog.value = true`) that the same file's template was watching. Easy, because everything was in one place.

After the split, the FAB still lives in the parent (`TransportPage.vue`), but the "should this dialog be open?" boolean now lives *inside* `YoubikeSection.vue` (as `showAddYoubikeStationDialog`) and `MetroSection.vue` (as `showAddMetroStation`) — each component owns and manages its own dialog state, which is exactly the point of splitting them apart. So how does a button in the parent reach into a child component and flip a boolean it doesn't have direct access to?

Vue 3 has a purpose-built pair of tools for exactly this:

- **`defineExpose`**, called inside a child component, is like handing the parent a small remote control. Both `YoubikeSection.vue` and `MetroSection.vue` end their `<script setup>` block with:
  ```js
  function openAddStationDialog() {
    showAddYoubikeStationDialog.value = true; // (or showAddMetroStation in the Metro version)
  }
  defineExpose({ openAddStationDialog });
  ```
  Without this line, everything inside `<script setup>` is private to that component — the parent couldn't reach `openAddStationDialog` (or anything else) even if it wanted to. `defineExpose` is an explicit opt-in: "this one function, and only this one function, may be called from outside."

- **A template `ref`**, used inside the parent, is how you get a handle to that remote control. In `TransportPage.vue`:
  ```html
  <youbike-section ref="youbikeSectionRef" />
  ```
  ```js
  const youbikeSectionRef = ref(null);
  ```
  Vue automatically fills `youbikeSectionRef.value` with a live reference to the child component instance once it's mounted — and specifically, the parts of it that the child chose to expose. So `youbikeSectionRef.value.openAddStationDialog()` calls the exact function the child defined above.

Put together, the FAB's click handler in the parent becomes:
```js
const openAddYoubikeStationDialog = () => {
  youbikeSectionRef.value.openAddStationDialog();
  showMenu.value = false; // closes the FAB's own little menu
};
```

This keeps each dialog's open/closed state owned by the component that actually renders it (good separation of concerns — `YoubikeSection.vue` never needs to know the FAB exists), while still letting the parent trigger it. It's the standard Vue 3 pattern any time a parent needs to imperatively "do something" inside a specific child, rather than just passing data down via props.

## Verification performed

- **Automated content check:** the original `TransportPage.vue` was pulled from git history (the commit just before this split) and its `<script>` block was diffed line-by-line (whitespace-normalized) against the combined content of the three new files. This caught one real transcription mistake — a copy-paste typo in one of the three Metro SOAP-request XML templates (`fetchCarWeight`'s XML was missing `/soap/` in one namespace URL) — which was found and fixed before committing.
- `grep` confirmed no leftover references to any moved-away YouBike/Metro name (`Station`, `stations`, `metroStations`, `fetchYoubikeData`, `fetchTrackInfo`, etc.) in the new, slimmed-down `TransportPage.vue`.
- `yarn lint` — clean, no errors.
- Started the dev server and requested each new/changed file directly through Vite's dev server (which compiles Vue single-file components on request) — all four returned HTTP 200 with no compile or import-resolution errors.
- Manual interactive smoke test at `/#/transport` (performed by the project owner, since this environment has no headless-browser tool available): confirmed no console errors; YouBike and Metro sections both render; the shared FAB's two buttons correctly open the YouBike dialog and the Metro dialog respectively (the one behavior most likely to break in this refactor); editing a YouBike nickname, deleting a YouBike station, and deleting a Metro station all still work; both sections' data continued updating after ~10 seconds, confirming the two independent polling loops both fire correctly.
