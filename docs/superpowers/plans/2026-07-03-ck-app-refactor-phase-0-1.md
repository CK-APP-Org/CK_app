# CK App Refactor — Phase 0 (Prep) + Phase 1 (Security) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the Python data tools out of the Quasar app's Vite root, and remove the hardcoded, real Taipei Metro API credential from source control — the two Phase 0/Phase 1 items from `docs/refactoring-plan.md` that don't depend on any later phase.

**Architecture:** No runtime architecture changes. Task 1 relocates non-JS tooling files (pure file move + doc updates, zero code behavior change). Task 2 replaces 6 hardcoded credential literals in `TransportPage.vue`'s SOAP XML template strings with `process.env.METRO_API_USER`/`process.env.METRO_API_PASS`, sourced from a gitignored local `.env.local` file in dev and from GitHub Actions secrets in CI, via a small env-loader added to `quasar.config.js`.

**Tech Stack:** Quasar 2 / Vue 3 (Vite-based `@quasar/app-vite`), Node.js (config-time, in `quasar.config.js`), GitHub Actions.

## Global Constraints

- No commit in this branch uses the `[deploy]` prefix — that stays under the user's manual control. (Source: `docs/superpowers/specs/2026-07-03-ck-app-refactor-design.md`)
- The real Metro credential value must never be committed to git, in this repo or its history from this point forward. (Source: same design doc, "Deviation from `docs/refactoring-plan.md` as written")
- Don't add new runtime or dev dependencies for this — `package.json`/`yarn.lock` stay untouched so `yarn install --frozen-lockfile` (used by CI) keeps working unmodified. (New constraint identified during planning — see Deviations below.)
- Follow the existing code style already in each touched file (this codebase does not use Prettier/ESLint auto-fix in CI, but `.eslintrc.cjs` exists — don't introduce new lint errors).

## Deviations from `docs/refactoring-plan.md` / the design doc (read before implementing)

1. **Phase 1-A (Firebase config dedup) is dropped from this plan.** Its targets — the `initializeApp`/`getFirestore` blocks in `CK_app/src/pages/LoginPage.vue` (lines 152-163) and three blocks in `CK_app/src/pages/SettingsPage.vue` (lines 320-331, 442-455, 760-771) — are entirely inside code that Phase 3 deletes wholesale (the dead login/account feature). The line-320 block in `SettingsPage.vue` is in fact already-dead code today (the `db` it creates is never read). Deduplicating Firebase init now means editing code that gets deleted one phase later for no lasting benefit. This work is deferred to Phase 3's own plan, which should confirm that after the login/account feature is deleted, `firebase`, `CK_app/src/boot/firebase.js`, and `CK_app/firebase.js` have no remaining callers and can be deleted outright rather than "fixed."
2. **Phase 0 and Phase 1 are combined into a single branch and PR** (`refactor/phase-0-1-prep-security`), not two. The design doc's default is one branch/PR per phase, but Phase 0 has no independent value on its own (it's pure prep with nothing to functionally verify), and with Phase 1-A dropped (deviation 1), Phase 1 is now small enough that splitting adds review overhead disproportionate to the change. If this feels wrong once you see the diff, splitting into two PRs before merging is still an option — the two tasks below are separate commits specifically so that split remains easy.
3. **Phase 0's "document a manual smoke-test checklist" is already satisfied.** `docs/refactoring-plan.md`'s own "Verification (end-to-end after all phases)" section already lists the exact checklist (YouBike, Metro, Food, Calendar, Todo, Home, Settings, Menu, News) that phase asked for. No new file is created for this.
4. **No `dotenv` dependency is added.** The plan needs to read a local `.env.local` file into `process.env` before `quasar.config.js` builds its config. Rather than adding a new dependency (which cuts against this refactor's own Phase 2 goal of *removing* unused dependencies), Task 2 adds an 11-line inline parser using Node's built-in `fs` module.

---

## Task 1: Move Python data tools out of the Vite app to the repo root

**Why this matters:** `CK_app/src/tools/` (Python scripts + `.xlsx` files) currently lives inside `CK_app/`, which is Vite's project root — Vite's dev-server file watcher walks this entire tree. These files have nothing to do with the Vite/Vue build; moving them to a repo-root `tools/` directory (a sibling of `CK_app/` and `docs/`) takes them out of Vite's purview entirely.

**Files:**
- Move: `CK_app/src/tools/Convert_xlsx_to_json.py` → `tools/Convert_xlsx_to_json.py`
- Move: `CK_app/src/tools/menu_scraper.py` → `tools/menu_scraper.py`
- Move: `CK_app/src/tools/menu_visualizer.py` → `tools/menu_visualizer.py`
- Move: `CK_app/src/tools/menu.xlsx` → `tools/menu.xlsx`
- Move: `CK_app/src/tools/第11週-建中菜單1141110.xlsx` → `tools/第11週-建中菜單1141110.xlsx`
- Move: `CK_app/src/tools/第12週-建中菜單1141117.xlsx` → `tools/第12週-建中菜單1141117.xlsx`
- Move: `CK_app/src/tools/第13週-建中菜單1141124.xlsx` → `tools/第13週-建中菜單1141124.xlsx`
- Modify: `CONTRIBUTING.md:41`
- Modify: `CONTRIBUTING.en.md:41`
- Modify: `README.md:55-58`
- Modify: `README.en.md:55-58`

**Interfaces:**
- Produces: a repo-root `tools/` directory. Anyone running these scripts must `cd tools` first (same as they previously had to `cd CK_app/src/tools`) — the scripts use paths relative to their own working directory (e.g. `scrape_menu("menu.xlsx")`, `output_dir = "menu_visualizations"`), not paths relative to the Vite app, so moving the whole directory together changes nothing about how they're invoked beyond the `cd` target.

- [ ] **Step 1: Create the branch**

```bash
git checkout main
git pull
git checkout -b refactor/phase-0-1-prep-security
```

- [ ] **Step 2: Confirm nothing inside the Vite app imports from `src/tools`**

Run (from repo root):
```bash
grep -rn "tools/" CK_app/src --include=*.vue --include=*.js
```
Expected: no output (or only unrelated matches, e.g. a path containing the word "tools" for an unrelated reason — inspect any hit before proceeding). This confirms the move is safe: nothing in the Vue/JS app imports these files.

- [ ] **Step 3: Move the files with `git mv`**

```bash
mkdir tools
git mv "CK_app/src/tools/Convert_xlsx_to_json.py" "tools/Convert_xlsx_to_json.py"
git mv "CK_app/src/tools/menu_scraper.py" "tools/menu_scraper.py"
git mv "CK_app/src/tools/menu_visualizer.py" "tools/menu_visualizer.py"
git mv "CK_app/src/tools/menu.xlsx" "tools/menu.xlsx"
git mv "CK_app/src/tools/第11週-建中菜單1141110.xlsx" "tools/第11週-建中菜單1141110.xlsx"
git mv "CK_app/src/tools/第12週-建中菜單1141117.xlsx" "tools/第12週-建中菜單1141117.xlsx"
git mv "CK_app/src/tools/第13週-建中菜單1141124.xlsx" "tools/第13週-建中菜單1141124.xlsx"
rmdir "CK_app/src/tools" 2>/dev/null || true
```

- [ ] **Step 4: Update `CONTRIBUTING.md`**

In `CONTRIBUTING.md`, the "專案結構速查" table currently has (line 41):
```
| `src/tools/` | Python 工具（課表/菜單轉檔） |
```
Replace that row with:
```
| `../tools/` | Python 工具（課表/菜單轉檔），位於 repo 根目錄，與 `CK_app/` 同層，避免被 Vite 掃到 |
```

- [ ] **Step 5: Update `CONTRIBUTING.en.md`**

In `CONTRIBUTING.en.md`, the equivalent table row (line 41) currently reads:
```
| `src/tools/` | Python tools (schedule/menu file conversion) |
```
Replace with:
```
| `../tools/` | Python tools (schedule/menu file conversion) — lives at the repo root, alongside `CK_app/`, so Vite doesn't scan it |
```

- [ ] **Step 6: Update `README.md`**

In `README.md`, remove this nested bullet (currently lines 55-58, under `- **src**`):
```
	- **tools**
		- Convert_xlsx_to_json.py: 把教務處課表檔(.xls)轉成json，使用說明在檔案裡
		- menu_scraper.py: (見 MenuPage 說明)
		- menu_visualizer.py: 將熱食部菜單自動轉成圖檔
```
and add this as its own top-level bullet immediately after the `- **src**` block ends (i.e. after its last sub-bullet, which is `- **utils**` / `xmlUtils.js`), at the same indentation as `- **public**` and `- **src**`:
```
- **tools**（位於 repo 根目錄，與 `CK_app/` 同層，非 Vite 專案的一部分）
	- Convert_xlsx_to_json.py: 把教務處課表檔(.xls)轉成json，使用說明在檔案裡
	- menu_scraper.py: (見 MenuPage 說明)
	- menu_visualizer.py: 將熱食部菜單自動轉成圖檔
```

- [ ] **Step 7: Update `README.en.md`**

In `README.en.md`, remove this nested bullet (currently lines 55-58, under `- **src**`):
```
	- **tools**
		- `Convert_xlsx_to_json.py`: converts the academic-office schedule file (.xls) into JSON; usage notes are inside the file
		- `menu_scraper.py`: (see the MenuPage section)
		- `menu_visualizer.py`: auto-converts the cafeteria menu into image files
```
and add this as its own top-level bullet immediately after the `- **src**` block ends, at the same indentation as `- **public**` and `- **src**`:
```
- **tools** (lives at the repo root, alongside `CK_app/` — not part of the Vite project)
	- `Convert_xlsx_to_json.py`: converts the academic-office schedule file (.xls) into JSON; usage notes are inside the file
	- `menu_scraper.py`: (see the MenuPage section)
	- `menu_visualizer.py`: auto-converts the cafeteria menu into image files
```

- [ ] **Step 8: Verify the app still builds**

```bash
cd CK_app
yarn install --frozen-lockfile
yarn lint
```
Expected: both commands exit 0. (`yarn lint` catches any accidental syntax issue; the tools move touches no `.vue`/`.js` under `src/`, so this should be unaffected.)

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "refactor: move Python data tools out of Vite app to repo-root tools/"
```

---

## Task 2: Remove the hardcoded Taipei Metro API credential from source

**Why this matters:** a real Taipei Metro account's email and password — see `docs/EVALUATION.md` §7 for the value, not repeated here to avoid one more committed copy of it — is hardcoded 3× (6 lines total) in `CK_app/src/pages/TransportPage.vue` and shipped in every build (web, Android, iOS). This is the evaluation's top Critical finding.

**This task changes where the credential lives, not what its value is.** The actual credential must be rotated by the user (Claude cannot create a new Taipei Metro/TDX account) — until that happens, treat the current value as compromised. After this task lands, the app reads the credential from `process.env.METRO_API_USER`/`process.env.METRO_API_PASS` instead of a literal; nothing in git ever holds the real value.

**Files:**
- Create: `CK_app/.env.example`
- Modify: `CK_app/quasar.config.js`
- Modify: `CK_app/src/pages/TransportPage.vue:1234-1235` (inside `fetchTrackInfo`)
- Modify: `CK_app/src/pages/TransportPage.vue:1333-1334` (inside `fetchCarWeight`)
- Modify: `CK_app/src/pages/TransportPage.vue:1401-1402` (inside `fetchCarWeightBR`)
- Modify: `.github/workflows/build_android.yml`
- Modify: `.github/workflows/build_ios.yml`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `process.env.METRO_API_USER` and `process.env.METRO_API_PASS`, available inside any client-side file in the Quasar app (via `quasar.config.js`'s `build.env`, which Quasar statically replaces at build time — the same mechanism already used for `process.env.SERVER`/`process.env.VUE_ROUTER_MODE` in `CK_app/src/router/index.js`). Later phases that touch `TransportPage.vue` (Phase 4-A's component split) should carry these two references along with the code they're extracted into.

- [ ] **Step 1: Create `CK_app/.env.example`**

```
# Copy this file to .env.local (already gitignored via .env.local* in
# CK_app/.gitignore) and fill in the real values for local development.
# Never commit .env.local or the real credential value.
#
# Ask a maintainer for the current Taipei Metro API (api.metro.taipei) account.
METRO_API_USER=
METRO_API_PASS=
```

- [ ] **Step 2: Add a local-env loader to `quasar.config.js`**

At the top of `CK_app/quasar.config.js`, change:
```js
const { configure } = require("quasar/wrappers");
const path = require("path");
```
to:
```js
const { configure } = require("quasar/wrappers");
const path = require("path");
const fs = require("fs");

// Loads CK_app/.env.local (gitignored) into process.env for local dev.
// A variable already set in the environment (e.g. by CI) is never
// overwritten, so real secrets set as CI env vars always win.
function loadDotEnvLocal(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf-8").split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    const value = rawValue.replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnvLocal(path.resolve(__dirname, ".env.local"));
```

- [ ] **Step 3: Expose the two variables to client code via `build.env`**

In `CK_app/quasar.config.js`, inside the `build: { ... }` object, change:
```js
    build: {
      target: {
        browser: ["es2019", "edge88", "firefox78", "chrome87", "safari13.1"],
        node: "node16",
      },

      vueRouterMode: "hash", // available values: 'hash', 'history'
```
to:
```js
    build: {
      target: {
        browser: ["es2019", "edge88", "firefox78", "chrome87", "safari13.1"],
        node: "node16",
      },

      env: {
        METRO_API_USER: process.env.METRO_API_USER || "",
        METRO_API_PASS: process.env.METRO_API_PASS || "",
      },

      vueRouterMode: "hash", // available values: 'hash', 'history'
```

- [ ] **Step 4: Replace the credential in `fetchTrackInfo` (`TransportPage.vue`)**

Change (the real credential values are in the current `TransportPage.vue`, not repeated here — see `docs/EVALUATION.md` §7):
```js
  <getTrackInfo xmlns="http://tempuri.org/">
  <userName>REDACTED_METRO_USER</userName>
  <passWord>REDACTED_METRO_PASS</passWord>
  </getTrackInfo>
```
to:
```js
  <getTrackInfo xmlns="http://tempuri.org/">
  <userName>${process.env.METRO_API_USER}</userName>
  <passWord>${process.env.METRO_API_PASS}</passWord>
  </getTrackInfo>
```

- [ ] **Step 5: Replace the credential in `fetchCarWeight` (`TransportPage.vue`)**

Change (again, real values are in the current file, not repeated here):
```js
<getCarWeightByInfoEx xmlns="http://tempuri.org/">
<userName>REDACTED_METRO_USER</userName>
<passWord>REDACTED_METRO_PASS</passWord>
</getCarWeightByInfoEx>
```
to:
```js
<getCarWeightByInfoEx xmlns="http://tempuri.org/">
<userName>${process.env.METRO_API_USER}</userName>
<passWord>${process.env.METRO_API_PASS}</passWord>
</getCarWeightByInfoEx>
```

- [ ] **Step 6: Replace the credential in `fetchCarWeightBR` (`TransportPage.vue`)**

Change (again, real values are in the current file, not repeated here):
```js
<getCarWeightBRInfo xmlns="http://tempuri.org/">
<userName>REDACTED_METRO_USER</userName>
<passWord>REDACTED_METRO_PASS</passWord>
</getCarWeightBRInfo>
```
to:
```js
<getCarWeightBRInfo xmlns="http://tempuri.org/">
<userName>${process.env.METRO_API_USER}</userName>
<passWord>${process.env.METRO_API_PASS}</passWord>
</getCarWeightBRInfo>
```

- [ ] **Step 7: Confirm no other occurrence of the credential remains**

```bash
grep -rn "<metro-username-from-docs/EVALUATION.md-§7>\|<metro-password-from-docs/EVALUATION.md-§7>" CK_app/ tools/ docs/ .github/
```
(Substitute the two literal values documented in `docs/EVALUATION.md` §7 for the two placeholders above — not repeated here to avoid another committed copy.)
Expected: no output.

- [ ] **Step 8: Wire the secrets into the Android CI build**

In `.github/workflows/build_android.yml`, change:
```yaml
      - name: Build Quasar app for Android (Capacitor)
        run: |
          chmod +x src-capacitor/android/gradlew
          yarn android
          cd src-capacitor/android
          ./gradlew bundle
```
to:
```yaml
      - name: Build Quasar app for Android (Capacitor)
        env:
          METRO_API_USER: ${{ secrets.METRO_API_USER }}
          METRO_API_PASS: ${{ secrets.METRO_API_PASS }}
        run: |
          chmod +x src-capacitor/android/gradlew
          yarn android
          cd src-capacitor/android
          ./gradlew bundle
```

- [ ] **Step 9: Wire the secrets into the iOS CI build**

In `.github/workflows/build_ios.yml`, change:
```yaml
      - name: Build Quasar app for iOS (Capacitor)
        run: |
          yarn ios
          cd src-capacitor
          npx cap update ios
          npx cap copy ios
          xcodebuild -workspace './ios/App/App.xcworkspace' -scheme App -destination generic/platform=iOS -archivePath App.xcarchive archive
          xcodebuild archive -archivePath App.xcarchive -exportArchive -exportOptionsPlist ./archive.plist -exportPath output -allowProvisioningUpdates
```
to:
```yaml
      - name: Build Quasar app for iOS (Capacitor)
        env:
          METRO_API_USER: ${{ secrets.METRO_API_USER }}
          METRO_API_PASS: ${{ secrets.METRO_API_PASS }}
        run: |
          yarn ios
          cd src-capacitor
          npx cap update ios
          npx cap copy ios
          xcodebuild -workspace './ios/App/App.xcworkspace' -scheme App -destination generic/platform=iOS -archivePath App.xcarchive archive
          xcodebuild archive -archivePath App.xcarchive -exportArchive -exportOptionsPlist ./archive.plist -exportPath output -allowProvisioningUpdates
```

- [ ] **Step 10: Smoke-test locally**

```bash
cd CK_app
yarn dev
```
Then, via browser automation against `http://localhost:9000/#/transport`:
- Confirm the page loads without a JS error in the console.
- Confirm the Metro station cards render their existing loading/error state (they will show an error or "no data" state, not live arrivals — there is no real credential in this sandbox, since `.env.local` doesn't exist here, so `process.env.METRO_API_USER` resolves to `""` and the Taipei Metro API will reject the SOAP request. That rejection must be caught by `TransportPage.vue`'s existing `try/catch` around each fetch, the same way it already handles the live API being down — it must not crash the page.)
- Confirm the YouBike station cards (a separate, unrelated API) still load normally, showing this change didn't regress anything outside the Metro code paths.

Note in the PR description: full Metro functional verification (real arrival times rendering) requires the user to either (a) drop the rotated credential into `CK_app/.env.local` and re-run this smoke test locally, or (b) add the `METRO_API_USER`/`METRO_API_PASS` GitHub Actions secrets and test the CI-built app once merged.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "security: move Taipei Metro API credential out of source into env vars"
```

---

## Task 3: Open the PR

- [ ] **Step 1: Push the branch**

```bash
git push -u origin refactor/phase-0-1-prep-security
```

- [ ] **Step 2: Open the PR**

```bash
gh pr create --title "Refactor: move Python tools out of app + remove hardcoded Metro credential" --body "$(cat <<'EOF'
## Summary
- Moves `CK_app/src/tools/` (Python scripts + xlsx files) to a repo-root `tools/` directory, out of Vite's project root.
- Removes the hardcoded Taipei Metro API credential from `TransportPage.vue`; it now reads from `process.env.METRO_API_USER`/`METRO_API_PASS`, sourced from a gitignored `.env.local` locally and from GitHub Actions secrets in CI.

## Action required before merging
- [ ] Rotate the Taipei Metro / TDX account credential (see `docs/EVALUATION.md` §7 for the account identifier) — the old one is compromised regardless of this PR, since it's already in git history.
- [ ] Add `METRO_API_USER` and `METRO_API_PASS` as GitHub Actions repository secrets with the **new**, rotated credential (Settings → Secrets and variables → Actions). Without this, CI-built apps will ship with an empty Metro credential and Metro live-arrival data will not load (fails gracefully, does not crash).

## Deviations from docs/refactoring-plan.md (see docs/superpowers/plans/2026-07-03-ck-app-refactor-phase-0-1.md for full rationale)
- Phase 1-A (Firebase config dedup) is deferred to Phase 3, since its target code is deleted wholesale by Phase 3's login/account removal.
- Phase 0 and Phase 1 are combined into this one PR rather than split into two.

## Test plan
- [ ] `yarn install --frozen-lockfile` and `yarn lint` pass
- [ ] `yarn dev` → `/#/transport` loads without console errors; YouBike cards still work; Metro cards show a graceful error/empty state (expected, no real credential in this environment)
- [ ] Confirm a repo-wide grep for the two literal values documented in `docs/EVALUATION.md` §7 (Metro account email and password) returns nothing
EOF
)"
```

---

## Self-Review Notes

- **Spec coverage:** Both `docs/refactoring-plan.md` Phase 0 items (branch, move `src/tools/`) and Phase 1-B (Metro credential) are covered. Phase 1-A is explicitly and intentionally deferred (see Deviations). The plan's own "document a smoke-test checklist" sub-item is satisfied by the pre-existing checklist in `docs/refactoring-plan.md` (see Deviations).
- **Placeholder scan:** No TBD/TODO; every step has literal file paths, literal before/after code, and literal commands.
- **Type/name consistency:** `METRO_API_USER`/`METRO_API_PASS` are the same two names used in `.env.example`, `quasar.config.js` (both the loader and `build.env`), all three `TransportPage.vue` edits, and both workflow files — verified consistent throughout.
