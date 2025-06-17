<template>
  <div class="task-manager">
    <!-- 任务创建区域 -->
    <div class="task-creator">
      <h2>创建新扫描任务</h2>
      <form @submit.prevent="handleCreateTask">
        <label>
          任务名称:
          <input v-model="newTask.name" required />
        </label>

        <label>
          扫描目标:
          <input v-model="newTask.target" placeholder="https://example.com" required />
        </label>

        <label>
          扫描命令:
          <input v-model="newTask.command" placeholder="nmap -sV" required />
        </label>

        <button type="submit">开始扫描</button>
      </form>
    </div>

    <!-- 任务列表区域 -->
    <div class="task-list">
      <h2>任务列表 ({{ tasks.length }})</h2>
      <button @click="fetchTasks">刷新任务列表</button>

      <!-- 状态过滤标签 -->
      <div class="status-tabs">
        <button
          v-for="status in ['all', 'pending', 'running', 'completed', 'failed']"
          :key="status"
          @click="currentFilter = status"
          :class="{ active: currentFilter === status }"
        >
          {{ status }} ({{ statusCounts[status] }})
        </button>
      </div>

      <!-- 任务列表 -->
      <ul v-if="filteredTasks.length">
        <li v-for="task in filteredTasks" :key="task.id" :class="task.status">
          <div class="task-header">
            <h3>{{ task.name }}</h3>
            <span class="status-badge">{{ task.status }}</span>
            <button @click="removeTask(task.id)">删除</button>
          </div>

          <p><strong>目标:</strong> {{ task.target }}</p>
          <p><strong>命令:</strong> {{ task.command }}</p>
          <p><strong>开始时间:</strong> {{ formatDate(task.startTime) }}</p>

          <!-- 任务操作 -->
          <div class="task-actions">
            <button v-if="task.status === 'pending'" @click="startTask(task.id)">开始扫描</button>

            <button v-if="task.status === 'running'" @click="addMockResult(task.id)">
              模拟添加结果
            </button>

            <button v-if="task.status === 'running'" @click="completeTask(task.id)">
              标记完成
            </button>

            <button v-if="task.status !== 'failed'" @click="failTask(task.id)">标记失败</button>
          </div>

          <!-- 扫描结果 -->
          <div v-if="task.results.length" class="results-container">
            <h4>扫描结果 ({{ task.results.length }})</h4>
            <div
              v-for="(result, index) in task.results"
              :key="result.resultId"
              class="result-item"
              :class="result.severity"
            >
              <p>
                <strong>#{{ index + 1 }} {{ result.vulnType }}</strong>
              </p>
              <p>
                严重程度: <span class="severity-tag">{{ result.severity }}</span>
              </p>
              <p>{{ result.details }}</p>
            </div>
          </div>
        </li>
      </ul>
      <p v-else>没有找到任务</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTaskStore } from '@/stores/task' // 调整路径以匹配你的文件位置
import type { Task } from '@/stores/task'

const taskStore = useTaskStore()

// 初始化时获取任务
onMounted(() => {
  taskStore.fetchTasks()
})

// 新任务表单数据
const newTask = ref({
  name: '',
  target: '',
  command: '',
})

// 状态过滤
const currentFilter = ref('all')

// 计算属性
const tasks = computed(() => taskStore.tasks)
const filteredTasks = computed(() => {
  if (currentFilter.value === 'all') return tasks.value
  return tasks.value.filter((t) => t.status === currentFilter.value)
})

const statusCounts = computed(() => ({
  all: tasks.value.length,
  pending: taskStore.pendingTasks.length,
  running: taskStore.runningTasks.length,
  completed: taskStore.completedTasks.length,
  failed: taskStore.failedTasks.length,
}))

// 日期格式化
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

// 任务操作函数
const fetchTasks = async () => {
  await taskStore.fetchTasks()
}

const handleCreateTask = async () => {
  await taskStore.addTask({
    ...newTask.value,
    status: 'pending',
  })
  newTask.value = { name: '', target: '', command: '' }
}

const startTask = async (id: string) => {
  await taskStore.updateTask(id, {
    status: 'running',
    startTime: new Date().toISOString(),
  })
}

const completeTask = async (id: string) => {
  await taskStore.updateTask(id, { status: 'completed' })
}

const failTask = async (id: string) => {
  await taskStore.updateTask(id, { status: 'failed' })
}

const removeTask = async (id: string) => {
  if (confirm('确定要删除此任务吗？')) {
    await taskStore.removeTask(id)
  }
}

// 模拟添加扫描结果
const addMockResult = (taskId: string) => {
  const severities = ['low', 'medium', 'high', 'critical']
  const vulnTypes = [
    'SQL 注入',
    'XSS 跨站脚本',
    'CSRF 跨站请求伪造',
    '命令注入',
    '路径遍历',
    'SSRF 服务端请求伪造',
  ]

  const randomIndex = Math.floor(Math.random() * vulnTypes.length)

  taskStore.addResult(taskId, {
    resultId: `result-${Date.now()}`,
    severity: severities[Math.floor(Math.random() * severities.length)] as any,
    vulnType: vulnTypes[randomIndex],
    details: `在 ${new Date().toLocaleTimeString()} 检测到 ${vulnTypes[randomIndex]} 漏洞`,
  })
}
</script>

<style scoped>
.task-manager {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.task-creator,
.task-list {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

form {
  display: grid;
  gap: 15px;
  margin-top: 15px;
}

label {
  display: block;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 5px;
}

button {
  background: #4a6cf7;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background: #3a56e0;
}

.status-tabs {
  display: flex;
  gap: 10px;
  margin: 15px 0;
}

.status-tabs button.active {
  background: #2c3e50;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.task-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.status-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
}

.pending .status-badge {
  background: #ffc107;
  color: #333;
}
.running .status-badge {
  background: #17a2b8;
  color: white;
}
.completed .status-badge {
  background: #28a745;
  color: white;
}
.failed .status-badge {
  background: #dc3545;
  color: white;
}

.task-actions {
  display: flex;
  gap: 10px;
  margin: 15px 0;
}

.results-container {
  margin-top: 15px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.result-item {
  padding: 10px;
  margin-bottom: 10px;
  border-left: 4px solid;
  background: #f8f9fa;
}

.result-item.low {
  border-color: #28a745;
}
.result-item.medium {
  border-color: #ffc107;
}
.result-item.high {
  border-color: #fd7e14;
}
.result-item.critical {
  border-color: #dc3545;
}

.severity-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.severity-tag.low {
  background: #28a745;
  color: white;
}
.severity-tag.medium {
  background: #ffc107;
  color: #333;
}
.severity-tag.high {
  background: #fd7e14;
  color: white;
}
.severity-tag.critical {
  background: #dc3545;
  color: white;
}
</style>
