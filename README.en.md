# CK APP — Campus Mobile App

**Language / 語言:** [中文](README.md) ｜ English (this page)

> Current version: **3.1** (the `versionName` in `src-capacitor/android/app/build.gradle`)　|　Docs last updated: 2026-06
>
> ⚠️ Note: the `version` field in `CK_app/package.json` is still `3.0.1`, which is out of sync with the real version. The source of truth for the version is Android's `build.gradle` and iOS's `project.pbxproj` (see [Development](#development)).

## Table of Contents
1. [What is CK APP?](#what-is-ck-app)
2. [Architecture](#architecture)
3. [Pages / Features](#pages--features)
4. [Store, i18n & other infrastructure](#store-i18n--other-infrastructure)
5. [Known issues & TODO](#known-issues--todo)
6. [Development](#development)
7. [Contributing](#contributing)

## What is CK APP?
CK APP is an app built by Diego Peng and Kimi Yang, 77th-cohort students of Chien Kuo High School (建中), during the summer of 2024. Its goal is to help every CK student deal with the everyday problems of school life. Since launching on both iOS and Android in September 2024, CK APP accumulated 2,080 downloads by September 2025. We hope CK APP can keep helping all future CK students.

## Architecture
CK APP's main code and data both live on GitHub, across two repos — `CK_app` and `Data` (there's actually a third repo, `Proxy`, but it's deprecated — it was the old Heroku code).

### Data
`Data` holds data that needs to change dynamically so CK APP can read it directly. Currently the data in active use is:
- `menus`: folder holding the cafeteria (熱食部) menus
- `ClassesSchedule.json`: class schedules for the whole school

### CK_app
`CK_app` is the main CK APP codebase, written with the Quasar Framework — essentially HTML, CSS, and JavaScript. We chose Quasar because it can output both Android and iOS apps from one codebase, so we don't have to write two separate versions.

Commonly used files / folders:
- **public**
	- `food`: icons for FoodPage
	- `metro`: icons for each MRT line in TransportPage
	- `promo`: the PromoPage logo
- **src**
	- **boot**: initialization code loaded when the app starts
		- `axios.js`: configures axios (HTTP requests)
		- `firebase.js`: initializes Firebase
		- `i18n.js`: initializes internationalization (vue-i18n)
	- **data**
		- `metroData.js`: Taipei MRT station and line info
		- `restaurantData.json`: FoodPage restaurant data (we considered moving it to `Data` for dynamic updates, but for some reason the Android build couldn't read it `==`)
	- **i18n**: localization strings (currently only `en-US`, not yet fully used)
	- **pages**: the heart of CK APP — most development happens here (13 pages total, see [Pages / Features](#pages--features))
	- **components / layouts**: shared components (e.g. `EssentialLink.vue`) and layouts (`MainLayout.vue`)
	- **router**
		- `routes.js`: register any new page here so other pages can link to it
	- **services**
		- `newsService.js`: auto-refreshes NewsPage data every 2 minutes
	- **store**: pages mutate local data through here — very important (see the [Store section](#store-i18n--other-infrastructure))
	- **utils**
		- `xmlUtils.js`: helper for parsing the school website's XML
- **tools** (lives at the repo root, alongside `CK_app/` — not part of the Vite project)
	- `Convert_xlsx_to_json.py`: converts the academic-office schedule file (.xls) into JSON; usage notes are inside the file
	- `menu_scraper.py`: (see the MenuPage section)
	- `menu_visualizer.py`: auto-converts the cafeteria menu into image files

Besides GitHub, we also use Firebase to store user data, plus the [official website](https://ckapp-tw.web.app/) (built & maintained by Ian Wen of the 78th cohort), the official Gmail (ckappofficial@gmail.com), and the [official Instagram account](https://www.instagram.com/ckappofficial/).

## Pages / Features
CK APP currently has **13 pages** (all registered in `src/router/routes.js`), all written with the Quasar Framework. A Quasar `.vue` file has three parts — `<template>`, `<script>`, `<style>` — i.e. HTML, JavaScript, and CSS.

### HomePage
Besides the six page buttons, the home page shows three dynamic pieces of info: the current class, today's to-dos, and pinned school-website content.

### SchedulePage
The schedule page has two buttons that fetch `ClassesSchedule.json`: set class & reload data.

### TodoPage
Split into two parts: a monthly calendar & a to-do list. How it works is a bit complicated, but you shouldn't need to touch it, so we won't explain it :D

### TransportPage
This is CK APP's largest page, split into a YouBike part and a Taipei MRT part.

For YouBike, we read the [Taipei City](https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json) and [New Taipei City](https://data.ntpc.gov.tw/openapi/swagger-ui/index.html?configUrl=%2Fapi%2Fv1%2Fopenapi%2Fswagger%2Fconfig&urls.primaryName=%E6%96%B0%E5%8C%97%E5%B8%82%E6%94%BF%E5%BA%9C%E4%BA%A4%E9%80%9A%E5%B1%80%2863%29#/) YouBike APIs separately. The New Taipei API is a bit nastier — the data is split across two pages, so we need two API calls.\
Also, adding a station has a feature to find the user's nine nearest stations. We originally wanted to detect the user's location directly, but that requires the user to grant permission, and it was a bit hard to write, so we gave up on it for now.

For the MRT, we had to apply to Taipei Metro to get their API. Their terms of use actually include these two clauses:
- Members must proactively notify the company of their application results after development is complete, and provide value-added application content, user counts, and other statistics that help assess the value-added results, as a reference for the company's API development management.
- If a member does not use the company's API service for more than three months, the company reserves the right to terminate the member account and cancel membership.

…but we just ignored that.

### MenuPage
The cafeteria usually uploads next month's menu to [the cloud](https://drive.google.com/drive/folders/1jZTQNkQVCoDVmMPQaG2Ov_Zwu4o4cmQQ) at the end of each month. So at the end of every month we need to download the xlsx files from the cloud (4 of them, one per week). Then, open a folder and put `menu_scraper` and `menu_visualizer` in it. Next, one by one, rename each menu file to `menu.xlsx`, put it in that folder, and run `menu_visualizer`. A folder (`menu_visualizations`) should appear containing the converted daily-menu PNG files. Finally, put those images into the `menus` folder of the `Data` repo and push — CK APP will then be able to read them.

Filename convention: a menu image is named after that week's Monday date plus the day of the week. For example, 2025/9/11 is a Thursday; that week's Monday is 9/8, so the menu file for 9/11 is `2025-09-08_4.png`. However, due to a bug, the currently shipped version of MenuPage sometimes counts the Monday date one day too early. We work around this with `menu_visualizer`: for the 9/11 example, it actually also outputs `2025-09-07_4.png`.

### FoodPage
Our map uses the Leaflet plugin, and restaurant data comes from `restaurantData.json`. Some shops show closing times past 24:00 — that's so the marker colors display correctly (otherwise after 23:30 the marker would turn light green, because the code thinks it's closing at midnight, when the shop might actually stay open until 2 AM). This can be fixed later.\
As mentioned, we wanted to move `restaurantData.json` to the `Data` repo for easier dynamic updates, but on Android there's some bug where it can fetch the GitHub data yet fails to render the markers. Worth another try.

### NewsPage
The school-website page's data comes from the Wi-Fi-symbol-looking buttons in the "important announcements" and "latest news" sections of the [CK school website](https://www.ck.tp.edu.tw/nss/p/index); clicking them yields an XML file we can read.\
As mentioned, `newsService.js` fetches the school-website data in the background every two minutes.

### PromoPage
A directory page for the "Joint Partner Shops of the Four Schools (建北中成)". It contains the partner-shop usage rules and area buttons (CK, Zhongshan, Chenggong, Taipei Main Station, Ximen, Gongguan, Guting, etc.) linking to the external site [`promo.cksc.tw`](https://promo.cksc.tw).

### SouvenirPage
Embeds the external souvenir store [`souvenir.cksc.tw/auth`](https://souvenir.cksc.tw/auth) in an iframe. It has almost no logic of its own; it mainly serves as an in-app entry point.

### HelpPage (Decision Helper)
A small utility page: the user enters one option per line, and on button press it randomly picks one for you. Pure front-end, no external data.

### SettingsPage
Pretty self-explanatory.

### AboutPage
Shows version info (currently 3.1). Remember to bump the version (see [Development](#development)). We should add developer bios later.

### LoginPage
The sign-up / login feature should probably be removed in the future. Currently we dump user data into Firebase, but CK APP now seems barely able to access Firebase — we suspect it's because so many users uploaded data that even the admin console lags badly when trying to view it.

> There's also `ErrorNotFound.vue` as the 404 page for unmatched routes (not counted among the 13 feature pages).

## Store, i18n & other infrastructure

### Store (Vuex)
`src/store/` is the app's local-state hub and is **very important**. Pages read and write through it, and `localStoragePlugin.js` automatically syncs it to the browser's / device's `localStorage`, so data persists across app restarts.

There are currently 8 modules (`src/store/modules/`):

| Module | Feature |
| --- | --- |
| `youbike` | YouBike station data and favorite stations (TransportPage) |
| `metro` | Taipei MRT station/line state (TransportPage) |
| `news` | School-website announcement cache (refreshed every 2 min by newsService, NewsPage) |
| `schedule` | Class schedule and the currently set class (SchedulePage) |
| `todo` | Calendar and to-do items (TodoPage) |
| `food` | FoodPage restaurant-related state |
| `account` | User account / login state (LoginPage) |
| `settings` | App settings (SettingsPage) |

Also:
- `localStoragePlugin.js`: persists the store to `localStorage`.
- `clearALL` action / `CLEAR_DATA` mutation: clears all local data and resets every module to its default state.

### i18n
The project has an internationalization scaffold via `vue-i18n` (`src/boot/i18n.js`, `src/i18n/`), with `en-US` as the default locale. In practice, though, there's only one `en-US` string set and most of the UI text is still hard-coded in Chinese, so i18n isn't really in use yet — this is the starting point if anyone wants to add a Chinese/English toggle later.

## Known issues & TODO
The TODOs / known bugs scattered across the page descriptions, collected here so whoever takes over can see them at a glance:

- [ ] **Version out of sync**: `package.json` says `3.0.1` while the shipped version is `3.1`. Consider unifying the source of truth.
- [ ] **MenuPage date off-by-one**: MenuPage sometimes counts the Monday date one day early; currently worked around by having `menu_visualizer` output an extra filename. Root cause unfixed.
- [ ] **FoodPage hours hack**: to keep marker colors correct, some shops' hours are written as past 24:00; overnight hours should be handled properly later.
- [ ] **restaurantData can't be made dynamic**: we wanted to move it to the `Data` repo for dynamic updates, but the Android build fetches the data yet fails to draw markers. Needs investigation.
- [ ] **TransportPage geolocation**: auto-detecting the user's location for nearest stations was shelved due to permission and implementation cost.
- [ ] **LoginPage / Firebase**: the login feature should be removed in the future; Firebase is hard to access due to data volume.
- [ ] **i18n not realized**: the scaffold exists but most UI text is hard-coded Chinese.
- [ ] **AboutPage**: could add developer bios.

## Development
### Simulating in a browser on your computer
1. Install Node.js (https://nodejs.org/en/download/)
2. Install Git (https://git-scm.com/downloads)
3. Open a terminal and run `git clone https://github.com/CK-APP-Org/CK_app.git`
4. Enter the CK_app folder: `cd CK_app/CK_app`
5. Install the Quasar CLI: `npm install -g @quasar/cli`
6. Install dependencies: `yarn install`
7. Start the dev server: `quasar dev`
8. Open `http://localhost:9000` in your browser

### Publishing (Android)
[![Build (& Deploy to Google Play) Android APP](https://github.com/CK-APP-Org/CK_app/actions/workflows/build_android.yml/badge.svg)](https://github.com/CK-APP-Org/CK_app/actions/workflows/build_android.yml)
1. Bump the version in `CK_app\src-capacitor\android\app\build.gradle` (`versionCode` & `versionName`)
2. (a) Run the GitHub Action "Deploy Android APP to Google Play"; or (b) prefix the commit message with `[deploy] ` to automatically attempt upload & release

### Publishing (iOS)
[![Build (& Deploy to TestFlight) iOS APP](https://github.com/CK-APP-Org/CK_app/actions/workflows/build_ios.yml/badge.svg)](https://github.com/CK-APP-Org/CK_app/actions/workflows/build_ios.yml)
1. Bump the version in `CK_app\src-capacitor\ios\App\App.xcodeproj\project.pbxproj` (`CURRENT_PROJECT_VERSION` & `MARKETING_VERSION`) (both debug & release)
2. (a) Run the GitHub Action "Deploy iOS App to TestFlight"; or (b) prefix the commit message with `[deploy] ` to automatically attempt upload & release

## Contributing
Contributions and handoffs are welcome! Please read the [Contributing Guide (CONTRIBUTING.en.md)](CONTRIBUTING.en.md) before opening a PR.
