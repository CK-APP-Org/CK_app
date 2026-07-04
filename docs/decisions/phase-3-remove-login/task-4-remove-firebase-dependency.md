# Task 4: Remove the now-fully-dead Firebase dependency and boot files

**Commit:** `aea0f5d` — "refactor: remove now-dead firebase dependency and boot files"

## What changed, in plain language

We removed the `firebase` package from `package.json`/`yarn.lock`, and deleted two files:
- `CK_app/src/boot/firebase.js`
- `CK_app/firebase.js` (a second, separate config file at the project root)

## Why this task exists (it wasn't in the original written plan)

This is a *deviation* the plan author added after investigating, not something in the original 8-phase refactoring document. The reasoning: Tasks 1-3 deleted the login/backup/import feature, and that feature was the **only** thing in the entire app that actually used Firebase. Once it's gone, the `firebase` package and its two setup files become 100% dead weight — nothing left to import them. Leaving them in place would mean this same refactor pass created new dead code while cleaning up old dead code, which defeats the point.

## Why it was safe to remove *before this task even started*

Two facts made this a very low-risk deletion, both confirmed before making any change:

1. **`src/boot/firebase.js` was never wired up.** Quasar apps only run a boot file if it's listed in `quasar.config.js`'s `boot: [...]` array. That array reads `boot: ["i18n", "axios"]` — `firebase` was never in it. So this file has never executed once, in any environment, for as long as this refactor has existed. Deleting it is closer to deleting an unused text file than removing working code.
2. **Root `firebase.js` had no importers anywhere in `src/`.** A repo-wide search for anything importing it by path found nothing.

Combined with Tasks 1-3 already removing the one real Firebase consumer (`SettingsPage.vue`'s `confirmImport`/`saveData`), that leaves zero remaining reasons for the package to be installed.

## What "removing an npm package" actually does

`yarn remove firebase` does three things: deletes the line from `package.json`'s dependency list, regenerates `yarn.lock` (the file that pins exact versions of every package and its own dependencies, so installs are reproducible), and deletes the actual `firebase` folder out of `node_modules`. None of this touches your source code — it only affects what code is *available* to import. Since nothing imports it anymore (verified below), removing it changes nothing about how the app runs; it just shrinks the dependency tree and the amount of code that ships to users' browsers.

## Verification performed

- `grep -rln "from [\"']firebase" src/` — the only match was `src/boot/firebase.js` itself (the file being deleted, matching on its own import lines) — confirming no other file in `src/` still imports from the `firebase` package. This is the check that Task 3's cleanup (removing a dead commented-out import block in `HomePage.vue`) was specifically added to keep clean — see that task's doc for why.
- `grep -rn "boot/firebase" src/ quasar.config.js` — no matches, confirming nothing references either deleted file by path.
- `yarn install --frozen-lockfile` — passed, confirming the regenerated lockfile is internally consistent.
- `yarn lint` — clean, no errors.
- Started the dev server and spot-checked four routes (`/`, `/#/settings`, `/#/food`, `/#/schedule`) — all responded HTTP 200 with no compile errors in the server log.
