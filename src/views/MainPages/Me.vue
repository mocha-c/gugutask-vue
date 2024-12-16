<template>
  <div>
    <!-- 信息展示容器 -->
    <div class="profile-container">
      <!-- 用户头像 -->
      <div class="avatar-container">
        <img
          :src="userInfo.avatar || defaultAvatar"
          alt="用户头像"
          class="avatar"
          @click="selectAvatar"
        />
        <!-- 悬停覆盖层 -->
        <div v-if="isHovered" class="overlay">
          <span class="overlay-text">点击上传图片</span>
        </div>
        <!-- 隐藏的文件选择框 -->
        <input
          type="file"
          ref="avatarInput"
          style="display: none"
          accept="image/*"
          @change="handleAvatarChange"
        />
      </div>
      <!-- 用户信息展示区域 -->
      <div class="info-container">
        <!-- 表单组件，用于展示和编辑用户信息 -->
        <el-form :model="userInfo" ref="userForm" :rules="rules" label-position="top">
          <!-- 用户名输入框 -->
          <el-form-item label="用户名" prop="name" class="inputs">
            <el-input v-model="userInfo.name" :disabled="!isEditing" />
          </el-form-item>
          <!-- 邮箱输入框 -->
          <el-form-item label="邮箱" prop="email" class="inputs">
            <el-input v-model="userInfo.email" :disabled="!isEditing" />
          </el-form-item>
          <!-- 密码输入框，仅在编辑模式下显示 -->
          <el-form-item label="密码" prop="password" v-if="isEditing" class="inputs">
            <el-input v-model="userInfo.password" type="password" @input="removeSpaces" />
          </el-form-item>
        </el-form>

        <!-- 按钮区域 -->
        <div class="button-container">
          <!-- 注销按钮 -->
          <el-button @click="logout" type="danger">注销</el-button>
          <!-- 编辑按钮，仅在非编辑模式下显示 -->
          <el-button v-if="!isEditing" type="primary" @click="editInfo">编辑</el-button>
          <!-- 保存和取消按钮，仅在编辑模式下显示 -->
          <el-button v-if="isEditing" type="success" @click="saveInfo">保存</el-button>
          <el-button v-if="isEditing" type="warning" @click="cancelEdit">取消</el-button>
        </div>

        <!-- 错误信息提示 -->
        <el-alert v-if="errorMessage" :title="errorMessage" type="error" show-icon />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

export default {
  setup() {
    const router = useRouter()

    // 用户信息数据
    const userInfo = ref({
      id: '', // 用户ID
      name: '', // 用户名
      email: '', // 用户邮箱
      password: '', // 用户密码，仅用于更新
      avatar: '' // 用户头像URL
    })

    // 默认头像路径
    const defaultAvatar = '/default-avatar.jpg'

    // 保存原始用户信息，用于恢复数据
    const originalUserInfo = ref({})
    // 是否处于编辑模式
    const isEditing = ref(false)
    // 错误信息提示
    const errorMessage = ref('')
    const isHovered = ref(false)
    const showOverlay = () => {
      isHovered.value = true
    }

    const hideOverlay = () => {
      isHovered.value = false
    }
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
      if (!token) {
        // 如果没有登录令牌，跳转到登录页面
        router.push('/login')
        return
      }

      try {
        // 从后端获取当前用户信息
        const response = await axios.get('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.data.code === 20039) {
          // 成功获取用户信息，更新数据
          userInfo.value = {
            id: response.data.data.id,
            name: response.data.data.username,
            email: response.data.data.email,
            avatar: response.data.data.avatar || '',
            password: ''
          }
          // 保存原始数据
          originalUserInfo.value = { ...userInfo.value }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    }

    // 注销逻辑
    const logout = () => {
      // 清除登录令牌
      localStorage.removeItem('token')
      // 跳转到登录页面
      router.push('/login')
    }

    // 启用编辑模式
    const editInfo = () => {
      isEditing.value = true
    }

    // 保存更新后的用户信息
    const saveInfo = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        // 如果没有登录令牌，跳转到登录页面
        router.push('/login')
        return
      }

      // 创建更新数据对象
      const dataToUpdate = {}

      // 检查用户名是否更改
      if (userInfo.value.name !== originalUserInfo.value.name) {
        dataToUpdate.username = userInfo.value.name
      }

      // 检查邮箱是否更改
      if (userInfo.value.email !== originalUserInfo.value.email) {
        dataToUpdate.email = userInfo.value.email
      }

      // 检查密码是否有输入
      if (userInfo.value.password) {
        dataToUpdate.password = userInfo.value.password
      }

      // 如果没有任何更改，提示用户
      if (!Object.keys(dataToUpdate).length) {
        errorMessage.value = '没有任何更改'
        return
      }

      try {
        // 发送更新请求到后端
        const response = await axios.put('/api/users/me', dataToUpdate, {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (response.data.code === 20039) {
          // 更新成功，退出编辑模式并重新获取用户信息
          isEditing.value = false
          fetchUserInfo()
          errorMessage.value = ''
        }
      } catch (error) {
        // 更新失败，显示错误信息
        errorMessage.value = error.response?.data?.message || '更新用户信息时发生错误'
      }
    }

    // 取消编辑并恢复原始数据
    const cancelEdit = () => {
      isEditing.value = false
      fetchUserInfo()
      errorMessage.value = ''
    }

    // 移除密码中的空格
    const removeSpaces = () => {
      userInfo.value.password = userInfo.value.password.replace(/\s+/g, '')
    }

    const selectAvatar = () => {
      // 点击头像时，触发文件选择框
      const fileInput = document.querySelector('input[type="file"]')
      fileInput.click()
    }
    const handleAvatarChange = async (event) => {
      const file = event.target.files[0]
      if (!file || !file.type.startsWith('image/')) {
        errorMessage.value = '请选择图片文件'
        return
      }

      const formData = new FormData()
      formData.append('file', file)

      try {
        const token = localStorage.getItem('token')
        const response = await axios.post('/api/upload-avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        })

        if (response.data.url) {
          userInfo.value.avatar = response.data.url // 更新头像URL
          errorMessage.value = ''
        }
      } catch (error) {
        console.error('上传头像失败:', error)
        errorMessage.value = '上传头像失败，请稍后再试'
      }
    }

    // 组件加载时获取用户信息
    onMounted(fetchUserInfo)

    return {
      userInfo,
      isEditing,
      errorMessage,
      rules,
      logout,
      editInfo,
      saveInfo,
      cancelEdit,
      removeSpaces,
      defaultAvatar,
      selectAvatar,
      handleAvatarChange,
      isHovered,
      showOverlay,
      hideOverlay
    }
  }
}
</script>

<style scoped>
/* 信息展示容器布局 */
.profile-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 1em;
  max-width: 600px;
  margin: 0 auto;
  padding: 1em;
  margin-top: 3em;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* 头像容器样式 */
.avatar-container {
  flex-shrink: 0;
  width: fit-content;
  cursor: pointer;
}

/* 用户头像样式 */
.avatar {
  min-width: 10em;
  min-height: 10em;
  max-width: 12em;
  max-height: 12em;
  border-radius: 1em;
  object-fit: cover;
  border: 2px solid #ddd;
  transition: filter 0.3s ease; /* 添加过渡效果 */
}
.avatar-container:hover .avatar {
  filter: brightness(0.9); /* 鼠标悬停时变暗 */
}

/* 信息容器样式 */
.info-container {
}

/* 表单项对齐方式 */
.el-form-item {
  margin-bottom: 20px;
}

/* 按钮容器布局 */
.button-container {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}

.inputs {
  max-width: 12em;
}
</style>
