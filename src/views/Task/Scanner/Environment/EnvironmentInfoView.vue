<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="50%" class="aside">
        <h2>任务信息</h2>
        <div class="message-card">
          <div class="header-title">
            <span class="scanner-name">
              <span class="target">{{ task && task.target }}</span>
            </span>
            <span class="scanner-name">
              <span class="command">{{ task && task.command }}</span>
            </span>
          </div>
          <div class="action">
            <el-button type="primary" @click="start"> 执行任务 </el-button>
          </div>
        </div>
        <div class="terminal">
          <Terminal />
        </div>
      </el-aside>
      <el-main>
        <h2>扫描结果</h2>
        <MessageView />
      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import type { Task } from '@/stores/task'
import { useRoute } from 'vue-router'
import { useTaskStore } from '@/stores/task'
import MessageView from './Message/MessageView.vue'
import Terminal from './TerminalView.vue'
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'

const route = useRoute()
const taskID = route.params.taskID as string
const taskStore = useTaskStore()

// 初始化为安全默认值
const task = ref<Task>(taskStore.safeGetById(taskID))

// 修复 1: 使用 number 类型替代 NodeJS.Timeout (浏览器环境兼容)
const statusPollingInterval = ref<number | null>(null)
const isPolling = ref(false)

// 启动状态轮询
const startStatusPolling = () => {
  // 修复 2: 避免使用 includes() 方法（兼容性问题）
  const isFinished = task.value?.status === 'completed' || task.value?.status === 'failed'

  // 确保任务存在且状态允许轮询
  const shouldStart = task.value?.id && !isPolling.value && !isFinished

  if (!shouldStart) return

  isPolling.value = true

  statusPollingInterval.value = window.setInterval(async () => {
    try {
      await taskStore.fetchTasks()

      // 更新任务数据
      const updatedTask = taskStore.safeGetById(taskID)
      task.value = updatedTask

      // 检查任务是否结束
      const updatedIsFinished =
        task.value?.status === 'completed' || task.value?.status === 'failed'

      if (updatedIsFinished) {
        stopStatusPolling()
      }
    } catch (error) {
      console.error('轮询任务状态失败:', error)
      stopStatusPolling()
    }
  }, 5000)
}

// 停止状态轮询
const stopStatusPolling = () => {
  if (statusPollingInterval.value !== null) {
    clearInterval(statusPollingInterval.value)
    statusPollingInterval.value = null
  }
  isPolling.value = false
}
import { eventBus } from './event-bus'

// 启动任务
async function start() {
  if (!task.value?.id) return

  try {
    await taskStore.startTask(taskID)
    eventBus.emit('startAgent')
    startStatusPolling()
  } catch (error) {
    console.error('启动任务失败:', error)
  }
}

// 组件挂载时开始轮询
onMounted(() => {
  // 首次加载任务数据
  taskStore.fetchTasks().then(() => {
    task.value = taskStore.safeGetById(taskID)
    startStatusPolling()
  })
})

// 组件卸载前停止轮询
onBeforeUnmount(() => {
  stopStatusPolling()
})

// 监听任务状态变化
watch(
  () => taskStore.getById(taskID),
  (newTask) => {
    if (newTask) {
      task.value = newTask

      // 修复 2: 避免使用 includes() 方法
      // 如果任务完成或失败，停止轮询
      if (newTask.status === 'completed' || newTask.status === 'failed') {
        stopStatusPolling()
      }
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.common-layout {
  /* padding: 20px; */
  height: 100%;
  gap: 10px;
  /* background-color: #0e1c32b5; */
  /* border: #0d1f2d 1px solid; */
  border-radius: 1rem;
  /* padding: 20px; */
}
:deep(.el-container) {
  gap: 20px;
}
.aside {
  display: flex;
  flex-direction: column;
  gap: 20px;
  display: flex;
  flex-direction: column;
  height: 65vh;
  overflow: hidden;
}
.message-card {
  background-color: #2a41524f;
  color: #ffffff;
  border: 2px solid #263242;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  align-content: space-around;
  align-items: center;
  width: 100%;
  gap: 10px;
}
.terminal-content {
  height: 30vh;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 10px;
  overflow-y: auto;
}
main.el-main {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 0 !important;
}
h2 {
  margin: 0;
  padding: 10px;
  color: #ffffff;
  font-weight: bold;
}
.header-title {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.target {
  font-size: 1.2rem;
  font-weight: bold;
}
.command {
  font-size: 1rem;
  color: #9ca3af;
}
.terminal {
  border-radius: 1rem;
  box-shadow: var(--box-shadow);
}
span.scanner-name {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.message-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  flex-direction: column;
  flex: 1; /* 让它占满剩余空间 */
  overflow: hidden;
}

.scanner-name,
.command {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
