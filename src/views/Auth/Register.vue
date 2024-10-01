<template>
  <div class="register-container">
    <!-- 左边的美图 -->
    <div class="register-image"><img src="/register.jpg" alt="登录图" /></div>

    <!-- 右边的表单 -->

    <div right-form>
      <el-form
        :model="registerForm"
        :rules="rules"
        ref="registerFormRef"
        @submit.prevent="handleRegister"
        class="register-form"
      >
        <div id="Title">
          <el-text class="mx-1" size="large" tag="b">🕊️咕咕任务</el-text>
        </div>
        <div id="inputs">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="registerForm.username" placeholder="输个用户名呗？"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="密码咧？"
            ></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="registerForm.email" placeholder="咱咋联系你呢？"></el-input>
          </el-form-item>
        </div>
        <div id="button-register">
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

/* 注册表单数据 */
const registerForm = reactive({
  username: '',
  password: '',
  email: ''
})

/* 表单验证规则 */
const rules = {
  username: [{ required: true, message: '至少写俩字呗', min: 2, trigger: 'blur' }],
  password: [{ required: true, message: '六位哦', min: 6, trigger: 'blur' }],
  email: [{ required: true, message: '忘记密码时有大用处', type: 'email', trigger: 'blur' }]
}

/* 引用表单实例 */
const registerFormRef = ref(null)
const toLogin = () => {
  router.push('/login')
}
/* 注册处理函数 */
const handleRegister = async () => {
  if (registerFormRef.value) {
    registerFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          ElMessage.success('交给后端啦！剩下的事情跟我没关系了嗷')
          ElMessage.success('稍等一会呗，等后端处理一下')
          const response = await axios.post('api/auth/register', registerForm)
          const { code } = response.data
          if (code === 20039) {
            ElMessage.success('成了哦，欢迎你!')
            router.push('/login')
          } else {
            ElMessage.error('〒▽〒: ' + response.data.message)
          }
        } catch (error) {
          ElMessage.error('〒▽〒: ' + error.message)
        }
      } else {
        ElMessage.error('不好好填写，我就没办法认识你啦')
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
  flex: 1.618; /* 占据左边部分 */
  display: flex;
  align-items: center;
  height: 100%; /* 让容器的高度填满父容器 */
  overflow: hidden; /* 防止图片溢出容器 */
  border-top-left-radius: 1em;
  border-bottom-left-radius: 1em;
}

.register-image img {
  max-width: 90%;
  height: auto;
  border-radius: 8px;
}

/* 右边的表单部分 */
.register-form {
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

#button-register {
  display: flex;
  justify-content: flex-end;

  margin-top: 1em;
}

#Title {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1em;
}
#register {
  margin-right: 1em;
}
</style>
