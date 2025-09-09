# CK APP 校園行動應用程式
1. [CK APP是什麼？](#ck-app是什麼)
2. [CK APP架構介紹](#ck-app架構介紹)
3. [頁面/功能介紹](#頁面功能介紹)

## CK APP是什麼？
CK APP是建中第77屆學生彭可翰和楊晨諺於2024年暑假所開發的應用程式，目的是幫助所有建中生解決生活中遇到的大小困難。CK APP自從2024年9月在iOS和Android雙平台上架至2025年9月共累積2080次下載。我們期許CK APP能夠持續幫助未來的所有建中生。

## CK APP架構介紹
CK APP的主要程式和資料皆位於GitHub，其共有兩個repo——CK_app和Data (Proxy為廢棄repo，為過去Heroku之程式)。
### Data
Data為存放需動態改動之資料，讓CK APP可以直接讀取。其中目前有被利用的資料為
- menus: 資料夾，存放熱食部菜單
- ClassesSchedule.json: 全校班級之課表
### CK_app
CK_app為CK APP的主體程式，語言是Quasar Framework，本質上為HTML、CSS和JavaScript。當初選用Quasar是因為可以輸出成Android和iOS的app，不需寫兩個不同版本。

以下列出常用檔案/資料夾說明
- public
	- food: FoodPage的圖標
	- metro: TransportPage中各路線的圖標
- src
	- data
		- metroData.js: 北捷站點和路線資訊
		- restaurantData.json: FoodPage餐廳資料 (有想過丟到Data，才可以動態改動，但這樣Android版不知道為什麼無法讀取資料\==)
- pages: CK APP的核心，大部分的編輯會在這裡進行
	- (11個頁面，略)
- router
	- routes.js: 如果有新增頁面要去這裡登記，才可以從其他頁面連結過去
- services
	- newsService.js: 讓NewsPage每隔2分鐘自動刷新資料
- store: 頁面會透過這裡更動本機資料，非常重要
	- (略)
- tools
	- Convert_xlsx_to_json.py: 把教務處課表檔(.xls)轉成json，使用說明在檔案裡
	- menu_scraper.py: (見下)
	- menu_visualizer.py: 將熱食部菜單自動轉成圖檔

除了GitHub外，我們也有用Firebase儲存使用者資料，以及[官方網站](https://ckapp-tw.web.app/) (由 78屆的Ian Wen開發管理)、官方gmail(ckappofficial@gmail.com)和[官方IG帳號](https://www.instagram.com/ckappofficial/)。

## 頁面/功能介紹
CK APP共有10個頁面，皆由Quasar Framework寫成。Quasar的檔案(.vue)分為三個部分——\<template>、\<script>、\<style>，即HTML、Javascript和CSS。以下主要介紹script部分，畢竟其為頁面運作的核心。
### HomePage (首頁)
待補。
### SchedulePage (課表)
待補。
### SchedulePage (行事曆)
待補。
### TransportPage (交通)
待補。
### MenuPage (熱食部)
熱食部通常會在月底把下個月的菜單放到[雲端](https://drive.google.com/drive/folders/1jZTQNkQVCoDVmMPQaG2Ov_Zwu4o4cmQQ)。因此我們在每個月底需要把雲端的xlsx檔下載(共4個，每週各一個檔案)。接下來，打開一個資料夾放入menu_scraper和menu_visualizer。接著，依序將菜單的檔案改名為menu.xlsx放入該資料夾中，並執行menu_visualizer。此時應該會出現一個資料夾(menu_visualizations)，裡面會有轉換過的每日菜單png檔。最後，將這些圖片放入Data repo的menus資料夾中並上傳，CK APP就讀得到了。

圖片檔名說明：菜單的圖片的檔名命名準則為當週週一之日期以及星期幾。例如2025/9/11為該週之星期四，該週週一為9/8，故9/11的菜單檔名為```2025-09-08_4.png```。然而因為程式有bug，所以目前(2025年9月)上架版本中，有時候MenuPage會把週一的日期往前算一天。但我們有用menu_visualizer迴避這個問題，以9/11的例子，menu_visualizer其實同時會輸出```2025-09-07_4.png```。
### FoodPage (美食)
待補。
### NewsPage (校網)
待補。
### SettingsPage
待補。
### AboutPage
待補。
### LoginPage
待補。
