# CK APP 校園行動應用程式
1. [CK APP是什麼？](#ck-app是什麼)
2. [CK APP架構介紹](#ck-app架構介紹)
3. [頁面/功能介紹](#頁面功能介紹)

## CK APP是什麼？
CK APP是建中第77屆學生彭可翰和楊晨諺於2024年暑假所開發的應用程式，目的是幫助所有建中生解決生活中遇到的大小困難。CK APP自從2024年9月在iOS和Android雙平台上架至2025年9月共累積2080次下載。我們期許CK APP能夠持續幫助未來的所有建中生。

## CK APP架構介紹
CK APP的主要程式和資料皆位於GitHub，其共有兩個repo——CK_app和Data (其實有第三個repo Proxy，但他現在是廢棄狀態，為過去Heroku之程式)。
### Data
Data為存放需動態改動之資料，讓CK APP可以直接讀取。其中目前有被利用的資料為
- menus: 存放熱食部菜單的資料夾
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
- pages: CK APP的核心，大部分的開發工作會在這裡進行
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
CK APP共有10個頁面，皆由Quasar Framework寫成。Quasar的檔案(.vue)分為三個部分——\<template>、\<script>、\<style>，即HTML、Javascript和CSS。
### HomePage (首頁)
除了六個頁面的按鈕外，首頁還包含三個動態資訊：目前課程、今日待辦事項、釘選校網內容。
### SchedulePage (課表)
課表有兩個按鈕會去抓ClassesSchedule.json:的資料：設定班級&重新載入資料。
### TodoPage (行事曆)
行事曆頁面分為兩個部分：月曆&待辦。詳細運作方式有點複雜，但應該不用改所以就不解釋了:D
### TransportPage (交通)
這是CK APP最龐大的頁面，程式分為YouBike和北捷兩部分。

YouBike部分，我們分別讀取[台北市](https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json)和[新北市](https://data.ntpc.gov.tw/openapi/swagger-ui/index.html?configUrl=%2Fapi%2Fv1%2Fopenapi%2Fswagger%2Fconfig&urls.primaryName=%E6%96%B0%E5%8C%97%E5%B8%82%E6%94%BF%E5%BA%9C%E4%BA%A4%E9%80%9A%E5%B1%80%2863%29#/)YouBike的API。新北市的API比較毒瘤一點，資料分成兩個頁面，所以需要分兩次API call。\
另外，新增站點有一個搜尋離使用者最近的九個站點得功能。我們本來想直接偵測使用者位置，但這會需要使用者開啟權限才行，然後這東西有點難寫，所以我們暫時放棄。

北捷部分，我們有向北捷公司申請才能拿到他們的API。然後其實使用條款包含下列兩項：
- 會員需於開發完成後主動通知本公司應用成果資訊,並依本公司
需求回饋加值應用內容、用戶數及其他可了解加值應用成效之統
計數字作為本公司 API 發展管理之參考。
- 會員用戶若您超過三個月未使用本公司 API 服務,本公司將有權
終止會員帳號,取消會員資格。

但我們沒有鳥他就是了。

### MenuPage (熱食部)
熱食部通常會在月底把下個月的菜單放到[雲端](https://drive.google.com/drive/folders/1jZTQNkQVCoDVmMPQaG2Ov_Zwu4o4cmQQ)。因此我們在每個月底需要把雲端的xlsx檔下載(共4個，每週各一個檔案)。接下來，打開一個資料夾放入menu_scraper和menu_visualizer。接著，依序將菜單的檔案改名為menu.xlsx放入該資料夾中，並執行menu_visualizer。此時應該會出現一個資料夾(menu_visualizations)，裡面會有轉換過的每日菜單png檔。最後，將這些圖片放入Data repo的menus資料夾中並上傳，CK APP就讀得到了。

圖片檔名說明：菜單的圖片的檔名命名準則為當週週一之日期以及星期幾。例如2025/9/11為該週之星期四，該週週一為9/8，故9/11的菜單檔名為```2025-09-08_4.png```。然而因為程式有bug，所以目前(2025年9月)上架版本中，有時候MenuPage會把週一的日期往前算一天。但我們有用menu_visualizer迴避這個問題，以9/11的例子，menu_visualizer其實同時會輸出```2025-09-07_4.png```。
### FoodPage (美食)
我們的地圖是用leaflet插件，餐廳資料來源是restaurantData.json。有些店家的營業時間會顯示超過24點，那是因為我們為了讓圖標顏色顯示正常(否則23:30後圖標會變淺綠色，因為程式會以為24點就要關門了，但實際上店家營業時間可能到凌晨2點)。以後可以修正。\
前面有講過我們有想把restaurantData.json丟到Data repo，方便動態修正資料，但Android版不知道是什麼bug，抓得到GitHub的資料但創建圖標的時候就會顯示不出來。可以再試試看。

### NewsPage (校網)
校網頁面的資料來源是[建中校網](https://www.ck.tp.edu.tw/nss/p/index)重要公告和最新消息的欄位中長得像Wi-Fi符號的按鈕，點下去會有XML檔可以讀。\
前面提過，newsService.js每隔兩分鐘會在背景自動抓校網資料。
### SettingsPage
滿直觀的。
### AboutPage
版本要記得改。之後應該要增加開發者介紹。
### LoginPage
註冊/登入的功能未來應該要拔掉。目前我們的做法是把使用者資料丟到Firebase，但現在CK APP好像不太能存取Firebase，我們推測是因為太多使用者上傳資料，連後臺想去Firebase看資料都會卡到爆。
