<template>
  <div class="report-template-view">
    <div class="main-layout">
      <div class="header-section">
        <div class="header-content">
          <div class="title-container">
            <h1>用户配置</h1>
          </div>
          <p class="subtitle">创建、编辑和管理您的安全扫描报告模板</p>
        </div>
      </div>
      <div class="common-layout">
        <el-container>
          <!-- <el-scrollbar height="100%"> -->
          <ConfigSubView />
          <!-- </el-scrollbar> -->
          <el-footer>
            <el-button type="primary" @click="saveConfig">保存配置</el-button>
          </el-footer>
        </el-container>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ConfigSubView from './ConfigSubView.vue'

function saveConfig() {
  console.log('保存配置')
}
</script>

<style scoped>
.common-layout {
  border: 2px solid #0b1829;
  background: #171d2b;
  border-radius: 15px;
  padding: 20px;
}
.el-footer {
  text-align: right;
}
.report-template-view {
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 2rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  height: auto;
  color: #e2e8f0;
}
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
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
</style>
