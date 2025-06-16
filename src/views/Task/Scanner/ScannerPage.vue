<template>
  <div class="report-template-view">
    <TaskInfoView />
    <EnvironmentInfoView></EnvironmentInfoView>
  </div>
</template>

<script lang="ts" setup>
import TaskInfoView from './Task/TaskInfoView.vue'
import EnvironmentInfoView from './Environment/EnvironmentInfoView.vue'
import { ref } from 'vue'

const activeName = ref('first')
</script>

<style scoped>
.back-button {
  padding: 20px;
}
.common-layout {
  overflow: hidden; /* 禁止滚动 */
  margin-top: 10px;
}
.action-tabs {
  /* margin: 20px; */
  margin-bottom: 0;
}
.outer-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: auto; /* 或你想要的固定高度 */
  flex-shrink: 0;
  background-color: rgba(255, 255, 255, 0.721);
  box-shadow: #e6e6e693 0px 0px 16px 6px;
  /* padding-bottom: 20px; */
  border-bottom: 1px solid #e2e8f0; /* 边框样式 */
}

.inner-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 20px;
  height: 100%;
  gap: 10px; /* 设置间距 */
}

.aside {
  height: 100%;
  overflow: auto; /* 如果需要 aside 内部滚动 */
  padding: 10px;
  border-radius: 15px;
  border: 2px solid #e2e8f0; /* 边框样式 */
  overflow-x: hidden; /* 禁止横向滚动 */
  min-width: 30%;
}

.main {
  flex: 1;
  height: 100%;
  border: 2px solid #e2e8f0; /* 边框样式 */
  box-shadow: #e2e8f0 0px 0px 10px; /* 阴影效果 */
  border-radius: 1rem;
}

.header-title {
  padding: 20px;
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
</style>
