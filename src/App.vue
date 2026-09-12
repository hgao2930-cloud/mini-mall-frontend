<script setup lang="ts">
import NavBar from './components/NavBar.vue'
function debounce<T extends unknown[]>(fn:(...args:T)=>void,delay:number){
  let timer:number|null = null
  return function debounced(...args:T){
    if(timer!==null)clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, delay);
  }
}
</script>

<template>
  <NavBar></NavBar>
  <RouterView></RouterView>
</template>

<style scoped></style>
