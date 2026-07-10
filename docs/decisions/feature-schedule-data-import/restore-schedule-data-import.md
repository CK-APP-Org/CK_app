# Restore real class schedule data and re-enable the class picker

**Commit:** `dac9d53` — "feat: restore real class schedule data and re-enable class picker"

## What changed, in plain language

Back in October 2025 (commit `1242208`, "Disabled SchedulePage and SettingsPage"), the app's automatic schedule import stopped working on purpose. A banner was added saying *"校方基於隱私權現在不提供課表資料，僅能自行輸入"* ("the school no longer provides schedule data for privacy reasons; please enter it yourself"), the class picker dropdown was disabled, and the refresh button was disabled. Under the hood, the app used to fetch everyone's schedule from `https://raw.githubusercontent.com/CK-APP-Org/ScheduleData/main/ClassesSchedule.json` — an external repo that stopped being a usable source.

We now have real timetable data for 建國高中 (Jianguo High School), covering all 3 grades and all 81 classes (101-128, 201-228, 301-328), each with 8 periods × 5 weekdays. This change bundles that data directly into the app (no network fetch needed) and turns the disabled UI back on.

## Why bundle the data locally instead of fetching it from a URL again

The old design fetched schedule JSON from a GitHub repo at runtime. We didn't restore that approach, for two reasons:
1. We don't control that external repo, and it's the exact thing that broke before.
2. The data we have is static — it's a semester's published class timetable, not something that changes minute to minute. There's no benefit to a network round-trip for data that can just ship with the app.

The three source files (`gaoyi_schedules.json` = grade 1, `gaoer_schedules.json` = grade 2, `gaosan_schedules.json` = grade 3) live in `src/data/schedules/` in their original, untouched shape (a `classes` array where each class has a `schedule` object of weekday → array of 8 subject strings). A new file, `src/data/schedules/index.js`, converts that shape into what the Vue components already expect (a `SET_SCHEDULE_DATA`-ready array of `{ name: "一"..."八", Monday: {subject}, ... }` rows) and exports it as a plain lookup object keyed by class id. `src/store/modules/schedule.js`'s `loadSchedule` action now just reads from that lookup instead of calling `axios.get(...)`.

## Two bugs this surfaced (and fixed) along the way

**1. Only 7 of the school's 8 real periods were ever handled.** The old "which period is it right now" logic in both `SchedulePage.vue` (`isCurrentClass`, for the highlighted-cell border) and `HomePage.vue` (`currentClass`, for the "目前課程" home screen widget) was a hardcoded array:
```js
["一", "二", "三", "四", "五", "五", "六", "七"][currentHour - 8]
```
This assumes every period is exactly one clock hour long starting at 8am, and it repeats `"五"` twice — meaning hour-slot 13 (1pm) and hour-slot 14 (2pm) both mapped to the same row, and period 8 (16:10-17:00) was never reachable at all. The real periods aren't hour-aligned (`08:10-09:00`, `09:10-10:00`, ..., with a lunch gap between 12:00 and 13:00, then `13:00-13:50` through `16:10-17:00`). Since we now have the real period times from the source data, `src/data/schedules/index.js` exports a `getCurrentPeriodName(date)` helper that checks the actual clock time against all 8 real time ranges, and both files now call that instead of guessing from the hour. This wasn't optional cleanup — without it, the new period-8 data would never highlight as "current," and periods 5-6 would still collide.

**2. The hardcoded class list had a typo that silently dropped a real class.** `SchedulePage.vue` and `SettingsPage.vue` each kept their own hand-typed `classOptions` array for the dropdown. Grade 2's tail read `..., 225, 226, 227, 328, 301, ...` — `328` where `228` should have been, meaning class 228 was never selectable, while `328` (grade 3's real last class) appeared twice. Both files now import a single `CLASS_OPTIONS` list computed directly from the bundled data's actual class ids, so it can't drift from reality again.

## What "fully restoring" means concretely

- `SchedulePage.vue`: banner text reverted to the original pre-disable wording ("點擊課表格子可自訂科目、顏色和備註" — click a cell to customize subject/color/note), refresh button and class-picker `q-select` no longer `disable`d.
- `SettingsPage.vue`: class-picker `q-select` no longer `disable`d.
- `App.vue`: the commented-out "load schedule on startup if empty" call in `onMounted` is restored, so a fresh install shows real data immediately instead of requiring a manual refresh tap.
- `SettingsPage.vue`'s unrelated registration/login banner and buttons were **not** touched — those belong to the already-completed Phase 3 login removal, not this change.

## Verification performed

- `npm run lint` — clean, no errors.
- Confirmed with a Python check that all 81 classes across the 3 source files have exactly 8 subjects for all 5 weekdays (no malformed rows to worry about in the transform).
- Ran the dev server and drove it through the browser:
  - `/schedule` loads class 101's real Friday timetable out of the box (no manual input needed).
  - Opening the class picker and switching to class `328` — deliberately chosen because it's the class the old typo made unreachable — loads that class's real data correctly, and the dropdown list has no duplicate/missing entries.
  - Mocked the browser clock to a Monday at 08:10-09:00 (period 1) and confirmed both the `SchedulePage` current-cell highlight and the `HomePage` "目前課程" widget correctly show `一: 資訊科技概論`, matching the raw source data for that class/day/period exactly.
  - No console errors on any of the above.
