import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 添加路由导航守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  // 允许没有 token 的用户访问 /login, /register, /reset 页面
  const publicPages = ['/login', '/register', '/reset']
  // 如果没有token并且目标路由不是 /login, /register, /reset，则跳转到 /login
  if (!token && !publicPages.includes(to.path)) {
    next('/login')
  }
  // 如果有token并且目标路由是 /login，则跳转到 /
  else if (token && to.path === '/login') {
    next('/')
  }
  // 否则允许访问目标路由
  else {
    next()
  }
})

app.use(router)
app.use(ElementPlus)
app.mount('#app')
