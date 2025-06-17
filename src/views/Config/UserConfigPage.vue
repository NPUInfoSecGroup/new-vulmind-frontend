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
          <div class="demo-collapse-position">
            <el-collapse :expand-icon-position="position">
              <el-collapse-item title="模型配置" name="1">
                <p>模型厂商</p>
                <el-select v-model="value" placeholder="Select" size="large">
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <p>base_url</p>
                <el-input v-model="base_url" placeholder="请输入base_url" size="large"></el-input>
                <p>api_key</p>
                <el-input v-model="api_key" placeholder="请输入模型名称" size="large"></el-input>
              </el-collapse-item>
              <el-collapse-item title="服务器配置" name="2">
                <p>服务器地址</p>
                <el-input
                  v-model="serve_url"
                  placeholder="请输入服务器地址"
                  size="large"
                ></el-input>
              </el-collapse-item>
            </el-collapse>
          </div>
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
import { useConfigStore } from '@/stores/config'
import { ref } from 'vue'

const configStore = useConfigStore()
import type { CollapseIconPositionType } from 'element-plus'

const position = ref<CollapseIconPositionType>('left')
const options = ref([
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google' },
  { value: 'azure', label: 'Azure' },
  { value: 'baidu', label: 'Baidu' },
])

const value = ref(configStore.getLLMConfig.modelProvider)
const base_url = ref(configStore.getLLMConfig.APIBaseUrl)
const serve_url = ref(configStore.getServerUrl)
const api_key = ref(configStore.getLLMConfig.APIKey)
function saveConfig() {
  configStore.updateLLMConfig({
    modelProvider: value.value,
    APIBaseUrl: base_url.value,
    APIKey: api_key.value,
  })
  configStore.updateServerUrl(serve_url.value)
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
.demo-collapse-position {
  width: 100%;
  height: 100%;
}
:deep(.el-collapse-item__header) {
  background-color: #00000000 !important;
  /* padding: 5px; */
  border-bottom: 2px solid #006efd00;

  /* box-shadow: #e6e6e693 0px 0px 16px 6px; */
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
}

:deep(.el-collapse-item__content) {
  /* background-color: #d8d8d8 !important; */
  border-radius: 15px;
  padding: 5px;
  /* border: 2px solid #363636; */
  font-size: 18px;
  font-weight: bold;
  /* margin-left: 10px; */
  margin-left: 1.5rem;
  margin-bottom: 10px;
  border-bottom: none;
  color: aliceblue;
}
:deep(.el-collapse-item__content) p {
  margin: 10px;
}
:deep(.el-collapse-item__wrap) {
  background-color: #00000000 !important;
  border: none;
}
.el-collapse.el-collapse-icon-position-left {
  border: none;
}
</style>
