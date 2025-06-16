<template>
  <el-menu
    :default-active="activeIndex"
    class="el-menu-demo"
    mode="horizontal"
    :ellipsis="false"
    @select="handleSelect"
  >
    <el-menu-item index="0" @click="goHome">
      <img style="height: 30px" src="@/assets/favicon.ico" alt="Element logo" />
    </el-menu-item>
    <el-menu-item index="1" @click="goScanHistory">扫描历史</el-menu-item>
    <el-menu-item index="2" @click="goDocument">报告生成</el-menu-item>
    <!-- <el-menu-item index="3" @click="goChat">聊天界面</el-menu-item> -->
    <el-menu-item index="-1" @click="goConfigList">用户配置</el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const activeIndex = ref(route.path === '/' ? '0' : route.path === '/scan-list' ? '1' : '1')

// 跳转函数
const goHome = () => {
  router.push('/')
  activeIndex.value = '0'
}
const goScanHistory = () => {
  router.push('/scan-history')
  activeIndex.value = '1'
}
const goDocument = () => {
  router.push('/report-templates')
  activeIndex.value = '2'
}
// const goChat = () => {
//   router.push('/chat')
//   activeIndex.value = '2'
// }
const goConfigList = () => {
  router.push('/config')
  activeIndex.value = '-1'
}

const handleSelect = (key: string) => {
  // 这里也可以用handleSelect做跳转
  // 但用显式的点击事件更灵活
  console.log('menu selected:', key)
}
</script>

<style scoped>
.el-menu--horizontal > .el-menu-item:nth-child(4) {
  margin-left: auto;
}
/* 示例代码 */
.el-menu {
  background-color: #171d2b;
  border: none;
  margin-bottom: 1rem;
  border-bottom: none !important;
  border-radius: var(--border-radius);
  box-shadow: #000000 0px 0px 13px 3px;
}
.el-menu-item {
  color: #ffffff !important;
  font-size: 16px;
  font-weight: 700;
  border-bottom: none !important;
  border-radius: var(--border-radius) !important;
}
.el-menu-item:hover,
.el-submenu__title:hover {
  background-color: rgb(14, 22, 43) !important;
  border-radius: var(--border-radius) !important;
}
.el-menu-item.is-active {
  background-color: rgb(17, 26, 45) !important;
  border-bottom: none !important;
  border-radius: var(--border-radius) !important;
}
</style>
