<template>
  <div class="deepseek-container">
    <!-- 顶部标题栏 -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">VulMind报告生成系统</h1>
      </div>
    </header>

    <!-- 配置面板 (已包含模板选择和扫描记录选择) -->
    <div class="template-config-panel" v-if="reportTemplates.length > 0 || loadingTemplates || scansAvailable">
      <!-- 模板选择器 -->
      <div class="select-row">
        <div class="select-label">报告模板：</div>
        <div v-if="loadingTemplates" class="loading-templates">
          <i class="fas fa-spinner fa-spin"></i> 加载模板中...
        </div>
        <select v-else v-model="selectedReportTemplateId" class="select-input">
          <option v-for="tpl in reportTemplates" :key="tpl.id" :value="tpl.id">
            {{ tpl.name }}
          </option>
        </select>
      </div>

      <!-- 扫描记录选择器 -->
      <div class="select-row">
        <div class="select-label">扫描记录：</div>
        <div v-if="loadingScans" class="loading-templates">
          <i class="fas fa-spinner fa-spin"></i> 加载扫描记录中...
        </div>
        <select v-else v-model="selectedScanId" class="select-input" @change="handleScanSelection">
          <option v-for="scan in scanHistory" :key="scan.id" :value="scan.id">
            {{ formatScanOption(scan) }}
          </option>
        </select>
      </div>

      <div class="generate-report-btn-container">
        <button
          class="generate-report-btn"
          @click="generateReport"
          :disabled="!selectedReportTemplateId || !selectedScanId"
        >
          <i class="fas fa-file-alt"></i>
          <span class="btn-text">生成报告</span>
          <i class="fas fa-magic btn-icon-magic"></i>
        </button>

        <button
          class="generate-report-btn save-report-btn"
          @click="saveReport"
          :disabled="!hasGeneratedReport"
        >
          <i class="fas fa-download"></i>
          <span class="btn-text">保存报告</span>
          <i class="fas fa-cloud-download-alt btn-icon-magic"></i>
        </button>

      </div>

    </div>


    <!-- 主聊天区 - 居中显示AI消息 -->
    <div class="chat-panel">
      <div class="messages-container">
        <!-- 只显示 AI 消息 - 移除标题栏并居中 -->
        <div
          v-for="(msg, index) in aiMessages"
          :key="index"
          class="message ai-message-center"
        >
          <div class="message-content" v-html="renderMarkdown(msg.content)"></div>
        </div>

        <!-- 居中显示思考中状态 -->
        <div v-if="isTyping" class="typing-container-center">
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

    </div>

    <!-- 底部状态与控制区 -->
    <div class="control-panel">
      <div class="status-container">
        <div :class="['status-indicator',
            apiStatus === 'connecting' ? 'connecting' :
            apiStatus === 'error' ? 'error' : '']"></div>
        <span>{{ statusText }}</span>
      </div>


    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed, onMounted } from 'vue'
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const aiMessages = computed(() => {
  return messages.value.filter(msg => msg.role === 'assistant');
});

const hasGeneratedReport = computed(() => {
  return aiMessages.value.length > 0;
});

// 新增: 模板选择相关变量
const reportTemplates = ref([]);
const loadingTemplates = ref(false);
const selectedReportTemplateId = ref(null);

// 扫描记录相关变量
const scanHistory = ref([]);
const loadingScans = ref(false);
const scansAvailable = ref(false);
const selectedScanId = ref(null);
const selectedScan = ref(null);

const isGenerating = ref(false);
const loadReportTemplates = async () => {
  try {
    loadingTemplates.value = true;

    // 使用 Vite 的 glob 导入功能从 scan-template 目录加载模板
    const modules = import.meta.glob('/src/scan-template/*.json', { eager: true });

    // 提取模板数据 - 包含id, name和preview字段
    const templates = Object.values(modules)
      .map((module) => {
        const { id, name, preview } = module.default || {};
        return { id, name, preview };
      })
      .filter(tpl => tpl.id && tpl.name && tpl.preview);  // 确保有preview字段

    // 按创建日期排序，最新的在前
    templates.sort((a, b) => b.id.localeCompare(a.id));

    reportTemplates.value = templates;

    // 设置默认选中第一个模板
    if (templates.length > 0) {
      selectedReportTemplateId.value = templates[0].id;
    }

  } catch (e) {
    console.error('加载报告模板失败:', e);
  } finally {
    loadingTemplates.value = false;
  }
};

const loadScanHistory = async () => {
  try {
    loadingScans.value = true;

    // 从API获取扫描记录
    const response = await fetch('http://127.0.0.1:9000/tasks');

    if (!response.ok) {
      throw new Error(`HTTP错误! 状态码: ${response.status}`);
    }

    const data = await response.json();
    scanHistory.value = data.tasks || [];
    scansAvailable.value = scanHistory.value.length > 0;

    // 设置默认选中第一条记录
    if (scanHistory.value.length > 0) {
      selectedScanId.value = scanHistory.value[0].id;
      handleScanSelection();
    }
  } catch (e) {
    console.error('加载扫描记录失败:', e);
    scansAvailable.value = false;
  } finally {
    loadingScans.value = false;
  }
};

const formatScanOption = (scan) => {
  const scanTypeLabels = {
    'scan --deep': '深度扫描',
    'scan --fast': '快速扫描',
    'scan --full': '全面扫描',
    'scan --auth': '认证扫描',
    'scan': '基础扫描'
  };

  const scanType = scanTypeLabels[scan.command] || '未知扫描';
  return `${scan.name} (${scanType})`;
};

const handleScanSelection = () => {
  // 查找选中的扫描记录
  selectedScan.value = scanHistory.value.find(
    scan => scan.id === selectedScanId.value
  ) || null;
};

const generateReport = async () => {
  if (!selectedReportTemplateId.value || !selectedScanId.value) {
    alert('请选择模板和扫描记录');
    return;
  }

  // 设置生成状态
  isGenerating.value = true;

  try {
    // 查找选中的模板
    const selectedTemplate = reportTemplates.value.find(
      t => t.id === selectedReportTemplateId.value
    );

    if (!selectedTemplate) {
      alert('选择的模板不存在');
      return;
    }

    // 检查preview字段是否存在
    if (!selectedTemplate.preview) {
      alert('模板缺少预览内容');
      return;
    }

    // 构建prompt - 直接使用preview字段
    const prompt = `我将向你提供一段报告模板和扫描数据，请严格按以下要求生成报告：
  1. 生成一个完整的 Markdown 格式报告
  2. 直接返回 Markdown 内容，不要添加任何额外的说明或代码块标识符
  3. 确保内容使用标准的 Markdown 语法，不使用三重反引号包裹任何内容
  4. 不要包含 HTML 标签，使用纯 Markdown 语法

  报告模板内容如下：
  ${selectedTemplate.preview}

  扫描结果数据如下：
  ${JSON.stringify(selectedScan.value, null, 2)}
  `;

    messages.value.push({ role: 'user', content: prompt });

    // 调用API生成报告
    isLoading.value = true;
    isTyping.value = true;
    apiStatus.value = 'connecting';

    try {
      // 调用DeepSeek API
      const response = await callDeepSeekAPI(prompt);

      // 添加AI响应
      messages.value.push({ role: 'assistant', content: response });
      apiStatus.value = 'connected';
    } catch (error) {
      console.error('API请求错误:', error);
      messages.value.push({
        role: 'assistant',
        content: `抱歉，生成报告时出错: ${error.message}`
      });
      apiStatus.value = 'error';
    } finally {
      isLoading.value = false;
      isTyping.value = false;
    }

  } catch (e) {
    console.error('生成报告出错:', e);
    alert('生成报告时发生错误');
  } finally {
    isGenerating.value = false;
  }
};
//保存报告功能
const saveReport = () => {
  if (!hasGeneratedReport.value) {
    alert('请先生成报告');
    return;
  }

  if (!selectedScan.value || !selectedScan.value.name) {
    alert('未选择扫描记录，无法确定文件名');
    return;
  }

  // 获取最新生成的报告内容
  const reportContent = aiMessages.value[aiMessages.value.length - 1].content;

  // 创建文件内容
  const blob = new Blob([reportContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);

  // 创建下载链接
  const link = document.createElement('a');
  link.href = url;

  // 改进的文件名生成方式
  let fileName = selectedScan.value.name.trim();

  // 清理文件名 - 保留中文、字母、数字、空格和连接符
  fileName = fileName.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s_\-()[\]]/g, ' ')
    .replace(/\s+/g, ' ')      // 多个空格替换为一个
    .trim();                  // 清除首尾空格

  // 如果清理后文件名为空，使用默认文件名
  if (!fileName) {
    const date = new Date();
    const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    fileName = `安全报告_${dateStr}`;
  }

  // 确保以.md结尾
  if (!fileName.endsWith('.md')) {
    fileName += '.md';
  }

  link.download = fileName;

  // 触发下载
  document.body.appendChild(link);
  link.click();

  // 清理
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};


onMounted(() => {
  loadReportTemplates();
  loadScanHistory();
});

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
const messages = ref([]);
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




// DeepSeek API调用
const callDeepSeekAPI = async (inputText) => {
  const apiUrl = 'https://api.deepseek.com/v1/chat/completions';
  const apiKey = 'sk-cc8300aca20d492f8d4726bf1510bb84';

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

.template-config-panel {
  background: rgba(15, 23, 42, 0.7);
  border-radius: 8px;
  margin: 0 20px 20px;
  border: 1px solid rgba(80, 100, 180, 0.2);
  padding: 15px;
}

.select-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.select-label {
  color: #c7d2fe;
  font-size: 14px;
  white-space: nowrap;
}

.select-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(90, 120, 220, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  color: #e6e9ff;
  font-size: 14px;
  transition: all 0.3s ease;
}

.select-input:focus {
  outline: none;
  border-color: #4fa3f7;
  box-shadow: 0 0 0 3px rgba(79, 163, 247, 0.25);
}

.loading-templates {
  color: #94a3b8;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
}
.generate-report-btn-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.generate-report-btn {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 30px;
  padding: 15px 35px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
  position: relative;
  overflow: hidden;
}

.generate-report-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
}

.generate-report-btn:hover::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shine 1.5s infinite;
}

.generate-report-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
}

.generate-report-btn:disabled {
  background: linear-gradient(135deg, #94a3b8, #cbd5e1);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.generate-report-btn:disabled:hover::after {
  content: none;
  animation: none;
}

.btn-text {
  position: relative;
  z-index: 2;
}

.btn-icon-magic {
  position: relative;
  z-index: 2;
  animation: pulse 2s infinite;
}

@keyframes shine {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* 原有其他样式保持不变 */
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
  align-items: center; /* 消息居中 */
}

.message {
  padding: 18px;
  border-radius: 14px;
  width: 90%;
  max-width: 800px; /* 限制最大宽度 */
  animation: messageAppear 0.4s ease;
  background: linear-gradient(135deg, #1a2448, #121b3a);
  border: 1px solid rgba(80, 110, 200, 0.2);
}

@keyframes messageAppear {
  0% { opacity: 0; transform: translateY(15px); }
  100% { opacity: 1; transform: translateY(0); }
}

.message-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  justify-content: center; /* 消息头居中 */
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
}

.message-content {
  font-size: 16px;
  line-height: 1.6;
  text-align: left; /* 内容左对齐 */
}

.typing-container {
  align-self: center; /* 居中 */
  padding: 15px 20px;
  background: rgba(21, 31, 58, 0.6);
  border-radius: 14px;
  border: 1px solid rgba(90, 120, 220, 0.2);
  max-width: 800px; /* 与消息宽度一致 */
  width: 90%;
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
  text-align: left;
}

.message-content :deep(ul),
.message-content :deep(ol) {
  padding-left: 2em;
  margin: 1em 0;
  text-align: left;
}

.message-content :deep(li) {
  margin: 0.6em 0;
  line-height: 1.6;
  text-align: left;
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
  text-align: left;
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
  text-align: left;
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
  text-align: left;
}

/* 行内代码样式 */
.message-content :deep(code) {
  font-family: 'Consolas', Monaco, monospace;
  font-size: 0.95em;
  text-align: left;
}

/* 表格样式 */
.message-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
  background-color: rgba(15, 23, 42, 0.3);
  border-radius: 8px;
  overflow: hidden;
  text-align: left;
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

.template-config-panel {
  background: rgba(15, 23, 42, 0.7);
  border-radius: 8px;
  margin: 0 20px 20px;
  border: 1px solid rgba(80, 100, 180, 0.2);
  padding: 15px;
}

.select-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.select-label {
  color: #c7d2fe;
  font-size: 14px;
  white-space: nowrap;
}

.select-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(90, 120, 220, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  color: #e6e9ff;
  font-size: 14px;
  transition: all 0.3s ease;
}

.select-input:focus {
  outline: none;
  border-color: #4fa3f7;
  box-shadow: 0 0 0 3px rgba(79, 163, 247, 0.25);
}

.loading-templates {
  color: #94a3b8;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
}
.generate-report-btn-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.generate-report-btn {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 30px;
  padding: 15px 35px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
  position: relative;
  overflow: hidden;
}

.generate-report-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
}

.generate-report-btn:hover::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 200%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shine 1.5s infinite;
}

.generate-report-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
}

.generate-report-btn:disabled {
  background: linear-gradient(135deg, #94a3b8, #cbd5e1);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.generate-report-btn:disabled:hover::after {
  content: none;
  animation: none;
}

.btn-text {
  position: relative;
  z-index: 2;
}

.btn-icon-magic {
  position: relative;
  z-index: 2;
  animation: pulse 2s infinite;
}

@keyframes shine {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
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
  height: 100vh;
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

/* 主聊天区 - 居中布局 */
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
  align-items: center; /* 确保内容居中 */
  gap: 20px;
}

/* 居中显示的AI消息 - 移除标题栏 */
.ai-message-center {
  padding: 18px;
  border-radius: 14px;
  max-width: 90%;
  animation: messageAppear 0.4s ease;
  align-self: center; /* 居中显示 */
  background: linear-gradient(135deg, #1a2448, #121b3a);
  border: 1px solid rgba(80, 110, 200, 0.2);
  width: 90%; /* 统一宽度 */
  max-width: 900px; /* 最大宽度限制 */
}

@keyframes messageAppear {
  0% { opacity: 0; transform: translateY(15px); }
  100% { opacity: 1; transform: translateY(0); }
}

.message-content {
  font-size: 16px;
  line-height: 1.6;
}

/* 居中显示的思考中状态 */
.typing-container-center {
  align-self: center; /* 居中显示 */
  padding: 15px 20px;
  background: rgba(21, 31, 58, 0.6);
  border-radius: 14px;
  border: 1px solid rgba(90, 120, 220, 0.2);
  width: 90%; /* 与消息宽度保持一致 */
  max-width: 900px; /* 最大宽度限制 */
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

/* 模板配置面板 */
.template-config-panel {
  background: rgba(15, 23, 42, 0.7);
  border-radius: 8px;
  margin: 0 20px 20px;
  border: 1px solid rgba(80, 100, 180, 0.2);
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.select-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.select-label {
  color: #c7d2fe;
  font-size: 16px;
  min-width: 100px;
}

.select-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(90, 120, 220, 0.3);
  border-radius: 8px;
  padding: 10px 15px;
  color: #e6e9ff;
  font-size: 16px;
  transition: all 0.3s ease;
}

.select-input:focus {
  outline: none;
  border-color: #4fa3f7;
  box-shadow: 0 0 0 3px rgba(79, 163, 247, 0.25);
}

.loading-templates {
  color: #94a3b8;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
}

.generate-report-btn-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.generate-report-btn {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 30px;
  padding: 15px 35px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
}

.generate-report-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
}

.generate-report-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
}

.generate-report-btn:disabled {
  background: linear-gradient(135deg, #94a3b8, #cbd5e1);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 底部控制面板 */
.control-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  margin-top: 15px;
  border-top: 1px solid rgba(80, 100, 180, 0.2);
}

.status-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-indicator {
  width: 12px;
  height: 12px;
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

/* Markdown渲染样式 - 居中对齐 */
.message-content :deep(*) {
  text-align: left;
}

.message-content :deep(h1),
.message-content :deep(h2),
.message-content :deep(h3) {
  color: #e6e9ff;
  margin-top: 1.5em;
  margin-bottom: 0.8em;
  font-weight: 600;
  position: relative;
  text-align: left;
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
  text-align: left;
}

.message-content :deep(ul),
.message-content :deep(ol) {
  padding-left: 2em;
  margin: 1em 0;
  text-align: left;
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
  text-align: left;
}

.message-content :deep(strong) {
  color: #8cb4ff;
  font-weight: 600;
}

.message-content :deep(em) {
  color: #b3c9e8;
  font-style: italic;
}

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

.message-content :deep(code) {
  background-color: rgba(30, 41, 59, 0.7);
  border-radius: 4px;
  padding: 0.2em 0.4em;
  font-family: 'Consolas', Monaco, monospace;
}

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

/* 响应式调整 */
@media (max-width: 768px) {
  .app-title {
    font-size: 2.2rem;
  }

  .select-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .select-input {
    width: 100%;
  }

  .ai-message-center {
    width: 95%;
    padding: 15px;
  }
}

</style>