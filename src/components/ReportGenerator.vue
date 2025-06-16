<template>
  <div class="report-generator card">
    <!-- 头部 -->
    <div class="card-header">
      <i class="fas fa-file-alt" />
      <h2>报告生成</h2>
    </div>

    <div class="card-body">
      <!-- 操作按钮 -->
      <div class="report-actions">
        <button class="action-button generate" @click="generateReport">
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

      <!-- 报告模板选择 -->
      <div class="select-row">
        <div class="select-label">报告模板：</div>
        <select v-model="selectedReportTemplate" class="select-input">
          <option v-for="tpl in reportTemplates" :key="tpl.id" :value="tpl.value">
            {{ tpl.name }}
          </option>
        </select>
      </div>

      <!-- 扫描记录选择 -->
      <div class="select-row">
        <div class="select-label">扫描记录：</div>
        <select v-model="selectedRecordId" class="select-input">
          <option v-for="rec in scanHistory" :key="rec.id" :value="rec.id">
            {{ rec.date }} - {{ rec.id }}
          </option>
        </select>
      </div>

      <!-- 预览区域 -->
      <div class="report-preview">
        <div class="report-header">
          <h3>安全扫描报告</h3>
          <p>漏洞挖掘与验证系统生成</p>
        </div>

        <!-- 元数据 -->
        <div class="report-metadata">
          <div class="metadata-column">
            <p><strong>报告日期:</strong> {{ currentDate }}</p>
            <p><strong>扫描类型:</strong> {{ scanType }}</p>
          </div>
          <div class="metadata-column">
            <p><strong>生成者:</strong> {{ reporterName }}</p>
            <p><strong>版本:</strong> 1.0.0</p>
          </div>
        </div>

        <!-- 漏洞统计 -->
        <div class="vulnerability-stats">
          <div class="stat-card critical">
            <div class="stat-title">严重漏洞</div>
            <div class="stat-value">{{ generatedReport.vulnCount.critical }}</div>
          </div>
          <div class="stat-card high">
            <div class="stat-title">高危漏洞</div>
            <div class="stat-value">{{ generatedReport.vulnCount.high }}</div>
          </div>
          <!-- 新增中危漏洞统计 -->
          <div class="stat-card medium">
            <div class="stat-title">中危漏洞</div>
            <div class="stat-value">{{ generatedReport.vulnCount.medium }}</div>
          </div>
          <!-- 新增低危漏洞统计 -->
          <div class="stat-card low">
            <div class="stat-title">低危漏洞</div>
            <div class="stat-value">{{ generatedReport.vulnCount.low }}</div>
          </div>
        </div>

        <!-- 扫描概要 -->
        <div class="report-section">
          <h4>扫描概要</h4>
          <div class="summary-detail">
            <p><strong>扫描目标:</strong> {{ generatedReport.scanTargets }}</p>
            <p><strong>扫描时间:</strong> {{ generatedReport.scanDuration }} 秒</p>
            <p><strong>扫描工具:</strong> {{ generatedReport.scanTools }}</p>
            <p><strong>严重漏洞详情:</strong> {{ generatedReport.criticalVulnsDescription }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref, onMounted, watch } from 'vue' // 添加watch
import { ElMessage } from 'element-plus'

export default {
  name: 'ReportGenerator',
  props: {
    reportTemplates: {
      type: Array,
      default: () => [
        { id: 'std', value: 'standard', name: '标准模板' },
        { id: 'pro', value: 'professional', name: '专业模板' }
      ]
    }
  },
  setup() {
    /* --- 扫描记录加载 --- */
    const scanHistory = ref([])
    const loadScanHistory = () => {
      try {
        const ctx = require.context('@/scan-details', false, /^\.\/scan-\d{10}\.json$/)
        scanHistory.value = ctx.keys().map(k => ctx(k)).sort((a, b) => b.id.localeCompare(a.id))

        // 默认选择第一条记录
        if (scanHistory.value.length > 0) {
          selectedRecordId.value = scanHistory.value[0].id
        }
      } catch (e) {
        console.error(e)
        ElMessage.error('加载扫描记录失败')
      }
    }
    onMounted(loadScanHistory)

    /* --- 表单数据 --- */
    const selectedReportTemplate = ref('standard')
    const selectedRecordId = ref(null)
    const reporterName = ref('系统管理员')
    const currentDate = ref(new Date().toLocaleDateString())

    /* --- 报告数据存储 --- */
    const generatedReport = reactive({
      scanType: '',
      scanTargets: '',
      scanTools: '',
      vulnCount: { critical: 0, high: 0, medium: 0, low: 0 },
      scanDuration: 0,
      criticalVulnsDescription: '请选择扫描记录'
    })

    /* --- 添加监听器：当选择扫描记录时自动更新报告 --- */
    watch(selectedRecordId, (newRecordId) => {
      if (!newRecordId) {
        // 重置报告数据
        Object.assign(generatedReport, {
          scanType: '',
          scanTargets: '',
          scanTools: '',
          vulnCount: { critical: 0, high: 0, medium: 0, low: 0 },
          scanDuration: 0,
          criticalVulnsDescription: '请选择扫描记录'
        })
        return
      }

      const record = scanHistory.value.find(r => r.id === newRecordId)
      if (!record) {
        ElMessage.error('扫描记录不存在')
        return
      }

      // 使用vulnSummary直接获取漏洞统计（如果存在）
      if (record.vulnSummary) {
        generatedReport.vulnCount = { ...record.vulnSummary }
      } else {
        // 回退逻辑：如果没有vulnSummary，则手动计算
        const counts = { critical: 0, high: 0, medium: 0, low: 0 }
        record.vulnerabilities?.forEach(v => {
          if (v.severity) counts[v.severity]++
        })
        generatedReport.vulnCount = counts
      }

      // 计算扫描类型
      generatedReport.scanType = record.targets?.length ? 'Web扫描' : record.scanDepth ? '二进制扫描' : '未指定'

      // 计算严重漏洞描述
      const criticalVulns = record.vulnerabilities?.filter(v => v.severity === 'critical').map(v => v.name) || []
      generatedReport.criticalVulnsDescription = criticalVulns.length ?
          criticalVulns.join('、') : '未发现严重漏洞'

      // 其他报告数据
      generatedReport.scanTargets = record.targets?.join(', ') || '未指定扫描目标'
      generatedReport.scanTools = record.selectedPlugins?.join(', ') || '未指定扫描工具'
      generatedReport.scanDuration = record.duration || 0
    })

    /* --- 报告生成方法 --- */
    const generateReport = () => {
      if (!selectedRecordId.value) {
        ElMessage.warning('请选择扫描记录')
        return
      }

      // 这里不需要重新生成数据，因为watch已经更新了
      ElMessage.success(`"${selectedReportTemplate.value}"报告生成完成`)
    }

    /* --- 其他操作保持不变 --- */
    const saveReport = () => {
      if (generatedReport.scanType) {
        ElMessage.success('报告已保存')
      } else {
        ElMessage.warning('请先生成报告')
      }
    }

    const exportReport = () => {
      if (generatedReport.scanType) {
        ElMessage.success('报告已导出')
      } else {
        ElMessage.warning('请先生成报告')
      }
    }

    const shareReport = () => {
      if (generatedReport.scanType) {
        ElMessage.success('报告已分享')
      } else {
        ElMessage.warning('请先生成报告')
      }
    }

    return {
      scanHistory,
      selectedReportTemplate,
      selectedRecordId,
      reporterName,
      currentDate,
      generatedReport,
      generateReport,
      saveReport,
      exportReport,
      shareReport
    }
  }
}
</script>

<style scoped>
/* 仅与按钮 / 选择行相关核心样式，其他保持现有样式 */
.report-actions{display:flex;justify-content:center;flex-wrap:wrap;gap:18px;margin-bottom:26px}
.action-button{min-width:140px;padding:12px 16px;border:none;border-radius:8px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:.9rem;font-weight:600;color:var(--text-primary);cursor:pointer;transition:var(--transition)}
.action-button.generate{background:linear-gradient(135deg,#4299e1,#2b6cb0)}
.action-button.save{background:linear-gradient(135deg,#48bb78,#2f855a)}
.action-button.export{background:linear-gradient(135deg,#63b3ed,#3182ce)}
.action-button.share{background:linear-gradient(135deg,#9f7aea,#6b46c1)}
.action-button:hover{transform:translateY(-3px);box-shadow:0 6px 12px rgba(0,0,0,.3)}

.select-row{display:flex;align-items:center;gap:14px;margin-bottom:24px}
.select-input{flex:1;padding:10px 15px;border-radius:8px;background:rgba(255,255,255,.08);border:1px solid var(--border);color:var(--text-primary)}
.select-label{white-space:nowrap;font-size:.95rem}
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

.select-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}
.select-input {
  flex: 1;
  padding: 10px 15px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border);
  color: var(--text-primary);
}

/* 漏洞统计卡片样式 */
.vulnerability-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin: 25px 0;
}

.stat-card {
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  /* 添加文本颜色为白色 */
  color: white;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.stat-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1;
  /* 确保数字也是白色 */
  color: white;
}

/* 不同漏洞级别的颜色 - 保持背景色不变 */
.stat-card.critical {
  background: linear-gradient(135deg, #ff6b6b, #ff4757);
}

.stat-card.high {
  background: linear-gradient(135deg, #ff9e44, #ff7e33);
}

.stat-card.medium {
  background: linear-gradient(135deg, #4da0ff, #2d8cf0);
}

.stat-card.low {
  background: linear-gradient(135deg, #36d399, #2dcc70);
}

/* 响应式调整 */
@media (max-width: 992px) {
  .vulnerability-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .vulnerability-stats {
    grid-template-columns: 1fr;
  }
}
</style>
