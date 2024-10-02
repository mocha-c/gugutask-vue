<template>
  <div class="Form">
    <!-- 表单组件，设置表单的引用、模型、验证规则、图标状态和尺寸 -->
    <el-form
      ref="ruleFormRef"
      class="max-w-lg"
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
      <el-form-item label="任务类型" prop="tasktype">
        <el-select v-model="ruleForm.tasktype" placeholder="是哪种类型的任务呢">
          <el-option
            v-for="(item, index) in taskTypes"
            :key="index"
            :label="item.typeName"
            :value="item.taskTypeId"
          />
        </el-select>
      </el-form-item>
      <!-- 截止时间选择 -->
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
        <el-button type="primary" @click="submitForm(ruleFormRef)">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, type ComponentSize, type FormInstance, type FormRules } from 'element-plus'
import axios from 'axios'
/* 定义表单的数据接口 */
interface RuleForm {
  name: string
  tasktype: string
  detail: string
  date1: string
  date2: string
  priority: string
}

/* 表单大小设置 */
const formSize = ref<ComponentSize>('default')

/* 表单引用 */
const ruleFormRef = ref<FormInstance>()

/* 表单数据的初始化 */
const ruleForm = reactive<RuleForm>({
  name: '',
  tasktype: '',
  detail: '',
  date1: '',
  date2: '',
  priority: ''
})

/* 优先级选项 */
const priorityOptions = ['高', '中', '低']
/* 从后端获取的任务类型列表 */
const taskTypes = ref([])
/* 表单验证规则 */
const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: '你一点计划都不做哒?!', trigger: 'blur' },
    { min: 2, max: 20, message: '至少写俩字儿呗', trigger: 'blur' }
  ],
  tasktype: [{ required: true, message: '是什么类型呢', trigger: 'change' }],
  date1: [{ type: 'date', required: true, message: '这事儿啥时候结束啊', trigger: 'change' }],
  date2: [{ type: 'date', required: false }],
  priority: [{ required: true, message: '急不?不急晚点做', trigger: 'change' }],
  detail: [{ required: false }]
})

/* 提交表单方法 */
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      try {
        const token = localStorage.getItem('token') // 获取token

        // 格式化 date1 为 YYYY-MM-DD
        const formattedDate1 = new Date(ruleForm.date1).toISOString().split('T')[0] // 提取日期部分
        // 检查是否选择了 date2，如果选择了则格式化为 HH:mm:ss，否则设为空字符串
        const formattedDate2 = ruleForm.date2
          ? new Date(ruleForm.date2).toTimeString().split(' ')[0]
          : ''

        // 构造要发送到后端的数据
        const payload = {
          name: ruleForm.name,
          detail: ruleForm.detail,
          priority: ruleForm.priority,
          date1: formattedDate1, // 日期
          date2: formattedDate2, // 时间
          status: '未完成', // 固定为"未完成"
          typeId: ruleForm.tasktype // 任务类型的ID
        }

        // 发送 POST 请求
        const response = await axios.post('/api/tasks', payload, {
          headers: {
            Authorization: `Bearer ${token}` // 携带 token
          }
        })

        // 判断返回的code是否为20039
        if (response.data.code === 20039) {
          ElMessage.success('好好的~记录下来啦！')

          // 清空表单
          resetForm(formEl)
        } else {
          ElMessage.error(`〒▽〒': ${response.data.message}`)
        }
      } catch (error) {
        ElMessage.error('〒▽〒')
        console.error(error)
      }
    } else {
      ElMessage.error('唔姆...你没写完哦')
    }
  })
}

/* 重置表单方法 */
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  // 重置表单的验证状态
  formEl.resetFields()

  // 手动重置所有表单字段
  ruleForm.name = ''
  ruleForm.tasktype = '' // 重置任务类型
  ruleForm.detail = ''
  ruleForm.date1 = ''
  ruleForm.date2 = ''
  ruleForm.priority = ''
}

/* 获取任务类型 */
const fetchTaskTypes = async () => {
  try {
    const token = localStorage.getItem('token') // 从 localStorage 获取 token
    const response = await axios.get('/api/task-types/mine', {
      headers: {
        Authorization: `Bearer ${token}` // 携带 token 进行请求
      }
    })

    if (response.data.code === 20039) {
      taskTypes.value = response.data.data // 设置任务类型数据
    } else {
      console.error('〒▽〒:', response.data.message)
    }
  } catch (error) {
    console.error('〒▽〒:', error)
  }
}

/* 页面加载时获取任务类型 */
onMounted(() => {
  fetchTaskTypes()
})
</script>

<style>
/* 表单整体样式 */
.Form {
  margin-top: 3em;
  display: flex;
  justify-content: center;
}

#text-center {
  display: flex;
  justify-content: center;
}
#Button {
  display: flex;
  flex-direction: column-reverse;
}
</style>
