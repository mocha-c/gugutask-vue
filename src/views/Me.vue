<template>
  <div class="mb-4">
    <el-button @click="logout">注销</el-button>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

// 使用 Vue Router
const router = useRouter()

// 注销逻辑
const logout = () => {
  // 清理 localStorage 中的 token
  localStorage.removeItem('token')
  // 跳转到登录页面
  router.push('/login')
}
</script>
