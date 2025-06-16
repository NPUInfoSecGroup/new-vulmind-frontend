import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'

const base = import.meta.env.BASE_URL

console.log('Base URL:', base) // 输出当前的 BASE_URL，便于调试

const app = 'VulMind'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    meta: { title: app + ' - 主页' }, // 此处加自定义字段
    component: Dashboard,
  },
  {
    path: '/scan-history',
    name: 'ScanHistory',
    meta: { title: app + ' - 扫描记录' }, // 此处加自定义字段
    component: () => import('@/views/ScanHistory.vue'),
  },
  {
    path: '/report-templates',
    name: 'ReportTemplates',
    meta: { title: app + ' - 生成报告' }, // 此处加自定义字段
    component: () => import('@/views/ReportTemplate.vue'),
  },
  {
    path: '/chat',
    name: 'Chat',
    meta: { title: app + ' - 聊天' }, // 此处加自定义字段
    component: () => import('@/views/MessageView.vue'),
  },
  {
    path: '/config',
    name: 'Config',
    meta: { title: app + ' - 用户配置' }, // 此处加自定义字段
    component: () => import('@/views/UserConfigPage.vue'), // 显示扫描页内容
  },
]

const router = createRouter({
  history: createWebHistory(base), // 使用 HTML5 History 模式
  routes,
})
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

// 完全移除路由守卫
export default router
