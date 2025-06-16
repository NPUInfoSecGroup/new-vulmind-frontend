<template>
  <div class="scanner-box">
    <el-scrollbar ref="scrollbarRef">
      <div class="message">
        <div v-for="(msg, index) in messages" :key="index">
          <p>
            <strong>{{ msg.role === 'user' ? '👤 你' : '🤖 AI' }}:</strong>
          </p>
          <p>{{ msg.content }}</p>
          <hr />
        </div>
      </div>
    </el-scrollbar>

    <div class="send-bar">
      <el-input
        v-model="request"
        placeholder="请输入消息"
        @keyup.enter="sendMessage"
        :disabled="loading"
      />
      <el-button @click="sendMessage" :icon="Top" circle :loading="loading" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import axios from 'axios'
import { Top } from '@element-plus/icons-vue'

const request = ref('')
const messages = ref<{ role: string; content: string }[]>([])
const loading = ref(false)
const scrollbarRef = ref()

// 加载本地聊天记录
onMounted(() => {
  const saved = localStorage.getItem('chat-history')
  if (saved) {
    messages.value = JSON.parse(saved)
  }
})

// 聊天记录自动保存
watch(
  messages,
  (val) => {
    localStorage.setItem('chat-history', JSON.stringify(val))
  },
  { deep: true },
)

async function sendMessage() {
  const text = request.value.trim()
  if (!text) return

  messages.value.push({ role: 'user', content: text })
  request.value = ''
  loading.value = true

  try {
    const res = await axios.post('http://localhost:8000/chat/send', {
      message: text, // ✅ 使用 JSON 请求体
    })
    messages.value.push({ role: 'ai', content: res.data.response || '(无返回)' })
  } catch (err) {
    console.error('发送失败', err)
    messages.value.push({ role: 'ai', content: '❌ 发送失败，请检查后端服务或网络' })
  }

  loading.value = false
  await nextTick()
  scrollbarRef.value?.setScrollTop(999999)
}
</script>

<style scoped>
.scanner-box {
  height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.el-scrollbar {
  flex: 1;
  overflow: auto;
  padding: 10px;
}

.send-bar {
  position: sticky;
  bottom: 0;
  padding: 10px;
  display: flex;
  gap: 10px;
  z-index: 10;
}

.message {
  color: aliceblue;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
