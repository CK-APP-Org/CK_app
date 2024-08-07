<template>
  <q-page class="flex flex-center">
    <q-card style="width: 300px">
      <q-card-section>
        <div class="text-h6">{{ isLogin ? "CK APP登入" : "CK APP註冊" }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit">
          <q-input
            v-model="accountName"
            label="帳號名稱"
            :rules="
              !isLogin
                ? [
                    (val) => !!val || '帳號名稱為必填',
                    (val) =>
                      /^[a-zA-Z0-9_]+$/.test(val) ||
                      '只能輸入英文字母、數字或底線',
                  ]
                : []
            "
            maxlength="20"
          >
            <template v-slot:hint v-if="!isLogin">
              只能輸入英文字母、數字或底線，最多20個字元
            </template>
          </q-input>

          <q-input
            v-model="password"
            label="密碼"
            :type="showPassword ? 'text' : 'password'"
            :rules="
              !isLogin
                ? [
                    (val) => !!val || '密碼為必填',
                    (val) =>
                      /^[a-zA-Z0-9_]+$/.test(val) ||
                      '只能輸入英文字母、數字或底線',
                  ]
                : []
            "
            maxlength="20"
          >
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
            <template v-slot:hint v-if="!isLogin">
              只能輸入英文字母、數字或底線，最多20個字元
            </template>
          </q-input>

          <q-input
            v-if="!isLogin"
            v-model="email"
            label="Email"
            type="email"
            :rules="[
              (val) => !!val || 'Email為必填',
              (val) =>
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(val) ||
                'Email格式不正確',
            ]"
          >
            <template v-slot:hint>
              請輸入有效的Email，以便忘記帳密時可驗證身分
            </template>
          </q-input>

          <div class="q-mt-md">
            <q-btn
              :label="isLogin ? '登入' : '註冊'"
              type="submit"
              color="primary"
            />
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          :label="isLogin ? '尚未註冊?' : '已有帳號?'"
          @click="isLogin = !isLogin"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { useQuasar } from "quasar";
import axios from "axios";

export default {
  setup() {
    const store = useStore();
    const $q = useQuasar();

    const isLogin = ref(true);
    const accountName = ref("");
    const password = ref("");
    const email = ref("");
    const showPassword = ref(false);
    const classSchedule = ref(null);

    const userAccount = computed(() => store.getters.getUserAccount);

    const firebaseConfig = {
      apiKey: "AIzaSyAfHEWoaKuz8fiMKojoTEeJWMUzJDgiuVU",
      authDomain: "ck-app-database.firebaseapp.com",
      projectId: "ck-app-database",
      storageBucket: "ck-app-database.appspot.com",
      messagingSenderId: "253500838094",
      appId: "1:253500838094:web:b6bfcf4975f3323ab8c09f",
      measurementId: "G-T79H6D7WRT",
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const userRef = doc(db, "User Data", "Userdata");

    onMounted(async () => {
      console.log(userRef);
      const SCHEDULE_URL =
        "https://raw.githubusercontent.com/CK-APP-Org/ScheduleData/main/ClassesSchedule.json";
      try {
        const response = await axios.get(SCHEDULE_URL);
        classSchedule.value = response.data[301]["schedule"];
      } catch (error) {
        console.error("Error fetching class schedule:", error);
      }
    });

    const onSubmit = async () => {
      const username = accountName.value;

      // Show processing notification
      const processingNotif = $q.notify({
        message: isLogin.value ? "登入中..." : "註冊中...",
        color: "info",
        position: "bottom",
        timeout: 0,
      });

      try {
        const docSnap = await getDoc(userRef);
        const userData = docSnap.data();

        if (isLogin.value) {
          if (userData && userData[username]) {
            if (userData[username].Password === password.value) {
              processingNotif(); // Dismiss the processing notification
              console.log("Login successful");
              store.dispatch("setUserAccount", username);
              $q.notify({
                message: "登入成功",
                color: "positive",
                position: "bottom",
                timeout: 2000,
              });
            } else {
              processingNotif(); // Dismiss the processing notification
              $q.notify({
                message: "密碼錯誤，請重試",
                color: "negative",
                position: "bottom",
                timeout: 2000,
              });
            }
          } else {
            processingNotif(); // Dismiss the processing notification
            $q.notify({
              message: "查無帳號，請先註冊",
              color: "negative",
              position: "bottom",
              timeout: 2000,
            });
          }
        } else {
          if (userData && userData[username]) {
            processingNotif(); // Dismiss the processing notification
            $q.notify({
              message: "帳號重複，請使用其他帳號名稱",
              color: "negative",
              position: "bottom",
              timeout: 2000,
            });
          } else {
            const newUserData = {
              Email: email.value,
              Password: password.value,
              Schedule: {
                ScheduleData: classSchedule.value,
                userClass: 101,
              },
              Youbike: {
                stationList: {
                  "YouBike2%2E0_泉州寧波西街口": {
                    nickname: "泉州寧波西街口(建中側門)",
                    city: "臺北市",
                    order: new Date("2024-01-01T00:00:00").getTime(),
                  },
                  "YouBike2%2E0_捷運中正紀念堂站(2號出口)": {
                    nickname: "中正紀念堂站(2號出口)",
                    city: "臺北市",
                    order: new Date("2024-01-01T00:01:00").getTime(),
                  },
                  "YouBike2%2E0_郵政博物館": {
                    nickname: "郵政博物館",
                    city: "臺北市",
                    order: new Date("2024-01-01T00:02:00").getTime(),
                  },
                  "YouBike2%2E0_植物園": {
                    nickname: "台北植物園",
                    city: "臺北市",
                    order: new Date("2024-01-01T00:03:00").getTime(),
                  },
                },
              },
              News: {
                pinnedNews: [],
                lastClearedTime: null,
                displayNewsWidget: true,
              },
              Food: {
                favoriteRestaurants: [],
              },
              Todo: {
                events: [],
                eventCategories: [{ name: "Default", color: "#ADADAD" }],
                displayTodoWidget: true,
                todos: [],
                currentView: "calendar",
                todoCategories: [],
              },
            };
            await setDoc(userRef, { [username]: newUserData }, { merge: true });
            processingNotif(); // Dismiss the processing notification
            store.dispatch("setUserAccount", username);
            $q.notify({
              message: "已建立帳號",
              color: "positive",
              position: "bottom",
              timeout: 2000,
            });
          }
        }
      } catch (error) {
        processingNotif(); // Dismiss the processing notification
        console.error("Error processing request:", error);
        $q.notify({
          message: isLogin.value ? "登入失敗" : "註冊失敗",
          caption: "請稍後再試",
          color: "negative",
          position: "bottom",
          timeout: 2000,
        });
      }
    };

    return {
      isLogin,
      accountName,
      password,
      email,
      showPassword,
      onSubmit,
      userAccount,
    };
  },
};
</script>
