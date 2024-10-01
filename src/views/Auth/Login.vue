<template>
  <div class="login-container">
    <!-- 左边的美图 -->
    <div class="login-image"><img src="/login.jpg" alt="登录图" /></div>

    <!-- 右边的表单 -->
    <div right-form>
      <el-form
        :model="loginForm"
        :rules="rules"
        ref="loginFormRef"
        @submit.prevent="handleLogin"
        class="login-form"
      >
        <div id="Title">
          <el-text class="mx-1" size="large" tag="b">🕊️咕咕任务</el-text>
        </div>
        <div id="inputs">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="loginForm.username" placeholder="你谁来着？"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="嗯哼？"></el-input>
          </el-form-item>
        </div>
        <div id="button-login">
          <el-form-item>
            <el-button color="#626aef" @click="toReset" id="register" plain>忘记密码</el-button>
          </el-form-item>
          <el-form-item>
            <el-button color="#08979c" @click="toRegister" id="register" plain>注册</el-button>
          </el-form-item>
          <el-form-item>
            <el-button color="#fa8c16" @click="handleLogin" plain>登录</el-button>
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
  username: [{ required: true, message: '你甚至都不愿意告诉我名字〒▽〒', trigger: 'blur' }],
  password: [{ required: true, message: '自己的密码都记不住？', trigger: 'blur' }]
}

/* 引用表单实例 */
const loginFormRef = ref(null)

// 去注册
const toRegister = () => {
  router.push('/register')
}

// 去重置密码
const toReset = () => {
  router.push('/email-to-token')
}
/* 登录处理函数 */
const handleLogin = async () => {
  if (loginFormRef.value) {
    loginFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const response = await axios.post('/api/auth/login', loginForm)
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
        ElMessage.error('你是谁来着？')
      }
    })
  }
}
</script>

<style scoped>
.login-container {
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
.login-image {
  flex: 1.618; /* 占据左边部分 */
  display: flex;
  align-items: center;
  height: 100%; /* 让容器的高度填满父容器 */
  overflow: hidden; /* 防止图片溢出容器 */
  border-top-left-radius: 1em;
  border-bottom-left-radius: 1em;
}

.login-image img {
  max-width: 90%;
  height: auto;
  border-radius: 8px;
}

/* 右边的表单部分 */
.login-form {
  flex: 1; /* 占据右边部分 */
  display: flex;
  flex-direction: column;
  margin-right: 3em;
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

#Title {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1em;
}
</style>
