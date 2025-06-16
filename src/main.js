import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/styles/main.css'
import { createPinia } from 'pinia'

// 创建Vue应用实例
const app = createApp(App)

// 使用插件
app.use(ElementPlus)
app.use(router)
app.use(createPinia())

// 挂载应用
app.mount('#app')

// 移除DOMContentLoaded事件监听器
