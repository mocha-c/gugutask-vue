<template>
  <div>
    <!-- 表单容器，限制宽度并居中对齐 -->
    <div class="form-container">
      <!-- 展示个人信息表单 -->
      <el-form
        :model="userInfo"
        ref="userForm"
        :rules="rules"
        label-position="right"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="name">
          <el-input v-model="userInfo.name" :disabled="!isEditing"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userInfo.email" :disabled="!isEditing"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="isEditing">
          <el-input v-model="userInfo.password" type="password" @input="removeSpaces"></el-input>
        </el-form-item>
      </el-form>

      <!-- 按钮区域，使用 flex 布局将按钮放在右下角 -->
      <div class="button-container">
        <el-button @click="logout" type="danger">注销</el-button>
        <el-button v-if="!isEditing" type="primary" @click="editInfo">编辑</el-button>
        <el-button v-if="isEditing" type="success" @click="saveInfo">保存</el-button>
        <el-button v-if="isEditing" type="warning" @click="cancelEdit">取消</el-button>
      </div>

      <el-alert v-if="errorMessage" :title="errorMessage" type="error" show-icon></el-alert>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// 使用 Vue Router
const router = useRouter()

// 注销逻辑
const logout = () => {
  // 清理 localStorage 中的 token
  localStorage.removeItem('token')
  // 跳转到登录页面
  router.push('/login')
}

// 定义用户信息
const originalUserInfo = ref({
  id: '',
  name: '',
  email: ''
})

const userInfo = ref({
  id: '',
  name: '',
  email: '',
  password: ''
})

// 编辑模式状态
const isEditing = ref(false)

// 错误信息
const errorMessage = ref('')

// 表单校验规则
const rules = {
  name: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
  email: [
    { required: true, message: '邮箱不能为空', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

// 获取用户信息
const fetchUserInfo = async () => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const response = await axios.get('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (response.data.code === 20039) {
        userInfo.value = {
          id: response.data.data.id,
          name: response.data.data.username,
          email: response.data.data.email,
          password: ''
        }
        originalUserInfo.value = { ...userInfo.value }
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  } else {
    router.push('/login')
  }
}

// 编辑用户信息
const editInfo = () => {
  isEditing.value = true
}

// 保存用户信息
const saveInfo = async () => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const dataToUpdate: any = {
        username: userInfo.value.name,
        email: userInfo.value.email
      }

      // 检查用户名是否改变
      if (userInfo.value.name === originalUserInfo.value.name) {
        delete dataToUpdate.username
      }

      // 检查邮箱是否改变
      if (userInfo.value.email === originalUserInfo.value.email) {
        delete dataToUpdate.email
      }

      // 检查密码是否为空且已更改
      if (userInfo.value.password) {
        dataToUpdate.password = userInfo.value.password
      } else {
        delete dataToUpdate.password
      }

      // 如果没有变化的字段，给出提示并返回
      if (Object.keys(dataToUpdate).length === 0) {
        errorMessage.value = '没有任何更改'
        return
      }

      const response = await axios.put('/api/users/me', dataToUpdate, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (response.data.code === 20039) {
        console.log('更新用户信息成功:', response.data)
        isEditing.value = false
        await fetchUserInfo() // 更新后重新获取用户信息
        errorMessage.value = ''
      }
    } catch (error) {
      console.error('更新用户信息失败:', error)
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage.value = error.response.data.message
      } else {
        errorMessage.value = '更新用户信息时发生错误'
      }
    }
  } else {
    router.push('/login')
  }
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  fetchUserInfo() // 重新获取用户信息，恢复之前的数据
  errorMessage.value = ''
}
// 移除密码中的空格
const removeSpaces = () => {
  userInfo.value.password = userInfo.value.password.replace(/\s+/g, '')
}

// 组件加载时获取用户信息
onMounted(() => {
  fetchUserInfo()
})
</script>
<style scoped>
.form-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.el-form-item {
  text-align: right;
}

.el-input {
  width: 100%;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
