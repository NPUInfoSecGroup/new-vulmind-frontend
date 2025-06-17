<template>
  <div ref="terminalRef" class="terminal-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Terminal } from 'xterm'
import 'xterm/css/xterm.css'
import axios from 'axios'

const terminalRef = ref<HTMLDivElement | null>(null)
let term: Terminal

const offset = ref(0) // 拉取偏移量
const pollTimer = ref<number | null>(null)
const POLL_INTERVAL = 800 // ms

// 初始化终端
function initTerminal() {
  term = new Terminal({
    cols: 100,
    rows: 30,
    theme: {
      background: '#1e1e1e',
      foreground: '#ffffff',
    },
  })
  term.open(terminalRef.value!)
  // 可选：清屏命令
  term.clear()
}

// 将一行对象渲染到终端
// 将一行对象渲染到终端（含 JSON 美化）
function writeLine(line: { type: string; content: string }) {
  switch (line.type) {
    case 'stdout':
      term.writeln(line.content)
      break

    case 'instruction':
      term.writeln('[指令] ' + line.content)
      break

    case 'structure':
      term.writeln('[结构] ⇩')
      try {
        // 尝试解析并美化 JSON
        const obj = JSON.parse(line.content)
        const pretty = JSON.stringify(obj, null, 2)
        pretty.split('\n').forEach((l) => term.writeln('  ' + l))
      } catch (e) {
        // 解析失败则原样输出
        term.writeln(line.content)
      }
      break

    default:
      term.writeln(`[${line.type}] ` + line.content)
  }
}

// 拉取新日志行
async function fetchOutput(taskId: string) {
  try {
    const res = await axios.get(`http://127.0.0.1:8000/scan/output`, {
      params: { offset: offset.value, taskId },
    })
    const newLines: Array<{ type: string; content: string }> = res.data.lines || []

    if (newLines.length > 0) {
      newLines.forEach(writeLine)
      offset.value += newLines.length

      // 自动滚动到底部
      await nextTick()
      const el = terminalRef.value!
      el.scrollTop = el.scrollHeight
    }
  } catch (err) {
    term.writeln('⚠️ 拉取日志失败：' + (err as any).message)
  }
}

function startPolling(taskId: string) {
  pollTimer.value = window.setInterval(() => fetchOutput(taskId), POLL_INTERVAL)
}

function stopPolling() {
  if (pollTimer.value !== null) {
    clearInterval(pollTimer.value)
    pollTimer.value = null
  }
}

onMounted(() => {
  initTerminal()
  const route = useRoute()
  const taskId = route.params.taskId as string
  offset.value = 0
  startPolling(taskId)
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style>
.terminal-container {
  width: 100%;
  height: 100%;
  background: #1e1e1e;
  overflow-y: auto; /* 保证可滚动 */
}
</style>
