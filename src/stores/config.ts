import { defineStore } from 'pinia'

export interface ServeConfig {
  /** 服务器地址 */
  dataServerUrl: string
  /** MCP 服务器地址 */
  mcpServerUrl: string
}

export interface LLMConfig {
  /** LLM 厂商 */
  modelProvider: string
  /** 模型名称 */
  modelName?: string
  /** 模型版本 */
  modelVersion?: string
  /** 模型参数 */
  modelParams?: Record<string, any>
  /** 模型 API 密钥 */
  APIKey?: string
  /** 模型 API 基础 URL */
  APIBaseUrl?: string
}

export const useConfigStore = defineStore('config', {
  state: () => ({
    serveConfig: {
      mcpServerUrl: 'http://localhost:8000', // 默认服务器地址
      dataServerUrl: 'http://localhost:9000', // 默认数据服务器地址
    } as ServeConfig,
    llmConfig: {
      modelProvider: 'deepseek', // 默认模型提供商
      modelName: 'v3', // 默认模型名称
      modelVersion: 'v1', // 默认模型版本
      modelParams: {}, // 模型参数
      APIKey: 'ds_sk_live_9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c', // API 密钥
      APIBaseUrl: 'https://api.deepseek.com', // API 基础 URL
    } as LLMConfig,
  }),
  getters: {
    // 获取服务器地址
    getMCPServerUrl: (state) => state.serveConfig.mcpServerUrl,
    getDataServerUrl: (state) => state.serveConfig.dataServerUrl,
    // 获取 LLM 配置
    getLLMConfig: (state) => state.llmConfig,
  },
  actions: {
    // 更新服务器地址
    updateDataServerUrl(url: string) {
      this.serveConfig.dataServerUrl = url
    },
    updateMCPServerUrl(url: string) {
      this.serveConfig.mcpServerUrl = url
    },
    // 更新 LLM 配置
    updateLLMConfig(config: Partial<LLMConfig>) {
      this.llmConfig = { ...this.llmConfig, ...config }
    },
  },
})
