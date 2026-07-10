# 貢獻指南 Contributing

**語言 / Language：** 中文（本頁） ｜ [English](CONTRIBUTING.en.md)

歡迎接手與貢獻 CK APP！這份文件說明如何在本專案開發、提交變更與上架。第一次接觸的人請先讀 [README.md](README.md) 了解整體架構。

## 目錄
1. [開發環境設定](#開發環境設定)
2. [專案結構速查](#專案結構速查)
3. [分支與 commit 規範](#分支與-commit-規範)
4. [新增一個頁面](#新增一個頁面)
5. [程式風格](#程式風格)
6. [資料的修改](#資料的修改)
7. [改版本號](#改版本號)
8. [測試](#測試)
9. [送出 Pull Request](#送出-pull-request)
10. [聯絡方式](#聯絡方式)

## 開發環境設定
完整步驟請見 [README 的「開發說明」](README.md#開發說明)。簡述：

```bash
git clone https://github.com/CK-APP-Org/CK_app.git
cd CK_app
npm install -g @quasar/cli
yarn install
quasar dev        # 開啟 http://localhost:9000
```

> 請在 repo 根目錄執行指令（`package.json` 在這裡；這個repo本身就是Quasar專案根目錄，不需要再往下一層資料夾）。

## 專案結構速查
| 路徑 | 用途 |
| --- | --- |
| `src/pages/` | 各頁面（.vue），主要開發區（共 12 個功能頁面） |
| `src/router/routes.js` | 路由登記處；新增頁面必改 |
| `src/store/` | Vuex 本機狀態（7 個模組），會持久化到 localStorage |
| `src/services/` | 背景服務，如 `newsService.js` |
| `src/data/` | 靜態資料（`metroData.js`、`restaurantData.json`、`schedules/`） |
| `src/boot/` | 啟動初始化（axios、i18n） |
| `tools/` | Python 工具（課表/菜單轉檔），位於 repo 根目錄，避免被 Vite 掃到 |
| `src-capacitor/` | Android / iOS 原生包裝與版本設定 |
| `docs/decisions/` | 過去每個重構/功能任務的「改了什麼、為什麼」說明文件，接手前建議先掃過相關的 |

詳細說明見 [README](README.md)。

## 分支與 commit 規範
- **不要直接 push 到 `main`**，請開新分支（例如 `fix/menu-date`、`feat/help-page`）再發 PR。
- Commit message 請簡潔說明「做了什麼」。
- ⚠️ **重要：commit message 開頭的 `[deploy] ` 會觸發自動上架！**
  - 加上 `[deploy] ` 前綴的 commit 會啟動 GitHub Action，自動嘗試 build 並上傳到 Google Play / TestFlight。
  - **一般開發 commit 請勿加 `[deploy] `**，以免誤觸發部署。確定要發版時才加（並記得先改版本號，見下）。
  - 這個檢查看的是「實際 push 到 `main` 的那個 commit」的訊息。用GitHub網頁介面合併PR時，預設的merge commit標題是「Merge pull request #...」，不會誤觸發；只有你自己手動把merge commit標題改成`[deploy] `開頭，或是直接commit到main且訊息以`[deploy] `開頭，才會觸發上架。

## 新增一個頁面
1. 在 `src/pages/` 新增 `XxxPage.vue`（含 `<template>`、`<script>`、`<style>`）。
2. 到 `src/router/routes.js` 登記路由，否則其他頁面無法連過去：
   ```js
   {
     path: "/xxx",
     component: () => import("layouts/MainLayout.vue"),
     children: [{ path: "", component: () => import("pages/XxxPage.vue") }],
   },
   ```
3. 若需要從首頁或選單進入，記得在對應的頁面 / `MainLayout.vue` 加上按鈕或連結。
4. 若頁面需要持久化資料，考慮在 `src/store/modules/` 新增模組並註冊到 `src/store/index.js`。

## 程式風格
專案已設定 ESLint + Prettier（`.eslintrc.cjs`、`.editorconfig`）。送 PR 前請執行：

```bash
yarn lint      # 檢查
yarn format    # 自動排版
```

- 沿用周邊程式的命名與縮排習慣。
- 盡量重用既有的 store / components，不要重造輪子。

## 資料的修改
- **餐廳資料**：改 `src/data/restaurantData.json`（FoodPage）。
- **北捷資料**：改 `src/data/metroData.js`（TransportPage）。
- **課表資料**：改 `src/data/schedules/` 底下依年級分開的三個 JSON（`gaoyi_schedules.json`、`gaoer_schedules.json`、`gaosan_schedules.json`），格式是「每個班一個 `id` + 一份 `schedule`（週一到週五，每天 8 節課的科目陣列）」，同資料夾的 `index.js` 會自動轉成頁面要的格式，不需要手動改 `index.js`。**這份資料現在直接放在這個repo裡，不再放 Data repo**，也不需要網路請求。
  - ⚠️ `tools/Convert_xlsx_to_json.py` 目前輸出的格式跟這裡不一樣（見 [README 已知問題](README.md#已知問題與待辦)），還不能直接拿來產生這些檔案，要嘛手動比照現有檔案格式整理，要嘛先更新這個工具。
- **菜單資料**：屬於動態資料，放在 **Data** repo（`menus/` 資料夾）。流程見 README 的 [MenuPage](README.md#menupage-熱食部) 說明，可用 `tools/` 的 `menu_scraper.py`、`menu_visualizer.py` 轉檔。

## 改版本號
發版前要同步更新版本（目前為 **3.1**）：
- Android：`src-capacitor/android/app/build.gradle` 的 `versionCode` 與 `versionName`
- iOS：`src-capacitor/ios/App/App.xcodeproj/project.pbxproj` 的 `CURRENT_PROJECT_VERSION` 與 `MARKETING_VERSION`（debug & release 都要）
- 顯示用：`src/pages/AboutPage.vue` 內的版本字串
- （建議一併更新 `package.json` 的 `version`，目前它落後實際版本）

## 測試
專案目前**沒有自動化測試**（`yarn test` 只是個 placeholder，會直接回傳成功）。請以手動方式驗證：
1. `quasar dev` 在瀏覽器測試。
2. 變動到原生功能時，盡量在實機或模擬器上確認 Android / iOS 行為。

## 送出 Pull Request
PR 前自我檢查：
- [ ] 已跑過 `yarn lint` 與 `yarn format`，沒有 lint 錯誤。
- [ ] 已在 `quasar dev` 手動測試過受影響的頁面。
- [ ] 新頁面已在 `routes.js` 登記。
- [ ] commit message **沒有**誤加 `[deploy] `（除非你真的要發版）。
- [ ] 若有發版，版本號已在所有該改的地方更新。
- [ ] PR 描述清楚說明改了什麼、為什麼。

## 聯絡方式
- 官方 Gmail：ckappofficial@gmail.com
- 官方 IG：[@ckappofficial](https://www.instagram.com/ckappofficial/)
- 官方網站：[ckapp-tw.web.app](https://ckapp-tw.web.app/)

謝謝你幫助 CK APP 繼續服務未來的建中生！🎒
