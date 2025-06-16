<template>
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
        <el-input v-model="serve_url" placeholder="请输入base_url" size="large"></el-input>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import type { CollapseIconPositionType } from 'element-plus'

const position = ref<CollapseIconPositionType>('left')
const value = ref('')
const options = ref([
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google' },
  { value: 'azure', label: 'Azure' },
  { value: 'baidu', label: 'Baidu' },
])

const base_url = ref('')
const serve_url = ref('')
const api_key = ref('')
</script>

<style scoped>
.demo-collapse-position {
  width: 100%;
  height: 100%;
}

/* 重点：使用 :deep() 来覆盖 Element Plus 的子组件样式 */

/* :deep(.el-collapse-item__wrap) {
  background-color: #008cff !important;
  border: none;
} */

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
