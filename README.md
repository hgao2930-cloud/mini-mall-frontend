# MiniMall 迷你商城

基于 Vue 3 全家桶的单页商城应用，覆盖电商核心业务闭环：商品浏览 → 商品详情 → 购物车 → 结算下单 → 订单支付 → 确认收货。

> 求职练手项目，前端侧完整实现，后端使用 json-server 模拟 REST API（Node + MySQL 真后端规划中）。

## 技术栈

- **Vue 3**（Composition API + `<script setup>`）
- **TypeScript**
- **Vite**
- **Vue Router 4**：动态路由、路由懒加载、404 兜底
- **Pinia**：购物车 / 订单状态管理
- **Axios**：封装请求实例与业务 API 层
- **json-server**：mock 后端

## 功能特性

### 商品模块

- 商品列表 / 详情分离，动态路由传参（`/products/:id`）
- 统一的四态处理：加载中 / 错误 / 空数据 / 正常渲染
- 错误处理区分网络错误与 HTTP 状态码（axios.isAxiosError 类型守卫）

### 购物车

- Pinia 集中管理：加购查重合并、数量增减、单条删除、清空
- 总件数 / 总价由 computed 实时派生

### 订单模块

- 结算下单：订单快照提交（POST），成功后清空购物车并跳转
- 完整订单状态机：

```
待付款 --[模拟支付]--> 待收货 --[确认收货]--> 已完成
```

- 状态驱动按钮显隐，PATCH 局部更新 + 重新拉取列表

### 工程化

- 路由懒加载 + `/:pathMatch(.*)*` 404 页面
- 自定义 composable `useAsyncData`：统一封装请求三态逻辑
- ESLint + oxlint + Prettier + vue-tsc 四重检查

## 快速开始

```sh
# 安装依赖
npm install

# 启动 mock 后端（localhost:3000）
npm run json-server

# 另开终端启动开发服务器（localhost:5173）
npm run dev
```

## 常用脚本

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动开发服务器 |
| `npm run json-server` | 启动 mock REST API |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run lint` | ESLint + oxlint 检查 |
| `npm run format` | Prettier 格式化 |
| `npm run type-check` | vue-tsc 类型检查 |

## 目录结构

```
src/
├── api/            # axios 实例与业务接口（products / order）
├── components/     # 通用组件（NavBar）
├── composables/    # useAsyncData 请求状态复用
├── stores/         # Pinia（cart 等）
├── views/          # 路由页面
├── router/         # 路由配置（懒加载）
├── App.vue
└── main.ts
```

## 开发中

- 登录鉴权：auth store、axios 拦截器（token 注入 / 401 处理）、路由守卫
- Node + Express + MySQL 真后端替换 mock
