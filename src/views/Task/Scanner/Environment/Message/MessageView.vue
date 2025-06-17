<template>
  <div class="scanner-box">
    <el-scrollbar ref="scrollbarRef" class="chat-panel">
      <div class="message">
        <div v-for="(msg, i) in messages" :key="i">
          <p>
            <strong
              >{{
                msg.role === 'user' ? '👤 你' : msg.role === 'assistant' ? '🤖 AI' : '📢 系统'
              }}：</strong
            >
          </p>
          <p>{{ msg.content }}</p>
          <hr />
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/message'
import { useTaskStore } from '@/stores/task'
import { computed, onMounted } from 'vue'

const route = useRoute()
const taskID = route.params.taskID as string
const chatStore = useChatStore()
const taskStore = useTaskStore()

const messages = computed(() => chatStore.getMessages(taskID))
const task = computed(() => taskStore.getById(taskID))

onMounted(async () => {
  await chatStore.fetchAllConversations()

  // 如果该任务的消息为空，则发送默认消息并启动流式响应
  if (chatStore.getMessages(taskID).length === 0) {
    const defaultMsg = {
      role: 'user' as 'user',
      content: task.value.command,
      timestamp: new Date().toISOString(),
    }

    await chatStore.sendMessage(taskID, defaultMsg)

    // 发送成功后立即调用流式读取，逐字追加 assistant 回复
    await chatStore.streamReceive(taskID, (msg) => {
      // 可选：额外处理字符流，比如滚动、日志、loading 状态等
      console.log('assistant 回复:', msg.content)
    })
  }
})
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
  white-space: pre-wrap;
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
