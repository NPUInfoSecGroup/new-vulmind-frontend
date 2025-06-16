<template>
  <div id="app" v-cloak>
    <router-view />
  </div>
</template>

<script>
import { onMounted } from 'vue'

export default {
  name: 'App',
  setup() {
    onMounted(() => {
      initParticleBackground()
    })

    function initParticleBackground() {
      const canvas = document.getElementById('particle-canvas')
      if (canvas) {
        canvas.style.position = 'fixed'
        canvas.style.top = '0'
        canvas.style.left = '0'
        canvas.style.zIndex = '-1'
      }
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
[v-cloak] {
  display: none;
}
</style>