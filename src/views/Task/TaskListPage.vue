<template>
  <div class="task-list-page">
    <h1>任务列表</h1>

    <div class="custom-style">
      <el-segmented v-model="value" :options="options" />
    </div>

    <el-scrollbar height="100%">
      <div class="grid-content">
        <el-row :gutter="10">
          <el-col v-for="(task, index) in filteredTasks" :key="index" :span="8">
            <el-card class="box-card">
              <div class="grid-content">
                <h3>{{ task.name }}</h3>
                <p>状态: {{ task.status }}</p>
                <el-button type="primary" @click="goSubPage(task.name)">查看详情</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const value = ref('全部')
const options = ['全部', '已完成', '扫描中', '异常']

const task_list = ref([
  { name: '任务1', status: '已完成' },
  { name: '任务2', status: '扫描中' },
  { name: '任务3', status: '异常' },
])

const filteredTasks = computed(() => {
  if (value.value === '全部') return task_list.value
  return task_list.value.filter((task) => task.status === value.value)
})

const router = useRouter()

function goSubPage(task_name: string) {
  router.push('/scan/' + task_name)
}
</script>

<style scoped>
.task-list-page {
  padding-left: 30px;
  padding-right: 30px;
}
.custom-style .el-segmented {
  --el-segmented-item-selected-color: var(--el-text-color-primary);
  --el-segmented-item-selected-bg-color: #ffd100;
  --el-border-radius-base: 16px;
}

.el-col {
  border-radius: 4px;
}
</style>
