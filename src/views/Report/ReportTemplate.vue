<template>
  <div class="report-template-view">
    <!-- 头部 -->
    <div class="header-section">
      <div class="header-content">
        <div class="title-container">
          <h1>报告模板管理</h1>
        </div>
        <p class="subtitle">创建、编辑和管理您的安全扫描报告模板</p>
      </div>
      <div class="folder-info" v-if="currentFolder">
        <i class="fas fa-folder"></i> {{ currentFolder.name }}
      </div>
    </div>

    <!-- 操作按钮 -->
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

      <!-- 文件夹选择按钮 -->
      <el-button
        class="action-button folder"
        type="info"
        @click="selectTemplateFolder"
      >
        <i class="fas fa-folder-open"></i> {{ currentFolder ? '切换文件夹' : '选择模板文件夹' }}
      </el-button>

      <el-button
        class="action-button"
        type="success"
        @click="loadTemplates"
        :disabled="!currentFolder"
      >
        <i class="fas fa-sync-alt"></i> 重新加载模板
      </el-button>
    </div>

    <!-- 加载提示 -->
    <div class="loading-section" v-if="loading">
      <el-icon class="is-loading">
        <loading />
      </el-icon>
      <span>加载模板中...</span>
    </div>

    <!-- 模板列表 -->
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

      <!-- 空状态 -->
      <div class="empty-templates" v-if="templates.length === 0 && !loading">
        <i class="fas fa-file-alt"></i>
        <h3>没有找到模板</h3>
        <p>请创建新模板或导入现有模板</p>
        <el-button type="primary" @click="createNewTemplate">创建新模板</el-button>
      </div>
    </div>

    <!-- 模板编辑对话框 -->
    <el-dialog
      v-model="editorVisible"
      :title="editorTitle"
      width="80%"
      custom-class="template-editor-dialog"
    >
      <!-- 编辑器主体 -->
      <div class="template-editor-container">
        <!-- 模板名称和默认标记 -->
        <div class="editor-header">
          <el-input
            v-model="currentTemplate.name"
            placeholder="输入模板名称"
            clearable
            class="template-name-input"
          />
          <div class="default-switch">
            <span class="switch-label">设为默认模板：</span>
            <el-switch v-model="currentTemplate.isDefault" />
          </div>
        </div>

        <!-- 功能工具栏 -->
        <div class="editor-toolbar">
          <div class="toolbar-left">
            <el-button circle @click="makeBold">
              <i class="fas fa-bold"></i>
            </el-button>
            <el-button circle @click="makeItalic">
              <i class="fas fa-italic"></i>
            </el-button>
            <el-button circle @click="makeUnderline">
              <i class="fas fa-underline"></i>
            </el-button>
            <el-button circle @click="makeUnorderedList">
              <i class="fas fa-list-ul"></i>
            </el-button>
            <el-button circle @click="makeOrderedList">
              <i class="fas fa-list-ol"></i>
            </el-button>
          </div>

          <div class="toolbar-right">
            <el-select v-model="selectedSection" placeholder="插入区块">
              <el-option
                v-for="item in sections"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-button type="primary" @click="insertSection">
              插入
            </el-button>
          </div>
        </div>

        <!-- 编辑/预览双栏 -->
        <div class="editor-content">
          <!-- Markdown 编辑器 -->
          <div class="editor-pane">
        <textarea
          ref="markdownTextarea"
          v-model="currentTemplate.content"
          class="markdown-editor"
          spellcheck="false"
          placeholder="输入Markdown格式的模板内容..."
        ></textarea>
          </div>

          <!-- 预览面板 -->
          <div class="preview-pane">
            <div class="preview-header">
              <el-icon><View /></el-icon>
              <h4>实时预览</h4>
            </div>
            <div class="preview-content" v-html="renderedContent"></div>
          </div>
        </div>
      </div>

      <!-- 对话框底部按钮 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editorVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTemplate">
            保存模板
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导入模板对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入模板"
      width="500px"
    >
      <div class="import-dialog">
        <p>请选择要导入的模板文件：</p>
        <el-upload
          class="import-upload"
          drag
          :auto-upload="false"
          :show-file-list="true"
          :on-change="handleImportFile"
          accept=".json"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖放文件到此处或 <em>点击选择文件</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              仅支持JSON格式文件
            </div>
          </template>
        </el-upload>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { UploadFilled, Loading } from '@element-plus/icons-vue'

export default {
  components: {
    UploadFilled,
    Loading
  },
  setup() {
    const templates = ref([])
    const loading = ref(false)
    const importDialogVisible = ref(false)
    const importFile = ref(null)

    // 当前选择的文件夹
    const currentFolder = ref(null)
    const defaultTemplateId = ref(null)

    const editorVisible = ref(false)
    const editorTitle = ref('编辑报告模板')

    const currentTemplate = reactive({
      id: '',
      name: '',
      content: '',
      isDefault: false,
      created: '',
    })

    // 解析 Markdown + 清洗
    const renderedContent = computed(() =>
      DOMPurify.sanitize(marked.parse(currentTemplate.content || '')),
    )

    // 区块下拉
    const sections = ref([
      { value: 'summary', label: '扫描概述' },
      { value: 'vulnerabilities', label: '漏洞清单' },
      { value: 'recommendations', label: '修复建议' },
      { value: 'risk_levels', label: '风险评级' },
      { value: 'compliance', label: '合规检查' },
      { value: 'executive_summary', label: '执行摘要' },
    ])
    const selectedSection = ref('')

    const markdownTextarea = ref(null)

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

    const sectionSnippets = {
      summary: `## 扫描概述\n\n- 扫描类型: \n- 扫描范围: \n- 时间范围: \n`,
      vulnerabilities: `## 漏洞清单\n\n| ID | 风险 | 描述 |\n| --- | --- | --- |\n| VUL-001 | 高 | 示例描述 |\n`,
      recommendations: `## 修复建议\n\n1. 建议一\n2. 建议二\n`,
      risk_levels: `## 风险评级\n\n| 等级 | 说明 |\n| --- | --- |\n| 高 | 立即处理 |\n`,
      compliance: `## 合规检查\n\n- 标准: \n- 结果: \n`,
      executive_summary: `## 执行摘要\n\n> 用一句话总结关键风险。\n`,
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

    /* ========== 文件系统操作 ========== */

    // 选择模板文件夹
    const selectTemplateFolder = async () => {
      try {
        const handle = await window.showDirectoryPicker({
          id: 'scanTemplateFolder',
          mode: 'readwrite'
        });

        // 验证权限
        if (await verifyPermission(handle, true)) {
          currentFolder.value = handle;
          // 保存文件夹处理程序以供后续使用
          localStorage.setItem('lastTemplateFolderHandle', JSON.stringify({
            name: handle.name
          }));

          // 加载模板
          loadTemplates();
        }
      } catch (error) {
        console.error('选择文件夹失败:', error);
        ElMessage.error(`选择文件夹失败: ${error.message || '用户取消操作'}`);
      }
    }

    // 验证文件夹权限
    const verifyPermission = async (handle, readWrite) => {
      const options = {};
      if (readWrite) {
        options.mode = 'readwrite';
      }

      if (await handle.queryPermission(options) === 'granted') {
        return true;
      }

      if (await handle.requestPermission(options) === 'granted') {
        return true;
      }

      return false;
    }

    // 加载模板
    const loadTemplates = async () => {
      if (!currentFolder.value) return;

      loading.value = true;
      templates.value = [];
      defaultTemplateId.value = null;

      try {
        // 检查默认模板文件
        let defaultFile;
        try {
          defaultFile = await currentFolder.value.getFileHandle('default.json', { create: true });
        } catch (error) {
          console.error('获取默认模板文件失败:', error);
        }

        // 读取默认模板ID
        if (defaultFile) {
          const defaultFileContent = await readFile(defaultFile);
          if (defaultFileContent) {
            try {
              const defaultData = JSON.parse(defaultFileContent);
              defaultTemplateId.value = defaultData.defaultTemplateId;
            } catch (parseError) {
              console.warn('解析默认模板文件失败:', parseError);
            }
          }
        }

        // 遍历文件夹，寻找模板文件
        for await (const entry of currentFolder.value.values()) {
          if (entry.kind === 'file' && entry.name.startsWith('tpl-') && entry.name.endsWith('.json')) {
            try {
              const fileHandle = entry;
              const templateContent = await readFile(fileHandle);

              if (templateContent) {
                try {
                  const template = JSON.parse(templateContent);

                  // 关键修复：从文件名中提取纯净的ID
                  // 文件名格式应为 tpl-<数字ID>.json
                  const pureId = entry.name
                    .replace('tpl-', '')  // 去除 tpl- 前缀
                    .replace('.json', ''); // 去除 .json 后缀

                  // 使用纯净ID作为模板ID
                  template.id = pureId;

                  // 标记是否为默认模板
                  template.isDefault = (pureId === defaultTemplateId.value);

                  templates.value.push(template);
                } catch (parseError) {
                  console.error(`解析模板文件 ${entry.name} 失败:`, parseError);
                }
              }
            } catch (fileError) {
              console.error(`读取模板文件 ${entry.name} 失败:`, fileError);
            }
          }
        }

        // 按创建时间排序
        templates.value.sort((a, b) =>
          new Date(b.created).getTime() - new Date(a.created).getTime()
        );

        ElMessage.success(`已加载 ${templates.value.length} 个模板`);
      } catch (error) {
        console.error('加载模板失败:', error);
        ElMessage.error(`加载模板失败: ${error.message}`);
      } finally {
        loading.value = false;
      }
    }

    // 文件读取工具函数
    const readFile = async (fileHandle) => {
      try {
        const file = await fileHandle.getFile();
        return await file.text();
      } catch (error) {
        console.error('读取文件失败:', error);
        ElMessage.error(`读取文件失败: ${error.message}`);
        return null;
      }
    }

    // 保存模板到文件
    const saveTemplateToFile = async (template) => {
      if (!currentFolder.value) {
        ElMessage.warning('请先选择模板文件夹');
        return false;
      }

      try {
        const cleanId = template.id.replace('tpl-', ''); // 移除已有前缀
        const fileName = `tpl-${cleanId}.json`; // 添加标准前缀
        // 创建或获取文件句柄
        const fileHandle = await currentFolder.value.getFileHandle(fileName, {
          create: true
        });

        // 获取写入权限
        if (!(await verifyPermission(fileHandle, true))) {
          ElMessage.error('没有文件写入权限');
          return false;
        }

        // 写入内容
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(template, null, 2));
        await writable.close();

        return true;
      } catch (error) {
        console.error('保存模板失败:', error);
        ElMessage.error(`保存模板失败: ${error.message}`);
        return false;
      }
    }

    // 保存默认模板ID
    const saveDefaultTemplate = async (templateId) => {
      if (!currentFolder.value) return;

      try {
        const defaultFile = await currentFolder.value.getFileHandle('default.json', { create: true });

        // 获取写入权限
        if (!(await verifyPermission(defaultFile, true))) {
          return false;
        }

        // 写入内容
        const writable = await defaultFile.createWritable();
        await writable.write(JSON.stringify({ defaultTemplateId: templateId }, null, 2));
        await writable.close();

        defaultTemplateId.value = templateId;
        return true;
      } catch (error) {
        console.error('设置默认模板失败:', error);
        ElMessage.error(`设置默认模板失败: ${error.message}`);
        return false;
      }
    }

    // 删除模板文件
    const deleteTemplateFile = async (template) => {
      if (!currentFolder.value) return false;

      try {
        const fileName = `tpl-${template.id}.json`;

        // 尝试获取文件句柄
        let fileHandle;
        try {
          fileHandle = await currentFolder.value.getFileHandle(fileName);
        } catch {
          return true; // 文件不存在，视为删除成功
        }

        // 检查删除权限
        if (!currentFolder.value.removeEntry) {
          ElMessage.error('您的浏览器不支持文件删除操作');
          return false;
        }

        // 删除文件
        await currentFolder.value.removeEntry(fileName);
        return true;
      } catch (error) {
        console.error('删除模板文件失败:', error);
        ElMessage.error(`删除模板文件失败: ${error.message}`);
        return false;
      }
    }

    /* ========== 模板 CRUD ========== */
    const createNewTemplate = () => {
      if (!currentFolder.value) {
        ElMessage.warning('请先选择模板文件夹');
        return;
      }

      editorTitle.value = '创建新模板'
      resetCurrentTemplate()
      editorVisible.value = true
    }

    const editTemplate = (tpl) => {
      const standardizedTpl = {
        ...tpl,
        id: tpl.id.replace('tpl-', '')
      };
      editorTitle.value = '编辑模板'
      Object.assign(currentTemplate, standardizedTpl);
      editorVisible.value = true
      nextTick(() => markdownTextarea.value?.focus())
    }

    const saveTemplate = async () => {
      if (!currentTemplate.id) {
        currentTemplate.id = Date.now().toString(); // 更简单的ID生成方式
        currentTemplate.created = new Date().toISOString();
      }

      // 更新预览HTML
      currentTemplate.preview = generatePreviewHtml(currentTemplate.name);

      try {
        // 保存到文件系统
        const saveSuccess = await saveTemplateToFile(currentTemplate);

        if (saveSuccess) {
          if (currentTemplate.isDefault) {
            await setAsDefault(currentTemplate);
          }

          // 更新本地列表
          const index = templates.value.findIndex(t => t.id === currentTemplate.id);
          if (index !== -1) {
            templates.value[index] = { ...currentTemplate };
          } else {
            templates.value.push({ ...currentTemplate });
          }

          ElMessage.success('模板保存成功');
          editorVisible.value = false;
        }
      } catch (error) {
        console.error('保存模板过程中出错:', error);
        ElMessage.error('模板保存失败');
      }
    }

    const setAsDefault = async (tpl) => {
      try {
        const success = await saveDefaultTemplate(tpl.id);
        if (success) {
          templates.value.forEach(t => {
            t.isDefault = t.id === tpl.id;
          });
          ElMessage.success(`已将 "${tpl.name}" 设为默认模板`);
        }
      } catch (error) {
        console.error('设置默认模板过程中出错:', error);
        ElMessage.error('设置默认模板失败');
      }
    }

    const deleteTemplate = async (tpl) => {
      try {
        ElMessageBox.confirm(
          `确定要删除模板 "${tpl.name}" 吗？此操作无法撤销。`,
          '删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(async () => {
          const deleteSuccess = await deleteTemplateFile(tpl);

          if (deleteSuccess) {
            // 如果是默认模板，清除默认设置
            if (tpl.isDefault) {
              await saveDefaultTemplate(null);
              defaultTemplateId.value = null;
            }

            // 从列表中移除
            templates.value = templates.value.filter(t => t.id !== tpl.id);

            // 如果列表不为空，设置第一个为默认
            if (tpl.isDefault && templates.value.length > 0) {
              await setAsDefault(templates.value[0]);
            }

            ElMessage.success('模板删除成功');
          }
        }).catch(() => {
          // 用户取消
        });
      } catch (error) {
        console.error('删除模板过程中出错:', error);
        ElMessage.error('模板删除失败');
      }
    }

    const resetCurrentTemplate = () => {
      const newId = Date.now().toString().slice(-5);
      Object.assign(currentTemplate, {
        id: newId,
        name: '未命名模板',
        content: '# 报告标题\n\n## 章节标题\n...',
        isDefault: false,
        created: new Date().toISOString(),
        preview: generatePreviewHtml('未命名模板'),
      });
    }

    // 生成模板预览HTML
    const generatePreviewHtml = (templateName) => {
      return `
        <div class="template-preview-content">
          <h3>${templateName}</h3>
          <div class="preview-stats">
            <span class="stat-item"><i class="fas fa-bug"></i> 漏洞: 0</span>
            <span class="stat-item"><i class="fas fa-chart-pie"></i> 风险评级: 中</span>
          </div>
          <div class="preview-sections">
            <p>扫描概述 | 漏洞列表 | 修复建议 | 合规检查</p>
          </div>
        </div>
      `;
    }

    // 导入模板对话框
    const importTemplate = () => {
      importDialogVisible.value = true;
    }

    // 处理导入文件
    const handleImportFile = (file) => {
      importFile.value = file.raw;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedTemplate = JSON.parse(e.target.result);

          // 验证模板结构
          if (!importedTemplate.id || !importedTemplate.name || !importedTemplate.content) {
            throw new Error('无效的模板格式');
          }

          // 生成预览
          importedTemplate.preview = generatePreviewHtml(importedTemplate.name);

          // 保存到文件系统
          const saveSuccess = await saveTemplateToFile(importedTemplate);

          if (saveSuccess) {
            templates.value.push(importedTemplate);
            ElMessage.success(`模板 "${importedTemplate.name}" 导入成功`);
            importDialogVisible.value = false;
          }
        } catch (error) {
          console.error('导入模板失败:', error);
          ElMessage.error(`导入失败: ${error.message || '文件格式无效'}`);
        }
      };

      reader.readAsText(importFile.value);
    }

    // 导出所有模板
    const exportAllTemplates = async () => {
      if (templates.value.length === 0) {
        ElMessage.warning('没有模板可导出');
        return;
      }

      try {
        const handle = await window.showDirectoryPicker({
          mode: 'readwrite',
          suggestedName: '扫描报告模板'
        });

        if (await verifyPermission(handle, true)) {
          // 创建导出文件夹
          const exportFolderName = `模板导出-${new Date().toISOString().slice(0, 10)}`;
          const exportFolder = await handle.getDirectoryHandle(exportFolderName, { create: true });

          // 导出每个模板
          for (const template of templates.value) {
            const fileHandle = await exportFolder.getFileHandle(`tpl-${template.id}.json`, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(template, null, 2));
            await writable.close();
          }

          // 导出默认模板设置
          if (defaultTemplateId.value) {
            const defaultFile = await exportFolder.getFileHandle('default.json', { create: true });
            const writable = await defaultFile.createWritable();
            await writable.write(JSON.stringify({ defaultTemplateId: defaultTemplateId.value }));
            await writable.close();
          }

          ElMessage.success(`已导出 ${templates.value.length} 个模板到文件夹 "${exportFolderName}"`);
        }
      } catch (error) {
        console.error('导出模板失败:', error);
        ElMessage.error(`导出失败: ${error.message || '用户取消操作'}`);
      }
    }

    // 初始化：检查是否有上次使用的文件夹
    onMounted(() => {
      const lastFolder = localStorage.getItem('lastTemplateFolderHandle');
      if (lastFolder) {
        try {
          const folderInfo = JSON.parse(lastFolder);
          document.querySelector('.action-button.folder').click();
        } catch (error) {
          console.error('解析上次文件夹失败:', error);
        }
      }
    })

    return {
      templates,
      editorVisible,
      editorTitle,
      currentTemplate,
      sections,
      selectedSection,
      renderedContent,
      markdownTextarea,
      loading,
      importDialogVisible,
      currentFolder,

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
      exportAllTemplates,
      handleImportFile,
      selectTemplateFolder,
      loadTemplates,
    }
  },
}
</script>

<style scoped>
/* 基础样式重置 */
.report-template-view {
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 2rem;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  height: auto;
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

.create-date,
.template-id {
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