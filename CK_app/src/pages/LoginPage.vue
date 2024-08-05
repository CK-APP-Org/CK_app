<template>
  <q-page class="flex flex-center">
    <q-card style="width: 300px">
      <q-card-section>
        <div class="text-h6">{{ isLogin ? "Login" : "Register" }}</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit">
          <q-input
            v-model="accountName"
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

export default {
  setup() {
    const isLogin = ref(true);
    const accountName = ref("");
    const password = ref("");
    const email = ref("");
    const showPassword = ref(false);

    const onSubmit = () => {
      if (isLogin.value) {
        console.log("Logging in with:", {
          accountName: accountName.value,
          password: password.value,
        });
        // Implement login logic here
      } else {
        console.log("Registering with:", {
          accountName: accountName.value,
          password: password.value,
          email: email.value,
        });
        // Implement registration logic here
      }
    };

    return {
      isLogin,
      accountName,
      password,
      email,
      showPassword,
      onSubmit,
    };
  },
};
</script>
