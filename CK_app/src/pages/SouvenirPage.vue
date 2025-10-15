<template>
  <div class="iframe-container">
    <iframe
      id="inlineFrameExample"
      title="Inline Frame Example"
      src="https://souvenir.cksc.tw/auth"
    >
    </iframe>
  </div>
</template>

<script>
export default {
  name: 'FullScreenIframe'
}
</script>

<style scoped>
.iframe-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
