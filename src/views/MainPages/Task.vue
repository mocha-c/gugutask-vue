<template>
  <div>
    <el-collapse>
      <el-collapse-item v-for="(type, index) in taskTypes" :key="index" :name="type.typeName">
        <template #title>
          <span>{{ type.typeName }}</span>
        </template>
        <el-table :data="filterTasksByType(type.typeName)" style="width: 100%">
          <el-table-column prop="date1" label="日期">
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
          <el-table-column prop="taskStatus" label="任务状态">
            <template #default="scope">
              <el-checkbox
                v-model="scope.row.taskStatus"
                @mousedown.prevent="updateTaskStatus(scope.row)"
              >
                {{ scope.row.taskStatus ? '已完成' : '未完成' }}
              </el-checkbox>
            </template>
          </el-table-column>
          <el-table-column prop="taskPriority" label="优先级" />
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
                <el-button size="small" @click="handleEdit(scope.row)"> 编辑 </el-button>
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
</template>

<script>
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  data() {
    return {
      tasks: [],
      taskTypes: []
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

          // 使用 reduce 去重并保留 taskType 对象
          const uniqueTypes = []
          this.taskTypes = this.tasks.reduce((acc, task) => {
            if (!acc.some((type) => type.typeName === task.taskType.typeName)) {
              acc.push(task.taskType)
            }
            return acc
          }, uniqueTypes)
          localStorage.setItem('tasks', JSON.stringify(this.tasks))
        } else {
          this.$message.error(response.data.message)
        }
      } catch (error) {
        console.error(error)
        this.$message.error('请求... 失败...')
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

    formatTaskDetail(detail) {
      return detail.length > 8 ? detail.slice(0, 8) + '...' : detail
    },
    formatTags(row) {
      if (Array.isArray(row.tags) && row.tags.length > 0) {
        return row.tags.map((tag) => tag.tagName).join(', ') // 假设每个标签对象都有一个`name`属性
      }
      return '无标签' // 或者返回其他合适的默认值
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
</style>
