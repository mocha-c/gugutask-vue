<template>
  <div class="EmailToToken-container">
    <!-- 左边的美图 -->
    <div class="EmailToToken-image"><img src="/EmailToToken.jpg" alt="邮箱请求Token" /></div>

    <!-- 右边的表单 -->
    <div right-form>
      <el-form
        :model="EmailToTokenForm"
        :rules="rules"
        ref="EmailToTokenFormRef"
        @submit.prevent="handleEmailToToken"
        class="EmailToToken-form"
      >
        <div id="Title">
          <el-text class="mx-1" size="large" tag="b">🕊️Token登录</el-text>
        </div>
        <div id="inputs">
          <el-form-item v-if="!sentTokenStage" label="邮箱呢" prop="email">
            <el-input v-model="EmailToTokenForm.email" placeholder="邮箱记得咩？"></el-input>
          </el-form-item>
          <el-form-item v-if="sentTokenStage" label="给我吧" prop="token">
            <el-input v-model="EmailToTokenForm.token" placeholder="找到了吗？给我看看"></el-input>
          </el-form-item>
        </div>
        <div id="button-EmailToToken">
          <el-form-item>
            <el-button color="#08979c" plain @click="toLogin" id="EmailToToken">登录</el-button>
          </el-form-item>
          <el-form-item>
            <el-button v-if="!sentTokenStage" color="#fa8c16" plain @click="handleEmailToToken"
              >请求Token</el-button
            >
            <el-button v-if="sentTokenStage" color="#fa8c16" plain @click="submitToken"
              >提交Token</el-button
            >
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
const EmailToTokenForm = reactive({
  email: '',
  token: ''
})

/* 表单验证规则 */
const rules = {
  email: [{ required: true, message: '不记得就没办法了哦', type: 'email', trigger: 'blur' }],
  token: [{ required: true, message: 'Token不能为空', trigger: 'blur' }]
}

const EmailToTokenFormRef = ref(null)
const sentTokenStage = ref(false) // 控制是否进入Token输入阶段

const toLogin = () => {
  router.push('/login')
}
/* 请求Token处理函数 */
const handleEmailToToken = async () => {
  if (EmailToTokenFormRef.value) {
    EmailToTokenFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const response = await axios.post('/api/auth/email-token', EmailToTokenForm)
          const { code } = response.data

          if (code === 20039) {
            ElMessage.success('发了哦，去邮箱里面看看~')

            sentTokenStage.value = true // 成功请求后切换到Token输入
          } else {
            ElMessage.error('〒▽〒: ' + response.data.message)
          }
        } catch (error) {
          ElMessage.error('〒▽〒: ' + error.message)
        }
      } else {
        ElMessage.error('好好填一下哦')
      }
    })
  }
}
/* 提交Token处理函数 */
const submitToken = async () => {
  if (EmailToTokenFormRef.value) {
    EmailToTokenFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const response = await axios.post('/api/auth/token-login', {
            token: EmailToTokenForm.token
          })
          const { code, data } = response.data

          if (code === 20039) {
            // 将 token 存储到 localStorage 中
            localStorage.setItem('token', data.token)
            ElMessage.success('登录成功了，记得去改密码哦！')
            router.push('/')
          } else {
            ElMessage.error('登录失败：' + response.data.message)
          }
        } catch (error) {
          ElMessage.error('登录失败：' + error.message)
        }
      } else {
        ElMessage.error('唉？好像不对〒▽〒')
      }
    })
  }
}
</script>

<style scoped>
.EmailToToken-container {
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
.EmailToToken-image {
  flex: 1.618; /* 占据左边部分 */
  display: flex;
  align-items: center;
  height: 100%; /* 让容器的高度填满父容器 */

  overflow: hidden; /* 防止图片溢出容器 */
  border-top-left-radius: 1em;
  border-bottom-left-radius: 1em;
}

.EmailToToken-image img {
  max-width: 90%;
  border-radius: 8px;
}

/* 右边的表单部分 */
.EmailToToken-form {
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

#button-EmailToToken {
  display: flex;
  justify-content: flex-end;

  margin-top: 1em;
}

#EmailToToken {
  margin-right: 1em;
}
#Title {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1em;
}
</style>
