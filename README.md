# MiniMall 迷你商城

基于 Vue 3 全家桶 + Node.js + MySQL 的全栈商城项目，覆盖电商核心业务闭环：商品浏览 → 商品详情 → 购物车 → 结算下单 → 订单支付 → 确认收货。

## 技术栈

**前端**

- Vue 3（Composition API + `<script setup>`）
- TypeScript
- Vite
- Vue Router 4：动态路由、路由懒加载、404 兜底、登录守卫
- Pinia：购物车 / 用户信息状态管理
- Axios：请求实例、token 拦截器、401 统一跳转、错误信息提取

**后端**

- Node.js + Express：RESTful API
- MySQL 8：users / products / orders 三张表
- JWT 登录鉴权（bcrypt 密码加密）
- 订单状态机在服务端校验（待付款 → 待收货 → 已完成）

## 功能特性

### 商品模块

- 商品列表 / 详情分离，动态路由传参（`/products/:id`）
- 统一的四态处理：加载中 / 错误 / 空数据 / 正常渲染
- 前端搜索过滤 + 分类切换

### 用户与鉴权

- 注册 / 登录：bcrypt 加密存储，登录返回 JWT 并写入 **httpOnly cookie**（SameSite=Lax，防 XSS 窃取）
- 浏览器自动携带 cookie，前端不接触 token；登出时后端清除 cookie
- 401 统一跳转登录页
- 路由守卫：购物车 / 订单 / 结算 / 个人中心需登录，登录页对已登录用户不开放

### 购物车

- Pinia 集中管理：加购查重合并、数量增减、单条删除、清空
- localStorage 持久化，总件数 / 总价由 computed 实时派生

### 订单模块

- 结算下单：商品快照 + 金额提交（POST），成功后清空购物车并跳转
- 完整订单状态机由服务端校验：

```
待付款 --[模拟支付]--> 待收货 --[确认收货]--> 已完成
```

- 订单归属当前登录用户，只能操作自己的订单
- 状态驱动按钮显隐，PATCH 局部更新 + 重新拉取列表

### 收货信息

- 收货人 / 电话 / 地址保存在服务端，个人中心可编辑
- 本地缓存兜底，后端不可用时不影响前端展示

### 工程化

- 路由懒加载 + `/:pathMatch(.*)*` 404 页面
- 自定义 composable `useAsyncData`：统一封装请求三态逻辑
- ESLint + oxlint + Prettier + vue-tsc 四重检查

## 快速开始

前置要求：Node.js 22+、MySQL 8（本机已运行，端口 3306）。

```sh
# 1. 初始化数据库（输入你的 MySQL root 密码）
#    注意：Windows 下不要用 PowerShell 管道导入（会转码坏中文），
#    推荐用 MySQL Workbench / Navicat 导入，或执行下面命令：
mysql -u root -p --default-character-set=utf8mb4 < ../mini-mall-server/schema.sql

# 2. 配置后端环境变量（填入 DB_PASSWORD，JWT_SECRET 建议改成随机串）
#    复制 ../mini-mall-server/.env.example 为 ../mini-mall-server/.env 并填写

# 3. 安装前后端依赖
npm install
cd ../mini-mall-server && npm install && cd ../mini-mall-frontend

# 4. 启动后端 API（localhost:3000/api）
cd ../mini-mall-server && npm run dev

# 5. 另开终端启动前端（localhost:5173）
npm run dev
```

## 常用脚本

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动前端开发服务器 |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run lint` | ESLint + oxlint 检查 |
| `npm run format` | Prettier 格式化 |
| `npm run type-check` | vue-tsc 类型检查 |

后端脚本在 `../mini-mall-server` 目录下执行：

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动 Node + MySQL 后端 API（监听模式） |
| `npm start` | 启动后端 API |

## API 一览

| 方法 | 路径 | 说明 | 鉴权 |
|---|---|---|---|
| POST | `/api/auth/register` | 注册 | 否 |
| POST | `/api/auth/login` | 登录，返回 JWT | 否 |
| GET | `/api/products` | 商品列表 | 否 |
| GET | `/api/products/:id` | 商品详情 | 否 |
| GET | `/api/orders` | 我的订单 | 是 |
| POST | `/api/orders` | 提交订单 | 是 |
| PATCH | `/api/orders/:id` | 订单状态流转 | 是 |
| GET | `/api/profile` | 收货信息 | 是 |
| PUT | `/api/profile` | 保存收货信息 | 是 |

## 目录结构

```
../mini-mall-server/   # Node + Express + MySQL 后端（独立项目）
│   ├── schema.sql     # 建库建表 + 种子数据
│   └── src/
│       ├── routes/    # auth / products / orders / profile
│       ├── middleware/ # JWT 鉴权
│       └── db.js      # MySQL 连接池
└── src/               # Vue 前端
    ├── api/           # axios 实例与业务接口
    ├── components/    # 通用组件（NavBar）
    ├── composables/   # useAsyncData 请求状态复用
    ├── stores/        # Pinia（cart / auth / userinfo）
    ├── views/         # 路由页面
    └── router/        # 路由配置（懒加载）
```
