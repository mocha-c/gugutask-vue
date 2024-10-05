import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import axios from 'axios'

const app = createApp(App)
axios.defaults.baseURL = 'http://192.168.1.100:3006'
// 添加路由导航守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  // 允许没有 token 的用户访问 /login, /register, /email-to-token 页面
  const publicPages = ['/login', '/register', '/email-to-token']
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
