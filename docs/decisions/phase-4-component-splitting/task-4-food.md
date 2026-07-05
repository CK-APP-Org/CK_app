# Task 4 (Phase 4): Split FoodPage.vue into useRestaurantHours.js + MapLegend.vue + RestaurantSidebar.vue + RestaurantList.vue

**Commits:**
- `67f382a` — "refactor(food): extract useRestaurantHours composable"
- `39bf55f` — "refactor(food): extract MapLegend.vue"
- `6abd29e` — "refactor(food): extract RestaurantSidebar.vue"
- `aec009c` — "refactor(food): extract RestaurantList.vue"
- `5618b91` — "refactor(food): wire FoodPage.vue to the new composable and components"
- `4e322fe` — "fix(food): restore dead-but-preserved onMounted comment in FoodPage.vue"

## What changed, in plain language

`FoodPage.vue` was 684 lines: a Leaflet map of nearby restaurants, a bottom-sheet detail panel, a full-screen list view, a legend explaining the marker icons, and all the "is this restaurant open right now" time math behind the scenes.

We split it into four new files plus a smaller parent:

1. **`src/composables/useRestaurantHours.js`** — every function that's pure math/data with no Vue dependency: the 4 status-icon objects and the functions that pick between them (`getMarkerIcon`, `getIconType`), plus `isOpen`, `isWithinMinutes`, `translateDays`, `getCurrentDay`. `docs/refactoring-plan.md` specifically calls this composable out as the future home for Phase 7's first unit tests, since none of this needs a running Vue app to test.
2. **`src/components/food/MapLegend.vue`** — the "地圖標記說明" dialog: 4 icons and their meanings, fully static.
3. **`src/components/food/RestaurantSidebar.vue`** — the bottom-sheet detail panel (name, opening hours by day, favorite/close buttons).
4. **`src/components/food/RestaurantList.vue`** — the full-screen "餐廳列表" dialog.
5. **`src/pages/FoodPage.vue`** — shrunk from 684 to about 260 lines. It keeps the map itself, the top control buttons, and data-fetching, and renders the three new components.

This was the last of the four Phase 4 sub-phases. All four (Transport, Todo, Settings, Food) now land together as one pull request.

## Why this is safe

Same verbatim-move approach as the other three splits. One thing worth being candid about: the automated diff-against-git-history check used throughout Phase 4 (see the Transport decision doc for how it works) caught **two things in this task specifically**, not zero:

1. A real slip in the first version of the rewritten `FoodPage.vue`: a commented-out block inside `onMounted()` (an old, abandoned attempt at working around a Leaflet default-icon quirk, using `Icon.Default.mergeOptions`) was silently left out. It was never called out as an intentional removal anywhere in this task's plan — unlike Todo's `ICAL`-import removal, which the refactoring plan explicitly asked for — so it was restored in a follow-up commit (`4e322fe`) once the diff flagged it. This is exactly what this verification step is for: catching accidental scope creep in either direction (dropping things that weren't meant to be dropped, same risk category as adding things that weren't meant to be added).
2. Two *intentional* differences, confirmed safe and documented in the plan once the diff surfaced them: the dead `import axios from "axios"` (only ever called inside a commented-out block, same "genuinely unreferenced in live code" test used for Transport's dropped `store` import) was dropped, and `import store from "../store/index"` (a direct singleton import) was replaced with the `useStore()` composable — the same substitution already used in every other Phase 4 file, for consistency, not because the two behave differently.

## Concept note: why did an asset image path need to change?

This is a mistake worth understanding because it's easy to make and a plain text-diff wouldn't have caught it.

`MapLegend.vue`'s four `<img>` tags point at files like `../../public/food/marker-icon-open.png`. That path only makes sense *relative to wherever the file containing it lives*. Before this split, that file was `src/pages/FoodPage.vue` — from there, `../../` walks up two directories (`pages` → `src`) to the repo root, then into `public/food/`. Correct.

After the split, the same markup lives in `src/components/food/MapLegend.vue` — one directory deeper than `src/pages/`. If the path string had been copied over unchanged, `../../` would only walk up to `src/`, one level short of the actual repo root — the browser would request a file that doesn't exist there, and the four legend icons would silently fail to load (broken image icons, no console error loud enough to be obvious). The fix was to add one more `../`, matching the new file's actual depth: `../../../public/food/marker-icon-open.png`.

The reason a copy-paste move can get this wrong without "obviously" changing anything: Vite's Vue compiler treats a relative `src="..."` on an `<img>` tag as a build-time asset reference, resolved against *the file it's written in* — so identical-looking text resolves to a different real path depending on which file it's in. This is different from a plain JavaScript string (like the icon URLs used elsewhere in this same refactor's Transport/Metro work), which is never rewritten by the bundler and means whatever it says, regardless of which file it sits in. Knowing which kind of "path" you're looking at — one the bundler rewrites vs. one it treats as inert text — is the actual skill here; the fix itself is a one-character change once you know to look for it.

## Verification performed

- **Automated content check:** the original `FoodPage.vue` was pulled from git history and its script content diffed (whitespace-normalized) against the four new files' combined script content. Found and fixed one real oversight (the dropped `onMounted` comment, above); every other difference was traced to an already-documented, intentional choice (the dead `axios` import, the `store`→`useStore()` substitution, `closeSidebar`'s removal, the `isOpen`→`isRestaurantOpen` rename to avoid a naming collision, and pure declaration-style differences between the original's arrow-consts and the composable's `export function` style).
- `grep` confirmed no leftover references to any moved-away name (`toggleFavorite`, `translateDays`, `isToday`) in the new, slimmed-down `FoodPage.vue`.
- `yarn lint` — clean, no errors (checked both before and after restoring the `onMounted` comment).
- Started the dev server and requested each new/changed file directly through Vite's dev server — all five returned HTTP 200 with no compile or import-resolution errors.
- Manual interactive smoke test at `/#/food` (performed by the project owner): confirmed no console errors; map and markers render; sidebar opens correctly from a marker click; the restaurant list's "詳細資訊" button closes the list, pans the map, and opens the right popup (the cross-component boundary most likely to break); favoriting works from both the sidebar and the list; both filter checkboxes work; the legend dialog's 4 icons render correctly (confirming the asset-path fix); "隨機選擇餐廳" pans/zooms to a random open restaurant and opens the sidebar.

## What's next

This completes all four Phase 4 sub-phases. The branch `refactor/phase-4-component-splitting` (16 commits: 4 sub-phases × commits-per-sub-phase, plus 4 decision-doc commits and one small fix-up) is pushed and its PR opened next, covering all of Phase 4 in one review — the process decision made at the start of this phase (see [[ck-app-refactor-overview]]).
