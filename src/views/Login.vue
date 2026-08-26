<template>
  <form @submit.prevent="handleLogin">
    用户名：<input type="text" v-model="user.username" placeholder="请输入用户名" /> 密码：<input
      :type="showPassword ? 'text' : 'password'" v-model="user.password" placeholder="请输入密码" />
    <button type="button" @click="showPassword = !showPassword">显示密码</button>
    <button type="submit">登录</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { loginUser } from '@/api/user'
import router from '@/router/index'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'

const showPassword = ref(false)
const user = ref({
  username: '',
  password: '',
})

const route = useRoute()
const redirect = route.query.redirect as string | undefined

const userStore = useAuthStore()
const { login } = userStore

async function handleLogin() {
  try {
    if (!user.value.username) return
    if (!user.value.password) return
    const res = await loginUser()
    const data = res.data.find(
      (u) => u.username === user.value.username && u.password === user.value.password,
    )
    if (data) {
      login(data)
      router.push(redirect ?? '/')
    } else {
      alert('用户名或密码输入错误')
    }
  } catch (err) {
    console.error(err)
  }
}
</script>

<style scoped></style>
