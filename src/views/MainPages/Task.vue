<template>
  <div>
    <el-collapse>
      <el-collapse-item v-for="(type, index) in existTaskTypes" :key="index" :name="type.typeName">
        <template #title>
          <span>{{ type.typeName }}</span>
        </template>
        <el-table :data="filterTasksByType(type.typeName)" style="width: 100%" border>
          <el-table-column prop="date1" label="日期" sortable>
            <template #default="scope">
              <el-popover trigger="hover" placement="bottom" width="auto">
                <template #default>
                  <div>具体时间: {{ scope.row.date2 }}</div>
                </template>
                <template #reference>
                  <span>{{ scope.row.date1 }}</span>
                </template>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column prop="taskName" label="任务名称" />
          <el-table-column
            prop="taskStatus"
            label="任务状态"
            :filters="[
              { text: '已完成', value: true },
              { text: '未完成', value: false }
            ]"
            :filter-method="filterStatus"
            filter-placement="bottom-end"
          >
            <template #default="scope">
              <el-checkbox
                v-model="scope.row.taskStatus"
                @mousedown.prevent="updateTaskStatus(scope.row)"
              >
                {{ scope.row.taskStatus ? '已完成' : '未完成' }}
              </el-checkbox>
            </template>
          </el-table-column>
          <el-table-column prop="taskPriority" label="优先级" sortable="" />
          <el-table-column prop="taskDetail" label="任务细节">
            <template #default="scope">
              <el-popover trigger="hover" placement="bottom" width="auto">
                <template #default>
                  <div>{{ scope.row.taskDetail }}</div>
                </template>
                <template #reference>
                  <span>{{ formatTaskDetail(scope.row.taskDetail) }}</span>
                </template>
              </el-popover>
            </template>
          </el-table-column>
          <!-- 标签列，添加筛选功能 -->
          <el-table-column
            label="标签"
            prop="tags"
            :filters="getTagFilters(type.typeName)"
            :filter-method="filterTasksByTag"
            filter-placement="bottom-end"
          >
            <template #default="scope">
              <div>
                <el-tag v-for="(tag, index) in scope.row.tags" :key="index">
                  {{ tag.tagName }}
                </el-tag>
                <div id="editTagButton">
                  <!-- 添加修改按钮 -->
                  <el-button size="small" @click="openTagDialog(scope.row)">修改</el-button>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <div style="text-align: center">
                <el-button size="small" @click="openDialog(scope.row)">编辑</el-button>
                <br />
                <el-button size="small" type="danger" @click="handleDelete(scope.row.taskId)">
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-collapse-item>
    </el-collapse>
  </div>
  <el-dialog v-model="dialogFormVisible" title="编辑任务" width="500">
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      label-width="auto"
      status-icon
      :size="formSize"
      style="max-width: 600px"
    >
      <!-- 任务名称输入框 -->
      <el-form-item label="任务名称" prop="name">
        <el-input v-model="ruleForm.name" placeholder="告诉我接下来的安排？" />
      </el-form-item>
      <el-form-item label="任务类型" prop="existTaskTypes">
        <el-select v-model="ruleForm.existTaskTypes" placeholder="是哪种类型的任务呢">
          <el-option
            v-for="(item, index) in existTaskTypes"
            :key="index"
            :label="item.typeName"
            :value="item.taskTypeId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="截止时间" required>
        <el-col :span="11">
          <el-date-picker
            v-model="ruleForm.date1"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-col>
        <el-col :span="2" id="text-center">
          <span class="text-gray-500">-</span>
        </el-col>
        <el-col :span="11">
          <el-time-picker
            v-model="ruleForm.date2"
            placeholder="可以不选具体时间"
            style="width: 100%"
          />
        </el-col>
      </el-form-item>

      <!-- 优先级选择器 -->
      <el-form-item label="优先级" prop="priority">
        <el-segmented v-model="ruleForm.priority" :options="priorityOptions" />
      </el-form-item>

      <!-- 任务细节输入框 -->
      <el-form-item label="任务细节" prop="detail">
        <el-input v-model="ruleForm.detail" type="textarea" placeholder="和我说详细点儿呗" />
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item id="Button">
        <el-button @click="resetForm(ruleFormRef)">重置</el-button>
        <el-button type="primary" @click="updateTask(ruleFormRef)">提交</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

  <!-- 这个对话框用来增删改任务类型 -->
  <el-dialog v-model="taskTypeDialogVisible" title="编辑任务" width="500">
    <el-form
      ref="taskTypesFormRef"
      label-width="auto"
      :model="taskTypesForm"
      status-icon
      :rules="taskTypesFormRules"
      :size="formSize"
      style="max-width: 600px"
    >
      <el-table :data="taskTypesForm.existTaskTypes" style="width: 100%">
        <!-- 任务类型名称列 -->
        <el-table-column prop="typeName" label="任务类型" />
        <!-- 操作列 -->
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="openEditTaskTypeDialog(scope.row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="deleteTaskType(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div id="addTaskType">
        <el-form-item label="新增类型" prop="newTaskType">
          <el-input v-model="taskTypesForm.newTaskType" placeholder="想创建新的任务类型吗？" />
        </el-form-item>
        <!-- 操作按钮 -->
        <el-form-item id="Button">
          <el-button @click="cancelEditTaskTypes">取消</el-button>
          <el-button type="primary" @click="addTaskType(newTaskType)">添加</el-button>
        </el-form-item>
      </div>
    </el-form>
  </el-dialog>
  <!-- 编辑任务类型的对话框 -->
  <el-dialog v-model="editTaskTypeDialogVisible" title="编辑任务类型" width="500">
    <el-form
      ref="editTaskTypeFormRef"
      :model="editTaskTypeForm"
      label-width="auto"
      :rules="editTaskTypeFormRules"
    >
      <!-- 任务类型名称输入框 -->
      <el-form-item label="任务类型名称" prop="typeName">
        <el-input v-model="editTaskTypeForm.typeName" placeholder="请输入任务类型名称" />
      </el-form-item>
      <!-- 操作按钮 -->
      <div id="edit-buttons">
        <el-form-item>
          <el-button @click="cancelEditTaskType">取消</el-button>
          <el-button type="primary" @click="updateTaskType">提交</el-button>
        </el-form-item>
      </div>
    </el-form>
  </el-dialog>
  <!-- 标签修改对话框 -->
  <el-dialog v-model="tagDialogVisible" title="编辑标签" width="500">
    <el-form ref="tagFormRef" :model="tagForm" label-width="auto" :rules="tagFormRules" status-icon>
      <el-table :data="tagForm.tags" style="width: 100%">
        <!-- 标签名称 -->
        <el-table-column prop="tagName" label="标签" />
        <!-- 操作列 -->
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="scope">
            <el-button
              link
              type="primary"
              size="small"
              @click="openEditTagDialog(scope.row, taskId)"
              >编辑</el-button
            >
            <!-- 这里deleteTag传入的scope.row是tag对象，这个对象的id属性是tag.id -->
            <el-button link type="danger" size="small" @click="deleteTag(scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <div id="addTag">
        <el-form-item label="新增标签" prop="newTag">
          <el-input v-model="tagForm.newTag" placeholder="想创建新的标签吗？" />
        </el-form-item>
        <!-- 操作按钮 -->
        <el-form-item id="Button">
          <el-button @click="cancelEditTags">取消</el-button>
          <el-button type="primary" @click="addTagToTask">添加</el-button>
        </el-form-item>
      </div>
    </el-form>
  </el-dialog>
  <el-dialog v-model="editTagDialogVisible" title="编辑标签" width="400px">
    <el-form
      ref="editTagFormRef"
      :model="editTagForm"
      label-width="auto"
      :rules="editTagNameFormRules"
    >
      <el-form-item label="标签名称" prop="tagName">
        <el-input v-model="editTagForm.tagName" placeholder="新的名称？" />
      </el-form-item>
      <!-- 操作按钮 -->
      <el-form-item>
        <el-button @click="cancelEditTag">取消</el-button>
        <el-button type="primary" @click="submitEditTag">提交</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
  <div id="changeType">
    <el-button color="#08979c" plain @click="openTaskTypeDialog">修改任务类型</el-button>
  </div>
</template>

<script>
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  data() {
    return {
      tagDialogVisible: false,
      newTaskType: '',
      dialogFormVisible: false,
      taskTypeDialogVisible: false,
      editTaskTypeDialogVisible: false,
      typedialog: false, // 用于控制编辑标签对话框的显示
      editTagDialogVisible: false,

      ruleForm: {
        name: '',
        existTaskTypes: [],
        date1: null,
        date2: null,
        detail: '',
        priority: ''
      },
      taskTypesForm: {
        existTaskTypes: [],
        newTaskType: ''
      },
      tagForm: {
        tags: [],
        newTag: ''
      },
      // 编辑表单的数据
      editTagForm: {
        tagId: null, // 存储当前标签的ID
        tagName: '' // 存储当前标签的名称
      },
      rules: {
        name: [
          { required: true, message: '你一点计划都不做哒?!', trigger: 'blur' },
          { min: 2, max: 20, message: '至少写俩字儿呗', trigger: 'blur' }
        ],
        existTaskTypes: [{ required: true, message: '是什么类型呢', trigger: 'change' }],
        date1: [{ type: 'date', required: true, message: '这事儿啥时候结束啊', trigger: 'change' }],
        date2: [{ type: 'date', required: false }],
        priority: [{ required: true, message: '急不?不急晚点做', trigger: 'change' }],
        detail: [{ required: false }]
      },
      taskTypesFormRules: {
        newTaskType: [{ required: true, message: '唔，是什么类型？', trigger: 'blur' }]
      },
      editTaskTypeFormRules: {
        typeName: [{ required: true, message: '要修改吗？', trigger: 'blur' }]
      },
      tagFormRules: {
        newTag: [{ required: true, message: '是什么标签呢？', trigger: 'blur' }]
      },
      editTagNameFormRules: {
        tagName: [{ required: true, message: '要修改吗？', trigger: 'blur' }]
      },
      priorityOptions: ['高', '中', '低'],
      tasks: [],
      existTaskTypes: [],
      editTaskTypeForm: {
        // 编辑表单绑定的数据
        taskTypeId: '',
        typeName: ''
      }
    }
  },
  methods: {
    async fetchTasks() {
      const token = localStorage.getItem('token')
      try {
        this.fetchTaskTypes()
        const response = await axios.get('/api/tasks/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (response.data.code === 20039) {
          this.tasks = response.data.data.map((task) => ({
            ...task,
            taskStatus: task.taskStatus === '已完成' //转换布尔值
          }))

          localStorage.setItem('tasks', JSON.stringify(this.tasks))
        } else {
          this.$message.error(response.data.message)
        }
      } catch (error) {
        console.error(error)
        this.$message.error('请求... 失败...')
      }
    },
    async fetchTaskTypes() {
      const token = localStorage.getItem('token') // 从本地存储获取 token
      try {
        const response = await axios.get('/api/task-types/mine', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (response.data.code === 20039) {
          this.existTaskTypes = response.data.data // 存储任务类型
        } else {
          ElMessage.error(response.data.message)
        }
      } catch (error) {
        console.error(error)
        ElMessage.error('唔..获取任务类型失败...')
      }
    },
    async handleDelete(taskId) {
      // 添加确认框提示
      ElMessageBox.confirm('确定要删除此任务吗？', '删除任务', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const token = localStorage.getItem('token')
          try {
            const response = await axios.delete(`/api/tasks/${taskId}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
            if (response.data.code === 20039) {
              ElMessage.success('删除~成功！')
              // 重新获取任务列表以更新视图
              this.fetchTasks()
              this.fetchTaskTypes()
            } else {
              ElMessage.error('〒▽〒:' + response.data.message)
            }
          } catch (error) {
            console.error(error)
            ElMessage.error('失败...')
          }
        })
        .catch(() => {})
    },
    async openDialog(task) {
      this.ruleForm.name = task.taskName || '' // 使用 taskName
      this.ruleForm.existTaskTypes = task.taskType.taskTypeId || null // 获取 taskTypeId
      this.ruleForm.date1 = new Date(task.date1 + 'T00:00:00+08:00') // 确保是东八区
      this.ruleForm.date2 = task.date2 ? new Date(`1970-01-01T${task.date2}+08:00`) : null // 确保是东八区
      this.ruleForm.detail = task.taskDetail || '' // 使用 taskDetail
      this.ruleForm.priority = task.taskPriority || '' // 使用 taskPriority
      localStorage.setItem('currentTask', JSON.stringify(task))
      this.dialogFormVisible = true // 唤醒对话框
    },
    async openTaskTypeDialog() {
      this.taskTypesForm.newTaskType = ''
      try {
        // 调用现有的 fetchTaskTypes 获取数据
        await this.fetchTaskTypes()

        // 这里的 this.existTaskTypes 已经被 fetchTaskTypes 方法赋值
        // 将 existTaskTypes 赋值给表单的 existTaskTypes 字段
        this.taskTypesForm.existTaskTypes = this.existTaskTypes

        // 显示任务类型对话框
        this.taskTypeDialogVisible = true
      } catch (error) {
        console.error('唉？出错了:', error)
      }
    },
    resetForm() {
      const currentTask = JSON.parse(localStorage.getItem('currentTask')) // 从本地存储获取任务并解析

      if (currentTask) {
        // 确保 currentTask 存在
        this.ruleForm.name = currentTask.taskName || '' // 使用 taskName
        this.ruleForm.existTaskTypes = currentTask.taskType.taskTypeId || null // 获取 taskTypeId
        // 转换 date1 和 date2
        this.ruleForm.date1 = currentTask.date1
          ? new Date(currentTask.date1 + 'T00:00:00+08:00')
          : null
        this.ruleForm.date2 = currentTask.date2
          ? new Date(`1970-01-01T${currentTask.date2}+08:00`)
          : null
        this.ruleForm.detail = currentTask.taskDetail || '' // 使用 taskDetail
        this.ruleForm.priority = currentTask.taskPriority || '' // 使用 taskPriority
      } else {
        // 如果没有当前任务，可以重置表单到默认状态
        this.ruleForm = {
          name: '',
          existTaskTypes: null,
          date1: null,
          date2: null,
          description: '',
          priority: ''
        }
      }
    },
    filterTasksByType(typeName) {
      // 过滤符合任务类型的任务
      const filteredTasks = this.tasks.filter((task) => task.taskType.typeName === typeName)
      // 去重逻辑，确保不返回重复的任务
      const uniqueTasks = Array.from(new Set(filteredTasks.map((task) => task.taskId))).map((id) =>
        filteredTasks.find((task) => task.taskId === id)
      )

      return uniqueTasks
    },
    updateTaskStatus(task) {
      const newStatus = !task.taskStatus // 计算新状态
      const token = localStorage.getItem('token')
      const statusString = newStatus ? '已完成' : '未完成' // 根据布尔值生成正确的字符串
      ElMessageBox.confirm('确定要更改任务状态吗？', '更改任务状态', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(async () => {
          try {
            await axios.put(
              `/api/tasks/${task.taskId}`,
              {
                status: statusString
              },
              {
                headers: {
                  Authorization: `Bearer ${token}` // 添加 token 到 headers
                }
              }
            )
            ElMessage.success('更新~成功！( •̀ ω •́ )✧')
            task.taskStatus = newStatus // 更新实际状态
          } catch (error) {
            console.error('请求错误:', error.response.data) // 打印错误信息
            ElMessage.error('唔..失败')
          }
        })
        .catch(() => {
          // 取消时不做任何操作
        })
    },
    updateTask() {
      const token = localStorage.getItem('token') // 从本地存储获取 token
      const currentTask = JSON.parse(localStorage.getItem('currentTask')) // 获取当前任务

      if (currentTask) {
        const taskId = currentTask.taskId // 获取 taskId

        console.log(taskId)
        // 准备要发送的数据
        const updatedTask = {
          name: this.ruleForm.name,
          typeId: this.ruleForm.existTaskTypes,
          date1: this.ruleForm.date1
            ? new Date(this.ruleForm.date1.getTime() + 8 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0]
            : null, // 转换为 YYYY-MM-DD
          date2: this.ruleForm.date2
            ? new Date(this.ruleForm.date2.getTime() + 8 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[1]
                .substring(0, 8)
            : null, // 转换为 HH:MM:SS
          priority: this.ruleForm.priority
        }

        // 发送 PUT 请求
        axios
          .put(`/api/tasks/${taskId}`, updatedTask, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then((response) => {
            console.log('date1:', this.ruleForm.date1) // 调试输出
            console.log('date2:', this.ruleForm.date2) // 调试输出} else {
            ElMessage.success('更新~成功！( •̀ ω •́ )✧')
            this.dialogFormVisible = false // 关闭对话框
            this.resetForm() // 重置表单
            this.fetchTasks() // 重新获取任务列表
            this.fetchTaskTypes()
          })
          .catch((error) => {
            console.error(error)
            ElMessage.error('唔..失败了')
          })
      } else {
        ElMessage.error('没有找到当前任务信息。')
      }
    },

    formatTaskDetail(detail) {
      return detail.length > 8 ? detail.slice(0, 8) + '...' : detail
    },
    formatTags(row) {
      if (Array.isArray(row.tags) && row.tags.length > 0) {
        return row.tags.map((tag) => tag.tagName).join(', ') // 假设每个标签对象都有一个`name`属性
      }
      return '无标签' // 或者返回其他合适的默认值
    },
    filterStatus(value, row) {
      return row.taskStatus === value
    },
    // 新增任务类型
    async addTaskType() {
      // 首先手动验证表单，确保 taskTypesForm.newTaskType 不能为空
      this.$refs.taskTypesFormRef.validate(async (valid) => {
        if (valid) {
          const token = localStorage.getItem('token') // 从本地存储获取 token
          try {
            // 发送 POST 请求到后端
            const response = await axios.post(
              '/api/task-types',
              {
                typeName: this.taskTypesForm.newTaskType // 使用表单中的 newTaskType
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            )

            if (response.data.code === 20039) {
              // 添加成功后，将新任务类型加入到前端列表
              this.taskTypesForm.existTaskTypes.push(response.data.data)
              this.taskTypesForm.newTaskType = '' // 清空输入框
              ElMessage.success('任务类型添加成功!( •̀ ω •́ )✧')
              // 刷新视图
              this.$nextTick(() => {
                this.$refs.taskTypesFormRef.clearValidate() // 清除表单验证状态
              })
            } else {
              ElMessage.error('唔..添加任务类型失败:' + response.data.message)
            }
          } catch (error) {
            ElMessage.error('唔..添加任务类型失败:' + error)
          }
        } else {
          // 如果验证失败，显示错误信息
          ElMessage.error('请填写任务类型名称')
        }
      })
    },
    // 删除任务类型
    async deleteTaskType(taskType) {
      try {
        // 弹出输入框，提示用户输入任务类型名称进行确认
        const { value } = await ElMessageBox.prompt(
          `请输入任务类型名称 "${taskType.typeName}" 来确认删除:`,
          '删除确认',
          {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            inputPattern: new RegExp(`^${taskType.typeName}$`), // 正则校验输入的名称是否正确
            inputErrorMessage: '输入的名称不对哦~',
            type: 'warning' // 设置为警告类型
          }
        )

        // 如果用户输入正确的任务类型名称，执行删除操作
        if (value === taskType.typeName) {
          const token = localStorage.getItem('token') // 从本地存储获取 token
          const response = await axios.delete(`/api/task-types/${taskType.taskTypeId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })

          if (response.data.code === 20039) {
            // 删除成功后，移除前端的数据
            this.taskTypesForm.existTaskTypes = this.taskTypesForm.existTaskTypes.filter(
              (type) => type.taskTypeId !== taskType.taskTypeId
            )
            this.fetchTasks() // 重新获取任务数据
            ElMessage.success('删除成功!( •̀ ω •́ )✧')
          } else {
            ElMessage.error(response.data.message)
          }
        }
      } catch (error) {
        if (error === 'cancel') {
          // 如果用户取消了操作
          ElMessage.info('好好想想哦~')
        } else {
          // 处理其他错误
          ElMessage.error('嗯？失败: ' + error)
        }
      }
    },
    cancelEditTaskTypes() {
      this.newTaskType = '' // 清空输入框
      this.taskTypeDialogVisible = false // 关闭对话框
      this.$nextTick(() => {
        this.$refs.taskTypesFormRef.clearValidate() // 清除表单验证状态
      })
    },
    // 打开编辑任务类型对话框，并填充当前任务类型数据
    openEditTaskTypeDialog(taskType) {
      this.editTaskTypeForm.taskTypeId = taskType.taskTypeId
      this.editTaskTypeForm.typeName = taskType.typeName
      this.editTaskTypeDialogVisible = true
    },
    // 取消编辑，关闭对话框
    cancelEditTaskType() {
      this.$nextTick(() => {
        this.$refs.editTaskTypeFormRef.clearValidate() // 清除表单验证状态
      })
      this.editTaskTypeDialogVisible = false
    },
    // 提交编辑后的任务类型，发送 PUT 请求到后端
    async updateTaskType() {
      // 首先手动验证表单
      this.$refs.editTaskTypeFormRef.validate(async (valid) => {
        if (valid) {
          const token = localStorage.getItem('token') // 从本地存储获取 token
          try {
            const response = await axios.put(
              `/api/task-types/${this.editTaskTypeForm.taskTypeId}`,
              { typeName: this.editTaskTypeForm.typeName },
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            )

            if (response.data.code === 20039) {
              // 成功后更新任务类型列表中的名称
              const taskTypeIndex = this.taskTypesForm.existTaskTypes.findIndex(
                (type) => type.taskTypeId === this.editTaskTypeForm.taskTypeId
              )
              if (taskTypeIndex !== -1) {
                this.taskTypesForm.existTaskTypes[taskTypeIndex].typeName =
                  this.editTaskTypeForm.typeName
              }
              // 关闭对话框并清空表单
              this.cancelEditTaskType()
              ElMessage.success('任务类型编辑成功!')
            } else {
              ElMessage.error('编辑失败: ' + response.data.message)
            }
          } catch (error) {
            ElMessage.error('编辑任务类型失败: ' + error)
          }
        } else {
          // 如果验证失败，显示错误信息
          ElMessage.error('请填写任务类型名称')
        }
      })
    },
    // 打开标签修改对话框
    openTagDialog(task) {
      console.log('传递的任务数据:', task) // 查看传入的任务数据
      console.log('打开对话框，任务ID:', task.taskId) // 确认任务ID是否正确
      console.log('标签数据:', task.tags) // 查看标签数据
      localStorage.setItem('currentTaskId', JSON.stringify(task.taskId))
      if (task.taskId && Array.isArray(task.tags)) {
        this.tagForm.taskId = task.taskId // 确保正确赋值任务ID
        this.tagForm.tags = task.tags
      } else {
        ElMessage.error('任务ID或标签未定义')
        this.tagForm.tags = []
        this.tagForm.taskId = null
      }
      this.tagDialogVisible = true // 显示对话框
    },

    // 删除标签
    async deleteTag(tag) {
      const taskId = this.tagForm.taskId // 直接从当前表单中获取最新的 taskId
      const tagId = tag.tagId || tag.id
      console.log('标签ID:', tagId)
      console.log('任务ID:', taskId)
      if (!taskId || !tagId) {
        ElMessage.error('任务ID或标签ID无效，无法删除标签')
        return
      }
      const token = localStorage.getItem('token')
      try {
        // 1. 先删除任务与标签的关联
        const taskTagUrl = `/api/task-tags/${taskId}/${tagId}`
        const taskTagResponse = await axios.delete(taskTagUrl, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (taskTagResponse.data.code === 20039) {
          // 成功后更新标签列表
          this.tagForm.tags = this.tagForm.tags.filter((t) => (t.tagId || t.id) !== tagId)
          console.log('任务标签关联删除成功')
          this.fetchTasks()
          // 2. 发送请求，删除标签本身
          const tagUrl = `/api/tags/${tagId}`
          const tagResponse = await axios.delete(tagUrl, {
            headers: { Authorization: `Bearer ${token}` }
          })

          if (tagResponse.data.code === 20039) {
            console.log('标签删除成功')
            ElMessage.success('标签删除成功!')
          } else {
            ElMessage.error('删除标签失败: ' + response.data.message)
          }
        }
      } catch (error) {
        ElMessage.error('操作失败: ' + error)
      }
    },

    // 取消编辑
    cancelEditTags() {
      this.tagDialogVisible = false // 隐藏对话框
      this.tagForm.newTag = '' // 清空新增标签输入框
      this.$nextTick(() => {
        // 清除验证状态
        if (this.$refs.tagFormRef) {
          this.$refs.tagFormRef.resetFields()
        }
      })
    },
    // 新增标签并关联到任务
    async addTagToTask() {
      // 1. 手动验证输入框是否为空
      if (!this.tagForm.newTag.trim()) {
        ElMessage.error('不可以为空嗷')
        return // 如果为空，则直接返回，不执行后续代码
      }
      const token = localStorage.getItem('token')
      const newTag = { tagName: this.tagForm.newTag } // 准备新增标签的数据

      try {
        // 1. 发送请求新增标签
        const tagResponse = await axios.post('/api/tags', newTag, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (tagResponse.data.code === 20039) {
          const tagId = tagResponse.data.data.tagId || tagResponse.data.data.id // 检查返回的tagId
          console.log('新增标签成功，标签ID:', tagId) // 检查标签新增是否成功

          // 2. 发送请求，将标签添加到任务
          const taskTagData = { taskId: this.tagForm.taskId, tagId }
          console.log('准备关联标签到任务，taskId:', this.tagForm.taskId, 'tagId:', tagId) // 确认关联请求即将发送

          const taskTagResponse = await axios.post('/api/task-tags', taskTagData, {
            headers: { Authorization: `Bearer ${token}` }
          })

          if (taskTagResponse.data.code === 20039) {
            ElMessage.success('标签添加成功!')
            console.log('关联标签到任务成功')

            // 3. 将返回的 tagId 和 taskId 对应存储到标签列表
            const newTagData = {
              tagId: taskTagResponse.data.data.tagId, // 后端返回的 tagId
              tagName: this.tagForm.newTag, // 使用新标签的名称
              taskId: taskTagResponse.data.data.taskId // 后端返回的 taskId
            }

            // 更新当前任务的标签列表
            const task = this.tasks.find((task) => task.taskId === this.tagForm.taskId)
            if (task) {
              // 将新标签推入当前任务的标签列表
              task.tags.push(newTagData)
              this.fetchTasks()
              // 同时更新对话框中的标签列表
              this.tagForm.tags = [...task.tags] // 重新赋值，触发 Vue 的响应式更新
            }

            this.tagForm.newTag = '' // 清空输入框
          } else {
            ElMessage.error('关联标签失败: ' + taskTagResponse.data.message)
          }
        } else {
          ElMessage.error('新增标签失败: ' + tagResponse.data.message)
        }
      } catch (error) {
        console.error('请求错误:', error) // 更明确的错误信息
        ElMessage.error('操作失败，请检查网络或服务器。')
      }
    },
    cancelEditTags() {
      this.tagDialogVisible = false
      ;(this.tagForm.newTag = ''),
        this.$nextTick(() => {
          // 清除验证状态
          if (this.$refs.tagFormRef) {
            this.$refs.tagFormRef.resetFields()
          }
        })
    },
    // 获取某个任务类型下的所有标签，生成过滤选项
    getTagFilters(typeName) {
      const tasksForType = this.tasks.filter((task) => task.taskType.typeName === typeName)
      const tagsSet = new Set()

      // 遍历所有任务，提取标签
      tasksForType.forEach((task) => {
        task.tags.forEach((tag) => tagsSet.add(tag.tagName)) // 使用Set自动去重
      })

      // 生成标签过滤项，返回格式[{ text: '标签名', value: '标签名' }]
      return Array.from(tagsSet).map((tag) => ({ text: tag, value: tag }))
    },

    // 根据标签进行筛选
    filterTasksByTag(value, row) {
      // 检查当前任务的标签列表中是否有用户选择的标签
      return row.tags.some((tag) => tag.tagName === value)
    },

    // 同时根据任务类型和标签进行过滤
    filterTasksByTypeAndTag(typeName) {
      const filteredTasks = this.tasks.filter((task) => task.taskType.typeName === typeName)

      // 如果没有选择标签，返回所有任务
      if (!this.selectedTag) {
        return filteredTasks
      }

      // 如果有选择标签，过滤出符合标签的任务
      return filteredTasks.filter((task) =>
        task.tags.some((tag) => tag.tagName === this.selectedTag)
      )
    },
    // 打开编辑标签对话框
    openEditTagDialog(tag) {
      this.editTagForm.tagId = tag.tagId || tag.id // 确保正确赋值标签ID
      this.editTagForm.tagName = tag.tagName // 赋值当前标签名称
      this.editTagDialogVisible = true // 显示编辑标签对话框
    },

    // 取消编辑标签
    cancelEditTag() {
      this.editTagDialogVisible = false // 关闭对话框
      this.editTagForm.tagId = null
      this.editTagForm.tagName = ''
    },
    // 提交编辑后的标签
    async submitEditTag() {
      if (!this.editTagForm.tagName.trim()) {
        ElMessage.error('标签名称不能为空')
        return
      }

      const token = localStorage.getItem('token') // 获取本地存储的token
      const tagId = this.editTagForm.tagId // 获取当前标签ID
      const updatedTagName = this.editTagForm.tagName // 获取编辑后的标签名称

      try {
        // 发送PUT请求更新标签
        const response = await axios.put(
          `/api/tags/${tagId}`,
          {
            tagName: updatedTagName
          },
          {
            headers: { Authorization: `Bearer ${token}` } // 携带token
          }
        )

        if (response.data.code === 20039) {
          ElMessage.success('标签更新成功!')
          // 更新对话框中的标签列表
          const tagIndex = this.tagForm.tags.findIndex(
            (tag) => tag.tagId === tagId || tag.id === tagId
          )
          if (tagIndex !== -1) {
            // 直接更新数组的对象属性，Vue 3 中这会触发响应式更新
            this.tagForm.tags[tagIndex].tagName = updatedTagName

            // 重新赋值整个数组，确保 Vue 响应式生效
            this.tagForm.tags = [...this.tagForm.tags]
          } else {
            console.warn(`没有找到 ID 为 ${tagId} 的标签`)
          }
          this.editTagDialogVisible = false // 关闭对话框
          this.fetchTasks() // 可选：重新获取任务以确保更新同步
        } else {
          ElMessage.error('〒▽〒: ' + response.data.message)
        }
      } catch (error) {
        console.error('〒▽〒:', error)
        ElMessage.error('〒▽〒出问题了')
      }
    }
  },

  mounted() {
    this.fetchTasks()
  }
}
</script>

<style>
.el-table .el-table__header th,
.el-table .el-table__body td {
  text-align: center;
}

.el-collapse {
  --el-collapse-header-font-size: 1.2em;
  text-align: center;
  padding: 0 20px;
  margin: auto;
}
.el-collapse-item__header {
  color: #4595d5;
}

#changeType {
  display: flex;
  justify-content: flex-end;
  padding: 20px;
}
#edit-buttons {
  display: flex;
  justify-content: flex-end;
}
#addTaskType {
  padding: 20px;
}
#addTag {
  padding: 20px;
}

#Button {
  display: flex;
  justify-content: flex-end;
}
</style>
