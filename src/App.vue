<template>
  <div id="app" class="app-container">
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
    >
      <el-menu-item index="/">记录</el-menu-item>
      <el-menu-item index="/task">任务</el-menu-item>
      <el-menu-item index="/login">登录</el-menu-item>
      <el-menu-item index="/register">注册</el-menu-item>
    </el-menu>
    <router-view @update:activeIndex="updateActiveIndex"></router-view>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: localStorage.getItem('activeIndex') || '/'
    }
  },
  methods: {
    handleSelect(key) {
      this.activeIndex = key
      localStorage.setItem('activeIndex', key)
      this.$router.push(key)
    },
    updateActiveIndex(newIndex) {
      this.activeIndex = newIndex
      localStorage.setItem('activeIndex', newIndex)
    }
  },
  mounted() {
    //恢复菜单选中状态
    const savedIndex = localStorage.getItem('activeIndex')
    if (savedIndex) {
      this.activeIndex = savedIndex
    }
    this.isLoggedIn = !!localStorage.getItem('loggedInUser')
  }
}
</script>
<style scoped></style>
