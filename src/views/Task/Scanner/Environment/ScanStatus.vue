<template>
  <div class="scan-output card">
    <div class="card-header">
      <span>命令行实时输出</span>
      <div class="header-controls">
        <button class="control-btn" @click="clearOutput" title="清空输出">
          <i class="fas fa-trash" />
        </button>
        <button class="control-btn" @click="toggleAutoScroll" :title="autoScroll ? '暂停滚动' : '启用滚动'">
          <i class="fas" :class="autoScroll ? 'fa-pause' : 'fa-play'" />
        </button>
        <button class="control-btn" @click="copyOutput" title="复制全部">
          <i class="fas fa-copy" />
        </button>
      </div>
    </div>
    <div class="card-body">
      <div ref="outputContainer" class="cli-output" @scroll="handleScroll">
        <div v-for="(line, idx) in outputLines" :key="idx" class="output-line">
          <span class="line-content">{{ line.content }}</span>
        </div>
        <div v-if="isLoading" class="loading-indicator">
          <i class="fas fa-spinner fa-spin" /> 实时加载中...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import axios from 'axios'

const outputLines = ref<{ content: string }[]>([])
const offset = ref(0)
const isLoading = ref(true)
const autoScroll = ref(true)
const pollTimer = ref<number>()
const outputContainer = ref<HTMLDivElement | null>(null)

const POLL_INTERVAL = 800 // ms

// 拉取后端新行
async function fetchOutput() {
  try {
    const res = await axios.get('http://localhost:8000/scan/output', {
      params: { offset: offset.value }
    })
    const newLines = res.data.lines || []
    if (newLines.length > 0) {
      outputLines.value.push(...newLines)
      offset.value += newLines.length
      await nextTick()
      if (autoScroll.value) scrollToBottom()
    }
    isLoading.value = false
  } catch {
    isLoading.value = false
  }
}

// 定时轮询
function startPolling() {
  pollTimer.value = window.setInterval(fetchOutput, POLL_INTERVAL)
}
function stopPolling() {
  if (pollTimer.value) clearInterval(pollTimer.value)
}

function scrollToBottom() {
  if (outputContainer.value) {
    outputContainer.value.scrollTop = outputContainer.value.scrollHeight
  }
}

function handleScroll() {
  if (!outputContainer.value) return
  // 判断是否在底部
  const isAtBottom = outputContainer.value.scrollTop + outputContainer.value.clientHeight >= outputContainer.value.scrollHeight - 20
  autoScroll.value = isAtBottom
}

function clearOutput() {
  outputLines.value = []
  offset.value = 0
}

function toggleAutoScroll() {
  autoScroll.value = !autoScroll.value
  if (autoScroll.value) nextTick(scrollToBottom)
}

function copyOutput() {
  const text = outputLines.value.map(l => l.content).join('\n')
  navigator.clipboard.writeText(text)
}

onMounted(() => {
  fetchOutput()
  startPolling()
})
onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.scan-output {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #151a23;
  border-radius: 1rem;
  border: 1px solid rgba(100,116,139,0.15);
}
.card-header {
  padding: 12px 20px;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1e2636;
  border-bottom: 1px solid rgba(100,116,139,0.18);
}
.header-controls {
  display: flex;
  gap: 8px;
}
.control-btn {
  border: none;
  background: transparent;
  color: #93a3b1;
  cursor: pointer;
  padding: 4px;
  font-size: 18px;
}
.control-btn:hover {
  color: #53b7f6;
}
.card-body {
  flex: 1;
  padding: 0;
  overflow: hidden;
  background: #131b26;
}
.cli-output {
  font-family: 'Fira Mono', 'Consolas', monospace;
  font-size: 14px;
  padding: 18px;
  overflow-y: auto;
  height: 100%;
  color: #d8e0f1;
  background: transparent;
}
.output-line {
  margin-bottom: 5px;
  white-space: normal;  /* 关键：让它自动换行，忽略多余的换行 */
  word-break: break-all;
}
.loading-indicator {
  color: #42a3f7;
  padding: 12px 0;
  font-size: 14px;
}
</style>
