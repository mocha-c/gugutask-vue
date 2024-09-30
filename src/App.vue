<template>
  <div id="app" class="app-container">
    <!-- 只有当路径不是 /login 时才显示导航栏 -->
    <el-menu
      v-if="!isAuthPage"
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
    >
      <el-menu-item index="/">记录</el-menu-item>
      <el-menu-item index="/task">任务</el-menu-item>
      <el-menu-item index="/me">我的</el-menu-item>
    </el-menu>

    <router-view @update:activeIndex="updateActiveIndex"></router-view>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: localStorage.getItem('activeIndex') || '/',
      isAuthPage: false // 添加一个状态来判断当前是否是登录页面
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
  watch: {
    // 监听路由的变化，自动更新是否在认证相关页面
    $route(to) {
      const authPages = ['/login', '/register', '/reset']
      this.isAuthPage = authPages.includes(to.path)

      // 确保菜单的 activeIndex 和当前路径一致
      if (to.path !== this.activeIndex) {
        this.activeIndex = to.path
        localStorage.setItem('activeIndex', to.path)
      }
    }
  },
  mounted() {
    // 检查当前路由是否在认证页面
    const authPages = ['/login', '/register', '/reset']
    this.isAuthPage = authPages.includes(this.$route.path)

    // 恢复菜单选中状态
    const savedIndex = localStorage.getItem('activeIndex')
    if (savedIndex && this.$route.path !== savedIndex) {
      this.activeIndex = this.$route.path
      localStorage.setItem('activeIndex', this.$route.path)
    }

    // 检查是否有token
    const token = localStorage.getItem('token')
    if (!token && authPages.includes(this.$route.path)) {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
#app {
  width: 70vw;
  height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin: 0 auto;
}
.el-menu-demo {
  justify-content: space-around;
}
.el-menu-item {
  text-align: center;
}
.content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex: 1;
}

.el-menu--horizontal {
  border-right: none;
  display: flex;
  justify-content: space-around;
  flex-wrap: nowrap;
  height: var(--el-menu-horizontal-height);
}
</style>
