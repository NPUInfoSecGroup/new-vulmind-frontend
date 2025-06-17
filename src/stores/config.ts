import { defineStore } from 'pinia'

export interface ServeConfig {
  /** 服务器地址 */
  serverUrl: string
}

export interface LLMConfig {
  /** LLM 厂商 */
  modelProvider: 'openai' | 'azure' | 'anthropic' | 'google' | 'local'
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
      serverUrl: 'http://localhost:3000', // 默认服务器地址
    } as ServeConfig,
    llmConfig: {
      modelProvider: 'openai', // 默认模型提供商
      modelName: 'gpt-3.5-turbo', // 默认模型名称
      modelVersion: 'v1', // 默认模型版本
      modelParams: {}, // 模型参数
      APIKey: '', // API 密钥
      APIBaseUrl: '', // API 基础 URL
    } as LLMConfig,
  }),
  getters: {
    // 获取服务器地址
    getServerUrl: (state) => state.serveConfig.serverUrl,
    // 获取 LLM 配置
    getLLMConfig: (state) => state.llmConfig,
  },
  actions: {
    // 更新服务器地址
    updateServerUrl(url: string) {
      this.serveConfig.serverUrl = url
    },
    // 更新 LLM 配置
    updateLLMConfig(config: Partial<LLMConfig>) {
      this.llmConfig = { ...this.llmConfig, ...config }
    },
  },
})
