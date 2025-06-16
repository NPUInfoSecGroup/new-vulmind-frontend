<template>
  <div class="scan-history-view">
    <!-- 头部区域美化 -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-container">
          <i class="fas fa-history"></i>
          <h1>扫描历史记录</h1>
        </div>
        <p class="subtitle">查看和管理扫描历史记录，分析漏洞技术细节</p>
      </div>
      <div class="header-decoration">
        <div class="decoration-item"></div>
        <div class="decoration-item"></div>
        <div class="decoration-item"></div>
      </div>
    </div>

    <!-- 过滤和搜索区域美化 -->
    <div class="filter-card">
      <div class="filter-section">
        <el-form :inline="true" :model="filterForm">
          <div class="filter-row">
            <el-form-item label="扫描目标">
              <el-input
                v-model="filterForm.target"
                placeholder="输入URL或关键词"
                class="filter-input"
              >
                <template #prefix>
                  <i class="fas fa-bullseye"></i>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="日期范围">
              <el-date-picker
                v-model="filterForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                class="filter-date-picker"
              >
                <template #prefix>
                  <i class="fas fa-calendar"></i>
                </template>
              </el-date-picker>
            </el-form-item>
          </div>

          <div class="filter-row">
            <el-form-item label="状态">
              <el-select v-model="filterForm.status" placeholder="选择状态" class="filter-select">
                <el-option label="全部" value=""></el-option>
                <el-option label="已完成" value="completed"></el-option>
                <el-option label="失败" value="failed"></el-option>
                <el-option label="进行中" value="scanning"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="searchHistory" class="filter-button primary">
                <i class="fas fa-search"></i> 搜索
              </el-button>
              <el-button @click="resetFilter" class="filter-button secondary">
                <i class="fas fa-undo"></i> 重置
              </el-button>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </div>

    <!-- 历史记录列表美化 -->
    <div class="history-card">
      <div class="history-list">
        <el-table
          :data="filteredHistory"
          style="width: 100%"
          class="scan-history-table"
          row-class-name="scan-row"
          header-row-class-name="header-row"
          @row-click="handleRowClick"
        >
          <el-table-column prop="date" label="扫描日期" width="180">
            <template #default="{ row }">
              <div class="date-container">
                <div class="date-value">{{ row.date }}</div>
                <div class="time-value">{{ row.time }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="target" label="扫描目标">
            <template #default="{ row }">
              <div class="target-container">
                <i class="fas" :class="row.type === 'web' ? 'fa-globe' : 'fa-file-code'"></i>
                <span>{{ row.target }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="type" label="扫描类型" width="120">
            <template #default="{ row }">
              <el-tag
                :type="row.type === 'web' ? 'success' : 'info'"
                class="scan-type-tag"
                effect="dark"
                round
              >
                {{ row.type === 'web' ? 'Web扫描' : '二进制扫描' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="结果概要" width="180">
            <template #default="{ row }">
              <div class="vuln-summary">
                <div class="vuln-item critical" v-if="row.vulnSummary.critical > 0">
                  <span class="vuln-count">{{ row.vulnSummary.critical }}</span>
                  <span class="vuln-label">严重</span>
                </div>
                <div class="vuln-item high" v-if="row.vulnSummary.high > 0">
                  <span class="vuln-count">{{ row.vulnSummary.high }}</span>
                  <span class="vuln-label">高危</span>
                </div>
                <div class="vuln-item medium" v-if="row.vulnSummary.medium > 0">
                  <span class="vuln-count">{{ row.vulnSummary.medium }}</span>
                  <span class="vuln-label">中危</span>
                </div>
                <div class="vuln-item low" v-if="row.vulnSummary.low > 0">
                  <span class="vuln-count">{{ row.vulnSummary.low }}</span>
                  <span class="vuln-label">低危</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="240" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button
                  size="small"
                  class="action-button tech-details"
                  @click.stop="viewTechnicalDetails(row)"
                >
                  <i class="fas fa-search"></i> 技术细节
                </el-button>
                <el-button
                  size="small"
                  type="primary"
                  class="action-button generate-report"
                  @click.stop="generateReport(row)"
                >
                  <i class="fas fa-file-pdf"></i> 生成报告
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-section">
          <el-pagination
            background
            layout="prev, pager, next, jumper"
            :total="totalItems"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handlePageChange"
            class="history-pagination"
          />
        </div>
      </div>
    </div>
    <el-dialog
      v-model="detailDialogVisible"
      :title="`扫描技术细节 - ${currentScan ? currentScan.target : ''}`"
      width="85%"
      top="5vh"
      custom-class="tech-detail-dialog"
    >
      <div class="tech-detail-container" v-if="currentScan">
        <!-- 扫描元数据部分保持不变 -->

        <!-- 漏洞列表部分 -->
        <div class="vulnerability-section">
          <h3 class="section-title">
            <i class="fas fa-bug"></i> 漏洞列表
            <span class="vuln-count">(共 {{ currentScan.vulnerabilities.length }} 个漏洞)</span>
          </h3>

          <div class="vuln-list">
            <!-- 每个漏洞项 -->
            <div
              v-for="vuln in currentScan.vulnerabilities"
              :key="vuln.id"
              class="vuln-item"
              :class="vuln.severity"
            >
              <!-- 漏洞头部信息 -->
              <div class="vuln-header">
                <div class="vuln-title">
                  <span class="vuln-id">{{ vuln.id }}</span>
                  <span class="vuln-name">{{ vuln.name }}</span>
                  <el-tag
                    :type="getSeverityTagType(vuln.severity)"
                    size="small"
                    effect="dark"
                    class="severity-tag"
                  >
                    {{ getSeverityLabel(vuln.severity) }}
                  </el-tag>
                </div>
                <div class="vuln-actions">
                  <!-- 验证漏洞按钮 -->
                  <!-- 导出详情按钮 -->
                  <el-tooltip effect="dark" content="导出详情" placement="top">
                    <el-button circle size="small" @click="exportVulnerability(vuln)">
                      <i class="fas fa-download"></i>
                    </el-button>
                  </el-tooltip>
                </div>
              </div>

              <!-- 漏洞内容 -->
              <div class="vuln-content">
                <!-- 漏洞描述 -->
                <div class="vuln-description">
                  <label>详细描述:</label>
                  <p>{{ vuln.description }}</p>
                </div>

                <!-- 漏洞信息网格 -->
                <div class="vuln-info-grid">
                  <div class="info-item">
                    <label>风险等级:</label>
                    <span :class="'risk-level ' + vuln.severity">
                      {{ getSeverityLevel(vuln.severity) }}
                    </span>
                  </div>
                  <div class="info-item">
                    <label>发现时间:</label>
                    <span>{{ currentScan.time }}</span>
                  </div>
                </div>

                <!-- 添加漏洞位置信息 -->
                <div class="vuln-location" v-if="vuln.location">
                  <label>漏洞位置:</label>
                  <pre>{{ vuln.location }}</pre>
                </div>

                <!-- 添加请求/响应信息 -->
                <div class="vuln-request" v-if="vuln.request">
                  <label>请求示例:</label>
                  <pre>{{ vuln.request }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  setup() {
    // 历史记录数据 - 现在初始化为空数组
    const scanHistory = ref([])

    // 加载状态
    const loading = ref(true)

    // 加载扫描历史数据
    const loadScanHistory = () => {
      try {
        loading.value = true

        // ① webpack 会在构建时扫描目录
        const ctx = require.context('@/scan-details', false, /^\.\/scan-\d{10}\.json$/)

        scanHistory.value = ctx
          .keys()
          .map((k) => ctx(k))
          .sort((a, b) => b.id.localeCompare(a.id))
      } catch (e) {
        console.error(e)
        ElMessage.error('加载扫描记录失败')
      } finally {
        loading.value = false
      }
    }

    // 组件挂载时加载数据
    onMounted(() => {
      loadScanHistory()
    })

    // 过滤表单
    const filterForm = reactive({
      target: '',
      dateRange: [],
      status: '',
    })

    // 分页设置
    const currentPage = ref(1)
    const pageSize = ref(5)
    const totalItems = computed(() => scanHistory.value.length)

    // 过滤后的历史记录
    const filteredHistory = computed(() => {
      return scanHistory.value
        .filter((record) => {
          const matchesTarget = filterForm.target
            ? record.target.toLowerCase().includes(filterForm.target.toLowerCase())
            : true

          const matchesDate =
            filterForm.dateRange.length === 2
              ? record.date >= filterForm.dateRange[0] && record.date <= filterForm.dateRange[1]
              : true

          const matchesStatus = filterForm.status ? record.status === filterForm.status : true

          return matchesTarget && matchesDate && matchesStatus
        })
        .slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
    })

    // 搜索历史
    const searchHistory = () => {
      currentPage.value = 1
    }

    // 重置筛选条件
    const resetFilter = () => {
      filterForm.target = ''
      filterForm.dateRange = []
      filterForm.status = ''
      currentPage.value = 1
    }

    // 分页切换
    const handlePageChange = (page) => {
      currentPage.value = page
    }

    // 技术细节弹窗控制
    const detailDialogVisible = ref(false)
    const currentScan = ref(null)

    // 获取漏洞严重性标签类型
    const getSeverityTagType = (severity) => {
      switch (severity) {
        case 'critical':
          return 'danger'
        case 'high':
          return 'warning'
        case 'medium':
          return 'primary'
        case 'low':
          return 'success'
        default:
          return 'info'
      }
    }

    // 获取漏洞严重性文本标签
    const getSeverityLabel = (severity) => {
      switch (severity) {
        case 'critical':
          return '严重'
        case 'high':
          return '高危'
        case 'medium':
          return '中危'
        case 'low':
          return '低危'
        default:
          return '未知'
      }
    }

    // 获取风险等级文本
    const getSeverityLevel = (severity) => {
      switch (severity) {
        case 'critical':
          return '极高风险'
        case 'high':
          return '高风险'
        case 'medium':
          return '中等风险'
        case 'low':
          return '低风险'
        default:
          return '未知风险'
      }
    }

    // 查看技术细节
    const viewTechnicalDetails = (row) => {
      currentScan.value = { ...row }
      detailDialogVisible.value = true
    }

    // 生成报告
    const generateReport = (row) => {
      ElMessage.success(`正在生成 ${row.target} 的扫描报告...`)
      // 实际生成报告逻辑
    }

    // 处理行点击
    const handleRowClick = (row) => {
      console.log('点击行:', row.id)
    }

    const exportVulnerability = (vuln) => {
      const blob = new Blob([JSON.stringify(vuln, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${vuln.id}.json`
      a.click()
      URL.revokeObjectURL(url)
      ElMessage.success(`${vuln.id} 已导出`)
    }

    return {
      filterForm,
      filteredHistory,
      totalItems,
      pageSize,
      currentPage,
      searchHistory,
      resetFilter,
      handlePageChange,
      viewTechnicalDetails,
      generateReport,
      handleRowClick,
      detailDialogVisible,
      currentScan,
      getSeverityTagType,
      getSeverityLabel,
      getSeverityLevel,
      loading,
      exportVulnerability,
    }
  },
}
</script>

<style scoped>
/* 基础样式 */
.scan-history-view {
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 2rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  height: auto;
  color: #e2e8f0;
}

/* 头部区域美化 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  position: relative;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.7);
  border-radius: 16px;
  border: 1px solid rgba(100, 116, 139, 0.2);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.header-content {
  z-index: 2;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.title-container i {
  font-size: 2.5rem;
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0;
  color: #f8fafc;
  letter-spacing: 0.5px;
}

.subtitle {
  font-size: 1.1rem;
  color: #94a3b8;
  margin: 0;
  max-width: 600px;
  line-height: 1.6;
}

.header-decoration {
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 1rem;
}

.decoration-item {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(96, 165, 250, 0.5);
}

.decoration-item:nth-child(1) {
  background: rgba(96, 165, 250, 0.8);
  width: 16px;
  height: 16px;
}

.decoration-item:nth-child(2) {
  background: rgba(139, 92, 246, 0.6);
}

.decoration-item:nth-child(3) {
  background: rgba(52, 211, 153, 0.6);
}

/* 过滤卡片样式 */
.filter-card {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(100, 116, 139, 0.2);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}

.filter-section {
  width: 100%;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.el-form-item {
  margin-bottom: 0;
  flex: 1;
  min-width: 300px;
}

.filter-input,
.filter-date-picker,
.filter-select {
  width: 100%;
}

.filter-button {
  border-radius: 10px;
  padding: 0.9rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 1rem;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.filter-button.primary {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
}

.filter-button.primary:hover {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(37, 99, 235, 0.3);
}

.filter-button.secondary {
  background: rgba(30, 41, 59, 0.7);
  color: #cbd5e1;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.filter-button.secondary:hover {
  background: rgba(51, 65, 85, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

/* 历史记录卡片样式 */
.history-card {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(100, 116, 139, 0.2);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}

.scan-history-table {
  --el-table-header-bg-color: rgba(30, 41, 59, 0.8);
  --el-table-header-text-color: #cbd5e0;
  --el-table-border-color: rgba(100, 116, 139, 0.2);
  --el-table-row-hover-bg-color: rgba(56, 78, 114, 0.3);
  --el-table-bg-color: transparent;
}

:deep(.el-table) {
  background-color: transparent;
  color: #e2e8f0;
}

:deep(.el-table th.el-table__cell) {
  background-color: rgba(30, 41, 59, 0.8);
  font-weight: 600;
}

:deep(.el-table .el-table__cell) {
  background-color: transparent;
  border-bottom: 1px solid rgba(100, 116, 139, 0.2);
}

:deep(.el-table .scan-row:hover) {
  background-color: rgba(56, 78, 114, 0.3) !important;
  cursor: pointer;
  transform: translateY(-1px);
  transition: all 0.2s ease;
}

:deep(.el-table .el-table__row) {
  background-color: rgba(15, 23, 42, 0.4);
  transition: all 0.3s ease;
}

:deep(.el-table .el-table__row.el-table__row--striped) {
  background-color: rgba(15, 23, 42, 0.3);
}

/* 表格单元格样式 */
.date-container {
  display: flex;
  flex-direction: column;
}

.date-value {
  font-weight: 600;
  color: #f1f5f9;
}

.time-value {
  font-size: 0.9rem;
  color: #94a3b8;
}

.target-container {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.target-container i {
  font-size: 1.2rem;
  color: #60a5fa;
}

.scan-type-tag {
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* 漏洞摘要样式 */
.vuln-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.vuln-item {
  display: flex;
  align-items: center;
  padding: 0.25rem 0.8rem;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 500;
}

.vuln-item.critical {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.vuln-item.high {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.vuln-item.medium {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}

.vuln-item.low {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.vuln-count {
  font-weight: 700;
  margin-right: 0.3rem;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  border-radius: 8px;
  padding: 0.5rem 0.8rem;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-button.tech-details {
  background: rgba(30, 41, 59, 0.7);
  color: #cbd5e1;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.action-button.tech-details:hover {
  background: rgba(56, 78, 114, 0.7);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.3);
}

.action-button.generate-report {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: white;
}

.action-button.generate-report:hover {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
}

/* 分页样式 */
.pagination-section {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-button-bg-color: rgba(30, 41, 59, 0.7);
  --el-pagination-button-color: #e2e8f0;
  --el-pagination-button-disabled-bg-color: rgba(30, 41, 59, 0.4);
  --el-pagination-hover-color: #3b82f6;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #3b82f6;
  color: white;
  font-weight: 600;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled):hover) {
  color: #3b82f6;
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 992px) {
  .el-form-item {
    min-width: 100%;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    text-align: center;
  }

  .header-decoration {
    position: static;
    margin-top: 1rem;
    transform: none;
  }

  .filter-row {
    flex-direction: column;
  }
}
.tech-detail-dialog {
  border-radius: 16px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border: 1px solid rgba(100, 116, 139, 0.3);
  max-width: 1200px;
}

.tech-detail-dialog .el-dialog__header {
  background: rgba(15, 23, 42, 0.8);
  border-bottom: 1px solid rgba(100, 116, 139, 0.2);
  margin: 0;
  padding: 1.2rem 1.5rem;
}

.tech-detail-dialog .el-dialog__title {
  color: #f1f5f9;
  font-weight: 600;
  font-size: 1.3rem;
}

.tech-detail-dialog .el-dialog__body {
  padding: 0;
  max-height: 70vh;
  overflow-y: auto;
}

.tech-detail-container {
  padding: 1.5rem;
}

.scan-meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(100, 116, 139, 0.2);
}

.meta-item {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 10px;
  padding: 1rem;
  border-left: 4px solid #3b82f6;
}

.meta-item label {
  font-weight: 600;
  color: #94a3b8;
  display: block;
  margin-bottom: 0.5rem;
}

.meta-item span {
  color: #e2e8f0;
  font-size: 1.1rem;
}

.vulnerability-section {
  margin-top: 1rem;
}

.section-title {
  font-size: 1.4rem;
  color: #f1f5f9;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.section-title i {
  color: #60a5fa;
}

.vuln-count {
  font-size: 1rem;
  color: #94a3b8;
  margin-left: 0.5rem;
}

.vuln-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.vuln-item {
  background: rgba(30, 41, 59, 0.6);
  border-radius: 10px;
  overflow: hidden;
  border-left: 4px solid;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.vuln-item.critical {
  border-left-color: #ef4444;
}

.vuln-item.high {
  border-left-color: #f59e0b;
}

.vuln-item.medium {
  border-left-color: #3b82f6;
}

.vuln-item.low {
  border-left-color: #10b981;
}

.vuln-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(30, 41, 59, 0.8);
  border-bottom: 1px solid rgba(100, 116, 139, 0.2);
}

.vuln-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.vuln-id {
  font-weight: 700;
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
  padding: 0.25rem 0.8rem;
  border-radius: 4px;
}

.vuln-name {
  font-weight: 600;
  font-size: 1.2rem;
  color: #f1f5f9;
}

.severity-tag {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.vuln-actions {
  display: flex;
  gap: 0.5rem;
}

.vuln-actions .el-button {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(100, 116, 139, 0.3);
  color: #94a3b8;
  transition: all 0.2s ease;
}

.vuln-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.vuln-content {
  padding: 1.5rem;
}

.vuln-description label {
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 0.5rem;
  display: block;
}

.vuln-description p {
  color: #e2e8f0;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.vuln-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.4);
  border-radius: 8px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item label {
  font-weight: 600;
  color: #94a3b8;
  min-width: 80px;
  margin-right: 0.8rem;
}

.info-item span {
  color: #e2e8f0;
}

.risk-level {
  font-weight: 600;
}

.risk-level.critical {
  color: #ef4444;
}

.risk-level.high {
  color: #f59e0b;
}

.risk-level.medium {
  color: #3b82f6;
}

.risk-level.low {
  color: #10b981;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(100, 116, 139, 0.2);
}

/* 响应式调整 */
@media (max-width: 992px) {
  .vuln-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .vuln-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .tech-detail-dialog {
    width: 95%;
  }

  .vuln-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
.no-data {
  text-align: center;
  padding: 3rem;
  color: #94a3b8;
}

.no-data i {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: #475569;
}

.no-data p {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}
.tech-detail-dialog,
.tech-detail-dialog .vuln-description p,
.tech-detail-dialog .info-item span {
  color: #e2e8f0;
}

.tech-detail-dialog .info-item label {
  color: #cbd5e1;
}

.vuln-info-grid {
  background: rgba(100, 116, 139, 0.15);
}

.risk-level.critical {
  color: #f87171;
}
.risk-level.high {
  color: #fbbf24;
}
.risk-level.medium {
  color: #60a5fa;
}
.risk-level.low {
  color: #34d399;
}

.vuln-description p {
  line-height: 1.6;
  color: #e2e8f0;
}

.vuln-info-grid .info-item {
  background: transparent;
}

.vuln-item {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
}
</style>
