<template>
  <div class="card">
    <!-- <h1 class="title">漏洞扫描</h1> -->
    <el-scrollbar>
      <p class="message">{{ message }}</p>
    </el-scrollbar>
    <div class="send-bar">
      <el-input v-model="request" placeholder="Please input" />
      <el-button @click="sendMessage" :icon="Top" circle />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Top } from '@element-plus/icons-vue'

const message = ref('')
const request = ref('')

function sendMessage(get_replay: (msg: string) => string) {
  message.value = request.value
  message.value = get_replay(request.value)
}
</script>

<style scoped>
h1 {
  margin-bottom: 10px;
  margin-top: 10px;
  font-size: 20px;
}
.scrollbar-demo-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  margin: 10px;
  text-align: center;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
.scanner-box {
  height: 50vh;
  display: flex;
  flex-direction: column;
}

.el-scrollbar {
  flex: 1 1 auto; /* 占满剩余空间 */
  overflow: auto;
}

.send-bar {
  flex-shrink: 0; /* 固定高度 */
  display: flex;
  flex-direction: row;
  gap: 10px;
  padding-top: 20px;
}

.message {
  height: 70vh;
  color: aliceblue;
  word-wrap: break-word;
}
</style>
