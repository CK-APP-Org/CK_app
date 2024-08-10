<template>
  <div>
    <q-page class="flex column relative-position">
      <!-- Loading overlay -->
      <div v-if="isLoading" class="loading-overlay flex flex-center">
        <q-spinner size="70px" color="primary" />
        <div class="q-mt-sm text-primary">讀取資料中...</div>
      </div>

      <div v-else-if="error" class="error-message q-pa-md">{{ error }}</div>

      <div v-else>
        <div class="map-controls-1 q-pa-md">
          <q-btn
            color="primary"
            label="畫面顯示列表"
            @click="showRestaurantList = true"
            class="q-mr-sm"
          />
          <q-checkbox
            v-model="hideClosedRestaurants"
            label="正在營業"
            class="q-mr-md"
          />
          <q-checkbox v-model="showOnlyFavorites" label="我的最愛" />
        </div>

        <div class="map-controls-2 q-pa-md">
          <q-btn
            color="primary"
            icon="info"
            @click="showLegend = true"
            class="q-mr-sm"
          />
        </div>

        <l-map
          ref="mapRef"
          style="height: 90vh; width: 100%"
          :zoom="16"
          :center="[25.031204, 121.515966]"
          :options="mapOptions"
        >
          <l-tile-layer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          ></l-tile-layer>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '林家乾麵(林乾)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '林家乾麵(林乾)')
                ))
            "
            :lat-lng="[25.030181, 121.51412]"
            :icon="getMarkerIcon('林家乾麵(林乾)')"
            @click="showSidebar('林家乾麵(林乾)', [25.030181, 121.51412])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">林家乾麵(林乾)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '建中側門漢堡餐車')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '建中側門漢堡餐車')
                ))
            "
            :lat-lng="[25.030418688051526, 121.51399964581553]"
            :icon="getMarkerIcon('建中側門漢堡餐車')"
            @click="
              showSidebar(
                '建中側門漢堡餐車',
                [25.030418688051526, 121.51399964581553]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">建中側門漢堡餐車</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '建中側抓').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '建中側抓')))
            "
            :lat-lng="[25.030385879007643, 121.51413375618512]"
            :icon="getMarkerIcon('建中側抓')"
            @click="
              showSidebar('建中側抓', [25.030385879007643, 121.51413375618512])
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">建中側抓</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '廣東小吃(廣炒)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '廣東小吃(廣炒)')
                ))
            "
            :lat-lng="[25.030279, 121.514101]"
            :icon="getMarkerIcon('廣東小吃(廣炒)')"
            @click="showSidebar('廣東小吃(廣炒)', [25.030279, 121.514101])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">廣東小吃(廣炒)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '呷尚寶(泉州店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '呷尚寶(泉州店)')
                ))
            "
            :lat-lng="[25.02948, 121.514145]"
            :icon="getMarkerIcon('呷尚寶(泉州店)')"
            @click="showSidebar('呷尚寶(泉州店)', [25.02948, 121.514145])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">呷尚寶(泉州店)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '烤上台大').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '烤上台大')))
            "
            :lat-lng="[25.029351, 121.514166]"
            :icon="getMarkerIcon('烤上台大')"
            @click="showSidebar('烤上台大', [25.029351, 121.514166])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">烤上台大</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '搭伙').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '搭伙')))
            "
            :lat-lng="[25.0292, 121.514201]"
            :icon="getMarkerIcon('搭伙')"
            @click="showSidebar('搭伙', [25.0292, 121.514201])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">搭伙</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '建中黑砂糖刨冰')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '建中黑砂糖刨冰')
                ))
            "
            :lat-lng="[25.029342, 121.514371]"
            :icon="getMarkerIcon('建中黑砂糖刨冰')"
            @click="showSidebar('建中黑砂糖刨冰', [25.029342, 121.514371])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">建中黑砂糖刨冰</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '雲南小廚').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '雲南小廚')))
            "
            :lat-lng="[25.029241, 121.514397]"
            :icon="getMarkerIcon('雲南小廚')"
            @click="showSidebar('雲南小廚', [25.029241, 121.514397])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">雲南小廚</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '老建中麵店')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '老建中麵店')))
            "
            :lat-lng="[25.029075, 121.514415]"
            :icon="getMarkerIcon('老建中麵店')"
            @click="showSidebar('老建中麵店', [25.029075, 121.514415])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">老建中麵店</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '建中豆漿補給站(建豆)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '建中豆漿補給站(建豆)')
                ))
            "
            :lat-lng="[25.029101, 121.512884]"
            :icon="getMarkerIcon('建中豆漿補給站(建豆)')"
            @click="
              showSidebar('建中豆漿補給站(建豆)', [25.029101, 121.512884])
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">建中豆漿補給站(建豆)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === 'Q Burger(中正寧波店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === 'Q Burger(中正寧波店)')
                ))
            "
            :lat-lng="[25.029501, 121.514521]"
            :icon="getMarkerIcon('Q Burger(中正寧波店)')"
            @click="
              showSidebar('Q Burger(中正寧波店)', [25.029501, 121.514521])
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">Q Burger(中正寧波店)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '萬香烤鴨莊(重慶店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '萬香烤鴨莊(重慶店)')
                ))
            "
            :lat-lng="[25.029721, 121.515461]"
            :icon="getMarkerIcon('萬香烤鴨莊(重慶店)')"
            @click="showSidebar('萬香烤鴨莊(重慶店)', [25.029721, 121.515461])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">萬香烤鴨莊(重慶店)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '胖老爹(中正重慶店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '胖老爹(中正重慶店)')
                ))
            "
            :lat-lng="[25.029633, 121.515474]"
            :icon="getMarkerIcon('胖老爹(中正重慶店)')"
            @click="showSidebar('胖老爹(中正重慶店)', [25.029633, 121.515474])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">胖老爹(中正重慶店)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '福井麵疙瘩')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '福井麵疙瘩')))
            "
            :lat-lng="[25.0299545, 121.515655]"
            :icon="getMarkerIcon('福井麵疙瘩')"
            @click="showSidebar('福井麵疙瘩', [25.0299545, 121.515655])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">福井麵疙瘩</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '江浙四海包子店')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '江浙四海包子店')
                ))
            "
            :lat-lng="[25.029987, 121.515811]"
            :icon="getMarkerIcon('江浙四海包子店')"
            @click="showSidebar('江浙四海包子店', [25.029987, 121.515811])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">江浙四海包子店</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '原馨牛排').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '原馨牛排')))
            "
            :lat-lng="[25.030025, 121.515951]"
            :icon="getMarkerIcon('原馨牛排')"
            @click="showSidebar('原馨牛排', [25.030025, 121.515951])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">原馨牛排</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '吉坤便當').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '吉坤便當')))
            "
            :lat-lng="[25.030041, 121.516082]"
            :icon="getMarkerIcon('吉坤便當')"
            @click="showSidebar('吉坤便當', [25.030041, 121.516082])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">吉坤便當</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '春天涼麵').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '春天涼麵')))
            "
            :lat-lng="[25.030074, 121.516221]"
            :icon="getMarkerIcon('春天涼麵')"
            @click="showSidebar('春天涼麵', [25.030074, 121.516221])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">春天涼麵</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '麥味登(中正寧波店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '麥味登(中正寧波店)')
                ))
            "
            :lat-lng="[25.029753, 121.515572]"
            :icon="getMarkerIcon('麥味登(中正寧波店)')"
            @click="showSidebar('麥味登(中正寧波店)', [25.029753, 121.515572])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">麥味登(中正寧波店)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === 'Woo 現烤甜甜圈')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === 'Woo 現烤甜甜圈')
                ))
            "
            :lat-lng="[25.02979333110343, 121.51566878251151]"
            :icon="getMarkerIcon('Woo 現烤甜甜圈')"
            @click="
              showSidebar(
                'Woo 現烤甜甜圈',
                [25.02979333110343, 121.51566878251151]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">Woo 現烤甜甜圈</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '懿品小珍').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '懿品小珍')))
            "
            :lat-lng="[25.029804, 121.515746]"
            :icon="getMarkerIcon('懿品小珍')"
            @click="showSidebar('懿品小珍', [25.029804, 121.515746])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">懿品小珍</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '昇客雞肉').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '昇客雞肉')))
            "
            :lat-lng="[25.029822, 121.515844]"
            :icon="getMarkerIcon('昇客雞肉')"
            @click="showSidebar('昇客雞肉', [25.029822, 121.515844])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">昇客雞肉</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '蓮德品素天地')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '蓮德品素天地')
                ))
            "
            :lat-lng="[25.02989412271085, 121.51606145338819]"
            :icon="getMarkerIcon('蓮德品素天地')"
            @click="
              showSidebar(
                '蓮德品素天地',
                [25.02989412271085, 121.51606145338819]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">蓮德品素天地</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === 'Ebisu curry&coffee')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === 'Ebisu curry&coffee')
                ))
            "
            :lat-lng="[25.029952, 121.516382]"
            :icon="getMarkerIcon('Ebisu curry&coffee')"
            @click="showSidebar('Ebisu curry&coffee', [25.029952, 121.516382])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">Ebisu curry&coffee</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === 'Ebisu Kitchen')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === 'Ebisu Kitchen')
                ))
            "
            :lat-lng="[25.030409840204676, 121.5168962820656]"
            :icon="getMarkerIcon('Ebisu Kitchen')"
            @click="
              showSidebar(
                'Ebisu Kitchen',
                [25.030409840204676, 121.5168962820656]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">Ebisu Kitchen</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '豪季水餃').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '豪季水餃')))
            "
            :lat-lng="[25.029839, 121.516452]"
            :icon="getMarkerIcon('豪季水餃')"
            @click="showSidebar('豪季水餃', [25.029839, 121.516452])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">豪季水餃</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '劉媽媽麵館')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '劉媽媽麵館')))
            "
            :lat-lng="[25.029544, 121.516719]"
            :icon="getMarkerIcon('劉媽媽麵館')"
            @click="showSidebar('劉媽媽麵館', [25.029544, 121.516719])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">劉媽媽麵館</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '黄龍莊').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '黄龍莊')))
            "
            :lat-lng="[25.03000881957471, 121.5165503303962]"
            :icon="getMarkerIcon('黄龍莊')"
            @click="
              showSidebar('黄龍莊', [25.03000881957471, 121.5165503303962])
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">黄龍莊</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '金全城自助餐')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '金全城自助餐')
                ))
            "
            :lat-lng="[25.02972038089551, 121.5167548880475]"
            :icon="getMarkerIcon('金全城自助餐')"
            @click="
              showSidebar(
                '金全城自助餐',
                [25.02972038089551, 121.5167548880475]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">金全城自助餐</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '桔子花咖哩')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '桔子花咖哩')))
            "
            :lat-lng="[25.030187001186075, 121.51754312224892]"
            :icon="getMarkerIcon('桔子花咖哩')"
            @click="
              showSidebar(
                '桔子花咖哩',
                [25.030187001186075, 121.51754312224892]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">桔子花咖哩</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '早安美芝城(寧波店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '早安美芝城(寧波店)')
                ))
            "
            :lat-lng="[25.030067, 121.516562]"
            :icon="getMarkerIcon('早安美芝城(寧波店)')"
            @click="showSidebar('早安美芝城(寧波店)', [25.030067, 121.516562])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">早安美芝城(寧波店)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '由紀(YUKI)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '由紀(YUKI)')))
            "
            :lat-lng="[25.030103, 121.516651]"
            :icon="getMarkerIcon('由紀(YUKI)')"
            @click="showSidebar('由紀(YUKI)', [25.030103, 121.516651])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">由紀(YUKI)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '金牛王').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '金牛王')))
            "
            :lat-lng="[25.030156, 121.516773]"
            :icon="getMarkerIcon('金牛王')"
            @click="showSidebar('金牛王', [25.030156, 121.516773])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">金牛王</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '郝家食堂').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '郝家食堂')))
            "
            :lat-lng="[25.030266, 121.516948]"
            :icon="getMarkerIcon('郝家食堂')"
            @click="showSidebar('郝家食堂', [25.030266, 121.516948])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">郝家食堂</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '虹品鍋貼水餃')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '虹品鍋貼水餃')
                ))
            "
            :lat-lng="[25.030165, 121.516368]"
            :icon="getMarkerIcon('虹品鍋貼水餃')"
            @click="showSidebar('虹品鍋貼水餃', [25.030165, 121.516368])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">虹品鍋貼水餃</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '福記港式燒臘')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '福記港式燒臘')
                ))
            "
            :lat-lng="[25.030203, 121.516529]"
            :icon="getMarkerIcon('福記港式燒臘')"
            @click="showSidebar('福記港式燒臘', [25.030203, 121.516529])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">福記港式燒臘</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '鐘圓環肉羹')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '鐘圓環肉羹')))
            "
            :lat-lng="[25.030182, 121.516449]"
            :icon="getMarkerIcon('鐘圓環肉羹')"
            @click="showSidebar('鐘圓環肉羹', [25.030182, 121.516449])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">鐘圓環肉羹</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === 'CoCo(南昌店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === 'CoCo(南昌店)')
                ))
            "
            :lat-lng="[25.030253, 121.516639]"
            :icon="getMarkerIcon('CoCo(南昌店)')"
            @click="showSidebar('CoCo(南昌店)', [25.030253, 121.516639])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">CoCo(南昌店)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '養鍋').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '養鍋')))
            "
            :lat-lng="[25.0303152, 121.516737]"
            :icon="getMarkerIcon('養鍋')"
            @click="showSidebar('養鍋', [25.0303152, 121.516737])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">養鍋</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '城市盒子').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '城市盒子')))
            "
            :lat-lng="[25.030368, 121.516846]"
            :icon="getMarkerIcon('城市盒子')"
            @click="showSidebar('城市盒子', [25.030368, 121.516846])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">城市盒子</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '便當王').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '便當王')))
            "
            :lat-lng="[25.030602, 121.516574]"
            :icon="getMarkerIcon('便當王')"
            @click="showSidebar('便當王', [25.030602, 121.516574])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">便當王</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '必勝客(南昌外送店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '必勝客(南昌外送店)')
                ))
            "
            :lat-lng="[25.030733819724723, 121.51603505015856]"
            :icon="getMarkerIcon('必勝客(南昌外送店)')"
            @click="
              showSidebar(
                '必勝客(南昌外送店)',
                [25.030733819724723, 121.51603505015856]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">必勝客(南昌外送店)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '桃屋日本料理')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '桃屋日本料理')
                ))
            "
            :lat-lng="[25.03038343881961, 121.51714130644875]"
            :icon="getMarkerIcon('桃屋日本料理')"
            @click="
              showSidebar(
                '桃屋日本料理',
                [25.03038343881961, 121.51714130644875]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">桃屋日本料理</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '飴盛禾').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '飴盛禾')))
            "
            :lat-lng="[25.03050646572006, 121.51705156758634]"
            :icon="getMarkerIcon('飴盛禾')"
            @click="
              showSidebar('飴盛禾', [25.03050646572006, 121.51705156758634])
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">飴盛禾</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '四兩刈包').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '四兩刈包')))
            "
            :lat-lng="[25.030624, 121.517234]"
            :icon="getMarkerIcon('四兩刈包')"
            @click="showSidebar('四兩刈包', [25.030624, 121.517234])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">四兩刈包</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '寧波餐盒').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '寧波餐盒')))
            "
            :lat-lng="[25.03070819276531, 121.51737447889629]"
            :icon="getMarkerIcon('寧波餐盒')"
            @click="
              showSidebar('寧波餐盒', [25.03070819276531, 121.51737447889629])
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">寧波餐盒</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '鴨香煲').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '鴨香煲')))
            "
            :lat-lng="[25.030736296964708, 121.51743034347368]"
            :icon="getMarkerIcon('鴨香煲')"
            @click="
              showSidebar('鴨香煲', [25.030736296964708, 121.51743034347368])
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">鴨香煲</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '建弘雞肉飯')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '建弘雞肉飯')))
            "
            :lat-lng="[25.03069250447738, 121.517323]"
            :icon="getMarkerIcon('建弘雞肉飯')"
            @click="showSidebar('建弘雞肉飯', [25.03069250447738, 121.517323])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">建弘雞肉飯</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '曼鯊鯊').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '曼鯊鯊')))
            "
            :lat-lng="[25.030870470759332, 121.51699783134352]"
            :icon="getMarkerIcon('曼鯊鯊')"
            @click="
              showSidebar('曼鯊鯊', [25.030870470759332, 121.51699783134352])
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">曼鯊鯊</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '本味拉麵').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '本味拉麵')))
            "
            :lat-lng="[25.031020290826692, 121.51724170894916]"
            :icon="getMarkerIcon('本味拉麵')"
            @click="
              showSidebar('本味拉麵', [25.031020290826692, 121.51724170894916])
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">本味拉麵</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '嘉義第一名火雞肉飯')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '嘉義第一名火雞肉飯')
                ))
            "
            :lat-lng="[25.031106, 121.51715]"
            :icon="getMarkerIcon('嘉義第一名火雞肉飯')"
            @click="showSidebar('嘉義第一名火雞肉飯', [25.031106, 121.51715])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">嘉義第一名火雞肉飯</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '鬍鬚張魯肉飯(南昌店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '鬍鬚張魯肉飯(南昌店)')
                ))
            "
            :lat-lng="[25.031176437044987, 121.51717130095058]"
            :icon="getMarkerIcon('鬍鬚張魯肉飯(南昌店)')"
            @click="
              showSidebar(
                '鬍鬚張魯肉飯(南昌店)',
                [25.031176437044987, 121.51717130095058]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">鬍鬚張魯肉飯(南昌店)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '麥當勞(南昌店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '麥當勞(南昌店)')
                ))
            "
            :lat-lng="[25.0294, 121.51865]"
            :icon="getMarkerIcon('麥當勞(南昌店)')"
            @click="showSidebar('麥當勞(南昌店)', [25.0294, 121.51865])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">麥當勞(南昌店)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '拿坡里披薩(南昌店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '拿坡里披薩(南昌店)')
                ))
            "
            :lat-lng="[25.029301870925266, 121.51876481837384]"
            :icon="getMarkerIcon('拿坡里披薩(南昌店)')"
            @click="
              showSidebar(
                '拿坡里披薩(南昌店)',
                [25.029301870925266, 121.51876481837384]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">拿坡里披薩(南昌店)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '夯堡').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '夯堡')))
            "
            :lat-lng="[25.03107844024507, 121.51832451478535]"
            :icon="getMarkerIcon('夯堡')"
            @click="
              showSidebar('夯堡', [25.03107844024507, 121.51832451478535])
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">夯堡</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '50嵐(寧波店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '50嵐(寧波店)')
                ))
            "
            :lat-lng="[25.030929731588213, 121.51775984466323]"
            :icon="getMarkerIcon('50嵐(寧波店)')"
            @click="
              showSidebar(
                '50嵐(寧波店)',
                [25.030929731588213, 121.51775984466323]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">50嵐(寧波店)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '迷客夏(臺北南昌店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '迷客夏(臺北南昌店)')
                ))
            "
            :lat-lng="[25.03076541343751, 121.5177717805471]"
            :icon="getMarkerIcon('迷客夏(臺北南昌店)')"
            @click="
              showSidebar(
                '迷客夏(臺北南昌店)',
                [25.03076541343751, 121.5177717805471]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">迷客夏(臺北南昌店)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '鶴茶樓(中正寧波西店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '鶴茶樓(中正寧波西店)')
                ))
            "
            :lat-lng="[25.030868397250778, 121.51796959337601]"
            :icon="getMarkerIcon('鶴茶樓(中正寧波西店)')"
            @click="
              showSidebar(
                '鶴茶樓(中正寧波西店)',
                [25.030868397250778, 121.51796959337601]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">鶴茶樓(中正寧波西店)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '起家雞(中正寧波店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '起家雞(中正寧波店)')
                ))
            "
            :lat-lng="[25.031169159344792, 121.5181020129375]"
            :icon="getMarkerIcon('起家雞(中正寧波店)')"
            @click="
              showSidebar(
                '起家雞(中正寧波店)',
                [25.031169159344792, 121.5181020129375]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">起家雞(中正寧波店)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '奇福扁食').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '奇福扁食')))
            "
            :lat-lng="[25.031318431436787, 121.51843582645411]"
            :icon="getMarkerIcon('奇福扁食')"
            @click="
              showSidebar('奇福扁食', [25.031318431436787, 121.51843582645411])
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">奇福扁食</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '三元堂拉麵')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '三元堂拉麵')))
            "
            :lat-lng="[25.031308887643682, 121.51771957931884]"
            :icon="getMarkerIcon('三元堂拉麵')"
            @click="
              showSidebar(
                '三元堂拉麵',
                [25.031308887643682, 121.51771957931884]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">三元堂拉麵</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '金泰刀削小廚')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '金泰刀削小廚')
                ))
            "
            :lat-lng="[25.031444209358376, 121.51760611482375]"
            :icon="getMarkerIcon('金泰刀削小廚')"
            @click="
              showSidebar(
                '金泰刀削小廚',
                [25.031444209358376, 121.51760611482375]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">金泰刀削小廚</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '100+義式廚房')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '100+義式廚房')
                ))
            "
            :lat-lng="[25.031379673762277, 121.51784569269692]"
            :icon="getMarkerIcon('100+義式廚房')"
            @click="
              showSidebar(
                '100+義式廚房',
                [25.031379673762277, 121.51784569269692]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">100+義式廚房</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '小松鍋燒麵')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '小松鍋燒麵')))
            "
            :lat-lng="[25.031672025211932, 121.51811902562679]"
            :icon="getMarkerIcon('小松鍋燒麵')"
            @click="
              showSidebar(
                '小松鍋燒麵',
                [25.031672025211932, 121.51811902562679]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">小松鍋燒麵</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '南門福州傻瓜乾麵')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '南門福州傻瓜乾麵')
                ))
            "
            :lat-lng="[25.03192131864971, 121.51823982595026]"
            :icon="getMarkerIcon('南門福州傻瓜乾麵')"
            @click="
              showSidebar(
                '南門福州傻瓜乾麵',
                [25.03192131864971, 121.51823982595026]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">南門福州傻瓜乾麵</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '28廣東粥鍋燒麵')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '28廣東粥鍋燒麵')
                ))
            "
            :lat-lng="[25.031875521694147, 121.51845284581562]"
            :icon="getMarkerIcon('28廣東粥鍋燒麵')"
            @click="
              showSidebar(
                '28廣東粥鍋燒麵',
                [25.031875521694147, 121.51845284581562]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">28廣東粥鍋燒麵</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '初 拉麵&煎餃')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '初 拉麵&煎餃')
                ))
            "
            :lat-lng="[25.031417643059626, 121.51792265476811]"
            :icon="getMarkerIcon('初 拉麵&煎餃')"
            @click="
              showSidebar(
                '初 拉麵&煎餃',
                [25.031417643059626, 121.51792265476811]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">初 拉麵&煎餃</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '金峰魯肉飯')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '金峰魯肉飯')))
            "
            :lat-lng="[25.032044958751985, 121.51849530640874]"
            :icon="getMarkerIcon('金峰魯肉飯')"
            @click="
              showSidebar(
                '金峰魯肉飯',
                [25.032044958751985, 121.51849530640874]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">金峰魯肉飯</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '可不可(中正南昌店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '可不可(中正南昌店)')
                ))
            "
            :lat-lng="[25.031498379480308, 121.51716641196012]"
            :icon="getMarkerIcon('可不可(中正南昌店)')"
            @click="
              showSidebar(
                '可不可(中正南昌店)',
                [25.031498379480308, 121.51716641196012]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">可不可(中正南昌店)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '珍煮丹(中正南門店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '珍煮丹(中正南門店)')
                ))
            "
            :lat-lng="[25.031958523886896, 121.51857440680428]"
            :icon="getMarkerIcon('珍煮丹(中正南門店)')"
            @click="
              showSidebar(
                '珍煮丹(中正南門店)',
                [25.031958523886896, 121.51857440680428]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">珍煮丹(中正南門店)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '八方雲集(南海店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '八方雲集(南海店)')
                ))
            "
            :lat-lng="[25.03202841061271, 121.51519603862796]"
            :icon="getMarkerIcon('八方雲集(南海店)')"
            @click="
              showSidebar(
                '八方雲集(南海店)',
                [25.03202841061271, 121.51519603862796]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">八方雲集(南海店)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '八方雲集(南昌店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '八方雲集(南昌店)')
                ))
            "
            :lat-lng="[25.02971609455992, 121.5184514471431]"
            :icon="getMarkerIcon('八方雲集(南昌店)')"
            @click="
              showSidebar(
                '八方雲集(南昌店)',
                [25.02971609455992, 121.5184514471431]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">八方雲集(南昌店)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '好味涼亭').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '好味涼亭')))
            "
            :lat-lng="[25.032062323492937, 121.51573119446294]"
            :icon="getMarkerIcon('好味涼亭')"
            @click="
              showSidebar('好味涼亭', [25.032062323492937, 121.51573119446294])
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">好味涼亭</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '老熊牛肉麵')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '老熊牛肉麵')))
            "
            :lat-lng="[25.032157104036347, 121.5157948969418]"
            :icon="getMarkerIcon('老熊牛肉麵')"
            @click="
              showSidebar('老熊牛肉麵', [25.032157104036347, 121.5157948969418])
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">老熊牛肉麵</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '肯德基(南昌店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '肯德基(南昌店)')
                ))
            "
            :lat-lng="[25.03224667128567, 121.51632808148645]"
            :icon="getMarkerIcon('肯德基(南昌店)')"
            @click="
              showSidebar(
                '肯德基(南昌店)',
                [25.03224667128567, 121.51632808148645]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">肯德基(南昌店)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '麵匡匡拉麵(南海店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '麵匡匡拉麵(南海店)')
                ))
            "
            :lat-lng="[25.032113966750952, 121.51554880425996]"
            :icon="getMarkerIcon('麵匡匡拉麵(南海店)')"
            @click="
              showSidebar(
                '麵匡匡拉麵(南海店)',
                [25.032113966750952, 121.51554880425996]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">麵匡匡拉麵(南海店)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '東門鴨莊').openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(restaurantData.find((r) => r.name === '東門鴨莊')))
            "
            :lat-lng="[25.03182751658159, 121.51666074571753]"
            :icon="getMarkerIcon('東門鴨莊')"
            @click="
              showSidebar('東門鴨莊', [25.03182751658159, 121.51666074571753])
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">東門鴨莊</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '樂饕饕自助餐')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '樂饕饕自助餐')
                ))
            "
            :lat-lng="[25.031524567627592, 121.5168707814687]"
            :icon="getMarkerIcon('樂饕饕自助餐')"
            @click="
              showSidebar(
                '樂饕饕自助餐',
                [25.031524567627592, 121.5168707814687]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">樂饕饕自助餐</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '摩斯漢堡(南昌店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '摩斯漢堡(南昌店)')
                ))
            "
            :lat-lng="[25.03173653449798, 121.51673133961954]"
            :icon="getMarkerIcon('摩斯漢堡(南昌店)')"
            @click="
              showSidebar(
                '摩斯漢堡(南昌店)',
                [25.03173653449798, 121.51673133961954]
              )
            "
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">摩斯漢堡(南昌店)</div></l-popup
            >
          </l-marker>

          <l-marker
            v-if="
              (!hideClosedRestaurants ||
                isOpen(
                  restaurantData.find((r) => r.name === '三商巧福(南昌店)')
                    .openingHours
                )) &&
              (!showOnlyFavorites ||
                isFavorite(
                  restaurantData.find((r) => r.name === '三商巧福(南昌店)')
                ))
            "
            :lat-lng="[25.031625, 121.516786]"
            :icon="getMarkerIcon('三商巧福(南昌店)')"
            @click="showSidebar('三商巧福(南昌店)', [25.031625, 121.516786])"
          >
            <l-popup :options="{ offset: new Point(0, -10) }"
              ><div class="text-h6">三商巧福(南昌店)</div></l-popup
            >
          </l-marker>
        </l-map>

        <!-- Custom Sidebar -->
        <div
          v-if="sidebarOpen"
          class="custom-sidebar"
          :class="{ 'sidebar-open': sidebarOpen }"
        >
          <div class="sidebar-name">
            <div v-if="selectedMarker">
              <div class="text-h5">{{ selectedMarker.name }}</div>
              <div v-if="selectedMarker.openingHours">
                <div class="text-h6">營業時間:</div>
                <div
                  v-for="(hours, day) in translateDays(
                    selectedMarker.openingHours
                  )"
                  :key="day"
                  :class="{ 'today-hours': isToday(day) }"
                  class="day-info"
                >
                  <div class="day-hours-line">
                    <span class="day-label">{{ day }}</span>
                    <span class="hours-info">{{
                      hours.split(",")[0].trim()
                    }}</span>
                  </div>
                  <template
                    v-for="(section, index) in hours.split(',')"
                    :key="index"
                  >
                    <div v-if="index > 0" class="additional-hours">
                      {{ section.trim() }}
                    </div>
                  </template>
                </div>
                <!--
                <div class="text-h6">
                  建中優惠: {{ selectedMarker.discount }}
                </div>
                -->
              </div>
            </div>
          </div>
          <q-btn
            :icon="isFavorite(selectedMarker) ? 'favorite' : 'favorite_border'"
            flat
            round
            color="red"
            class="favorite-btn"
            @click="toggleFavorite(selectedMarker)"
          />
          <q-btn
            icon="close"
            flat
            round
            color="grey-8"
            class="close-btn"
            @click="closeSidebar"
          />
        </div>
        <q-dialog v-model="showLegend">
          <q-card style="min-width: 350px">
            <q-card-section>
              <div class="text-h6">地圖標記說明</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="legend-item">
                <img
                  src="https://imgur.com/jZN5Ph6.png"
                  alt="Open"
                  style="width: 25px; height: 41px"
                />
                <span>正在營業</span>
              </div>
              <div class="legend-item">
                <img
                  src="https://imgur.com/de9dxzv.png"
                  alt="Closed"
                  style="width: 25px; height: 41px"
                />
                <span>已打烊</span>
              </div>
              <div class="legend-item">
                <img
                  src="https://imgur.com/hizjEaj.png"
                  alt="Closing Soon"
                  style="width: 25px; height: 41px"
                />
                <span>即將打烊 (30分鐘內)</span>
              </div>
              <div class="legend-item">
                <img
                  src="https://imgur.com/upabpUD.png"
                  alt="Opening Soon"
                  style="width: 25px; height: 41px"
                />
                <span>即將開業 (30分鐘內)</span>
              </div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="關閉" color="primary" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
        <q-dialog v-model="showRestaurantList" full-width>
          <q-card>
            <q-card-section>
              <div class="text-h6">餐廳列表</div>
            </q-card-section>
            <q-card-section class="q-pa-none">
              <q-list separator>
                <q-item v-for="restaurant in markers" :key="restaurant.name">
                  <q-item-section>
                    <q-item-label>{{ restaurant.name }}</q-item-label>
                    <q-item-label caption>
                      今日營業: {{ restaurant.openingHours[getCurrentDay()] }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      :icon="
                        isFavorite(restaurant) ? 'favorite' : 'favorite_border'
                      "
                      flat
                      round
                      color="red"
                      @click="toggleFavorite(restaurant)"
                    />
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      label="詳細資訊"
                      color="primary"
                      flat
                      @click="showSidebarFromList(restaurant)"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="關閉" color="primary" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </q-page>
  </div>
</template>

<script setup>
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";
import { onMounted, computed, ref } from "vue";
import { Icon, Point } from "leaflet";
import store from "../store/index";
import L from "leaflet";
import restaurantData from "../data/restaurantData.json";

const mapRef = ref(null);
const hideClosedRestaurants = ref(false);
const showLegend = ref(false);
const mapOptions = {
  zoomControl: false,
};

const favoriteRestaurants = computed(
  () => store.getters.getFavoriteRestaurants
);

const showOnlyFavorites = ref(false);
const showRestaurantList = ref(false);

const openIcon = new Icon({
  iconUrl: "https://imgur.com/jZN5Ph6.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const closedIcon = new Icon({
  iconUrl: "https://imgur.com/de9dxzv.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const openVarIcon = new Icon({
  iconUrl: "https://imgur.com/hizjEaj.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const closedVarIcon = new Icon({
  iconUrl: "https://imgur.com/upabpUD.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const getMarkerIcon = (restaurantName) => {
  const restaurant = restaurantData.find((r) => r.name === restaurantName);
  if (!restaurant) return closedIcon;

  const now = new Date();
  const day = now
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const time = now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  const todayHours = restaurant.openingHours[day];
  if (todayHours === "休息") return closedIcon;

  const hourRanges = todayHours.split(",");
  for (const range of hourRanges) {
    const [open, close] = range.split(/[-–]/);

    // Check if closing in 30 minutes
    if (isWithinMinutes(time, close, 30) && time < close) {
      return openVarIcon;
    }

    // Check if opening in 30 minutes
    if (isWithinMinutes(open, time, 30) && time < open) {
      return closedVarIcon;
    }

    if (time >= open && time < close) {
      return openIcon;
    }
  }

  return closedIcon;
};

const isWithinMinutes = (time1, time2, minutes) => {
  const [h1, m1] = time1.split(":").map(Number);
  const [h2, m2] = time2.split(":").map(Number);
  const diff = Math.abs(h1 * 60 + m1 - (h2 * 60 + m2));
  return diff <= minutes;
};

const isOpen = (openingHours) => {
  const now = new Date();
  const day = now
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const time = now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });

  const todayHours = openingHours[day];
  if (todayHours === "休息") return false;

  const hourRanges = todayHours.split(",");
  return hourRanges.some((range) => {
    const [open, close] = range.split(/[-–]/);
    return time >= open && time <= close;
  });
};

const isToday = (day) => {
  const today = new Date().toLocaleDateString("zh-TW", { weekday: "long" });
  return day === today;
};

const translateDays = (openingHours) => {
  const dayTranslations = {
    monday: "星期一",
    tuesday: "星期二",
    wednesday: "星期三",
    thursday: "星期四",
    friday: "星期五",
    saturday: "星期六",
    sunday: "星期日",
  };

  return Object.entries(openingHours).reduce((acc, [day, hours]) => {
    acc[dayTranslations[day] || day] = hours;
    return acc;
  }, {});
};

const getCurrentDay = () => {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[new Date().getDay()];
};

const toggleFavorite = (restaurant) => {
  const index = favoriteRestaurants.value.findIndex(
    (r) => r.name === restaurant.name
  );
  if (index === -1) {
    favoriteRestaurants.value.push(restaurant);
    store.dispatch("addFavoriteRestaurant", restaurant);
  } else {
    favoriteRestaurants.value.splice(index, 1);
    store.dispatch("removeFavoriteRestaurant", restaurant.name);
  }
};

const isFavorite = (restaurant) => {
  return favoriteRestaurants.value.some((r) => r.name === restaurant.name);
};

const isLoading = ref(true);
const error = ref(null);

const fetchRestaurantData = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    // Use the imported data directly
    restaurantData.value = restaurantData;
  } catch (err) {
    console.error("Error loading restaurant data:", err);
    error.value = "Failed to load restaurant data. Please try again later.";
  } finally {
    isLoading.value = false;
  }
};

const markers = computed(() =>
  restaurantData.value
    .map((marker) => ({
      ...marker,
      isOpen: isOpen(marker.openingHours),
    }))
    .filter(
      (marker) =>
        (!hideClosedRestaurants.value || marker.isOpen) &&
        (!showOnlyFavorites.value || isFavorite(marker))
    )
);

const sidebarOpen = ref(false);
const selectedMarker = ref(null);

const showSidebar = (restaurantName, position) => {
  const restaurant = restaurantData.find((r) => r.name === restaurantName);
  if (restaurant) {
    selectedMarker.value = {
      name: restaurantName,
      position: position,
      openingHours: restaurant.openingHours,
    };
    sidebarOpen.value = true;
  }
};

const closeSidebar = () => {
  sidebarOpen.value = false;
};

const showSidebarFromList = (restaurant) => {
  showSidebar(restaurant);
  showRestaurantList.value = false;

  // Find the marker for the selected restaurant
  const marker = markers.value.find((m) => m.name === restaurant.name);

  if (marker && mapRef.value) {
    // Pan the map to the marker's position
    mapRef.value.leafletObject.panTo(marker.position);

    // Open the popup
    mapRef.value.leafletObject.eachLayer((layer) => {
      if (
        layer instanceof L.Marker &&
        layer.getLatLng().equals(marker.position)
      ) {
        layer.openPopup();
      }
    });
  }
};

onMounted(() => {
  fetchRestaurantData();
  delete Icon.Default.prototype._getIconUrl;
  Icon.Default.mergeOptions({
    iconRetinaUrl: new URL("https://imgur.com/2bk3D5t.png", import.meta.url)
      .href,
    iconUrl: new URL("https://imgur.com/0ZsD2ff.png", import.meta.url).href,
    shadowUrl: new URL("https://imgur.com/qKgJSmB.png", import.meta.url).href,
  });
});
</script>

<style scoped>
.day-info {
  margin-bottom: 10px;
  margin-left: 20px;
}

.day-hours-line {
  display: flex;
  align-items: baseline;
}

.day-label {
  width: 4em; /* Adjust this value to align all hours properly */
  flex-shrink: 0;
}

.hours-info {
  margin-left: 1em;
}

.additional-hours {
  margin-left: 5em; /* This should match the width of .day-label + .hours-info margin-left */
}

.additional-hours-popup {
  margin-left: 4.5em;
}

.today-hours {
  font-weight: bold;
  color: #2196f3;
}

.ml-4 {
  margin-left: 3.5em;
  padding-left: 0.5em;
}

.custom-sidebar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  transform: translateY(100%);
  transition: transform 0.3s ease-out;
  z-index: 1000;
  height: 37vh; /* Increased height to 70% of viewport height */
}

.sidebar-open {
  transform: translateY(0);
}

.sidebar-name {
  padding: 20px;
  height: calc(100% - 60px); /* Adjust for padding */
  overflow-y: auto;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
}

.favorite-btn {
  position: absolute;
  top: 10px;
  right: 50px; /* Adjust this value to position it next to the close button */
}

.map-controls-1 {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  padding: 10px;
}

.map-controls-2 {
  position: absolute;
  bottom: 50px;
  right: 8px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  padding: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.legend-item img {
  margin-right: 10px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1000;
  flex-direction: column;
}

.error-message {
  color: #ff5252;
  font-weight: bold;
}
</style>
