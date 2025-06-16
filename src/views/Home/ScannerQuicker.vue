<template>
  <div class="report-container-wrapper">
    <div class="report-generator">
      <!-- 头部 -->
      <div class="report-header">
        <i class="fas fa-file-alt" />
        <h2>报告生成</h2>
      </div>

      <div class="report-body">
        <!-- 创建任务模块 -->
        <div class="report-preview-container">
          <h3>创建任务</h3>
          <div class="create-task">
            <el-button type="primary" class="new" size="large" @click="open">
              + 创建新任务
            </el-button>
          </div>
        </div>

        <!-- 近期任务模块 -->
        <div class="report-preview-container">
          <h3>近期任务</h3>
          <div class="recent-tasks">
            <div class="task-card" v-for="n in 1" :key="n">
              <h4>任务 #{{ n }}</h4>
              <p>状态：已完成</p>
              <p>时间：2025-06-16</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 对话框：嵌入 TaskAddPage -->
    <el-dialog
      v-model="showAddDialog"
      width="50%"
      :destroy-on-close="false"
      :close-on-click-modal="false"
    >
      <TaskAddPage @success="showAddDialog = false" @cancel="handleScanCancel" />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import TaskAddPage from '@/views/Home/Task/ScanTarget.vue'

const showAddDialog = ref(false)

const open = () => {
  showAddDialog.value = true
}

const handleScanCancel = () => {
  showAddDialog.value = false
}
</script>

<style scoped>
.create-task {
  display: flex;
  justify-content: center;
  padding: 1rem 0 0 0;
  height: 100%;
}

.recent-tasks {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 1rem;
}

.task-card {
  flex: 1 1 220px;
  max-width: 280px;
  min-width: 200px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  color: var(--text-primary);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}
.card-header {
  border-radius: 1rem;
}
.task-card:hover {
  transform: translateY(-5px);
}

.task-card h4 {
  margin-bottom: 8px;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  height: auto;
  background: var(--dark-bg);
  color: var(--text-primary);
  padding: 24px;
  overflow-x: hidden;
  position: relative;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  gap: 20px;
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

.report-header h2 {
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
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: stretch; /* 关键：让子项高度自动拉伸为相同 */
  gap: 20px;
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
  flex: 1; /* 让左右容器自动平分空间并对齐高度 */
  display: flex;
  flex-direction: column; /* 保持子项竖向排列 */
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--border-radius);
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
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loading-spinner {
  font-size: 2rem;
  color: #60a5fa;
  animation: spin 1s linear infinite;
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
:deep(button.el-button.el-button--primary.new) {
  width: 100%;
  height: 100%;
  font-size: large;
  border-radius: 1rem;
  box-shadow: none;
}
:deep(el-dialog__header) {
  display: none;
}
:deep(.el-dialog__headerbtn) {
  display: none;
}
</style>
