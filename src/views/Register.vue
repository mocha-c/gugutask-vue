<template>
  <div class="register-container">
    <!-- 左边的美图 -->
    <div class="register-image"><img src="/register.jpg" alt="登录图" /></div>

    <!-- 右边的表单 -->
    <div right-form>
      <el-form
        :model="loginForm"
        :rules="rules"
        ref="loginFormRef"
        @submit.prevent="handleRegister"
        class="login-form"
      >
        <div id="inputs">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="loginForm.username" placeholder="输个用户名呗？"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码咧？"
            ></el-input>
          </el-form-item>
        </div>
        <div id="button-login">
          <el-form-item>
            <el-button color="#08979c" @click="toLogin" id="register" plain>登录</el-button>
          </el-form-item>
          <el-form-item>
            <el-button color="#fa8c16" @click="handleRegister" plain>提交</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

/* 使用 Vue Router */
const router = useRouter()

/* 登录表单数据 */
const loginForm = reactive({
  username: '',
  password: ''
})

/* 表单验证规则 */
const rules = {
  username: [{ required: true, message: '不写用户名我咋知道谁是你啊', trigger: 'blur' }],
  password: [{ required: true, message: '自己的密码都记不住？', trigger: 'blur' }]
}

/* 引用表单实例 */
const loginFormRef = ref(null)
const toLogin = () => {
  router.push('/login')
}
/* 登录处理函数 */
const handleRegister = async () => {
  if (loginFormRef.value) {
    loginFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const response = await axios.post('http://localhost:3006/api/auth/register', loginForm)
          const { code, data } = response.data

          if (code === 20039) {
            // 将 token 存储到 localStorage 中
            localStorage.setItem('token', data.token)
            ElMessage.success('成了!')
            router.push('/')
          } else {
            ElMessage.error('〒▽〒: ' + response.data.message)
          }
        } catch (error) {
          ElMessage.error('〒▽〒: ' + error.message)
        }
      } else {
        ElMessage.error('填完呗，花不了多少时间')
      }
    })
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-radius: 1em;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 1em;
  height: 80vh; /* 调整容器的高度 */
  max-width: 1200px; /* 设置最大宽度 */
  max-height: 600px; /* 设置最大高度 */
}

/* 左边的图片部分 */
.register-image {
  flex: 1; /* 占据左边部分 */
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%; /* 让容器的高度填满父容器 */
  overflow: hidden; /* 防止图片溢出容器 */
  border-top-left-radius: 1em;
  border-bottom-left-radius: 1em;
}

.register-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

/* 右边的表单部分 */
.login-form {
  flex: 1; /* 占据右边部分 */
  display: flex;
  flex-direction: column;
  padding-left: 2em;
  margin-right: 1em;
}

#inputs {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

#button-login {
  display: flex;
  justify-content: flex-end;

  margin-top: 1em;
}

#register {
  margin-right: 1em;
}
</style>
