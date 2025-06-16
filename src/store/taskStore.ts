// stores/taskStore.ts
import { defineStore } from 'pinia'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
  }),

  getters: {
    getById: (state) => (id) => {
      return state.tasks.find((task) => task.id === id)
    },
    activeTasks: (state) => state.tasks.filter((task) => task.status === 'in-progress'),
  },

  actions: {
    addTask(task) {
      this.tasks.push({
        ...task,
        id: task.id || Date.now().toString(),
        startTime: task.startTime || new Date(),
        status: task.status || 'pending',
        buglist: task.buglist || [],
      })
    },

    removeTask(id) {
      this.tasks = this.tasks.filter((t) => t.id !== id)
    },

    updateTask(id, patch) {
      const index = this.tasks.findIndex((t) => t.id === id)
      if (index !== -1) {
        this.tasks[index] = { ...this.tasks[index], ...patch }
      }
    },

    clearTasks() {
      this.tasks = []
    },

    setTaskStatus(id, status, error = null) {
      this.updateTask(id, {
        status,
        error,
        endTime: ['completed', 'failed', 'cancelled'].includes(status) ? new Date() : null,
      })
    },

    addBugToTask(taskId, bug) {
      const task = this.getById(taskId)
      if (task) {
        task.buglist.push({
          ...bug,
          id: bug.id || Date.now().toString(),
          timestamp: bug.timestamp || new Date(),
        })
      }
    },
  },
})
