<template>
  <div ref="terminalRef" class="terminal-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Terminal } from 'xterm'
import 'xterm/css/xterm.css'
import axios from 'axios'
import { eventBus } from './event-bus'

type Line = { type: string; content: string }

const terminalRef = ref<HTMLDivElement | null>(null)
let term: Terminal

const offset = ref(0) // 拉取偏移量
const pollTimer = ref<number | null>(null)
const POLL_INTERVAL = 800 // ms
let taskId = ''

// 初始化终端
function initTerminal() {
  term = new Terminal({
    cols: 100,
    rows: 30,
    theme: { background: '#1e1e1e', foreground: '#ffffff' },
  })
  term.open(terminalRef.value!)
  term.clear()
}

// 将一行对象渲染到终端
function writeLine(line: Line) {
  switch (line.type) {
    case 'stdout':
      term.writeln(line.content)
      break
    case 'instruction':
      term.writeln('$ ' + line.content)
      break
    case 'structure':
      term.writeln('> ')
      try {
        const obj = JSON.parse(line.content)
        const pretty = JSON.stringify(obj, null, 2)
        pretty.split('\n').forEach((l) => term.writeln('  ' + l))
      } catch {
        term.writeln(line.content)
      }
      break
    default:
      term.writeln(`[${line.type}] ` + line.content)
  }
}

// 拉取新日志行
async function fetchOutput() {
  try {
    const res = await axios.get(`http://127.0.0.1:8000/scan/output`, {
      params: { offset: offset.value, taskId },
    })
    const newLines: Line[] = res.data.lines || []

    if (newLines.length) {
      newLines.forEach(writeLine)
      offset.value += newLines.length
      await nextTick()
      terminalRef.value!.scrollTop = terminalRef.value!.scrollHeight
    }
  } catch (err) {
    term.writeln('⚠️ 拉取日志失败：' + (err as any).message)
  }
}

function startPolling() {
  if (pollTimer.value === null) {
    pollTimer.value = window.setInterval(fetchOutput, POLL_INTERVAL)
  }
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
  taskId = route.params.taskId as string
  offset.value = 0

  // 监听事件总线，开始拉取日志
  eventBus.on('startAgent', () => {
    term.clear()
    offset.value = 0
    startPolling()
  })
})

onUnmounted(() => {
  stopPolling()
  eventBus.off('startAgent')
})
</script>

<style>
.terminal-container {
  width: 100%;
  height: 100%;
  background: #1e1e1e;
}
</style>
