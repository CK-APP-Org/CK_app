# Contributing Guide 貢獻指南

**Language / 語言:** [中文](CONTRIBUTING.md) ｜ English (this page)

Welcome to contributing to / taking over CK APP! This document explains how to develop, submit changes, and publish releases. If this is your first time, read [README.en.md](README.en.md) first to understand the overall architecture.

## Table of Contents
1. [Dev environment setup](#dev-environment-setup)
2. [Project structure cheat sheet](#project-structure-cheat-sheet)
3. [Branches & commit conventions](#branches--commit-conventions)
4. [Adding a new page](#adding-a-new-page)
5. [Code style](#code-style)
6. [Changing data](#changing-data)
7. [Bumping the version](#bumping-the-version)
8. [Testing](#testing)
9. [Submitting a Pull Request](#submitting-a-pull-request)
10. [Contact](#contact)

## Dev environment setup
See the [README "Development" section](README.en.md#development) for full steps. In short:

```bash
git clone https://github.com/CK-APP-Org/CK_app.git
cd CK_app
npm install -g @quasar/cli
yarn install
quasar dev        # opens http://localhost:9000
```

> Run commands from the repo root (that's where `package.json` lives — this repo *is* the Quasar project root, there's no extra folder to `cd` into).

## Project structure cheat sheet
| Path | Purpose |
| --- | --- |
| `src/pages/` | Pages (.vue) — the main development area (12 feature pages) |
| `src/router/routes.js` | Route registry; must edit when adding a page |
| `src/store/` | Vuex local state (7 modules), persisted to localStorage |
| `src/services/` | Background services, e.g. `newsService.js` |
| `src/data/` | Static data (`metroData.js`, `restaurantData.json`, `schedules/`) |
| `src/boot/` | Startup init (axios, i18n) |
| `tools/` | Python tools (schedule/menu file conversion) — lives at the repo root, so Vite doesn't scan it |
| `src-capacitor/` | Android / iOS native wrappers and version config |
| `docs/decisions/` | Write-ups of what changed and why for past refactor/feature tasks — worth skimming the relevant ones before you start |

See the [README](README.en.md) for details.

## Branches & commit conventions
- **Don't push directly to `main`** — create a new branch (e.g. `fix/menu-date`, `feat/help-page`) and open a PR.
- Keep commit messages concise and descriptive of "what was done".
- ⚠️ **IMPORTANT: a `[deploy] ` prefix in the commit message triggers an automatic release!**
  - A commit prefixed with `[deploy] ` kicks off a GitHub Action that automatically attempts to build and upload to Google Play / TestFlight.
  - **Do NOT add `[deploy] ` to normal development commits**, to avoid accidental deployments. Add it only when you intend to release (and remember to bump the version first, see below).
  - This checks the message of whatever commit actually lands on `main`. Merging a PR through the GitHub UI defaults to a merge-commit title like "Merge pull request #...", which won't trigger it — it only fires if you manually edit that merge-commit title to start with `[deploy] `, or commit directly to `main` with a message that does.

## Adding a new page
1. Create `XxxPage.vue` in `src/pages/` (with `<template>`, `<script>`, `<style>`).
2. Register the route in `src/router/routes.js`, otherwise other pages can't link to it:
   ```js
   {
     path: "/xxx",
     component: () => import("layouts/MainLayout.vue"),
     children: [{ path: "", component: () => import("pages/XxxPage.vue") }],
   },
   ```
3. If it should be reachable from the home page or menu, add a button/link in the relevant page / `MainLayout.vue`.
4. If the page needs persistent data, consider adding a module under `src/store/modules/` and registering it in `src/store/index.js`.

## Code style
The project is set up with ESLint + Prettier (`.eslintrc.cjs`, `.editorconfig`). Before opening a PR, run:

```bash
yarn lint      # check
yarn format    # auto-format
```

- Follow the naming and indentation conventions of the surrounding code.
- Reuse existing stores / components where possible — don't reinvent the wheel.

## Changing data
- **Restaurant data**: edit `src/data/restaurantData.json` (FoodPage).
- **MRT data**: edit `src/data/metroData.js` (TransportPage).
- **Schedule data**: edit the three per-grade JSON files under `src/data/schedules/` (`gaoyi_schedules.json`, `gaoer_schedules.json`, `gaosan_schedules.json`). Each class entry has an `id` and a `schedule` (Monday-Friday, each an array of 8 subjects). The `index.js` in the same folder converts these automatically into what the pages need — you shouldn't need to touch `index.js` itself. **This data now lives directly in this repo, not the `Data` repo**, and needs no network request.
  - ⚠️ `tools/Convert_xlsx_to_json.py` currently outputs a different format than this (see [README known issues](README.en.md#known-issues--todo)) — it can't be used as-is to produce these files. Either hand-format new data to match the existing files, or update the tool first.
- **Menu data**: this is dynamic data living in the **Data** repo (`menus/` folder). See the README's [MenuPage](README.en.md#menupage) section for the workflow, and use `tools/menu_scraper.py` / `tools/menu_visualizer.py` for conversion.

## Bumping the version
Before a release, update the version everywhere (currently **3.1**):
- Android: `versionCode` and `versionName` in `src-capacitor/android/app/build.gradle`
- iOS: `CURRENT_PROJECT_VERSION` and `MARKETING_VERSION` in `src-capacitor/ios/App/App.xcodeproj/project.pbxproj` (both debug & release)
- Display: the version string in `src/pages/AboutPage.vue`
- (Recommended: also update `version` in `package.json`, which currently lags the real version)

## Testing
The project currently has **no automated tests** (`yarn test` is just a placeholder that returns success). Verify changes manually:
1. Test in the browser with `quasar dev`.
2. When touching native features, verify Android / iOS behavior on a real device or emulator where possible.

## Submitting a Pull Request
Self-check before a PR:
- [ ] Ran `yarn lint` and `yarn format`, no lint errors.
- [ ] Manually tested the affected pages with `quasar dev`.
- [ ] New pages are registered in `routes.js`.
- [ ] The commit message does **not** accidentally include `[deploy] ` (unless you really mean to release).
- [ ] If releasing, the version is bumped in every required place.
- [ ] The PR description clearly explains what changed and why.

## Contact
- Official Gmail: ckappofficial@gmail.com
- Official IG: [@ckappofficial](https://www.instagram.com/ckappofficial/)
- Official website: [ckapp-tw.web.app](https://ckapp-tw.web.app/)

Thanks for helping CK APP keep serving future CK students! 🎒
