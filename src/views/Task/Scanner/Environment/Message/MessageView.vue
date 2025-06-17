<template>
  <div class="scanner-box">
    <el-scrollbar ref="scrollbarRef" class="chat-panel">
      <div class="message">
        <div v-for="(msg, i) in messages" :key="i">
          <!-- <p>
            <strong
              >{{
                msg.role === 'user' ? '👤 你' : msg.role === 'assistant' ? '🤖 AI' : '📢 系统'
              }}：</strong
            >
          </p> -->
          <div v-html="renderContent(msg.content)" class="markdown-body"></div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useTaskStore } from '@/stores/task'
import { computed, onMounted, watch, ref, nextTick } from 'vue'
import MarkdownIt from 'markdown-it'

const route = useRoute()
const taskID = route.params.taskID as string
const chatStore = useChatStore()
const taskStore = useTaskStore()

const scrollbarRef = ref<InstanceType<(typeof import('element-plus'))['ElScrollbar']> | null>(null)

const messages = computed(() => chatStore.getMessages(taskID))
const task = computed(() => taskStore.getById(taskID))

onMounted(async () => {
  await chatStore.fetchAllConversations()

  if (chatStore.getMessages(taskID).length === 0) {
    const defaultMsg = {
      role: 'user' as 'user',
      content: task.value.command,
      timestamp: new Date().toISOString(),
    }

    // await chatStore.sendMessage(taskID, defaultMsg)

    await chatStore.streamReceive(taskID, (msg) => {
      console.log('assistant 回复:', msg.content)
    })
  }
})

// 监听 messages 变化，自动滚动到底部
watch(
  messages,
  async () => {
    await nextTick()
    if (scrollbarRef.value) {
      // 平滑滚动到底部
      scrollbarRef.value.scrollTo({
        top: scrollbarRef.value.wrapRef.scrollHeight,
        behavior: 'smooth',
      })
    }
  },
  { deep: true, immediate: true },
)

const md = new MarkdownIt()

const renderContent = (content: string) => {
  return md.render(content)
}
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
  /* white-space: pre-wrap; */
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
