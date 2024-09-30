import { createRouter, createWebHistory } from 'vue-router'
import Record from '@/views/Record.vue'
import Task from '@/views/Task.vue'
import Me from '@/views/Me.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Reset from '@/views/Reset.vue'
const routes = [
  { path: '/', component: Record },
  { path: '/task', component: Task },
  { path: '/me', component: Me },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/reset', component: Reset }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
