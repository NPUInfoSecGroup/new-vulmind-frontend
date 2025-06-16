import { defineStore } from 'pinia'

export const useScanStore = defineStore('scan', {
  state: () => ({
    currentScan: {
      status: 'idle',
      progress: 0,
      targets: [],
      requirements: '',
      selectedPlugins: [],
      scanDepth: 5,
      vulnerabilities: [],
      startTime: null,
      endTime: null,
      error: null,
    },
    validationTools: [
      { id: 1, name: 'ExploitDB 验证', value: 'exploitdb' },
      { id: 2, name: '自定义验证脚本', value: 'custom' },
      { id: 3, name: 'MCP 验证框架', value: 'mcp', disabled: true },
    ],
    plugins: [
      { id: 1, name: 'SQLMap (SQL 注入检测)', value: 'sqlmap' },
      { id: 2, name: 'OWASP ZAP (综合扫描)', value: 'zap' },
      { id: 3, name: 'NMAP (端口与服务扫描)', value: 'nmap' },
      { id: 4, name: 'Dirsearch (目录扫描)', value: 'dirb' },
    ],
    scanHistory: [],
  }),

  getters: {
    scanDuration(state) {
      if (!state.currentScan.startTime) return 0
      const end = state.currentScan.endTime || new Date()
      return Math.round((end - state.currentScan.startTime) / 1000)
    },
    firstTarget(state) {
      return state.currentScan.targets?.[0] || 'N/A'
    },
  },

  actions: {
    setScanTargets(targets) {
      this.currentScan.targets = targets
    },
    setScanRequirements(req) {
      this.currentScan.requirements = req
    },
    setSelectedPlugins(plugins) {
      this.currentScan.selectedPlugins = plugins
    },
    setScanDepth(depth) {
      this.currentScan.scanDepth = depth
    },
    startScan() {
      this.currentScan = {
        ...this.currentScan,
        status: 'scanning',
        progress: 0,
        vulnerabilities: [],
        startTime: new Date(),
        endTime: null,
        error: null,
      }

      const intervalId = setInterval(() => {
        if (this.currentScan.status === 'cancelled') {
          clearInterval(intervalId)
          return
        }
        this.currentScan.progress = Math.min(this.currentScan.progress + 5, 95)
      }, 500)

      // 模拟异步任务
      setTimeout(() => {
        clearInterval(intervalId)
        try {
          const results = [
            {
              id: 'vuln-1',
              name: 'SQL 注入漏洞',
              target: this.currentScan.targets[0] || 'http://example.com/login',
              severity: 'critical',
              cve: 'CVE-2023-12345',
              description: '在登录接口发现 SQL 注入漏洞',
              status: 'pending',
            },
            {
              id: 'vuln-2',
              name: '跨站脚本漏洞 (XSS)',
              target: this.currentScan.targets[0] || 'http://example.com/feedback',
              severity: 'high',
              cve: 'CVE-2023-54321',
              description: '在用户反馈表单中发现存储型 XSS 漏洞',
              status: 'pending',
            },
          ]
          this.completeScan(results)
        } catch (e) {
          this.setScanFailed(e.message)
        }
      }, 4000)
    },
    completeScan(results) {
      const completedState = {
        ...this.currentScan,
        status: 'completed',
        progress: 100,
        vulnerabilities: results,
        endTime: new Date(),
      }

      this.currentScan = completedState

      const historyEntry = JSON.parse(JSON.stringify(completedState))
      historyEntry.id = Date.now().toString()
      this.scanHistory.unshift(historyEntry)

      if (this.scanHistory.length > 50) {
        this.scanHistory.pop()
      }
    },
    setScanFailed(error) {
      this.currentScan = {
        ...this.currentScan,
        status: 'failed',
        error,
        endTime: new Date(),
      }
    },
    cancelScan() {
      this.currentScan = {
        ...this.currentScan,
        status: 'cancelled',
        endTime: new Date(),
      }
    },
  },
})
