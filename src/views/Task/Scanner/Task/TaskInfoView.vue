<template>
  <div class="header-section">
    <div class="header-content">
      <h1 v-if="isTaskReady">{{ task.name }}</h1>
      <p class="id">{{ taskID }}</p>
    </div>

    <div class="back-button">
      <el-button type="primary" @click="$router.back()">返回</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { useTaskStore } from '@/stores/task'
import { computed, watch, ref } from 'vue'

const taskStore = useTaskStore()
const route = useRoute()
const taskID = route.params.taskID as string

const task = computed(() => taskStore.getById(taskID))

// 控制是否已加载到目标任务
const isTaskReady = ref(false)

async function loadTasks() {
  await taskStore.fetchTasks()
}

loadTasks()

watch(
  task,
  (newTask) => {
    if (newTask) {
      console.log('当前任务信息:', newTask)
      isTaskReady.value = true
      doSomethingAfterTask()
    } else {
      // 还没找到对应任务，isTaskReady 置 false，防止误用
      isTaskReady.value = false
    }
  },
  { immediate: true },
)

function doSomethingAfterTask() {
  console.log('执行后续逻辑')
}
</script>

<style scoped>
.info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40px;
  background-color: #12192c;
  border: 1px solid rgb(17 35 60);
  border-radius: 1rem;
}
.task-info-view {
  flex: 1;
}
.task-details h1 {
  margin: 0;
  font-size: 2rem;
  color: #ffffff;
  font-weight: bold;
}
.task-details p.id {
  margin: 5px 0 0;
  font-size: 14px;
  color: #b7b7b7;
}
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.7);
  border-radius: 16px;
  border: 1px solid rgba(100, 116, 139, 0.2);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.header-content {
  z-index: 2;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.title-container i {
  font-size: 2.5rem;
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0;
  color: #f8fafc;
  letter-spacing: 0.5px;
}

.subtitle {
  font-size: 1.1rem;
  color: #94a3b8;
  margin: 0;
  max-width: 600px;
  line-height: 1.6;
}

.header-decoration {
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 1rem;
}
</style>
