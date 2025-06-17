import { defineStore } from 'pinia'
/** 对话消息 */
export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string // 消息内容
  timestamp?: string // ISO 时间戳，可选，由前后端约定
}

/** 任务对应的对话/消息列表 */
export interface Conversation {
  taskId: string // 与 Task 的 id 关联
  messages: Message[] // 该任务下的消息流
}
// ====== Chat Store: 管理任务对话 ======
export const useChatStore = defineStore('chat', {
  state: () => ({
    convs: [] as Conversation[], // 存储所有任务的对话列表
  }),
  getters: {
    // 获取某任务的全部消息
    getMessages: (state) => (taskId: string) => {
      const conv = state.convs.find((c) => c.taskId === taskId)
      return conv ? conv.messages : []
    },
  },
  actions: {
    /** 前端发送消息，推到后端接口并更新本地 */
    async sendMessage(taskId: string, message: Message) {
      // POST /api/tasks/{taskId}/messages -> Message
      try {
        const res = await fetch(`/api/tasks/${taskId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        })
        const saved: Message = await res.json()
        this._appendMsg(taskId, saved)
      } catch (e) {
        console.error(e)
      }
    },

    /**
     * 流式接收后端响应，按字符逐步回调
     * 使用 Fetch + ReadableStream 实现 GPT 式一字一字接收
     */
    async streamReceive(taskId: string, onMessage: (msg: Message) => void) {
      // 触发流式接口
      const response = await fetch(`/api/tasks/${taskId}/stream`, {
        method: 'GET',
        headers: { Accept: 'text/plain' },
      })
      if (!response.body) return
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let partial = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        // 解码本次二进制块
        const chunk = decoder.decode(value, { stream: true })
        partial += chunk
        // 按字符拆分并回调
        for (const char of chunk) {
          const msg: Message = {
            role: 'assistant',
            content: char,
            timestamp: new Date().toISOString(),
          }
          this._appendMsg(taskId, msg)
          onMessage(msg)
        }
      }
    },

    /** 内部方法：追加消息到 state */
    _appendMsg(taskId: string, msg: Message) {
      let conv = this.convs.find((c) => c.taskId === taskId)
      if (!conv) {
        conv = { taskId, messages: [] }
        this.convs.push(conv)
      }
      conv.messages.push(msg)
    },
  },
})
