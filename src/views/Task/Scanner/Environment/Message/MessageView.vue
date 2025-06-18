<template>
  <div class="scanner-box">
    <el-scrollbar ref="scrollbarRef" class="chat-panel">
      <div class="message">
        <div v-for="(msg, i) in messages" :key="i">
          <div v-html="renderContent(msg.content)" class="markdown-body"></div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import MarkdownIt from 'markdown-it'
import { useConfigStore } from '@/stores/config'
import { useTaskStore } from '@/stores/task'
import { useRoute } from 'vue-router'

const route = useRoute()

const configStore = useConfigStore()
const taskStore = useTaskStore()
const taskID = route.params.taskID as string
const task = taskStore.safeGetById(taskID)
const baseUrl = configStore.getServerUrl

const md = new MarkdownIt()

const renderContent = (content: string) => {
  return md.render(content)
}

import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import axios from 'axios'

const config = reactive({
  target: task.target,
  goal: task.command,
})
const agentStarted = ref(false)
const agentRunning = ref(false)
const messages = ref<{ role: string; content: string }[]>([])
const initLoading = ref(false)
const scrollbarRef = ref<any>()
let pollingTimer: any = null

// 聊天记录自动保存/恢复
onMounted(() => {
  const saved = localStorage.getItem('agent-chat-history')
  if (saved) messages.value = JSON.parse(saved)
})
watch(
  messages,
  async () => {
    await nextTick()
    if (scrollbarRef.value) {
      // 平滑滚动到底部
      scrollbarRef.value.scrollTo({
        top: scrollbarRef.value.wrapRef.scrollHeight,
        behavior: 'smooth',
      })
    }
  },
  { deep: true, immediate: true },
)
async function startAgent() {
  if (!config.target || !config.goal) {
    return alert('请填写目标和测试目的')
  }
  initLoading.value = true
  try {
    // 1. 启动 agent 模式
    console.log('正在启动 Agent 模式...')
    await axios.post('http://localhost:8000/agent/' + task.id + '/start', {
      target: config.target,
      goal: config.goal,
      iteration_limit: 20,
    })
    agentStarted.value = true
    agentRunning.value = true
    // messages.value.push({ role: 'system', content: '➡️ Agent 模式已启动，正在自动进行渗透测试...' })
    await nextTick()
    scrollbarRef.value?.setScrollTop(999999)
    // 2. 开始自动轮询/拉取 agent 步骤直到结束
    console.log('开始轮询 Agent 步骤...')
    pollAgentSteps()
  } catch (err) {
    messages.value.push({ role: 'system', content: '# 启动失败，请检查后端' })
    agentStarted.value = false
    agentRunning.value = false
  }
  initLoading.value = false
}
import { eventBus } from '../event-bus'
import { onBeforeUnmount } from 'vue'
import { routeLocationKey } from 'vue-router'

onMounted(() => {
  eventBus.on('startAgent', startAgent)
})

onBeforeUnmount(() => {
  eventBus.off('startAgent', startAgent)
})

async function pollAgentSteps() {
  console.log('轮询 Agent 步骤...')
  if (!agentRunning.value) return

  try {
    // 执行一次 agent 的 step
    const res = await axios.post('http://localhost:8000/agent/step')
    const logs = res.data.logs || []
    // 追加本次AI输出
    if (logs.length) {
      // 去重，只追加新内容
      const newMsg = logs[logs.length - 1]?.ai_response || '(无返回)'
      if (!messages.value.length || messages.value[messages.value.length - 1].content !== newMsg) {
        messages.value.push({ role: 'ai', content: newMsg })
      }
    }

    // 检查Agent状态，决定是否继续
    const statusResp = await axios.get('http://localhost:8000/agent/status')
    if (statusResp.data.running === false) {
      // messages.value.push({ role: 'system', content: '✅ Agent 已完成全部渗透任务！' })
      agentRunning.value = false
      agentStarted.value = false
      return
    }
    // 递归继续下一步
    pollingTimer = setTimeout(pollAgentSteps, 1000)
    await nextTick()
    scrollbarRef.value?.setScrollTop(999999)
  } catch (err) {
    messages.value.push({ role: 'system', content: '# Agent 步骤执行失败或中断！' })
    agentRunning.value = false
    agentStarted.value = false
  }
}
</script>

<style scoped>
.agent-box {
  height: 80vh;
  display: flex;
  flex-direction: column;
  background: #182231;
  border-radius: 1rem;
  margin: 0 0 10px 0;
  border: 1px solid rgba(100, 116, 139, 0.15);
  color: #cbd5e0;
}
.config-panel {
  padding: 10px;
  background: #101824;
  border-radius: 10px;
  margin: 12px;
}
.chat-panel {
  flex: 1;
  overflow: auto;
  padding: 12px 20px;
  background-color: #192034;
}
.message {
  color: aliceblue;
  /* white-space: pre-wrap; */
  word-wrap: break-word;
}
.scanner-box {
  height: 57.8vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #0f172a;
  border-radius: 1rem;
  margin-top: 15px;
  margin-bottom: 0;
  border: 1px solid rgba(100, 116, 139, 0.2);
  color: #cbd5e0;
  padding: 10px;
}
</style>
