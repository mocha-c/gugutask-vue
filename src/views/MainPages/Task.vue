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
          <el-table-column label="标签">
            <template #default="scope">
              <div>
                <el-tag v-for="(tag, index) in scope.row.tags" :key="index">
                  {{ tag.tagName }}
                </el-tag>
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
</template>

<script>
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reactive, ref } from 'vue'

export default {
  data() {
    return {
      dialogFormVisible: false,
      ruleForm: {
        name: '',
        existTaskTypes: [],
        date1: null,
        date2: null,
        detail: '',
        priority: ''
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
      priorityOptions: ['高', '中', '低'],
      tasks: [],
      existTaskTypes: []
    }
  },
  methods: {
    async fetchTasks() {
      ElMessage.success('在刷新啦~别急！')
      const token = localStorage.getItem('token')
      try {
        const response = await axios.get('/api/tasks/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (response.data.code === 20039) {
          this.tasks = response.data.data.map((task) => ({
            ...task,
            taskStatus: task.taskStatus === '已完成'
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
        type: 'warning' // 你也可以根据需求选择其他类型
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
    openDialog(task) {
      const existTaskTypes = this.fetchTaskTypes() || ''
      this.ruleForm.name = task.taskName || '' // 使用 taskName
      this.ruleForm.existTaskTypes = task.taskType.taskTypeId || null // 获取 taskTypeId
      this.ruleForm.date1 = new Date(task.date1 + 'T00:00:00+08:00') // 确保是东八区
      this.ruleForm.date2 = task.date2 ? new Date(`1970-01-01T${task.date2}+08:00`) : null // 确保是东八区
      this.ruleForm.detail = task.taskDetail || '' // 使用 taskDetail
      this.ruleForm.priority = task.taskPriority || '' // 使用 taskPriority
      localStorage.setItem('currentTask', JSON.stringify(task))
      localStorage.setItem('existTaskTypes', JSON.stringify(existTaskTypes))
      this.dialogFormVisible = true // 唤醒对话框
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
      // 直接从 this.tasks 筛选符合任务类型的任务
      return this.tasks.filter((task) => task.taskType.typeName === typeName)
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
    }
  },
  mounted() {
    this.fetchTasks()
    this.fetchTaskTypes()
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
  padding: 20px;
  margin: auto;
}
.el-collapse-item__header {
  color: #4595d5;
}
</style>
