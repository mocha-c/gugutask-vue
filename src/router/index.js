import { createRouter, createWebHistory } from 'vue-router'
import Record from '../views/Record.vue'
import Task from '../views/Task.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
const routes = [
  { path: '/', component: Record },
  { path: '/task', component: Task },
  { path: '/login', component: Login },
  { path: '/register', component: Register }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
