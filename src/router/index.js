import { createRouter, createWebHistory } from 'vue-router'
import Record from '../views/Record.vue'
import Task from '../views/Task.vue'
import Me from '../views/Me.vue'
import Login from '../views/Auth/Login.vue'
import Register from '../views/Auth/Register.vue'
import EmailToToken from '../views/Auth/EmailToToken.vue'
const routes = [
  { path: '/', component: Record },
  { path: '/task', component: Task },
  { path: '/me', component: Me },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/email-to-token', component: EmailToToken }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
