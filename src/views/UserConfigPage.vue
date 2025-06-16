<template>
  <div class="main-layout">
    <h1>用户配置</h1>
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
</template>

<script lang="ts" setup>
import ConfigSubView from './Config/ConfigSubView.vue'

function saveConfig() {
  console.log('保存配置')
}
</script>

<style scoped>
.main-layout {
  padding-left: 30px;
  padding-right: 30px;
}
.common-layout {
  border: 2px solid #e2e8f0;
  background: none;
  border-radius: 15px;
  padding: 20px;
}
.el-footer {
  text-align: right;
}
</style>
