<template>
  <q-page class="flex flex-center">
    <q-card style="width: 300px">
      <q-card-section>
        <div class="text-h6">{{ isLogin ? "Login" : "Register" }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit">
          <q-input
            v-model="userName"
            label="Account Name"
            :rules="
              !isLogin
                ? [
                    (val) => !!val || 'Account name is required',
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
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            :rules="
              !isLogin
                ? [
                    (val) => !!val || 'Password is required',
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
            label="Email (optional)"
            type="email"
          />

          <div class="q-mt-md">
            <q-btn
              :label="isLogin ? 'Login' : 'Register'"
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
import { ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";

export default {
  setup() {
    const store = useStore();
    const router = useRouter();
    const $q = useQuasar();
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
    const auth = getAuth(app);

    const isLogin = ref(true);
    const email = ref("");
    const password = ref("");
    const userName = ref("");
    const showPassword = ref(false);

    const onSubmit = async () => {
      try {
        if (isLogin.value) {
          // Login
          await signInWithEmailAndPassword(auth, email.value, password.value);
          await fetchUserData(auth.currentUser.uid);
        } else {
          // Register
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email.value,
            password.value
          );
          await updateProfile(userCredential.user, {
            displayName: userName.value,
          });
          await saveUserData(userCredential.user.uid);
        }

        store.dispatch("setUserData", {
          userName: auth.currentUser.displayName,
          userEmail: auth.currentUser.email,
        });

        $q.notify({
          message: isLogin.value ? "登入成功" : "註冊成功",
          color: "positive",
          position: "bottom",
          timeout: 2000,
        });

        router.push("/");
      } catch (error) {
        console.error("Error:", error);
        $q.notify({
          message: isLogin.value ? "登入失敗" : "註冊失敗",
          color: "negative",
          position: "bottom",
          timeout: 2000,
        });
      }
    };

    const fetchUserData = async (userId) => {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        Object.entries(userData).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
          store.commit(`SET_${key.toUpperCase()}`, value);
        });
      }
    };

    const saveUserData = async (userId) => {
      const userData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        userData[key] = JSON.parse(localStorage.getItem(key));
      }
      await setDoc(doc(db, "users", userId), userData);
    };

    return {
      isLogin,
      email,
      password,
      userName,
      showPassword,
      onSubmit,
    };
  },
};
</script>
