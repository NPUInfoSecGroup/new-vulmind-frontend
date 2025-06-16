<!-- <template>
  <h1>扫描目标配置</h1>

  <div class="scan-target card">
    <div class="card-header">
      <i class="fas fa-bullseye" />
    </div>

    <div class="card-body">

      <div class="section">
        <div class="section-title">
          <i class="fas fa-globe-americas" />
          <span>目标配置</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="url">目标 URL：</label>
          <input
            id="url"
            v-model="targetUrl"
            type="text"
            placeholder="https://example.com"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="ipRange">IP 范围：</label>
          <input
            id="ipRange"
            v-model="ipRange"
            type="text"
            placeholder="192.168.1.1-192.168.1.255"
            class="form-input"
          />
        </div>
      </div>


      <div class="section">
        <div class="section-title">
          <i class="fas fa-tools" />
          <span>扫描工具配置</span>
        </div>

        <div class="form-group">
          <label class="form-label">选择工具：</label>
          <div class="tools-grid">
            <div v-for="(tool, index) in availableTools" :key="index" class="tool-option">
              <input
                type="checkbox"
                :id="'tool-' + index"
                :value="tool"
                v-model="selectedTools"
                class="tool-checkbox"
              />
              <label :for="'tool-' + index">{{ tool }}</label>
            </div>
          </div>
        </div>
      </div>


      <div class="section">
        <div class="section-title">
          <i class="fas fa-comment-alt" />
          <span>扫描建议</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="suggestions">额外参数或建议：</label>
          <textarea
            id="suggestions"
            v-model="suggestions"
            placeholder="请输入特定的扫描要求或建议..."
            class="form-textarea"
          ></textarea>
        </div>
      </div>


      <div class="actions">
        <button class="action-btn primary" @click="startScan">
          <i class="fas fa-play" />
          启动扫描
        </button>
        <button class="action-btn secondary" @click="resetForm">
          <i class="fas fa-redo" />
          重置
        </button>
      </div>
    </div>
  </div>
</template> -->

<template>
  <div class="main-layout">
    <h1>创建任务</h1>
    <el-form :model="form" label-width="auto" style="">
      <el-form-item label="任务名称">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="任务类型">
        <el-select v-model="form.type" placeholder="please select your zone">
          <el-option label="Zone one" value="shanghai" />
          <el-option label="Zone two" value="beijing" />
        </el-select>
      </el-form-item>
      <el-form-item label="任务目标">
        <el-input v-model="form.target" />
      </el-form-item>
      <el-form-item label="MCP插件">
        <el-checkbox-group>
          <el-checkbox v-for="item in toolkit" :key="item.value" :label="item.name"> </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="提示词">
        <el-input v-model="form.desc" type="textarea" />
      </el-form-item>
      <el-form-item class="actions">
        <el-button type="primary" @click="onSubmit">Create</el-button>
        <el-button>Cancel</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

// do not use same name with ref
const form = reactive({
  target: '',
  name: '',
  type: '',
  desc: '',
  tools: [],
  suggestions: '',
})

const toolkit = reactive([
  { name: 'fenjing', value: 0 },
  { name: 'fscan', value: 1 },
  { name: 'dirsearch', value: 2 },
  { name: 'curl', value: 3 },
  { name: 'githack', value: 4 },
  { name: 'ds_store_exp', value: 5 },
  { name: 'gotoscan', value: 6 },
  { name: 'SQLMap', value: 7 },
  { name: 'xss', value: 8 },
])

const onSubmit = () => {
  console.log('submit!')
}
</script>
<!-- <script lang="ts">
export default {
  name: 'ScanTarget',
  data() {
    return {
      targetUrl: '',
      ipRange: '',
      availableTools: [
        'fenjing',
        'fscan',
        'dirsearch',
        'curl',
        'githack',
        'ds_store_exp',
        'gotoscan',
        'SQLMap',
        'xss',
      ],
      selectedTools: [],
      suggestions: '',
    }
  },
  methods: {
    startScan() {
      // 表单验证逻辑
      if (!this.targetUrl && !this.ipRange) {
        alert('请至少输入一个目标URL或IP范围')
        return
      }

      if (this.selectedTools.length === 0) {
        alert('请至少选择一个扫描工具')
        return
      }

      console.log('开始扫描配置：', {
        targetUrl: this.targetUrl,
        ipRange: this.ipRange,
        tools: this.selectedTools,
        suggestions: this.suggestions,
      })

      // 实际扫描逻辑
      alert(`扫描已启动！使用工具：${this.selectedTools.join(', ')}`)

      // TODO: 调用API启动扫描
      // this.$store.dispatch('startScan', {
      //   targetUrl: this.targetUrl,
      //   ipRange: this.ipRange,
      //   tools: this.selectedTools,
      //   suggestions: this.suggestions
      // });
    },
    resetForm() {
      this.targetUrl = ''
      this.ipRange = ''
      this.selectedTools = []
      this.suggestions = ''
    },
  },
}
</script> -->

<style scoped>
.main-layout {
  padding-left: 30px;
  padding-right: 30px;
}
.actions {
  display: flex;
  justify-content: flex-end;
}
</style>
