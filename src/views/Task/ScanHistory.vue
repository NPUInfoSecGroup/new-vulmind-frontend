<template>
  <div class="scan-history-view">
    <!-- 头部区域美化 -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-container">
          <h1>扫描历史记录</h1>
        </div>
        <p class="subtitle">查看和管理扫描历史记录，分析漏洞技术细节</p>
      </div>
    </div>

    <!-- 过滤和搜索区域美化 -->
    <div class="filter-card">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8">
          <div class="filter-item">
            <label class="filter-label">扫描目标</label>
            <el-input
              v-model="filterForm.target"
              placeholder="输入URL或关键词"
              class="filter-input"
            >
              <template #prefix>
                <i class="fas fa-bullseye"></i>
              </template>
            </el-input>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8">
          <div class="filter-item">
            <label class="filter-label">日期范围</label>
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
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="8">
          <div class="filter-item">
            <label class="filter-label">状态</label>
            <el-select v-model="filterForm.status" placeholder="选择状态" class="filter-select">
              <el-option label="全部" value="" />
              <el-option label="挂起" value="pending" />
              <el-option label="执行" value="running" />
              <el-option label="完成" value="completed" />
              <el-option label="失败" value="failed" />
            </el-select>
          </div>
        </el-col>
      </el-row>
    </div>
    <el-row :gutter="20" class="scan-history-cards" v-if="filteredHistory.length > 0">
      <el-col
        v-for="(row, index) in filteredHistory"
        :key="index"
        :xs="24"
        :sm="24"
        :md="12"
        :lg="12"
        :xl="8"
      >
        <el-card class="scan-history-card" shadow="hover">
          <div class="scanner-header">
            <div class="name">
              {{ row.name || `扫描记录 ${index + 1}` }}
              <el-tag
                :type="/^(?:\d{1,3}\.){3}\d{1,3}$/.test(row.target) ? 'warning' : 'primary'"
                class="scan-type-tag"
                effect="plain"
              >
                {{ /^(?:\d{1,3}\.){3}\d{1,3}$/.test(row.target) ? 'IP扫描' : 'Web扫描' }}
              </el-tag>
            </div>
            <div class="date-info">
              <div class="date">{{ row.startTime }}</div>
              <div class="info-item pending" v-if="row.status == 'pending'">
                <p>挂起</p>
              </div>
              <div class="info-item running" v-if="row.status == 'running'">
                <p>执行</p>
              </div>
              <div class="info-item completed" v-if="row.status == 'completed'">
                <p>完成</p>
              </div>
              <div class="info-item failed" v-if="row.status == 'failed'">
                <p>失败</p>
              </div>
            </div>
          </div>

          <div class="card-body">
            <div class="target-info">
              <i class="fas" :class="row.type === 'web' ? 'fa-globe' : 'fa-file-code'"></i>
              <span class="target">{{ row.target }}</span>
            </div>

            <div class="vuln-summary">
              <div class="vuln-item critical" v-if="vulnSummary(row).critical > 0">
                <span class="vuln-label">严重</span>
                <span class="vuln-count">{{ vulnSummary(row).critical }}</span>
              </div>
              <div class="vuln-item high" v-if="vulnSummary(row).high > 0">
                <span class="vuln-label">高危</span>
                <span class="vuln-count">{{ vulnSummary(row).high }}</span>
              </div>
              <div class="vuln-item medium" v-if="vulnSummary(row).medium > 0">
                <span class="vuln-label">中危</span>
                <span class="vuln-count">{{ vulnSummary(row).medium }}</span>
              </div>
              <div class="vuln-item low" v-if="vulnSummary(row).low > 0">
                <span class="vuln-label">低危</span>
                <span class="vuln-count">{{ vulnSummary(row).low }}</span>
              </div>
              <div
                class="vuln-item safe"
                v-if="
                  vulnSummary(row).low === 0 &&
                  vulnSummary(row).medium === 0 &&
                  vulnSummary(row).high === 0 &&
                  vulnSummary(row).critical === 0
                "
              >
                <span class="vuln-label">无风险</span>
              </div>
            </div>
          </div>

          <div class="card-footer action-buttons">
            <el-button type="primary" @click="viewTechnicalDetails(row)" class="gobutton">
              <i class="fas fa-search"></i> 查看详情
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-empty v-else description="暂无扫描记录" image-size="160" class="empty-placeholder" />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/task'

const taskStore = useTaskStore() // 引入任务存储
const router = useRouter() // ✅ 获取路由实例
// 历史记录数据
const scanHistory = ref([])

// 加载状态
const loading = ref(true)

// 加载扫描历史数据

const fetchTasks = async () => {
  await taskStore.fetchTasks()
}
const loadScanHistory = async () => {
  loading.value = true
  try {
    await fetchTasks()
    scanHistory.value = taskStore.getScanHistory().slice().reverse()

    if (scanHistory.value.length === 0) {
      ElMessage.info('暂无扫描历史记录')
    } else {
      console.log('获取的扫描历史数量:', scanHistory.value.length)
    }
  } catch (error) {
    ElMessage.error('加载扫描历史失败，请稍后重试')
    console.error('加载扫描历史失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadScanHistory() // 不再在外面判断长度
})

// 过滤表单
const filterForm = reactive({
  target: '',
  dateRange: [],
  status: '',
})

const filteredHistory = computed(() => {
  const history = scanHistory.value ?? []
  const dateRange = filterForm.dateRange ?? []

  return history.filter((record) => {
    const matchesTarget = filterForm.target
      ? record.target.toLowerCase().includes(filterForm.target.toLowerCase())
      : true

    const matchesDate =
      dateRange.length === 2
        ? new Date(record.startTime) >= new Date(dateRange[0]) &&
          new Date(record.startTime) <= new Date(dateRange[1])
        : true

    const matchesStatus = filterForm.status ? record.status === filterForm.status : true

    return matchesTarget && matchesDate && matchesStatus
  })
})

const vulnSummary = (row) => {
  const results = row?.results || []

  return {
    critical: results.filter((vuln) => vuln.severity === 'critical').length,
    high: results.filter((vuln) => vuln.severity === 'high').length,
    medium: results.filter((vuln) => vuln.severity === 'medium').length,
    low: results.filter((vuln) => vuln.severity === 'low').length,
  }
}

// 查看技术细节
const viewTechnicalDetails = (row) => {
  router.push('/scan-history/' + row.id)
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
  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  gap: 1rem;
}
.filter-item {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  align-content: center;
  flex-wrap: nowrap;
}
label.filter-label {
  margin: 1rem 0;
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
  padding: 1rem 0.8rem;
  /* border: 2px solid transparent; */
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
  background: rgba(120, 130, 127, 0.15);
  color: #a2afaa;
}
.vuln-item.safe {
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
  flex-direction: row-reverse;
  align-items: center;
  height: 2.5rem;
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

.vuln-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
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
.scanner-header {
  align-items: flex-start;
  gap: 12px;
  flex-direction: column;
}
.scan-history-card {
  background-color: #0f172a;
  border-radius: 1rem;
  margin-top: 10px;
  margin-bottom: 10px;
  border: 1px solid rgba(100, 116, 139, 0.2);
  color: #cbd5e0;
}
.date-info {
  font-size: 1rem;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  color: #404853;
}
.scan-type-tag {
  border-radius: 0.5rem;
}
.name {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}
.target-info {
  background-color: #081322;
  box-shadow: var(--box-shadow);
  border: 1px solid rgba(100, 116, 139, 0.2);
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
}
.vuln-summary {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.5rem;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 1rem 0;
}
.vuln-item {
  /* height: 100%; */
  font-size: 0.8rem !important;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}
.vuln-count {
  font-size: 0.8rem;
  margin-left: 5px;
}
:deep(button.el-button.el-button--primary.gobutton) {
  width: 100%;
}
.info-item {
  padding: 0.25rem 0.8rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  margin-left: 1rem;
}
.info-item.pending {
  background: rgba(183, 183, 183, 0.15);
  color: #cccccc;
  margin-left: 0;
}
.info-item.running {
  background: rgba(68, 239, 97, 0.15);
  color: #71f8ac;
}
.info-item.completed {
  background: rgba(68, 114, 239, 0.15);
  color: #71b9f8;
}
.info-item.failed {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}
</style>
