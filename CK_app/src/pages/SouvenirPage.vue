<template>
  <q-page class="souvenir-page">
    <div class="iframe-wrapper">
      <iframe
        id="inlineFrameExample"
        title="Inline Frame Example"
        src="https://souvenir.cksc.tw/auth"
      >
      </iframe>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'SouvenirPage'
}
</script>

<style scoped>
.souvenir-page {
  padding: 0;
  height: 100%;
  overflow: hidden;
}

.iframe-wrapper {
  width: 100%;
  height: calc(100vh - 50px - 50px);
  position: relative;
}

iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

@media (max-width: 1023px) {
  .iframe-wrapper {
    height: calc(100vh - 50px);
  }
}
</style>
