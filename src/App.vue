<template>
  <div id="app" v-cloak>
    <TitleBar />
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import TitleBar from './components/TitleBar.vue'

onMounted(() => {
  const canvas = document.getElementById('particle-canvas')
  if (canvas) {
    canvas.style.position = 'fixed'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.zIndex = '-1'
  }
})
</script>

<style>
#app {
  /* font-family: Avenir, Helvetica, Arial, sans-serif; */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0 40px;
  padding: 0 40px;
}
[v-cloak] {
  display: none;
}
</style>
