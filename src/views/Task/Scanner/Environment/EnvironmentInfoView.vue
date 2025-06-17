<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="50%" class="aside">
        <h2>环境信息</h2>
        <div class="message-card">
          <div class="header-title">
            <span class="target">{{ task.target }}</span>
            <span class="command">{{ task.command }}</span>
          </div>
          <div class="action">
            <el-button type="primary" @click="start"> 执行任务 </el-button>
          </div>
        </div>
        <el-scrollbar>
          <div class="terminal">
            <!-- <el-card>
              <div class="terminal-content"></div>
            </el-card> -->
            <!-- <ScanStatus /> -->
          </div>
        </el-scrollbar>
      </el-aside>
      <el-main>
        <h2>扫描过程</h2>
        <MessageView />
      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { useTaskStore } from '@/stores/task'
import MessageView from './Message/MessageView.vue'
import ScanStatus from '@/views/Task/Scanner/Environment/ScanStatus.vue'
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'

const route = useRoute()
const taskID = route.params.taskID as string
const taskStore = useTaskStore()
const task = ref(taskStore.getById(taskID))

// 定时器和轮询状态标志
const statusPollingInterval = ref<NodeJS.Timeout | null>(null)
const isPolling = ref(false)

// 启动状态轮询
const startStatusPolling = () => {
  // 避免重复轮询或不必要的轮询
  if (isPolling.value || task.value?.status === 'completed' || task.value?.status === 'failed') {
    return
  }

  isPolling.value = true

  statusPollingInterval.value = setInterval(async () => {
    try {
      await taskStore.fetchTasks()
      task.value = taskStore.getById(taskID)

      if (task.value?.status === 'completed' || task.value?.status === 'failed') {
        console.log(`任务 ${taskID} 已结束，状态: ${task.value.status}`)
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
  if (statusPollingInterval.value) {
    clearInterval(statusPollingInterval.value)
    statusPollingInterval.value = null
  }
  isPolling.value = false
}

// 启动任务
function start() {
  taskStore.startTask(taskID)
  startStatusPolling()
}

// 组件挂载时开始轮询
onMounted(() => {
  startStatusPolling()
})

// 组件卸载前停止轮询
onBeforeUnmount(() => {
  stopStatusPolling()
})

// 监听任务状态变化
watch(
  () => taskStore.getById(taskID),
  (newTask) => {
    task.value = newTask
    if (newTask?.status === 'completed' || newTask?.status === 'failed') {
      stopStatusPolling()
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
</style>
