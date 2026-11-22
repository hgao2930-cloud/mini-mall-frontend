<template>
  <div class="orders-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">我的订单</h1>
        <p class="page-subtitle">查看历史订单记录与当前履约进度</p>
      </div>
    </div>

    <!-- 状态筛选标签 -->
    <div v-if="orders && orders.length > 0" class="status-tabs">
      <button
        v-for="tab in statusTabs"
        :key="tab.value"
        type="button"
        class="tab-btn"
        :class="{ active: activeStatus === tab.value }"
        @click="activeStatus = tab.value"
      >
        <span>{{ tab.label }}</span>
        <span class="tab-count">{{ tab.count }}</span>
      </button>
    </div>

    <!-- 骨架屏 -->
    <div v-if="isLoading" class="order-list">
      <div v-for="n in 2" :key="n" class="order-card">
        <div class="order-header">
          <div class="skeleton-block skeleton-sm"></div>
          <div class="skeleton-block skeleton-badge"></div>
        </div>
        <div class="skeleton-body">
          <div class="skeleton-block skeleton-item"></div>
        </div>
      </div>
    </div>

    <div v-else-if="errMsg" class="state-card state-error">
      <p>{{ errMsg }}</p>
      <button type="button" class="retry-btn" @click="load()">重试</button>
    </div>

    <div v-else-if="!orders || orders.length === 0" class="state-card">
      <p class="empty-title">暂无订单记录</p>
      <p class="empty-desc">下单后可以在这里实时跟踪订单状态</p>
      <RouterLink to="/products" class="empty-link">去逛逛 →</RouterLink>
    </div>

    <div v-else-if="filteredOrders.length === 0" class="state-card">
      <p class="empty-title">当前状态下暂无订单</p>
      <button type="button" class="retry-btn" @click="activeStatus = '全部'">查看全部订单</button>
    </div>

    <div v-else class="order-list">
      <div v-for="order in filteredOrders" :key="order.id" class="order-card">
        <div class="order-header">
          <div class="order-meta-left">
            <span class="order-id">订单 #{{ order.id }}</span>
            <span class="order-time">{{ formatTime(order.createdAt) }}</span>
          </div>
          <span :class="['status-badge', statusClass(order.status)]">
            <span class="status-dot"></span>
            {{ order.status }}
          </span>
        </div>

        <div class="order-items">
          <div v-for="item in order.items" :key="item.product.id" class="order-item">
            <RouterLink :to="`/products/${item.product.id}`" class="order-thumb-wrap">
              <img :src="item.product.image" :alt="item.product.name" class="order-item-image" />
            </RouterLink>
            <div class="order-item-info">
              <RouterLink :to="`/products/${item.product.id}`" class="order-item-name">
                {{ item.product.name }}
              </RouterLink>
              <div class="order-item-meta">
                ¥{{ formatPrice(item.product.price) }} × {{ item.quantity }}
              </div>
            </div>
            <div class="order-item-subtotal">
              ¥{{ formatPrice(item.product.price * item.quantity) }}
            </div>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-total">
            实付金额
            <span class="order-total-price">¥{{ formatPrice(order.totalPrice) }}</span>
          </div>
          <div class="order-actions">
            <button
              v-if="order.status === '待付款'"
              type="button"
              class="btn btn-primary"
              :disabled="payingId === order.id"
              @click="handlePay(order.id)"
            >
              {{ payingId === order.id ? '支付中...' : '模拟支付' }}
            </button>
            <button
              v-else-if="order.status === '待收货'"
              type="button"
              class="btn btn-success"
              :disabled="confirmingId === order.id"
              @click="handleConfirm(order.id)"
            >
              {{ confirmingId === order.id ? '确认中...' : '确认收货' }}
            </button>
            <span v-else class="done-hint">✓ 交易已完成</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getOrders, payOrder, confirmOrder } from '@/api/order'
import { computed, onMounted, ref } from 'vue'
import { useAsyncData } from '@/composables/useAsyncData'
import { ElMessage } from 'element-plus'
import { RouterLink } from 'vue-router'
import { getApiErrorMessage } from '@/api/index'
import { formatPrice } from '@/utils/format'

const { data: orders, isLoading, errMsg, load } = useAsyncData(getOrders)
const activeStatus = ref<'全部' | '待付款' | '待收货' | '已完成'>('全部')

const statusTabs = computed(() => {
  const list = orders.value ?? []
  return [
    { label: '全部', value: '全部' as const, count: list.length },
    {
      label: '待付款',
      value: '待付款' as const,
      count: list.filter((o) => o.status === '待付款').length,
    },
    {
      label: '待收货',
      value: '待收货' as const,
      count: list.filter((o) => o.status === '待收货').length,
    },
    {
      label: '已完成',
      value: '已完成' as const,
      count: list.filter((o) => o.status === '已完成').length,
    },
  ]
})

const filteredOrders = computed(() => {
  const list = orders.value ?? []
  if (activeStatus.value === '全部') return list
  return list.filter((o) => o.status === activeStatus.value)
})

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
  payingId.value = id
  try {
    await payOrder(id)
    await load()
    ElMessage.success('支付成功')
  } catch (err) {
    ElMessage.error(getApiErrorMessage(err))
  } finally {
    payingId.value = ''
  }
}

const handleConfirm = async function (id: string) {
  confirmingId.value = id
  try {
    await confirmOrder(id)
    await load()
    ElMessage.success('收货确认成功')
  } catch (err) {
    ElMessage.error(getApiErrorMessage(err))
  } finally {
    confirmingId.value = ''
  }
}

const payingId = ref('')
const confirmingId = ref('')

onMounted(() => load())
</script>

<style scoped>
.orders-page {
  max-width: var(--page-max-width);
  margin: 0 auto;
  padding: var(--page-padding);
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-ink);
}

.page-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: var(--color-text-muted);
}

/* ===== 状态筛选条 ===== */
.status-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  transition: all var(--transition);
}

.tab-btn:hover {
  color: var(--color-ink);
  border-color: var(--color-ink);
}

.tab-btn.active {
  color: #fff;
  background: var(--color-ink);
  border-color: var(--color-ink);
}

.tab-count {
  padding: 1px 7px;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.08);
  color: var(--color-text-secondary);
}

.tab-btn.active .tab-count {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

/* ===== 骨架 & 空/错误态 ===== */
.skeleton-sm {
  width: 160px;
  height: 16px;
  border-radius: 6px;
}

.skeleton-badge {
  width: 68px;
  height: 24px;
  border-radius: 999px;
}

.skeleton-body {
  padding: 20px 24px;
}

.skeleton-item {
  width: 100%;
  height: 64px;
  border-radius: 10px;
}

.state-card {
  text-align: center;
  padding: 72px 24px;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  color: var(--color-text-muted);
}

.state-error {
  color: var(--color-danger);
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-ink);
}

.empty-desc {
  margin-top: 6px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.retry-btn,
.empty-link {
  display: inline-flex;
  align-items: center;
  margin-top: 20px;
  padding: 10px 26px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background: var(--color-ink);
  border-radius: 999px;
}

/* ===== 订单卡片 ===== */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.order-card {
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  background: #fafafa;
  border-bottom: 1px solid var(--color-hairline);
}

.order-meta-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.order-id {
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
}

.order-time {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* ===== 状态徽章 ===== */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-pending {
  color: var(--color-warning);
  background: var(--color-warning-light);
}

.status-shipping {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.status-done {
  color: var(--color-success);
  background: var(--color-success-light);
}

/* ===== 订单条目 ===== */
.order-items {
  padding: 0 24px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-hairline);
}

.order-item:last-child {
  border-bottom: none;
}

.order-thumb-wrap {
  width: 64px;
  height: 64px;
  padding: 6px;
  border-radius: 10px;
  background: var(--color-stage);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.order-item-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
}

.order-item-info {
  flex: 1;
  min-width: 0;
}

.order-item-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
  margin-bottom: 4px;
  transition: color var(--transition);
}

.order-item-name:hover {
  color: var(--color-primary);
}

.order-item-meta {
  font-size: 13px;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.order-item-subtotal {
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
  min-width: 84px;
  text-align: right;
}

/* ===== 底部 ===== */
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 24px;
  background: #fafafa;
  border-top: 1px solid var(--color-hairline);
}

.order-total {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.order-total-price {
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
}

.order-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn {
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 999px;
  transition: all var(--transition);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  color: #fff;
  background: var(--color-ink);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-ink-hover);
  transform: translateY(-1px);
}

.btn-success {
  color: #fff;
  background: var(--color-success);
}

.btn-success:hover:not(:disabled) {
  filter: brightness(0.95);
  transform: translateY(-1px);
}

.done-hint {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-success);
}

@media (max-width: 640px) {
  .orders-page {
    padding: 18px 16px 36px;
  }

  .order-header,
  .order-items,
  .order-footer {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
