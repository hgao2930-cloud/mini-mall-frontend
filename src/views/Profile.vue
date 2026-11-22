<template>
  <div class="profile-page">
    <h1 class="page-title">个人中心</h1>

    <!-- 用户信息卡 -->
    <div class="profile-card user-hero-card">
      <div class="user-hero-left">
        <div class="profile-avatar">{{ user?.username?.charAt(0).toUpperCase() }}</div>
        <div>
          <div class="user-greeting">{{ user?.username }}</div>
          <div class="user-role">MiniMall 个人账户 · 登录状态有效</div>
        </div>
      </div>
      <div class="quick-pills">
        <RouterLink to="/cart" class="pill-link">购物车</RouterLink>
        <RouterLink to="/orders" class="pill-link pill-link-dark">我的订单</RouterLink>
      </div>
    </div>

    <!-- 订单统计 -->
    <div class="profile-card">
      <div class="card-header">
        <h2 class="card-title">订单概览</h2>
        <RouterLink to="/orders" class="text-link">查看全部订单 →</RouterLink>
      </div>
      <div class="stat-grid">
        <RouterLink to="/orders" class="stat-item">
          <div class="stat-num">{{ orderCount }}</div>
          <div class="stat-label">总订单</div>
        </RouterLink>
        <RouterLink to="/orders" class="stat-item stat-pending">
          <div class="stat-num">{{ pendingCount }}</div>
          <div class="stat-label">待付款</div>
        </RouterLink>
        <RouterLink to="/orders" class="stat-item stat-shipping">
          <div class="stat-num">{{ shippingCount }}</div>
          <div class="stat-label">待收货</div>
        </RouterLink>
        <RouterLink to="/orders" class="stat-item stat-done">
          <div class="stat-num">{{ doneCount }}</div>
          <div class="stat-label">已完成</div>
        </RouterLink>
      </div>
    </div>

    <!-- 收货信息 -->
    <div class="profile-card">
      <div class="card-header">
        <h2 class="card-title">收货信息</h2>
        <button type="button" class="edit-btn" @click="openDialog">
          {{ isFilled() ? '修改信息' : '立即填写' }}
        </button>
      </div>

      <div v-if="isFilled()" class="shipping-info">
        <div class="info-row">
          <span class="info-label">收货人</span>
          <span class="info-value">{{ userInfo.name }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">联系电话</span>
          <span class="info-value tabular">{{ userInfo.phone }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">收货地址</span>
          <span class="info-value">{{ userInfo.address }}</span>
        </div>
      </div>

      <div v-else class="shipping-empty">
        <p>还没有填写收货信息，完善后可快速下单结算</p>
      </div>
    </div>

    <div class="quick-actions">
      <RouterLink to="/products" class="action-btn">继续购物</RouterLink>
      <RouterLink to="/" class="action-btn">返回首页</RouterLink>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="修改收货信息" width="440px">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="收货人" prop="name">
          <el-input v-model="form.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" type="textarea" :rows="2" placeholder="请输入收货地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="isSaving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useUserInfoStore } from '@/stores/userinfo'
import { getOrders } from '@/api/order'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { getApiErrorMessage } from '@/api/index'

const { user } = storeToRefs(useAuthStore())
const userInfoStore = useUserInfoStore()
const { userInfo } = storeToRefs(userInfoStore)
const { isFilled, updateInfo, loadInfo } = userInfoStore

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const isSaving = ref(false)
const form = ref({ name: '', phone: '', address: '' })

// 与后端 routes/profile.js 的 validateProfile 规则保持一致
const rules: FormRules = {
  name: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度需为 2-20 个字符', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  address: [
    { required: true, message: '请输入收货地址', trigger: 'blur' },
    { min: 5, max: 100, message: '地址长度需为 5-100 个字符', trigger: 'blur' },
  ],
}

const orderCount = ref(0)
const pendingCount = ref(0)
const shippingCount = ref(0)
const doneCount = ref(0)

async function openDialog() {
  form.value = { ...userInfo.value }
  dialogVisible.value = true
  await nextTick()
  formRef.value?.clearValidate()
}

async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  isSaving.value = true
  try {
    await updateInfo({ ...form.value })
    dialogVisible.value = false
    ElMessage.success('收货信息已保存')
  } catch (err) {
    ElMessage.error(getApiErrorMessage(err))
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  loadInfo()
  try {
    const res = await getOrders()
    const orders = res.data
    orderCount.value = orders.length
    pendingCount.value = orders.filter((o) => o.status === '待付款').length
    shippingCount.value = orders.filter((o) => o.status === '待收货').length
    doneCount.value = orders.filter((o) => o.status === '已完成').length
  } catch {
    // 静默处理
  }
})
</script>

<style scoped>
.profile-page {
  max-width: var(--page-max-width);
  margin: 0 auto;
  padding: var(--page-padding);
}

.page-title {
  margin-bottom: 22px;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-ink);
}

.profile-card {
  margin-bottom: 20px;
  padding: 24px;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

/* ===== 顶部用户卡 ===== */
.user-hero-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.user-hero-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #111827, #374151);
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-greeting {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-ink);
}

.user-role {
  margin-top: 2px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.quick-pills {
  display: flex;
  gap: 10px;
}

.pill-link {
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-ink);
  background: var(--color-stage);
  border-radius: 999px;
  transition: all var(--transition);
}

.pill-link:hover {
  background: var(--color-border);
}

.pill-link-dark {
  color: #fff;
  background: var(--color-ink);
}

.pill-link-dark:hover {
  background: var(--color-ink-hover);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-hairline);
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-ink);
}

.text-link {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary);
}

/* ===== 统计网格 ===== */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.stat-item {
  text-align: center;
  padding: 20px 12px;
  border-radius: 12px;
  background: var(--color-stage);
  transition: all var(--transition);
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xs);
}

.stat-num {
  font-size: 28px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
}

.stat-label {
  margin-top: 4px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.stat-pending .stat-num {
  color: var(--color-warning);
}

.stat-shipping .stat-num {
  color: var(--color-primary);
}

.stat-done .stat-num {
  color: var(--color-success);
}

/* ===== 收货信息 ===== */
.info-row {
  display: flex;
  gap: 16px;
  padding: 11px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-label {
  width: 72px;
  flex-shrink: 0;
  font-size: 13px;
  color: var(--color-text-muted);
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-ink);
}

.tabular {
  font-variant-numeric: tabular-nums;
}

.shipping-empty {
  padding: 20px;
  border-radius: 12px;
  background: var(--color-stage);
  text-align: center;
  color: var(--color-text-muted);
  font-size: 13px;
}

.edit-btn {
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-ink);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  transition: all var(--transition);
}

.edit-btn:hover {
  border-color: var(--color-ink);
  background: var(--color-stage);
}

/* ===== 快捷操作 ===== */
.quick-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 13px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-ink);
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  transition: all var(--transition);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

@media (max-width: 768px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .profile-page {
    padding: 18px 16px 36px;
  }

  .profile-card {
    padding: 18px;
  }
}
</style>
