<template>
  <div ref="terminalRef" class="terminal-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Terminal } from 'xterm'
import 'xterm/css/xterm.css'

const terminalRef = ref<HTMLDivElement | null>(null)
let term: Terminal
let evtSource: EventSource | null = null

onMounted(() => {
  // 1. 初始化 xterm.js
  term = new Terminal({
    cols: 80,
    rows: 24,
    theme: {
      background: '#1e1e1e',
      foreground: '#ffffff',
    },
  })
  term.open(terminalRef.value!)

  // 2. 从路由里拿到 taskId
  const route = useRoute()
  const taskId = route.params.taskId as string

  // 3. 建立 SSE 连接
  evtSource = new EventSource(`http://localhost:8000/stream/${taskId}`)

  // 4. 接收消息并写入终端
  evtSource.onmessage = (e) => {
    term.writeln(e.data)
  }
  evtSource.onerror = () => {
    term.writeln('⚠️ 连接已断开')
    evtSource?.close()
  }
})

onUnmounted(() => {
  // 组件卸载时关闭连接
  evtSource?.close()
})
</script>

<style>
.terminal-container {
  width: 100%;
  height: 100%;
  background: #1e1e1e;
}
</style>
