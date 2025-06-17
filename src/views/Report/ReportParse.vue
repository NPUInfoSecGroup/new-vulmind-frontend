<template>
  <div class="deepseek-container">
    <!-- 顶部标题栏 -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">DeepSeek API</h1>
        <p class="app-subtitle">AI对话助手</p>
      </div>
    </header>

    <!-- 主聊天区 -->
    <div class="chat-panel">
      <!-- 消息容器 -->
      <div class="messages-container">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message', msg.role === 'user' ? 'user-message' : 'ai-message']"
        >
          <div class="message-header">
            <div :class="['avatar', msg.role === 'user' ? 'user-avatar' : 'ai-avatar']">
              <i v-if="msg.role === 'user'" class="fas fa-user"></i>
              <i v-else class="fas fa-robot"></i>
            </div>
            <strong>{{ msg.role === 'user' ? '您' : 'DeepSeek AI' }}</strong>
          </div>
          <div class="message-content" v-html="renderMarkdown(msg.content)"></div>
        </div>

        <div v-if="isTyping" class="typing-container">
          <div class="typing-indicator">
            <span class="typing-text">思考中</span>
            <div class="typing-dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-container">
        <textarea
          v-model="userInput"
          placeholder="输入您的消息（Shift+Enter换行，Enter发送）..."
          @keydown="handleKeyDown"
          :disabled="isLoading"
        ></textarea>
        <button
          class="submit-btn"
          @click="sendMessage"
          :disabled="isLoading || !userInput.trim()"
        >
          <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-paper-plane"></i>
          {{ isLoading ? '生成中...' : '发送' }}
        </button>
      </div>
    </div>

    <!-- 底部状态与控制区 -->
    <div class="control-panel">
      <div class="status-container">
        <div :class="['status-indicator',
            apiStatus === 'connecting' ? 'connecting' :
            apiStatus === 'error' ? 'error' : '']"></div>
        <span>{{ statusText }}</span>
      </div>

      <div class="action-buttons">
        <button class="action-btn download-btn" @click="downloadMarkdown">
          <i class="fas fa-download"></i> 保存对话
        </button>
        <button class="action-btn clear-btn" @click="clearConversation">
          <i class="fas fa-trash-alt"></i> 清空对话
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const renderMarkdown = (markdown) => {
  if (!markdown) return '';

  // 配置marked
  marked.setOptions({
    gfm: true,
    breaks: true,
    highlight: (code, lang) => {
      const language = lang || 'plaintext';
      return `<pre><code class="hljs language-${language}">${escapeHtml(code)}</code></pre>`;
    }
  });

  const rawHtml = marked.parse(markdown);
  return DOMPurify.sanitize(rawHtml);
};

// 增强的HTML转义函数，确保代码块内容安全
const escapeHtml = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
const scrollToBottom = () => {
  nextTick(() => {
    const container = document.querySelector('.messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
};

// 对话数据
const messages = ref([
  {
    role: 'assistant',
    content: '你好！我是DeepSeek AI助手。请问有什么我可以帮助您的？\n\n- 我可以回答技术问题\n- 帮助解决编程难题\n- 解释复杂概念\n- 提供学习资源建议'
  }
]);

const userInput = ref('');
const isLoading = ref(false);
const isTyping = ref(false);
const apiStatus = ref('connected'); // connected, connecting, error

// 状态文本
const statusText = computed(() => {
  return {
    connected: 'API连接正常',
    connecting: '正在连接API...',
    error: 'API连接错误'
  }[apiStatus.value];
});


// 发送消息到DeepSeek API
const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;

  const inputText = userInput.value;
  userInput.value = '';

  // 添加用户消息
  messages.value.push({ role: 'user', content: inputText });

  // 设置加载状态
  isLoading.value = true;
  isTyping.value = true;
  apiStatus.value = 'connecting';

  try {
    // 调用DeepSeek API
    const response = await callDeepSeekAPI(inputText);

    // 添加AI响应
    messages.value.push({ role: 'assistant', content: response });
    apiStatus.value = 'connected';
  } catch (error) {
    console.error('API请求错误:', error);
    messages.value.push({
      role: 'assistant',
      content: `抱歉，请求出错: ${error.message}`
    });
    apiStatus.value = 'error';
  } finally {
    isLoading.value = false;
    isTyping.value = false;
  }
};

// DeepSeek API调用
const callDeepSeekAPI = async (inputText) => {
  const apiUrl = 'https://api.deepseek.com/v1/chat/completions';
  const apiKey = 'xxx';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        ...messages.value,
        { role: "user", content: inputText }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

// 下载对话记录
const downloadMarkdown = () => {
  if (messages.value.length === 0) return;

  let markdownContent = `# DeepSeek对话记录\n\n`;
  messages.value.forEach(msg => {
    const role = msg.role === 'user' ? '**您**:' : '**DeepSeek AI**:';
    markdownContent += `${role}\n\n${msg.content}\n\n---\n\n`;
  });

  const blob = new Blob([markdownContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `deepseek-chat-${new Date().toISOString().slice(0, 10)}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 清空对话
const clearConversation = () => {
  messages.value = [
    {
      role: 'assistant',
      content: '对话已重置！有什么可以帮您的吗？'
    }
  ];
};

// 处理键盘输入
const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

watch(messages, () => {
  scrollToBottom();
}, { deep: true, immediate: true });
</script>

<style scoped>
.deepseek-container {
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #161d3a 0%, #1a2448 100%);
  color: #e6e9ff;
  border-radius: 16px;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(100, 120, 220, 0.3);
  height: 100%;
}

/* 顶部标题栏 */
.app-header {
  text-align: center;
  padding: 15px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(120, 140, 240, 0.2);
}

.app-title {
  font-size: 2.8rem;
  font-weight: 700;
  background: linear-gradient(to right, #8c9bff, #4fa3f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 15px rgba(140, 155, 255, 0.4);
  margin-bottom: 8px;
}

.app-subtitle {
  font-size: 1.2rem;
  color: rgba(200, 210, 255, 0.9);
  letter-spacing: 1px;
  font-weight: 300;
}

/* 主聊天区 */
.chat-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(80, 100, 180, 0.2);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message {
  padding: 18px;
  border-radius: 14px;
  max-width: 90%;
  animation: messageAppear 0.4s ease;
}

@keyframes messageAppear {
  0% { opacity: 0; transform: translateY(15px); }
  100% { opacity: 1; transform: translateY(0); }
}

.user-message {
  align-self: flex-end;
  background: linear-gradient(135deg, #293a7a, #1c2a63);
  border: 1px solid rgba(90, 120, 230, 0.3);
}

.ai-message {
  align-self: flex-start;
  background: linear-gradient(135deg, #1a2448, #121b3a);
  border: 1px solid rgba(80, 110, 200, 0.2);
}

.message-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.user-avatar {
  background: linear-gradient(135deg, #4f6cd9, #3a56b4);
}

.ai-avatar {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
}

.message-content {
  font-size: 16px;
  line-height: 1.6;
}

.typing-container {
  align-self: flex-start;
  padding: 15px 20px;
  background: rgba(21, 31, 58, 0.6);
  border-radius: 14px;
  border: 1px solid rgba(90, 120, 220, 0.2);
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #94a3b8;
}

.typing-text {
  font-weight: 500;
  color: #4fa3f7;
}

.typing-dots {
  display: flex;
  gap: 5px;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #4fa3f7;
  opacity: 0.4;
  animation: pulse 1.5s infinite ease-in-out;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes pulse {
  0%, 100% { opacity: 0.4; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.1); }
}

.input-container {
  position: relative;
  padding: 15px;
  border-top: 1px solid rgba(80, 100, 180, 0.2);
}

textarea {
  width: 100%;
  height: 100px;
  resize: none;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(90, 120, 220, 0.3);
  border-radius: 12px;
  padding: 15px;
  color: #e6e9ff;
  font-size: 16px;
  line-height: 1.5;
  transition: all 0.3s ease;
}

textarea:focus {
  outline: none;
  border-color: #4fa3f7;
  box-shadow: 0 0 0 3px rgba(79, 163, 247, 0.25);
  background: rgba(15, 23, 42, 0.9);
}

.submit-btn {
  position: absolute;
  right: 25px;
  bottom: 25px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: 15px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  background: #4b5563;
}

/* 底部控制面板 */
.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin-top: 15px;
  border-top: 1px solid rgba(80, 100, 180, 0.2);
}

.status-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #10b981;
}

.status-indicator.connecting {
  background: #f59e0b;
  animation: pulse 1.5s infinite;
}

.status-indicator.error {
  background: #ef4444;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.action-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(120, 140, 240, 0.3);
  background: rgba(25, 35, 70, 0.5);
  color: #c7d2fe;
  transition: all 0.2s;
}

.download-btn:hover {
  background: rgba(16, 185, 129, 0.15);
  color: #6ee7b7;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
}
.deepseek-container {
  height: 100vh; /* 确保全屏高度 */
  overflow: hidden; /* 防止滚动问题 */
}

.messages-container {
  flex: 1;
  overflow-y: auto; /* 添加滚动条 */
}
.message-content :deep(h1),
.message-content :deep(h2),
.message-content :deep(h3),
.message-content :deep(h4) {
  color: #e6e9ff;
  margin-top: 1.5em;
  margin-bottom: 0.8em;
  font-weight: 600;
  position: relative;
}

.message-content :deep(h1) {
  font-size: 1.8em;
  padding-bottom: 0.3em;
  border-bottom: 2px solid rgba(79, 163, 247, 0.5);
}

.message-content :deep(h2) {
  font-size: 1.6em;
  padding-bottom: 0.2em;
  border-bottom: 1px solid rgba(79, 163, 247, 0.3);
}

.message-content :deep(h3) {
  font-size: 1.4em;
}

.message-content :deep(p) {
  margin: 1.2em 0;
  line-height: 1.7;
}

.message-content :deep(ul),
.message-content :deep(ol) {
  padding-left: 2em;
  margin: 1em 0;
}

.message-content :deep(li) {
  margin: 0.6em 0;
  line-height: 1.6;
}

.message-content :deep(ul) li::marker {
  content: "•";
  color: #4fa3f7;
}

.message-content :deep(blockquote) {
  border-left: 4px solid #4fa3f7;
  background-color: rgba(79, 163, 247, 0.1);
  padding: 0.8em 1.2em;
  margin: 1.2em 0;
  color: #b3c9e8;
  border-radius: 0 8px 8px 0;
}

.message-content :deep(strong) {
  color: #8cb4ff;
  font-weight: 600;
}

.message-content :deep(em) {
  color: #b3c9e8;
  font-style: italic;
}

.message-content :deep(del) {
  text-decoration: line-through;
  color: #a0aec0;
}

/* 代码块样式 */
.message-content :deep(pre) {
  background-color: rgba(15, 23, 42, 0.9) !important;
  border: 1px solid rgba(79, 163, 247, 0.3);
  border-radius: 8px;
  padding: 1.2em;
  overflow-x: auto;
  margin: 1.5em 0;
  position: relative;
}

.message-content :deep(pre)::before {
  content: attr(data-lang);
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(79, 163, 247, 0.3);
  color: #e6e9ff;
  padding: 0.2em 0.6em;
  font-size: 0.8em;
  border-radius: 0 0 0 8px;
}

.message-content :deep(code):not(pre code) {
  background-color: rgba(30, 41, 59, 0.7);
  border-radius: 4px;
  padding: 0.2em 0.4em;
  font-family: 'Consolas', Monaco, monospace;
  font-size: 0.9em;
}

/* 行内代码样式 */
.message-content :deep(code) {
  font-family: 'Consolas', Monaco, monospace;
  font-size: 0.95em;
}

/* 表格样式 */
.message-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
  background-color: rgba(15, 23, 42, 0.3);
  border-radius: 8px;
  overflow: hidden;
}

.message-content :deep(th),
.message-content :deep(td) {
  padding: 0.8em 1em;
  text-align: left;
  border: 1px solid rgba(90, 120, 230, 0.2);
}

.message-content :deep(th) {
  background-color: rgba(30, 58, 138, 0.3);
  color: #8cb4ff;
  font-weight: 600;
}
</style>