/// <reference types="vite/client" />

// 加上这一段，告诉 TypeScript 如何理解 .vue 文件
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}