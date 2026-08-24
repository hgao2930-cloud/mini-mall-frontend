<template>
  <form @submit.prevent="handleRegister">
    用户名：<input type="text" v-model="user.username" placeholder="请输入用户名" /> 密码：<input
      :type="showPassword ? 'text' : 'password'"
      v-model="user.password"
      placeholder="请输入密码"
    />
    <button type="button" @click="showPassword = !showPassword">显示密码</button>
    <button type="submit">注册</button>
  </form>
</template>

<script setup lang="ts">
import { registerUser } from '@/api/user'
import { ref } from 'vue'
import router from '@/router'

const showPassword = ref(false)
const user = ref({
  username: '',
  password: '',
})
async function handleRegister() {
  try {
    if (!user.value.username) return
    if (!user.value.password) return
    await registerUser(user.value)
    router.push('/')
  } catch (err) {
    console.error(err)
  }
}
</script>

<style scoped></style>
