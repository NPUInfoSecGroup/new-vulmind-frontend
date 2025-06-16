<template>
  <div class="dashboard-container">
    <!-- 顶部标题栏 -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">
          <i class="fas fa-shield-alt" />
          VulMind
        </h1>
        <p class="app-subtitle">可拓展大模型漏洞扫描平台</p>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="dashboard-content">
      <ScanTarget />
      <ScanStatus />

      <ReportGenerator />
    </main>
  </div>
</template>

<script>
import ScanTarget from '@/views/Home/ScanTarget.vue'
import ScanStatus from '@/views/Home/ScanStatus.vue'
import ReportGenerator from '@/views/Home/ReportGenerator.vue'

export default {
  name: 'Dashboard',
  components: {
    ScanTarget,
    ScanStatus,
    ReportGenerator,
  },
}
</script>

<style scoped>
/***********************************
 * 调色板 & 全局变量
 ***********************************

/***********************************
 * 页面骨架
 ***********************************/
.dashboard-container {
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
}

.dashboard-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 15% 25%, rgba(67, 97, 238, 0.15) 0%, transparent 40%),
    radial-gradient(circle at 85% 35%, rgba(67, 97, 238, 0.12) 0%, transparent 45%),
    radial-gradient(circle at 50% 90%, rgba(67, 97, 238, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
  filter: blur(60px);
}

/***********************************
 * 顶部 Header
 ***********************************/
.app-header {
  background: linear-gradient(135deg, #1e244d 0%, #2d3771 100%);
  border-radius: var(--border-radius);
  padding: 32px 28px 24px;
  box-shadow: var(--box-shadow);
  position: relative;
  z-index: 1;
  overflow: hidden;
  margin-bottom: 1rem;
}
.app-header::after {
  content: '';
  position: absolute;
  top: -40%;
  right: -40%;
  width: 90%;
  height: 180%;
  background: radial-gradient(circle, rgba(0, 219, 222, 0.25) 0%, transparent 70%);
  transform: rotate(25deg);
  pointer-events: none;
}
.header-content {
  position: relative;
  z-index: 2;
  text-align: center;
}
.app-title {
  font-size: clamp(1.8rem, 2.2vw + 1rem, 2.75rem);
  font-weight: 700;
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
}
.app-title i {
  color: var(--accent);
}
.app-subtitle {
  font-size: 1rem;
  max-width: 640px;
  margin: 0.5rem auto 0;
  color: rgba(255, 255, 255, 0.85);
}

/***********************************
 * 顶部导航按钮
 ***********************************/
.nav-buttons {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 28px;
  flex-wrap: wrap;
}
.nav-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: var(--border-radius);
  font-weight: 600;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border);
  color: var(--text-primary);
  text-decoration: none;
  transition: var(--transition);
  backdrop-filter: blur(5px);
}
.nav-button:hover {
  background: var(--accent);
  color: #1a202c;
  transform: translateY(-4px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.45);
}

/***********************************
 * 主内容区：上两并排，下单行
 ***********************************/
.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    'target status'
    'report report';
  gap: 20px;
  grid-auto-rows: 1fr;
}
.target-area {
  grid-area: target;
}
.status-area {
  grid-area: status;
}
.report-area {
  grid-area: report;
}

/***********************************
 * 模块包裹器
 ***********************************/
.module-wrapper {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 26px 24px;
  box-shadow: var(--box-shadow);
  border: 1px solid var(--border);
  transition: var(--transition);
  overflow: hidden;
  height: 100%;
}
.module-wrapper:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4);
}

/***********************************
 * 响应式：窄屏堆叠
 ***********************************/
@media (max-width: 1024px) {
  .dashboard-content {
    grid-template-columns: 1fr;
    grid-template-areas:
      'target'
      'status'
      'report';
  }
}
</style>
