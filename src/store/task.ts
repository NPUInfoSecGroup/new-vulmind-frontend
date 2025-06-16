// types/task.ts

export interface Bug {
  id: string
  name: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  cve: string
  target: string
  timestamp: Date
}

export interface Task {
  id: string
  name: string
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  startTime: Date
  endTime: Date | null
  error: string | null
  buglist: Bug[]
}
