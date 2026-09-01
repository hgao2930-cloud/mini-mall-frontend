<template>
  <div class="profile-page">
    <h1 class="page-title">个人中心</h1>

    <div class="profile-card">
      <div class="profile-avatar">{{ user?.username?.charAt(0).toUpperCase() }}</div>
      <div class="profile-info">
        <div class="info-row">
          <span class="info-label">用户名</span>
          <span class="info-value">{{ user?.username }}</span>
        </div>
        <!-- <div class="info-row">
          <span class="info-label">用户ID</span>
          <span class="info-value info-id">{{ user?.id }}</span>
        </div> -->
      </div>
    </div>

    <div class="profile-card">
      <div class="card-header">
        <h2 class="card-title">收货信息</h2>
        <button class="edit-btn" @click="openDialog">修改信息</button>
      </div>
      <div v-if="isFilled()" class="shipping-info">
        <div class="info-row">
          <span class="info-label">收货人</span>
          <span class="info-value">{{ userInfo.name }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">电话</span>
          <span class="info-value">{{ userInfo.phone }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">地址</span>
          <span class="info-value">{{ userInfo.address }}</span>
        </div>
      </div>
      <div v-else class="shipping-empty">
        <p>还没有填写收货信息</p>
        <button class="edit-btn" @click="openDialog">立即填写</button>
      </div>
    </div>

    <div class="profile-card">
      <h2 class="card-title">订单统计</h2>
      <div class="stat-grid">
        <div class="stat-item">
          <div class="stat-num">{{ orderCount }}</div>
          <div class="stat-label">总订单</div>
        </div>
        <div class="stat-item stat-pending">
          <div class="stat-num">{{ pendingCount }}</div>
          <div class="stat-label">待付款</div>
        </div>
        <div class="stat-item stat-shipping">
          <div class="stat-num">{{ shippingCount }}</div>
          <div class="stat-label">待收货</div>
        </div>
        <div class="stat-item stat-done">
          <div class="stat-num">{{ doneCount }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <RouterLink to="/orders" class="action-btn">查看订单</RouterLink>
      <RouterLink to="/products" class="action-btn">去购物</RouterLink>
      <RouterLink to="/" class="action-btn">返回首页</RouterLink>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="修改收货信息" width="420px">
      <el-form :model="form" label-position="top">
        <el-form-item label="收货人">
          <el-input v-model="form.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" type="textarea" :rows="2" placeholder="请输入收货地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserInfoStore } from '@/stores/userinfo'
import { getOrders } from '@/api/order'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'

const { user } = storeToRefs(useAuthStore())
const userInfoStore = useUserInfoStore()
const { userInfo } = storeToRefs(userInfoStore)
const { isFilled, updateInfo, loadInfo } = userInfoStore

const dialogVisible = ref(false)
const form = ref({ name: '', phone: '', address: '' })

const orderCount = ref(0)
const pendingCount = ref(0)
const shippingCount = ref(0)
const doneCount = ref(0)

function openDialog() {
  form.value = { ...userInfo.value }
  dialogVisible.value = true
}

function handleSave() {
  if (!form.value.name || !form.value.phone || !form.value.address) {
    ElMessage.warning('请填写完整的收货信息')
    return
  }
  updateInfo(form.value)
  dialogVisible.value = false
  ElMessage.success('收货信息已保存')
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
  margin-bottom: 24px;
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text);
}

/* ===== 卡片 ===== */
.profile-card {
  margin-bottom: 20px;
  padding: 24px;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

/* ===== 头像 ===== */
.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-size: 28px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

/* ===== 信息行 ===== */
.info-row {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  width: 80px;
  flex-shrink: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.info-value {
  font-size: 14px;
  color: var(--color-text);
}

.info-id {
  font-family: monospace;
  font-size: 13px;
  color: var(--color-text-placeholder);
}

/* ===== 收货信息 ===== */
.shipping-empty {
  text-align: center;
  padding: 20px 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.shipping-empty p {
  margin-bottom: 12px;
}

.edit-btn {
  padding: 4px 14px;
  font-size: 13px;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--border-radius-sm);
  transition: all var(--transition);
}

.edit-btn:hover {
  background: var(--color-primary);
  color: #fff;
}

/* ===== 统计 ===== */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px 0;
  border-radius: var(--border-radius);
  background: var(--color-bg);
}

.stat-num {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
}

.stat-label {
  margin-top: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
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

/* ===== 快捷操作 ===== */
.quick-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.action-btn {
  flex: 1;
  padding: 12px;
  text-align: center;
  font-size: 14px;
  color: var(--color-primary);
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  transition: all var(--transition);
}

.action-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}
</style>
