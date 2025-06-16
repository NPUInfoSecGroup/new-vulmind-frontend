<template>
  <div class="scan-target card">
    <div class="card-header">
      <i class="fas fa-bullseye" />
      <h2>扫描目标配置</h2>
    </div>

    <div class="card-body">
      <!-- 目标配置 -->
      <div class="section">
        <div class="section-title">
          <i class="fas fa-globe-americas" />
          <span>目标配置</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="url">目标 URL：</label>
          <input id="url" v-model="targetUrl" type="text" placeholder="https://example.com" class="form-input" />
        </div>

        <div class="form-group">
          <label class="form-label" for="ipRange">IP 范围：</label>
          <input id="ipRange" v-model="ipRange" type="text" placeholder="192.168.1.1-192.168.1.255" class="form-input" />
        </div>
      </div>

      <!-- 扫描工具选择 -->
      <div class="section">
        <div class="section-title">
          <i class="fas fa-tools" />
          <span>扫描工具配置</span>
        </div>

        <div class="form-group">
          <label class="form-label">选择工具：</label>
          <div class="tools-grid">
            <div v-for="(tool, index) in availableTools" :key="index" class="tool-option">
              <input
                  type="checkbox"
                  :id="'tool-' + index"
                  :value="tool"
                  v-model="selectedTools"
                  class="tool-checkbox"
              >
              <label :for="'tool-' + index">{{ tool }}</label>
            </div>
          </div>
        </div>
      </div>

      <!-- 扫描建议 -->
      <div class="section">
        <div class="section-title">
          <i class="fas fa-comment-alt" />
          <span>扫描建议</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="suggestions">额外参数或建议：</label>
          <textarea
              id="suggestions"
              v-model="suggestions"
              placeholder="请输入特定的扫描要求或建议..."
              class="form-textarea"
          ></textarea>
        </div>
      </div>

      <!-- 操作按钮 - 统一按钮样式 -->
      <div class="actions">
        <button class="action-btn primary" @click="startScan">
          <i class="fas fa-play" />
          启动扫描
        </button>
        <button class="action-btn secondary" @click="resetForm">
          <i class="fas fa-redo" />
          重置
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScanTarget',
  data () {
    return {
      targetUrl: '',
      ipRange: '',
      availableTools: [
        'fenjing', 'fscan', 'dirsearch', 'curl',
        'githack', 'ds_store_exp', 'gotoscan', 'SQLMap', 'xss'
      ],
      selectedTools: [],
      suggestions: ''
    }
  },
  methods: {
    startScan() {
      // 表单验证逻辑
      if (!this.targetUrl && !this.ipRange) {
        alert('请至少输入一个目标URL或IP范围');
        return;
      }

      if (this.selectedTools.length === 0) {
        alert('请至少选择一个扫描工具');
        return;
      }

      console.log('开始扫描配置：', {
        targetUrl: this.targetUrl,
        ipRange: this.ipRange,
        tools: this.selectedTools,
        suggestions: this.suggestions
      });

      // 实际扫描逻辑
      alert(`扫描已启动！使用工具：${this.selectedTools.join(', ')}`);

      // TODO: 调用API启动扫描
      // this.$store.dispatch('startScan', {
      //   targetUrl: this.targetUrl,
      //   ipRange: this.ipRange,
      //   tools: this.selectedTools,
      //   suggestions: this.suggestions
      // });
    },
    resetForm() {
      this.targetUrl = '';
      this.ipRange = '';
      this.selectedTools = [];
      this.suggestions = '';
    }
  }
}
</script>

<style scoped>
.scan-target {
  width: 100%;
  height: 100%;
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
  padding: 18px 25px;
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
}

.card-body {
  padding: 25px;
}

.section {
  margin-bottom: 28px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 18px;
}

.form-label {
  display: block;
  margin-bottom: 10px;
  color: var(--text-primary);
  font-weight: 500;
}

.form-input,
.form-select {
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--text-primary);
}

.form-textarea {
  width: 100%;
  min-height: 80px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--text-primary);
  resize: vertical;
  font-family: inherit;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.tool-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.tool-option:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.tool-checkbox {
  margin: 0;
}

.actions {
  display: flex;
  gap: 16px;
  margin-top: 30px;
}

.action-btn {
  flex: 1;
  padding: 14px 0;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 2px solid transparent;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  filter: brightness(1.1);
}

.primary {
  background: linear-gradient(135deg, #47a8ff, #1a73e8);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.secondary {
  background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
  color: #333;
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.primary:hover {
  background: linear-gradient(135deg, #5cb3ff, #2a85ff);
  box-shadow: 0 8px 16px rgba(27, 117, 232, 0.3);
}

.secondary:hover {
  background: linear-gradient(135deg, #f5f5f5, #e9e9e9);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}
</style>