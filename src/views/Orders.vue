<template>
  <div class="orders-page">
    <h1 class="page-title">我的订单</h1>

    <div v-if="isLoading" class="loading">加载中</div>
    <div v-else-if="errMsg" class="error">{{ errMsg }}</div>
    <div v-else-if="!orders || orders.length === 0" class="empty">
      <p>暂无订单</p>
      <RouterLink to="/products" class="empty-link">去逛逛</RouterLink>
    </div>

    <div v-else class="order-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-time">{{ formatTime(order.createdAt) }}</span>
          <span :class="['status-badge', statusClass(order.status)]">{{ order.status }}</span>
        </div>

        <div class="order-items">
          <div v-for="item in order.items" :key="item.product.id" class="order-item">
            <img :src="item.product.image" :alt="item.product.name" class="order-item-image" />
            <div class="order-item-info">
              <div class="order-item-name">{{ item.product.name }}</div>
              <div class="order-item-meta">¥{{ item.product.price }} × {{ item.quantity }}</div>
            </div>
            <div class="order-item-subtotal">¥{{ item.product.price * item.quantity }}</div>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-total">
            合计 <span class="order-total-price">¥{{ order.totalPrice }}</span>
          </div>
          <div class="order-actions">
            <button
              v-if="order.status === '待付款'"
              class="btn btn-primary"
              @click="handlePay(order.id)"
            >
              模拟支付
            </button>
            <button
              v-if="order.status === '待收货'"
              class="btn btn-success"
              @click="handleConfirm(order.id)"
            >
              确认收货
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getOrders, payOrder, confirmOrder } from '@/api/order'
import { onMounted } from 'vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { ElMessage } from 'element-plus'
import { RouterLink } from 'vue-router'

const { data: orders, isLoading, errMsg, load } = useAsyncData(getOrders)

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    待付款: 'status-pending',
    待收货: 'status-shipping',
    已完成: 'status-done',
  }
  return map[status] ?? ''
}

const handlePay = async function (id: string) {
  try {
    await payOrder(id)
    await load()
    ElMessage.success('支付成功')
  } catch {
    ElMessage.error('支付失败，请稍后重试')
  }
}

const handleConfirm = async function (id: string) {
  try {
    await confirmOrder(id)
    await load()
    ElMessage.success('收货确认成功')
  } catch {
    ElMessage.error('确认收货失败，请稍后重试')
  }
}

onMounted(() => load())
</script>

<style scoped>
.orders-page {
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

/* ===== 状态 ===== */
.loading,
.empty,
.error {
  text-align: center;
  padding: 80px 0;
  color: var(--color-text-secondary);
  font-size: 15px;
}

.error {
  color: var(--color-danger);
}

.empty-link {
  display: inline-block;
  margin-top: 16px;
  padding: 8px 24px;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--border-radius);
  transition: all var(--transition);
}

.empty-link:hover {
  background: var(--color-primary);
  color: #fff;
}

/* ===== 订单卡片 ===== */
.order-card {
  margin-bottom: 20px;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border-light);
}

.order-time {
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* ===== 状态徽章 ===== */
.status-badge {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 10px;
}

.status-pending {
  color: #e6a23c;
  background: #fdf6ec;
}

.status-shipping {
  color: #409eff;
  background: #ecf5ff;
}

.status-done {
  color: #67c23a;
  background: #f0f9eb;
}

/* ===== 订单条目 ===== */
.order-items {
  padding: 0 20px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.order-item:last-child {
  border-bottom: none;
}

.order-item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--border-radius-sm);
  flex-shrink: 0;
}

.order-item-info {
  flex: 1;
  min-width: 0;
}

.order-item-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 4px;
}

.order-item-meta {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.order-item-subtotal {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-danger);
  min-width: 70px;
  text-align: right;
}

/* ===== 底部 ===== */
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: var(--color-bg);
  border-top: 1px solid var(--color-border-light);
}

.order-total {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.order-total-price {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-danger);
}

.order-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 6px 20px;
  font-size: 13px;
  font-weight: 500;
  border-radius: var(--border-radius-sm);
  transition: all var(--transition);
}

.btn-primary {
  color: #fff;
  background: var(--color-primary);
}

.btn-primary:hover {
  background: var(--color-primary-dark);
}

.btn-success {
  color: #fff;
  background: var(--color-success);
}

.btn-success:hover {
  background: #5daf34;
}
</style>
