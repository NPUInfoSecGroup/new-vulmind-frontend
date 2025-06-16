<template>
  <div class="report-template-view">
    <!-- ========== 头部 ========== -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-container">
          <i class="fas fa-file-alt"></i>
          <h1>报告模板管理</h1>
        </div>
        <p class="subtitle">创建、编辑和管理您的安全扫描报告模板</p>
      </div>
      <div class="header-decoration">
        <div class="decoration-item"></div>
        <div class="decoration-item"></div>
        <div class="decoration-item"></div>
      </div>
    </div>

    <!-- ========== 操作按钮 ========== -->
    <div class="action-section">
      <el-button type="primary" class="action-button" @click="createNewTemplate">
        <i class="fas fa-plus"></i> 创建新模板
      </el-button>
      <el-button class="action-button secondary" @click="importTemplate">
        <i class="fas fa-file-import"></i> 导入模板
      </el-button>
      <el-button class="action-button tertiary" @click="exportAllTemplates">
        <i class="fas fa-file-export"></i> 批量导出
      </el-button>
    </div>

    <!-- ========== 模板列表 ========== -->
    <div class="template-list">
      <div
          class="template-card"
          v-for="template in templates"
          :key="template.id"
          :class="{ 'default-template': template.isDefault }"
      >
        <div class="card-header">
          <div class="template-meta">
            <span class="template-name">{{ template.name }}</span>
            <span v-if="template.isDefault" class="default-badge">
              <i class="fas fa-star"></i> 默认模板
            </span>
          </div>

          <div class="template-actions">
            <el-tooltip effect="dark" content="编辑模板" placement="top">
              <el-button circle @click="editTemplate(template)">
                <i class="fas fa-edit"></i>
              </el-button>
            </el-tooltip>

            <el-tooltip
                effect="dark"
                :content="template.isDefault ? '已是默认模板' : '设为默认模板'"
                placement="top"
            >
              <el-button
                  circle
                  :type="template.isDefault ? 'success' : ''"
                  @click="setAsDefault(template)"
              >
                <i class="fas" :class="template.isDefault ? 'fa-check' : 'fa-star'"></i>
              </el-button>
            </el-tooltip>

            <el-tooltip effect="dark" content="删除模板" placement="top">
              <el-button circle type="danger" @click="deleteTemplate(template)">
                <i class="fas fa-trash"></i>
              </el-button>
            </el-tooltip>
          </div>
        </div>

        <div class="template-preview">
          <div class="preview-content" v-html="template.preview"></div>
        </div>

        <div class="card-footer">
          <div class="footer-info">
            <span class="create-date">
              <i class="fas fa-calendar-alt"></i> 创建于: {{ template.created }}
            </span>
            <span class="template-id">
              <i class="fas fa-fingerprint"></i> ID: {{ template.id }}
            </span>
          </div>
        </div>
      </div>

      <!-- 添加新模板卡片 -->
      <div class="template-card add-new" @click="createNewTemplate">
        <div class="add-new-content">
          <i class="fas fa-plus-circle"></i>
          <span>添加新模板</span>
        </div>
      </div>
    </div>

    <!-- ========== 模板编辑对话框 ========== -->
    <el-dialog
        v-model="editorVisible"
        :title="editorTitle"
        width="80%"
        custom-class="template-editor-dialog"
    >
      <div class="template-editor-container">
        <!-- ====== 顶部输入 ====== -->
        <div class="editor-header">
          <el-input v-model="currentTemplate.name" placeholder="模板名称" />
          <el-switch
              v-model="currentTemplate.isDefault"
              active-text="设为默认模板"
              inactive-text=""
          />
        </div>

        <!-- ====== 工具栏 ====== -->
        <div class="editor-toolbar">
          <div class="toolbar-left">
            <!-- 粗斜下 -->
            <el-button-group>
              <el-tooltip effect="dark" content="加粗" placement="top">
                <el-button @click="makeBold">
                  <i class="fas fa-bold"></i>
                </el-button>
              </el-tooltip>
              <el-tooltip effect="dark" content="斜体" placement="top">
                <el-button @click="makeItalic">
                  <i class="fas fa-italic"></i>
                </el-button>
              </el-tooltip>
              <el-tooltip effect="dark" content="下划线" placement="top">
                <el-button @click="makeUnderline">
                  <i class="fas fa-underline"></i>
                </el-button>
              </el-tooltip>
            </el-button-group>

            <!-- 列表 -->
            <el-button-group>
              <el-tooltip effect="dark" content="无序列表" placement="top">
                <el-button @click="makeUnorderedList">
                  <i class="fas fa-list-ul"></i>
                </el-button>
              </el-tooltip>
              <el-tooltip effect="dark" content="有序列表" placement="top">
                <el-button @click="makeOrderedList">
                  <i class="fas fa-list-ol"></i>
                </el-button>
              </el-tooltip>
            </el-button-group>

            <!-- 链接 / 图片 -->
            <el-button-group>
              <el-tooltip effect="dark" content="插入链接" placement="top">
                <el-button @click="insertLink">
                  <i class="fas fa-link"></i>
                </el-button>
              </el-tooltip>
              <el-tooltip effect="dark" content="插入图片" placement="top">
                <el-button @click="insertImage">
                  <i class="fas fa-image"></i>
                </el-button>
              </el-tooltip>
            </el-button-group>
          </div>

          <!-- 右侧下拉区块 -->
          <div class="toolbar-right">
            <el-select
                v-model="selectedSection"
                placeholder="添加区块"
                class="section-select"
            >
              <el-option
                  v-for="section in sections"
                  :key="section.value"
                  :label="section.label"
                  :value="section.value"
              />
            </el-select>
            <el-button type="primary" plain @click="insertSection">
              <i class="fas fa-plus"></i> 插入区块
            </el-button>
          </div>
        </div>

        <!-- ====== 编辑器 + 预览 ====== -->
        <div class="editor-content">
          <textarea
              ref="markdownTextarea"
              v-model="currentTemplate.content"
              class="markdown-editor"
              placeholder="在此输入Markdown格式的报告模板..."
          ></textarea>

          <div class="preview-pane">
            <div class="preview-header">
            <h4><i class="fas fa-eye"></i> 实时预览</h4>
            </div>
            <div class="preview-content">
            <div v-html="renderedContent"></div>
            </div>
            </div>
        </div>
      </div>

      <!-- ====== Dialog 底部按钮 ====== -->
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editorVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTemplate">保存模板</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export default {
  setup() {
    // 报告模板数据
    const templates = ref([
      {
        id: 'tpl-001',
        name: '标准技术报告',
        isDefault: true,
        created: '2023-08-12',
        content: '# 安全扫描报告\n\n## 扫描概述\n...',
        preview: `<div class="template-preview-content">
          <h3>安全扫描报告</h3>

          <div class="preview-stats">
            <span class="stat-item"><i class="fas fa-bug"></i>
 漏洞: 12</span>

            <span class="stat-item"><i class="fas fa-exclamation-triangle"></i>
 严重: 3</span>

          </div>

          <div class="preview-sections">
            <p>扫描概述 | 漏洞列表 | 修复建议</p>

          </div>

        </div>
`
      },
      {
        id: 'tpl-002',
        name: '管理层摘要报告',
        isDefault: false,
        created: '2023-09-01',
        content: '# 安全风险摘要\n\n## 关键发现\n...',
        preview: `<div class="template-preview-content">
          <h3>安全风险摘要</h3>

          <div class="preview-stats">
            <span class="stat-item"><i class="fas fa-chart-pie"></i>
 风险评级: 高</span>

            <span class="stat-item"><i class="fas fa-clock"></i>
 预计修复: 3天</span>

          </div>

          <div class="preview-sections">
            <p>执行摘要 | 风险评级 | 行动计划</p>

          </div>

        </div>
`
      },
      {
        id: 'tpl-003',
        name: '合规审计报告',
        isDefault: false,
        created: '2023-09-15',
        content: '# 合规审计报告\n\n## 审计范围\n...',
        preview: `<div class="template-preview-content">
          <h3>合规审计报告</h3>

          <div class="preview-stats">
            <span class="stat-item"><i class="fas fa-shield-alt"></i>
 合规项: 28</span>

            <span class="stat-item"><i class="fas fa-times-circle"></i>
 不合规: 5</span>

          </div>

          <div class="preview-sections">
            <p>审计范围 | 合规检查 | 改进建议</p>

          </div>

        </div>
`
      }
    ])

    const editorVisible = ref(false)
    const editorTitle = ref('编辑报告模板')

    const currentTemplate = reactive({
      id: '',
      name: '',
      content: '',
      isDefault: false,
      created: ''
    })

    // 解析 Markdown + 清洗
    const renderedContent = computed(() =>
        DOMPurify.sanitize(marked.parse(currentTemplate.content || ''))
    )

    // 区块下拉
    const sections = ref([
      { value: 'summary', label: '扫描概述' },
      { value: 'vulnerabilities', label: '漏洞清单' },
      { value: 'recommendations', label: '修复建议' },
      { value: 'risk_levels', label: '风险评级' },
      { value: 'compliance', label: '合规检查' },
      { value: 'executive_summary', label: '执行摘要' }
    ])
    const selectedSection = ref('')

    /* ========== DOM 引用 ========== */
    const markdownTextarea = ref(null)

    /* ========== 文本操作助手 ==========
       根据光标位置/选区，插入或包装 Markdown 语法
    ================================== */
    const wrapSelection = (before, after = '') => {
      const el = markdownTextarea.value
      if (!el) return

      const start = el.selectionStart
      const end = el.selectionEnd
      const original = currentTemplate.content

      const selectedText = original.slice(start, end)
      const newText = before + selectedText + after

      currentTemplate.content = original.slice(0, start) + newText + original.slice(end)

      // 将光标放回插入后的文本中
      nextTick(() => {
        el.focus()
        el.selectionStart = start + before.length
        el.selectionEnd = start + before.length + selectedText.length
      })
    }

    const prependLines = (prefixCb) => {
      const el = markdownTextarea.value
      if (!el) return

      const start = el.selectionStart
      const end = el.selectionEnd
      const original = currentTemplate.content

      const beforeSel = original.slice(0, start)
      const sel = original.slice(start, end)
      const afterSel = original.slice(end)

      const lines = sel.split('\n')
      const newLines = lines.map((l, idx) => prefixCb(idx, l) + l)
      currentTemplate.content = beforeSel + newLines.join('\n') + afterSel
    }

    /* ========== 工具栏行为实现 ========== */
    const makeBold = () => wrapSelection('**', '**')
    const makeItalic = () => wrapSelection('_', '_')
    // Markdown 本身没下划线，用内联 HTML
    const makeUnderline = () => wrapSelection('<u>', '</u>')

    const makeUnorderedList = () => prependLines(() => '- ')
    const makeOrderedList = () => prependLines((i) => `${i + 1}. `)

    const insertLink = () => {
      const url = window.prompt('请输入链接 URL')
      if (!url) return
      const text = window.prompt('显示文本（可留空使用 URL）') || url
      wrapSelection(`[${text}](${url})`)
    }

    const insertImage = () => {
      const url = window.prompt('请输入图片 URL')
      if (!url) return
      const alt = window.prompt('图片替代文字（alt）') || ''
      wrapSelection(`![${alt}](${url})`)
    }

    /* ========== 插入区块 ==========
       按 selectedSection 插入 Markdown 片段
    ================================== */
    const sectionSnippets = {
      summary: `## 扫描概述\n\n- 扫描类型: \n- 扫描范围: \n- 时间范围: \n`,
      vulnerabilities: `## 漏洞清单\n\n| ID | 风险 | 描述 |\n| --- | --- | --- |\n| VUL-001 | 高 | 示例描述 |\n`,
      recommendations: `## 修复建议\n\n1. 建议一\n2. 建议二\n`,
      risk_levels: `## 风险评级\n\n| 等级 | 说明 |\n| --- | --- |\n| 高 | 立即处理 |\n`,
      compliance: `## 合规检查\n\n- 标准: \n- 结果: \n`,
      executive_summary: `## 执行摘要\n\n> 用一句话总结关键风险。\n`
    }

    const insertSection = () => {
      if (!selectedSection.value) {
        ElMessage.warning('请选择区块类型')
        return
      }
      const snippet = sectionSnippets[selectedSection.value]
      wrapSelection('\n' + snippet + '\n')
      selectedSection.value = ''
    }

    /* ========== 模板 CRUD ========== */
    const createNewTemplate = () => {
      editorTitle.value = '创建新模板'
      resetCurrentTemplate()
      editorVisible.value = true
    }

    const editTemplate = (tpl) => {
      editorTitle.value = '编辑模板'
      Object.assign(currentTemplate, tpl)
      editorVisible.value = true
      nextTick(() => markdownTextarea.value?.focus())
    }

    const saveTemplate = () => {
      if (!currentTemplate.id) {
        currentTemplate.id = `tpl-${Date.now()}`
        currentTemplate.created = new Date().toLocaleDateString()
        templates.value.push({ ...currentTemplate })
      } else {
        const idx = templates.value.findIndex((t) => t.id === currentTemplate.id)
        if (idx !== -1) templates.value[idx] = { ...currentTemplate }
      }
      editorVisible.value = false
    }

    const setAsDefault = (tpl) => {
      templates.value.forEach((t) => (t.isDefault = t.id === tpl.id))
    }

    const deleteTemplate = (tpl) => {
      templates.value = templates.value.filter((t) => t.id !== tpl.id)
      if (tpl.isDefault && templates.value.length) templates.value[0].isDefault = true
    }

    const resetCurrentTemplate = () => {
      Object.assign(currentTemplate, {
        id: '',
        name: '未命名模板',
        content: '# 报告标题\n\n## 章节标题\n...',
        isDefault: false,
        created: ''
      })
    }

    const importTemplate = () => ElMessage.info('导入功能开发中')
    const exportAllTemplates = () => ElMessage.success('所有模板已导出')

    /* ========== 导出到模板 ========== */
    return {
      templates,
      editorVisible,
      editorTitle,
      currentTemplate,
      sections,
      selectedSection,
      renderedContent,
      markdownTextarea,

      // toolbar
      makeBold,
      makeItalic,
      makeUnderline,
      makeUnorderedList,
      makeOrderedList,
      insertLink,
      insertImage,
      insertSection,

      // CRUD
      createNewTemplate,
      editTemplate,
      saveTemplate,
      setAsDefault,
      deleteTemplate,
      importTemplate,
      exportAllTemplates
    }
  }
}
</script>


<style scoped>
/* 基础样式重置 */
.report-template-view {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 2rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  min-height: 100vh;
  color: #e2e8f0;
}

/* 头部区域美化 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.7);
  border-radius: 16px;
  border: 1px solid rgba(100, 116, 139, 0.2);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.header-content {
  z-index: 2;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.title-container i {
  font-size: 2.5rem;
  color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

h1 {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0;
  color: #f8fafc;
  letter-spacing: 0.5px;
}

.subtitle {
  font-size: 1.1rem;
  color: #94a3b8;
  margin: 0;
  max-width: 600px;
  line-height: 1.6;
}

.header-decoration {
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 1rem;
}

.decoration-item {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(96, 165, 250, 0.5);
}

.decoration-item:nth-child(1) {
  background: rgba(96, 165, 250, 0.8);
  width: 16px;
  height: 16px;
}

.decoration-item:nth-child(2) {
  background: rgba(139, 92, 246, 0.6);
}

.decoration-item:nth-child(3) {
  background: rgba(52, 211, 153, 0.6);
}

/* 操作按钮区域美化 */
.action-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.action-button {
  border-radius: 10px;
  padding: 0.9rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 1rem;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.action-button i {
  font-size: 1.1rem;
}

.action-button.primary {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
}

.action-button.primary:hover {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(37, 99, 235, 0.3);
}

.action-button.secondary {
  background: rgba(30, 41, 59, 0.7);
  color: #cbd5e1;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.action-button.secondary:hover {
  background: rgba(51, 65, 85, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.action-button.tertiary {
  background: rgba(30, 41, 59, 0.7);
  color: #cbd5e1;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.action-button.tertiary:hover {
  background: rgba(51, 65, 85, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

/* 模板列表美化 */
.template-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.template-card {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(100, 116, 139, 0.2);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.template-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  border-color: rgba(96, 165, 250, 0.3);
}

.default-template {
  border: 2px solid rgba(234, 179, 8, 0.5);
  box-shadow: 0 0 0 3px rgba(234, 179, 8, 0.1);
}

.default-template .card-header {
  background: linear-gradient(90deg, rgba(234, 179, 8, 0.15), transparent);
}

.card-header {
  padding: 1.2rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(30, 41, 59, 0.5);
  border-bottom: 1px solid rgba(100, 116, 139, 0.2);
}

.template-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.template-name {
  font-weight: 600;
  font-size: 1.3rem;
  color: #f1f5f9;
}

.default-badge {
  background: rgba(234, 179, 8, 0.2);
  color: #fbbf24;
  font-size: 0.85rem;
  padding: 0.25rem 0.8rem;
  border-radius: 100px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  width: fit-content;
}

.template-actions {
  display: flex;
  gap: 0.5rem;
}

.template-actions .el-button {
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(100, 116, 139, 0.2);
  color: #94a3b8;
  transition: all 0.2s ease;
}

.template-actions .el-button:hover {
  background: rgba(51, 65, 85, 0.7);
  transform: scale(1.1);
}

.template-preview {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  align-items: center;
}

.preview-content {
  width: 100%;
}

.template-preview-content {
  width: 100%;
}

.template-preview-content h3 {
  font-size: 1.5rem;
  color: #e2e8f0;
  margin-top: 0;
  margin-bottom: 1rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.template-preview-content h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background: #60a5fa;
  border-radius: 3px;
}

.preview-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #94a3b8;
}

.stat-item i {
  color: #60a5fa;
  font-size: 1.1rem;
}

.preview-sections {
  background: rgba(30, 41, 59, 0.4);
  padding: 1rem;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #cbd5e1;
  line-height: 1.6;
}

.card-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(100, 116, 139, 0.2);
}

.footer-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #94a3b8;
}

.create-date, .template-id {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-new {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: rgba(15, 23, 42, 0.4);
  border: 2px dashed rgba(100, 116, 139, 0.4);
  transition: all 0.3s ease;
}

.add-new:hover {
  border-color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
  transform: translateY(-5px);
}

.add-new-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #94a3b8;
  transition: all 0.3s ease;
}

.add-new-content i {
  font-size: 3rem;
  color: #60a5fa;
}

.add-new:hover .add-new-content {
  color: #e2e8f0;
  transform: scale(1.05);
}

/* 编辑器对话框美化 */
.template-editor-dialog {
  border-radius: 16px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border: 1px solid rgba(100, 116, 139, 0.3);
  max-width: 1200px;
}

.template-editor-dialog .el-dialog__header {
  background: rgba(15, 23, 42, 0.8);
  border-bottom: 1px solid rgba(100, 116, 139, 0.2);
  margin: 0;
  padding: 1.2rem 1.5rem;
}

.template-editor-dialog .el-dialog__title {
  color: #f1f5f9;
  font-weight: 600;
  font-size: 1.3rem;
}

.template-editor-dialog .el-dialog__body {
  padding: 0;
}

.template-editor-dialog .el-dialog__headerbtn {
  top: 1.2rem;
  color: #94a3b8;
}

.template-editor-dialog .el-dialog__headerbtn:hover {
  color: #f8fafc;
}

.template-editor-container {
  padding: 1.5rem;
}

.editor-header {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.editor-header .el-input {
  flex-grow: 1;
}

.editor-header .el-input__wrapper {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(100, 116, 139, 0.3);
  box-shadow: none;
  color: #e2e8f0;
  font-size: 1.1rem;
  padding: 0.8rem 1rem;
}

.editor-header .el-input__wrapper:hover {
  border-color: #60a5fa;
}

.editor-header .el-input__inner::placeholder {
  color: #64748b;
}

.editor-header .el-switch {
  height: 40px;
  display: flex;
  align-items: center;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  padding: 0.8rem;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 10px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(100, 116, 139, 0.2);
}

.toolbar-left {
  display: flex;
  gap: 0.8rem;
}

.toolbar-right {
  display: flex;
  gap: 0.8rem;
}

.editor-toolbar .el-button {
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(100, 116, 139, 0.2);
  color: #94a3b8;
  transition: all 0.2s ease;
}

.editor-toolbar .el-button:hover {
  background: rgba(51, 65, 85, 0.7);
  transform: translateY(-2px);
  color: #e2e8f0;
}

/* ---------- 编辑器主体 ---------- */
.editor-content {
  display: flex;
  gap: 1rem;
}

/* Markdown 编辑器 */
.markdown-editor {
  flex: 1;
  min-height: 400px;
  resize: vertical;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 1rem;
  line-height: 1.6;
  font-family: 'Fira Code', monospace;
}

.markdown-editor::placeholder {
  color: #64748b;
}

/* 预览面板 */
.preview-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(100, 116, 139, 0.3);
  border-radius: 10px;
  overflow: hidden;
}

.preview-header {
  padding: 0.8rem 1rem;
  background: rgba(30, 41, 59, 0.6);
  border-bottom: 1px solid rgba(100, 116, 139, 0.2);
}

.preview-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #f1f5f9;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-header i {
  color: #60a5fa;
}

.preview-pane .preview-content {
  padding: 1rem;
  overflow-y: auto;
  color: #cbd5e1;
}

/* ---------- Dialog 底部按钮 ---------- */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(30, 41, 59, 0.6);
  border-top: 1px solid rgba(100, 116, 139, 0.2);
}

.dialog-footer .el-button {
  border-radius: 8px;
  padding: 0.9rem 1.5rem;
  font-weight: 600;
}

.dialog-footer .el-button--primary {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  border: none;
  color: #fff;
}

.dialog-footer .el-button--primary:hover {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
}

.dialog-footer .el-button:not(.el-button--primary) {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(100, 116, 139, 0.3);
  color: #cbd5e1;
}

.dialog-footer .el-button:not(.el-button--primary):hover {
  background: rgba(51, 65, 85, 0.7);
}

/* ---------- 滚动条美化 ---------- */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.4);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.6);
}

::-webkit-scrollbar-track {
  background: transparent;
}
/* ===== Markdown 内联排版 ===== */
.preview-content h1,
.preview-content h2,
.preview-content h3,
.preview-content h4 {
  margin: 0.6em 0 0.4em;
  font-weight: 700;
}

.preview-content p {
  margin: 0.4em 0;
}

.preview-content strong {
  font-weight: 700;
}

.preview-content em {
  font-style: italic;
}

.preview-content code {
  font-family: 'Fira Code', monospace;
  padding: 0.15em 0.3em;
  background: rgba(100, 116, 139, 0.2);
  border-radius: 4px;
  font-size: 0.95em;
}

.preview-content pre code {
  display: block;
  padding: 1em;
  overflow-x: auto;
  border-radius: 8px;
}

</style>
