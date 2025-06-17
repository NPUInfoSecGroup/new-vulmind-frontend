<template>
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
      <div class="form-group" v-if="targetType === 'url'">
        <label class="form-label" for="url">任务名称</label>
        <input v-model="targetName" type="text" placeholder="扫描任务" class="form-input" />
      </div>
      <!-- 新增：目标类型选择（Element Plus 实现） -->
      <div class="form-group">
        <label class="form-label" for="targetType">目标类型：</label>
        <el-select id="targetType" v-model="targetType" placeholder="请选择目标类型" size="large">
          <el-option label="URL" value="url" />
          <el-option label="IP 地址" value="ip" />
        </el-select>
      </div>

      <!-- URL 输入 -->
      <div class="form-group" v-if="targetType === 'url'">
        <label class="form-label" for="url">目标 URL：</label>
        <input
          id="url"
          v-model="targetUrl"
          type="text"
          placeholder="https://example.com"
          class="form-input"
        />
      </div>

      <!-- IP 输入 -->
      <div class="form-group" v-if="targetType === 'ip'">
        <label class="form-label" for="ipRange">目标 IP：</label>
        <input
          id="ipRange"
          v-model="targetIP"
          type="text"
          placeholder="192.168.1.1"
          class="form-input"
        />
      </div>
    </div>

    <!-- 扫描建议 -->
    <div class="section">
      <div class="section-title">
        <i class="fas fa-comment-alt" />
        <span>扫描指令</span>
      </div>

      <div class="form-group">
        <textarea
          id="suggestions"
          v-model="command"
          placeholder="请输入特定的扫描要求"
          class="form-textarea"
        ></textarea>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <el-button type="" class="no" size="large" @click="cancel"> 取消 </el-button>
      <el-button type="primary" class="yes" size="large" @click="startScan"> 启动扫描 </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTaskStore } from '@/stores/task'
import { useRouter } from 'vue-router'
const emit = defineEmits(['success', 'cancel'])
const taskStore = useTaskStore()
const router = useRouter()

let targetType = ref('url') // 默认目标类型为 URL
let targetUrl = ref('')
let targetIP = ref('')
let targetName = ref('') // 新增：任务名称输入
let command = ref('')

function startScan() {
  // 表单验证逻辑
  if (!targetUrl.value && !targetIP.value) {
    alert('请至输入任务目标')
    return
  }
  // 目标类型验证
  if (targetType.value === 'url' && !/^https?:\/\/[^\s]+$/.test(targetUrl.value)) {
    alert('请输入有效的 URL')
    return
  }
  if (
    targetType.value === 'ip' &&
    !/^\d{1,3}(\.\d{1,3}){3}(-\d{1,3}(\.\d{1,3}){3})?$/.test(targetIP.value)
  ) {
    alert('请输入有效的 IP 地址范围')
    return
  }
  if (!command.value) {
    alert('请至少输入一个扫描要求')
    return
  }

  // 添加新任务到任务列表
  taskStore.addTask({
    name: targetName.value || '扫描任务',
    target: targetType.value === 'url' ? targetUrl.value : targetIP.value,
    command: command.value,
    status: 'pending',
  })

  console.log('开始扫描配置：', {
    targetType: targetType.value,
    targetUrl: targetUrl.value,
    targetIP: targetIP.value,
    command: command.value,
  })
  emit('success') // 触发父组件关闭弹窗
  router.push('/scan-history/')
}
function cancel() {
  emit('cancel')
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
  margin-left: 1rem;
  margin-right: 1rem;
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
:deep(button.el-button.el-button--primary.yes) {
  width: 100%;
  height: 100%;
  font-size: large;
  border-radius: 1rem;
  box-shadow: none;
}
:deep(button.el-button.no) {
  width: 100%;
  height: 100%;
  font-size: large;
  border-radius: 1rem;
  box-shadow: none;
}
.card-header {
  border-radius: 1rem;
}
</style>
