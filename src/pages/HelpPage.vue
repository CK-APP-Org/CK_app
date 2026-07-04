<template>
  <q-page class="decision-helper-page">
    <div class="container">
      <div class="header-section">
        <div class="title-wrapper">
          <q-icon name="casino" size="48px" color="primary" class="title-icon" />
          <h1 class="page-title">選擇障礙小幫手</h1>
        </div>
        <p class="subtitle">輸入你的選項，讓我幫你做決定！</p>
      </div>

      <q-card class="input-card" flat bordered>
        <q-card-section>
          <div class="input-label">
            <q-icon name="edit_note" color="grey-7" size="20px" />
            <span>輸入選項（每行一個）</span>
          </div>
          <q-input
            v-model="input"
            type="textarea"
            outlined
            autogrow
            :rows="6"
            placeholder="例如：&#10;去看電影&#10;在家休息&#10;約朋友吃飯&#10;去運動"
            class="option-input"
          />
          <div class="option-count" v-if="optionCount > 0">
            已輸入 {{ optionCount }} 個選項
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-pb-md">
          <q-btn
            label="幫我選一個！"
            color="primary"
            size="lg"
            unelevated
            rounded
            :disable="optionCount === 0"
            @click="makeDecision"
            class="decision-btn"
          >
            <q-icon name="shuffle" right size="20px" />
          </q-btn>
        </q-card-actions>
      </q-card>

      <transition name="result-fade">
        <q-card v-if="result" class="result-card" flat>
          <q-card-section class="result-content">
            <div class="result-icon-wrapper">
              <q-icon name="emoji_events" color="amber" size="64px" />
            </div>
            <div class="result-label">建議選擇</div>
            <div class="result-text">{{ result }}</div>
            <q-btn
              unelevated
              label="重新選擇"
              text-color="white"
              class="q-mt-md reset-btn"
              @click="reset"
            />
          </q-card-section>
        </q-card>
      </transition>
    </div>
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      input: "",
      result: null,
    };
  },
  computed: {
    optionCount() {
      const options = this.input
        .split("\n")
        .map((opt) => opt.trim())
        .filter((opt) => opt.length > 0);
      return options.length;
    },
  },
  methods: {
    makeDecision() {
      const options = this.input
        .split("\n")
        .map((opt) => opt.trim())
        .filter((opt) => opt.length > 0);

      if (options.length > 0) {
        const randomIndex = Math.floor(Math.random() * options.length);
        this.result = options[randomIndex];
      } else {
        this.$q.notify({
          message: "請至少輸入一個選項！",
          color: "warning",
          icon: "warning",
        });
      }
    },
    reset() {
      this.result = null;
    },
  },
};
</script>

<style scoped>
.reset-btn {
  background-color: #03328d;
  color: white;
  font-weight: 500;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.reset-btn:hover {
  background-color: #024070;
  transform: scale(1.05);
}

.decision-helper-page {
  min-height: 100vh;
  padding: 2rem 1rem;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.title-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.title-icon {
  animation: rotate 3s linear infinite;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  color: black;
}

.subtitle {
  font-size: 1.1rem;
  color: #616161;
  margin: 0;
}

.input-card {
  border-radius: 16px;
  border: 2px solid #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.input-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: #424242;
}

.option-input {
  font-size: 1rem;
}

.option-count {
  text-align: right;
  font-size: 0.875rem;
  color: #757575;
  margin-top: 0.5rem;
}

.decision-btn {
  font-size: 1.1rem;
  padding: 0.75rem 2.5rem;
  font-weight: 600;
  transition: transform 0.2s;
}

.decision-btn:hover {
  transform: scale(1.05);
}

.result-card {
  margin-top: 2rem;
  border-radius: 16px;
  border: 2px solid #e0e0e0;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.result-content {
  text-align: center;
  padding: 2rem;
}

.result-icon-wrapper {
  animation: bounce 0.6s ease-out;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.result-label {
  font-size: 1rem;
  color: #757575;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.result-text {
  font-size: 2rem;
  font-weight: 700;
  color: #1976d2;
  margin-bottom: 0.5rem;
  word-wrap: break-word;
}

.result-fade-enter-active,
.result-fade-leave-active {
  transition: all 0.3s ease;
}

.result-fade-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.result-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 600px) {
  .page-title {
    font-size: 2rem;
  }

  .decision-helper-page {
    padding: 1rem 0.5rem;
  }

  .result-text {
    font-size: 1.5rem;
  }
}
</style>
