import { defineStore } from 'pinia'
// 后端基础地址
const API_BASE = 'http://localhost:3000' //前端测试
// ====== 数据接口定义 ======
// ScanResult 表示一次扫描的结果，由后端返回
export interface ScanResult {
  resultId: string // 结果唯一标识，由后端生成
  severity: 'low' | 'medium' | 'high' | 'critical' // 危险程度
  vulnType: string // 漏洞类型
  details: string // 漏洞详细信息
}

// Task 表示一个任务实体，后端在创建和查询时均返回此结构
export interface Task {
  id: string // 任务 ID，由后端生成
  startTime: string // 任务开始时间，ISO 格式，由后端设置
  name: string // 任务名称
  target: string // 任务目标，例如 URL 或 IP
  command: string // 后端执行的扫描指令
  status: 'pending' | 'running' | 'completed' | 'failed' // 任务状态
  results: ScanResult[] // 扫描结果列表，后端在任务完成或中途返回
}

// ====== Pinia Store 定义 ======
export const useTaskStore = defineStore('task', {
  state: () => ({
    // 存储所有历史任务
    tasks: [] as Task[],
  }),

  getters: {
    // 根据任务 ID 获取单个任务
    getById: (state) => {
      return (id: string) => state.tasks.find((t) => t.id === id)
    },
    // 各状态任务列表，方便前端分类展示
    pendingTasks: (state) => state.tasks.filter((t) => t.status === 'pending'),
    runningTasks: (state) => state.tasks.filter((t) => t.status === 'running'),
    completedTasks: (state) => state.tasks.filter((t) => t.status === 'completed'),
    failedTasks: (state) => state.tasks.filter((t) => t.status === 'failed'),
  },

  actions: {
    /**
     * 从后端拉取所有任务
     * 后端接口：GET /tasks
     * 返回示例：Task[]，包含 startTime
     */
    async fetchTasks() {
      try {
        console.log('Fetching tasks from backend...')
        const response = await fetch(`${API_BASE}/tasks`)
        const data: Task[] = await response.json()
        this.tasks = data
      } catch (error) {
        console.error('fetchTasks error:', error)
      }
    },

    /**
     * 新增任务
     * 后端接口：POST /tasks
     * 请求体：{ name, target, command}
     * 返回示例：完整 Task 对象，包含生成的 id 和 startTime
     */
    async addTask(task: Omit<Task, 'id' | 'results' | 'startTime'>) {
      try {
        console.log('Adding task:', task)
        const response = await fetch(`${API_BASE}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...task, results: [] }),
        })
        const newTask: Task = await response.json()
        this.tasks.push(newTask)
      } catch (error) {
        console.error('addTask error:', error)
      }
    },

    /**
     * 更新任务属性，如状态、指令或开始时间
     * 后端接口：PUT /tasks/{id}
     * 请求体：Partial<Task>，只需包含要更新的字段，如 startTime
     * 返回示例：更新后的 Task 对象
     */
    async updateTask(id: string, updates: Partial<Task>) {
      try {
        const response = await fetch(`${API_BASE}/tasks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        })
        const updated: Task = await response.json()
        const idx = this.tasks.findIndex((t) => t.id === id)
        if (idx !== -1) this.tasks.splice(idx, 1, updated)
      } catch (error) {
        console.error('updateTask error:', error)
      }
    },

    /**
     * 删除任务
     * 后端接口：DELETE /tasks/{id}
     * 不返回内容，HTTP 状态码 204
     */
    async removeTask(id: string) {
      try {
        await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' })
        this.tasks = this.tasks.filter((t) => t.id !== id)
      } catch (error) {
        console.error('removeTask error:', error)
      }
    },

    /**
     * 本地新增扫描结果
     * 若后端提供实时推送，可改为接收 WebSocket 或 SSE 更新
     */
    addResult(taskId: string, result: ScanResult) {
      const task = this.getById(taskId)
      if (task) {
        task.results.push(result)
      }
    },
    /**
     * 启动任务
     * 后端接口：POST /tasks/{id}/start
     * 请求体：空
     * 返回示例：更新后的 Task 对象（状态变为 running）
     */
    async startTask(id: string) {
      try {
        const response = await fetch(`${API_BASE}/tasks/${id}/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          throw new Error(`Failed to start task: ${response.status}`)
        }

        const updated: Task = await response.json()
        const idx = this.tasks.findIndex((t) => t.id === id)
        if (idx !== -1) this.tasks.splice(idx, 1, updated)
      } catch (error) {
        console.error('startTask error:', error)
        // 可选：将错误传递给调用者或显示错误提示
        throw error
      }
    },
    /**
     * 获取最近的任务列表
     * 这里假设最近任务是指最近 5 个任务
     */
    getRecentTasks(number): Task[] {
      console.log(number)
      if (number === undefined || number <= 0) {
        console.log('未指定数量，使用默认值 5')
        number = 5 // 默认返回最近 5 个任务
      }
      if (this.tasks.length < number) {
        console.log(`任务少于 ${number} 个，返回全部任务`)
        number = this.tasks.length // 如果任务少于 5 个，则返回所有任务
      }
      // 按 startTime 降序排序，返回最近的任务
      console.log(this.tasks.slice(number).reverse())
      return this.tasks.slice(-number).reverse() // 返回最近 5 个任务，按时间倒序
      // 这里可以根据实际需求调整返回数量或排序方式
    },
    getScanHistory() {
      return this.tasks
    },
  },
})
