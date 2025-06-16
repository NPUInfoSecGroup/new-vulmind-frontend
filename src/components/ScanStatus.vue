<template>
  <div class="scan-output card">
    <div class="card-header">
      <i class="fas fa-terminal" />
      <h2>扫描命令输出</h2>
      <div class="header-controls">
        <button class="control-btn" @click="clearOutput" title="清空输出">
          <i class="fas fa-trash" />
        </button>
        <button class="control-btn" @click="toggleAutoScroll" :title="autoScroll ? '停止自动滚动' : '启用自动滚动'">
          <i class="fas" :class="autoScroll ? 'fa-pause' : 'fa-play'" />
        </button>
        <button class="control-btn" @click="copyOutput" title="复制输出">
          <i class="fas fa-copy" />
        </button>
      </div>
    </div>

    <div class="card-body">
      <div ref="outputContainer" class="cli-output" @scroll="handleScroll">
        <div class="output-timestamp">命令回显开始 {{ startTime }}</div>
        <div v-for="(line, index) in outputLines" :key="index" class="output-line" :class="line.type">
          <span v-if="line.tool" class="tool-tag">{{ line.tool }}</span>
          <span class="line-content" :class="line.type">{{ line.content }}</span>
          <span v-if="line.type === 'command'" class="command-prompt">$</span>
        </div>
        <div v-if="isLoading" class="loading-indicator">
          <i class="fas fa-spinner fa-spin" /> 扫描进行中...
        </div>
      </div>
    </div>

    <div class="card-footer">
      <div class="status-indicator">
        <div class="status-bubble" :class="statusClass" />
        <div class="status-text">{{ statusText }}</div>
      </div>
      <div class="tool-usage">
        <span v-for="tool in activeTools" :key="tool" class="tool-chip">
          <i class="fas fa-toolbox" /> {{ tool }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScanOutput',
  data() {
    return {
      outputLines: [],
      startTime: new Date().toLocaleTimeString(),
      autoScroll: true,
      isLoading: true,
      status: 'running',
      activeTools: ['SQLMap', 'dirsearch', 'fscan'],
      scrollPosition: 0
    }
  },
  computed: {
    statusText() {
      return this.status === 'ready' ? '就绪，等待扫描开始' : '扫描进行中…'
    },
    statusClass() {
      return this.status === 'ready' ? 'ready' : 'running'
    }
  },
  methods: {
    addOutputLine(type, content, tool) {
      this.outputLines.push({
        type,
        content,
        tool,
        timestamp: new Date().toLocaleTimeString()
      })

      if (this.autoScroll) {
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    },

    addCommand(command) {
      this.addOutputLine('command', command)
    },

    addResponse(response) {
      this.addOutputLine('response', response)
    },

    addSuccess(message) {
      this.addOutputLine('success', message)
    },

    addError(error) {
      this.addOutputLine('error', error)
    },

    addToolOutput(tool, output) {
      this.addOutputLine('tool-output', output, tool)
    },

    scrollToBottom() {
      const container = this.$refs.outputContainer
      container.scrollTop = container.scrollHeight
    },

    clearOutput() {
      this.outputLines = []
      this.startTime = new Date().toLocaleTimeString()
      this.addOutputLine('info', '输出已清空')
    },

    toggleAutoScroll() {
      this.autoScroll = !this.autoScroll
      if (this.autoScroll) this.scrollToBottom()
    },

    copyOutput() {
      const text = this.outputLines.map(line => {
        const prefix = line.tool ? `[${line.tool}] ` : ''
        return prefix + line.content
      }).join('\n')

      navigator.clipboard.writeText(text)
          .then(() => {
            this.addOutputLine('success', '输出已复制到剪贴板')
          })
          .catch(err => {
            this.addOutputLine('error', '复制失败: ' + err.message)
          })
    },

    handleScroll() {
      const container = this.$refs.outputContainer
      const isAtBottom = container.scrollHeight - container.scrollTop === container.clientHeight

      if (isAtBottom) {
        this.autoScroll = true
      } else {
        this.autoScroll = false
      }
    },

    // 模拟扫描输出 - 仅用于演示
    simulateScanOutput() {
      const tools = ['SQLMap', 'dirsearch', 'fscan', 'githack']
      const messages = [
        { type: 'command', text: 'scan --target https://example.com' },
        { type: 'info', text: 'Starting vulnerability scan...' },
        { type: 'tool-output', text: 'Initializing SQLMap v1.6', tool: 'SQLMap' },
        { type: 'tool-output', text: 'Target URL: https://example.com/login.php', tool: 'SQLMap' },
        { type: 'tool-output', text: 'Payload: 1 AND 1=1 UNION ALL SELECT 1,NULL...', tool: 'SQLMap' },
        { type: 'success', text: 'SQLMap: Potential SQL injection detected' },
        { type: 'tool-output', text: 'Launching directory brute-force with dirsearch', tool: 'dirsearch' },
        { type: 'tool-output', text: 'Status 200: /admin', tool: 'dirsearch' },
        { type: 'tool-output', text: 'Status 200: /backup', tool: 'dirsearch' },
        { type: 'tool-output', text: 'Status 403: /wp-admin', tool: 'dirsearch' },
        { type: 'tool-output', text: 'Running network scan with fscan', tool: 'fscan' },
        { type: 'tool-output', text: 'Port 80/tcp open  http', tool: 'fscan' },
        { type: 'tool-output', text: 'Port 443/tcp open  ssl/http', tool: 'fscan' },
        { type: 'tool-output', text: 'Port 8080/tcp open  http-proxy', tool: 'fscan' },
        { type: 'tool-output', text: 'Cloning .git repository with githack', tool: 'githack' },
        { type: 'tool-output', text: 'Found .git directory at https://example.com/.git/', tool: 'githack' },
        { type: 'success', text: 'Scan completed - 3 vulnerabilities found' }
      ]

      let index = 0
      const interval = setInterval(() => {
        if (index >= messages.length) {
          clearInterval(interval)
          this.isLoading = false
          this.status = 'ready'
          this.addOutputLine('success', '所有扫描任务已完成')
          return
        }

        const msg = messages[index]
        switch (msg.type) {
          case 'command':
            this.addCommand(msg.text)
            break
          case 'info':
            this.addOutputLine('info', msg.text)
            break
          case 'success':
            this.addSuccess(msg.text)
            break
          case 'tool-output':
            this.addToolOutput(msg.tool, msg.text)
            break
        }

        index++
      }, 400)
    }
  },
  mounted() {
    this.simulateScanOutput()
  }
}
</script>

<style scoped>
.scan-output {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  border: 1px solid var(--border);
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.card-header {
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid var(--border);
}

.card-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  flex: 1;
}

.header-controls {
  display: flex;
  gap: 10px;
}

.control-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: var(--accent);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.card-body {
  padding: 0;
  flex: 1;
  display: flex;
  background: #0a0e17;
  position: relative;
}

.cli-output {
  flex: 1;
  font-family: 'Fira Code', 'Consolas', 'Courier New', monospace;
  font-size: 14px;
  color: #e0e0e0;
  padding: 20px;
  overflow-y: auto;
  line-height: 1.5;
  overflow-anchor: auto;
}

.output-timestamp {
  color: #6c757d;
  margin-bottom: 15px;
  font-size: 12px;
}

.output-line {
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;
  white-space: pre-wrap;
  word-break: break-all;
}

.output-line.command {
  color: #17a2b8;
  font-weight: 500;
}

.output-line.info {
  color: #adb5bd;
}

.output-line.success {
  color: #28a745;
}

.output-line.error {
  color: #dc3545;
}

.output-line.tool-output {
  color: #e9ecef;
}

.command-prompt {
  position: absolute;
  left: 0;
  top: 0;
  color: #17a2b8;
  font-weight: bold;
}

.tool-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(23, 162, 184, 0.15);
  color: #17a2b8;
  margin-right: 12px;
  font-size: 12px;
  border: 1px solid rgba(23, 162, 184, 0.3);
}

.line-content.command::before {
  content: "$ ";
  color: #17a2b8;
  font-weight: bold;
}

.loading-indicator {
  padding: 10px 0;
  color: #17a2b8;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-footer {
  padding: 15px 20px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-bubble {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--warning);
}
.status-bubble.ready {
  background: var(--success);
}
.status-bubble.running {
  background: var(--accent);
  box-shadow: 0 0 8px rgba(23, 162, 184, 0.8);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}

.status-text {
  font-size: 14px;
}

.tool-usage {
  display: flex;
  gap: 10px;
}

.tool-chip {
  padding: 5px 12px;
  background: rgba(13, 110, 253, 0.15);
  border-radius: 30px;
  font-size: 13px;
  color: #0d6efd;
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid rgba(13, 110, 253, 0.3);
}

/* 滚动条样式 */
.cli-output::-webkit-scrollbar {
  width: 8px;
}

.cli-output::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.cli-output::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

.cli-output::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}
</style>