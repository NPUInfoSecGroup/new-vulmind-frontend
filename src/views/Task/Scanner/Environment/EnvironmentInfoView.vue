<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="50%" class="aside">
        <h2>环境信息</h2>
        <div class="message-card">
          <div class="header-title">
            <p>{{ task.target }}</p>
            <el-tag effect="light" type="info" round>
              {{ task.type }}
            </el-tag>
          </div>
          <div class="action">
            <el-button type="primary" @click=""> 执行任务 </el-button>
          </div>
        </div>
        <el-scrollbar>
          <div class="terminal">
            <!-- <el-card>
              <div class="terminal-content"></div>
            </el-card> -->
            <ScanStatus />
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
import { ref } from 'vue'
import MessageView from './Message/MessageView.vue'
import ScanStatus from '@/views/Home/ScanStatus.vue'
const task = ref({
  name: '任务1',
  type: 'interactive',
  status: 'completed',
  target: 'http://example.com',
  created_at: '2023-10-01 12:00:00',
})
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
</style>
