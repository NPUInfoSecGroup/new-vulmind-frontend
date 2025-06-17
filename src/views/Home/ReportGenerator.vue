<template>
  <div class="report-container-wrapper">
    <div class="report-generator">
      <!-- 头部 -->
      <div class="report-header">
        <i class="fas fa-file-alt" />
        <h2>报告生成</h2>
      </div>

      <div class="report-body">
        <!-- 操作按钮 -->
        <div class="report-actions">
          <button class="action-button generate" @click="goToReportParse">
            <i class="fas fa-sync-alt" />
            <span>生成报告</span>
          </button>
          <button class="action-button save" @click="saveReport">
            <i class="fas fa-save" />
            <span>保存报告</span>
          </button>
          <button class="action-button export" @click="exportReport">
            <i class="fas fa-file-export" />
            <span>导出报告</span>
          </button>
          <button class="action-button share" @click="shareReport">
            <i class="fas fa-share-alt" />
            <span>分享报告</span>
          </button>
        </div>

        <!-- 配置区域 -->
        <div class="config-section">
          <!-- 报告模板选择 -->
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

          <!-- 扫描记录选择 -->
          <div class="select-row">
            <div class="select-label">扫描记录：</div>
            <select v-model="selectedRecordId" class="select-input" @change="handleScanSelection">
              <option v-for="rec in scanHistory" :key="rec.id" :value="rec.id">
                {{ formatTaskDate(rec.startTime) }} - {{ rec.name || rec.id }} ({{ scanTypeLabel(rec.command) }})
              </option>
            </select>
          </div>
        </div>

        <!-- 预览区域 -->
        <div class="report-preview-container">
          <div class="report-header">
            <h3>安全扫描报告</h3>
            <p>漏洞挖掘与验证系统生成</p>
          </div>

          <!-- 元数据 -->
          <div class="report-meta">
            <div class="meta-item">
              <div class="meta-label">报告日期</div>
              <div class="meta-value">{{ currentDate }}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">扫描类型</div>
              <div class="meta-value">{{ scanTypeLabel(currentScan.command) }}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">生成者</div>
              <div class="meta-value">{{ reporterName }}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">版本</div>
              <div class="meta-value">1.0.0</div>
            </div>
          </div>

          <!-- 漏洞统计 -->
          <div class="vulnerability-stats">
            <div class="stat-card critical">
              <div class="stat-value">{{ vulnSummary.critical || 0 }}</div>
              <div class="stat-label">严重漏洞</div>
            </div>
            <div class="stat-card high">
              <div class="stat-value">{{ vulnSummary.high || 0 }}</div>
              <div class="stat-label">高危漏洞</div>
            </div>
            <div class="stat-card medium">
              <div class="stat-value">{{ vulnSummary.medium || 0 }}</div>
              <div class="stat-label">中危漏洞</div>
            </div>
            <div class="stat-card low">
              <div class="stat-value">{{ vulnSummary.low || 0 }}</div>
              <div class="stat-label">低危漏洞</div>
            </div>
          </div>

          <!-- 扫描概要 -->
          <div class="scan-summary">
            <div class="summary-title">扫描概要</div>
            <div class="summary-item">
              <div class="summary-label">扫描目标:</div>
              <div class="summary-value">{{ currentScan.target || '未指定目标' }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">扫描时间:</div>
              <div class="summary-value">{{ formatTaskDate(currentScan.startTime) }}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">扫描状态:</div>
              <div class="summary-value">{{ statusLabel(currentScan.status) }}</div>
            </div>
            <div v-if="criticalVulns.length > 0" class="summary-item">
              <div class="summary-label">严重漏洞详情:</div>
              <div class="summary-value">
                <ul class="critical-vuln-list">
                  <li v-for="(vuln, index) in criticalVulns" :key="index">
                    {{ vuln.vulnType }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import router from '@/router/index.js'

// 扫描历史记录
const scanHistory = ref([])

// 报告模板
const reportTemplates = ref([])
const loadingTemplates = ref(true)
const templateLoadError = ref(false)

// 当前选中的扫描记录ID
const selectedRecordId = ref(null)

// 当前选中的模板ID
const selectedReportTemplateId = ref(null)

// 当前选中的扫描记录
const currentScan = reactive({
  id: '',
  name: '',
  target: '',
  command: '',
  status: '',
  startTime: '',
  results: []
})

// 漏洞摘要统计
const vulnSummary = computed(() => {
  const summary = { critical: 0, high: 0, medium: 0, low: 0 }

  if (!currentScan.results || !Array.isArray(currentScan.results)) {
    return summary
  }

  currentScan.results.forEach(result => {
    const severity = (result.severity || '').toLowerCase()
    switch(severity) {
      case 'critical': summary.critical++; break
      case 'high': summary.high++; break
      case 'medium': summary.medium++; break
      case 'low': summary.low++; break
    }
  })

  return summary
})

// 当前选中的模板
const selectedTemplate = computed(() => {
  return reportTemplates.value.find((t) => t.id === selectedReportTemplateId.value) || null
})

// 加载状态
const loading = ref(true)

// 表单数据
const reporterName = ref('系统管理员')
const currentDate = ref(
  new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
)

// 严重漏洞列表
const criticalVulns = computed(() => {
  if (!currentScan.results || !Array.isArray(currentScan.results)) return []
  return currentScan.results.filter(v =>
    v.severity && v.severity.toLowerCase() === 'critical'
  )
})

// 格式化日期
const formatTaskDate = (dateString) => {
  if (!dateString) return '未知日期'
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dateString
  }
}

// 扫描类型标签
const scanTypeLabel = (command) => {
  if (!command) return '未知类型'
  if (command.includes('--deep')) return '深度扫描'
  if (command.includes('--fast')) return '快速扫描'
  if (command.includes('--full')) return '全面扫描'
  if (command.includes('--auth')) return '认证扫描'
  return '基础扫描'
}

// 状态标签
const statusLabel = (status) => {
  switch (status) {
    case 'completed': return '已完成'
    case 'running': return '进行中'
    case 'failed': return '失败'
    default: return status || '未知状态'
  }
}

// 加载扫描历史数据
const loadScanHistory = async () => {
  try {
    loading.value = true
    const response = await fetch('http://localhost:9000/tasks')

    if (!response.ok) {
      throw new Error(`HTTP错误! 状态码: ${response.status}`)
    }

    const data = await response.json()
    scanHistory.value = data.tasks || []

    // 默认选择第一条记录
    if (scanHistory.value.length > 0) {
      selectedRecordId.value = scanHistory.value[0].id
      handleScanSelection()
    }
  } catch (e) {
    console.error('加载扫描记录失败:', e)
    ElMessage.error('加载扫描记录失败: ' + e.message)
  } finally {
    loading.value = false
  }
}

// 动态加载报告模板
const loadReportTemplates = async () => {
  try {
    loadingTemplates.value = true

    // 使用 Vite 的 glob 导入功能从 scan-template 目录加载模板
    const modules = import.meta.glob('/src/scan-template/*.json', { eager: true })

    // 提取模板数据
    const templates = Object.values(modules)
      .map((module) => module.default)
      .filter(Boolean)

    // 按创建日期排序，最新的在前
    templates.sort((a, b) => new Date(b.created) - new Date(a.created))

    reportTemplates.value = templates

    // 设置默认选中：找到第一个标记为默认的或第一个模板
    const defaultTemplate = templates.find((t) => t.isDefault) || templates[0]
    if (defaultTemplate) {
      selectedReportTemplateId.value = defaultTemplate.id
    }

    templateLoadError.value = false
  } catch (e) {
    console.error('加载报告模板失败:', e)
    ElMessage.error('加载报告模板失败: ' + e.message)
    templateLoadError.value = true
  } finally {
    loadingTemplates.value = false
  }
}

// 处理扫描记录选择
const handleScanSelection = () => {
  if (!selectedRecordId.value) return

  const record = scanHistory.value.find((r) => r.id === selectedRecordId.value)
  if (!record) {
    ElMessage.error('扫描记录不存在')
    return
  }

  // 更新当前扫描记录数据
  Object.assign(currentScan, record)
}

// 组件挂载时加载数据
onMounted(() => {
  loadScanHistory()
  loadReportTemplates()
})

// 报告生成方法
const goToReportParse = () => {
  // 直接跳转到/report-parse页面
  window.location.href = '/new-vulmind-frontend/report-parse';
}

// 其他操作方法
const saveReport = () => ElMessage.success('报告已保存')
const exportReport = () => ElMessage.success('报告已导出')
const shareReport = () => ElMessage.success('报告已分享')
</script>

<style scoped>
/* 基础变量 */
:root {
  --primary: #4361ee;
  --secondary: #3f37c9;
  --dark: #0f2027;
  --darker: #0a1721;
  --light: #f8f9fa;
  --light-gray: #a0aec0;
  --success: #2ecc71;
  --danger: #e74c3c;
  --card-bg: rgba(30, 41, 59, 0.85);
  --border: rgba(255, 255, 255, 0.1);
  --shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --transition: all 0.3s ease;
}

/* 新增的容器包裹整个report-generator */
.report-container-wrapper {
  width: 100%; /* 比外部框稍窄一点 */
  max-width: 1800px; /* 最大宽度限制 */
  margin: 0 auto; /* 居中显示 */
}

/* 整体容器 - 宽度调整为100% */
.report-generator {
  width: 100%; /* 拉伸到整个宽度 */
  background: linear-gradient(135deg, var(--darker) 0%, var(--dark) 100%);
  color: var(--text-primary);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
}

.report-header {
  padding: 1.2rem 1.5rem;
  background: rgba(15, 23, 42, 0.8);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 12px;
}

.rereport-header h2 {
  font-size: 1.6rem;
  font-weight: 600;
  color: #f1f5f9;
}

.report-header i {
  font-size: 1.8rem;
  color: #60a5fa;
}

.report-body {
  padding: 1.5rem;
}

/* 操作按钮 */
.report-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 18px;
  margin-bottom: 26px;
}

.action-button {
  min-width: 140px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.action-button.generate {
  background: linear-gradient(135deg, #4299e1, #2b6cb0);
}

.action-button.save {
  background: linear-gradient(135deg, #48bb78, #2f855a);
}

.action-button.export {
  background: linear-gradient(135deg, #63b3ed, #3182ce);
}

.action-button.share {
  background: linear-gradient(135deg, #9f7aea, #6b46c1);
}

.action-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

/* 配置区域 */
.config-section {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 10px;
  padding: 1.2rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(100, 116, 139, 0.2);
}

.select-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.select-label {
  white-space: nowrap;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.select-input {
  flex: 1;
  padding: 10px 15px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text-primary);
  font-size: 1rem;
  transition: var(--transition);
}

.select-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.25);
}

/* 报告预览区域 */
.report-preview-container {
  width: 100%; /* 100%宽度 */
  max-width: 100%; /* 不限制最大宽度 */
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid var(--border);
  padding: 1.5rem;
  color: var(--text-primary);
  overflow: hidden;
}

.report-preview-container .report-header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border);
  background: transparent;
  border: none;
  padding: 0;
  justify-content: center;
}

.report-preview-container .report-header h3 {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: var(--text-primary);
}

.report-preview-container .report-header p {
  color: var(--text-secondary);
  font-size: 1rem;
}

/* 元数据区域 */
.report-meta {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.meta-item {
  background: rgba(0, 0, 0, 0.15);
  padding: 12px;
  border-radius: 8px;
}

.meta-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 5px;
}

.meta-value {
  font-weight: 500;
}

/* 漏洞统计卡片样式 */
.vulnerability-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 25px;
}

.stat-card {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 10px 0;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.stat-card.critical .stat-value {
  color: var(--danger);
}

.stat-card.high .stat-value {
  color: #ff9800;
}

.stat-card.medium .stat-value {
  color: #ffeb3b;
}

.stat-card.low .stat-value {
  color: var(--success);
}

/* 扫描概要区域 */
.scan-summary {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.summary-title {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: var(--text-primary);
}

.summary-item {
  display: flex;
  margin-bottom: 8px;
}

.summary-label {
  width: 120px;
  color: var(--text-secondary);
}

.summary-value {
  flex: 1;
}

/* 严重漏洞列表样式 */
.critical-vuln-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.critical-vuln-list li {
  padding: 5px 10px;
  margin: 5px 0;
  background: rgba(239, 68, 68, 0.15);
  border-radius: 4px;
  color: #f87171;
}

/* 加载中状态 */
.loading-templates {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.5);
  color: var(--text-secondary);
  font-size: 0.95rem;
  width: 100%;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .report-meta {
    grid-template-columns: repeat(2, 1fr);
  }

  .vulnerability-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .report-meta {
    grid-template-columns: 1fr;
  }

  .vulnerability-stats {
    grid-template-columns: 1fr;
  }

  .report-actions {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
  }

  .select-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .select-input {
    width: 100%;
  }

  .summary-label {
    width: 100px;
  }
}
</style>