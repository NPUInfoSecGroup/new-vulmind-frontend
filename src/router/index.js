import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'

const base = import.meta.env.BASE_URL

console.log('Base URL:', base) // 输出当前的 BASE_URL，便于调试

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/scan-history',
    name: 'ScanHistory',
    component: () => import('../views/ScanHistory.vue'),
  },
  {
    path: '/report-templates',
    name: 'ReportTemplates',
    component: () => import('../views/ReportTemplate.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(base), // 使用 HTML5 History 模式
  routes,
})

// 完全移除路由守卫
export default router
