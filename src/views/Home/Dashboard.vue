<template>
  <!-- <div class="dashboard-container"> -->
  <!-- 顶部标题栏 -->
  <header class="app-header">
    <div class="header-content">
      <h1 class="app-title">VulMind</h1>
      <p class="app-subtitle">可拓展大模型漏洞扫描平台</p>
    </div>
  </header>

  <!-- 主内容区 - 填满宽度 -->
  <div class="main-content">
    <!-- 漏洞概览组件 -->
    <VulnerabilityOverview :scan-count="8" :critical="9" :high="7" :medium="13" :low="11" />

    <!-- 其他组件 -->
    <ScannerQuicker />
    <ReportGenerator />
  </div>
  <!-- </div> -->
</template>

<script setup>
import ReportGenerator from '@/views/Home/ReportGenerator.vue'
import ScannerQuicker from './ScannerQuicker.vue'
import VulnerabilityOverview from './VulnerabilityOverview.vue'
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  background: #0a1220; /* 更深的背景 */
  color: #fff;
  padding: 20px;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dashboard-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 10% 20%, rgba(67, 97, 238, 0.2) 0%, transparent 30%),
    radial-gradient(circle at 90% 30%, rgba(67, 97, 238, 0.18) 0%, transparent 40%),
    radial-gradient(circle at 50% 80%, rgba(67, 97, 238, 0.15) 0%, transparent 45%);
  pointer-events: none;
  z-index: 0;
  filter: blur(80px);
}

/* 顶部标题区域 - 填满宽度 */
.app-header {
  background: linear-gradient(135deg, #161d3a 0%, #2a3468 100%);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7);
  text-align: center;
  margin-bottom: 25px;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(100, 120, 220, 0.3);
}

.app-title {
  font-size: 3.5rem;
  font-weight: 800;
  background: linear-gradient(to right, #8c9bff, #4fa3f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
  text-shadow: 0 0 15px rgba(140, 155, 255, 0.4);
}

.app-subtitle {
  font-size: 1.4rem;
  color: rgba(200, 210, 255, 0.9);
  margin: 0;
  letter-spacing: 0.5px;
  font-weight: 300;
}

/* 主内容区 - 填满宽度 */
.main-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
  width: 100%;
  /* max-width: 1200px; */
  /* margin: 0 auto; */
  position: relative;
  z-index: 2;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .main-content {
    max-width: 95%;
  }

  .app-title {
    font-size: 3rem;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 15px;
  }

  .app-header {
    padding: 20px 15px;
  }

  .app-title {
    font-size: 2.5rem;
  }

  .app-subtitle {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .app-title {
    font-size: 2.2rem;
  }

  .app-subtitle {
    font-size: 1rem;
  }
}
</style>
