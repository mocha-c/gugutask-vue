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

      <!-- 截止时间选择 -->
      <el-form-item label="截止时间" required>
        <el-row :gutter="10">
          <!-- 日期选择器 -->
          <el-col :span="11">
            <el-form-item prop="date1">
              <el-date-picker
                v-model="ruleForm.date1"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="2" class="text-center">
            <span class="text-gray-500">-</span>
          </el-col>
          <!-- 时间选择器 -->
          <el-col :span="11">
            <el-form-item prop="date2">
              <el-time-picker v-model="ruleForm.date2" placeholder="选择时间" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
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
import { reactive, ref } from 'vue'
import type { ComponentSize, FormInstance, FormRules } from 'element-plus'

/* 定义表单的数据接口 */
interface RuleForm {
  name: string
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
  detail: '',
  date1: '',
  date2: '',
  priority: ''
})

/* 优先级选项 */
const priorityOptions = ['高', '中', '低']

/* 表单验证规则 */
const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: '你一点计划都不做哒?!', trigger: 'blur' },
    { min: 2, max: 20, message: '至少写俩字儿呗', trigger: 'blur' }
  ],
  detail: [{ required: false }],
  date1: [{ type: 'date', required: true, message: '这事儿啥时候结束啊', trigger: 'change' }],
  date2: [{ type: 'date', required: true, message: '选个点儿呗', trigger: 'change' }],
  priority: [{ required: true, message: '急不?不急晚点做', trigger: 'change' }]
})

/* 提交表单方法 */
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('提交成功!')
    } else {
      console.log('提交失败!', fields)
    }
  })
}

/* 重置表单方法 */
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
</script>

<style>
/* 表单整体样式 */
.Form {
  margin-top: 3em;
  display: flex;
  justify-content: center;
}

/* 按钮样式，重置和提交按钮竖向排列 */
#Button {
  display: flex;
  flex-direction: column-reverse;
}
</style>
