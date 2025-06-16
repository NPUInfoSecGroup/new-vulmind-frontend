<template>
  <div class="info-bar">
    <div class="task-info-view">
      <div class="task-details">
        <h1>{{ taskName }}</h1>
        <p class="id">{{ taskID }}</p>
      </div>
    </div>
    <div class="back-button">
      <el-button type="primary" @click="$router.back()">返回</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { ref } from 'vue'
const route = useRoute()
const taskID = route.params.taskID as string
const taskName = ref('1123')
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
.task-details {
  /* margin-left: 20px; */
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
</style>
