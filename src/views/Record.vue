<template>
  <div class="Form">
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
      <el-form-item label="任务名称" prop="name">
        <el-input v-model="ruleForm.name" placeholder="请输入任务名称" />
      </el-form-item>
      <el-form-item label="截止时间" required>
        <el-row :gutter="10">
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
          <el-col :span="11">
            <el-form-item prop="date2">
              <el-time-picker v-model="ruleForm.date2" placeholder="选择时间" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form-item>

      <el-form-item label="优先级" prop="priority">
        <el-segmented v-model="ruleForm.priority" :options="priorityOptions" />
      </el-form-item>

      <el-form-item label="任务细节" prop="detail">
        <el-input v-model="ruleForm.detail" type="textarea" placeholder="任务描述" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm(ruleFormRef)">提交</el-button>
        <el-button @click="resetForm(ruleFormRef)">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { ComponentSize, FormInstance, FormRules } from 'element-plus'

interface RuleForm {
  name: string
  detail: string
  date1: string
  date2: string
  priority: string
}

const formSize = ref<ComponentSize>('default')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  name: '',
  detail: '',
  date1: '',
  date2: '',
  priority: ''
})

const priorityOptions = ['高', '中', '低']

const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 3, max: 20, message: '任务名称长度为 3 到 20 个字符', trigger: 'blur' }
  ],
  detail: [
    { required: true, message: '请输入任务描述', trigger: 'blur' },
    { min: 5, message: '任务描述至少需要 5 个字符', trigger: 'blur' }
  ],
  date1: [{ type: 'date', required: true, message: '请选择日期', trigger: 'change' }],
  date2: [{ type: 'date', required: true, message: '请选择时间', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }]
})

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

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
</script>
