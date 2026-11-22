<template>
  <div class="home-page">
    <!-- Hero 横幅 -->
    <section class="hero">
      <div class="hero-content">
        <span class="hero-eyebrow">
          <span class="eyebrow-dot"></span>
          {{ isLoggedIn ? `欢迎回来，${user?.username}` : '2026 数码精选 · 实时库存' }}
        </span>
        <h1 class="hero-title">精选数码好物，纯粹设计体验</h1>
        <p class="hero-subtitle">
          涵盖旗舰手机、轻薄笔记本、降噪耳机与桌面配件，所见即所得的轻盈购物体验。
        </p>
        <div class="hero-actions">
          <RouterLink to="/products" class="hero-btn-primary">探索全部商品 →</RouterLink>
          <RouterLink :to="isLoggedIn ? '/orders' : '/login'" class="hero-btn-secondary">
            {{ isLoggedIn ? '我的订单' : '登录 / 注册' }}
          </RouterLink>
        </div>
      </div>

      <RouterLink
        v-if="products?.[0]"
        :to="`/products/${products[0].id}`"
        class="hero-spotlight"
      >
        <div class="spotlight-top">
          <span class="spotlight-pill">TOP 1 热销</span>
          <span class="spotlight-cat">{{ products[0].category }}</span>
        </div>
        <div class="spotlight-stage">
          <img :src="products[0].image" :alt="products[0].name" />
        </div>
        <div class="spotlight-meta">
          <div class="spotlight-name">{{ products[0].name }}</div>
          <div class="spotlight-price">¥{{ formatPrice(products[0].price) }}</div>
        </div>
      </RouterLink>
    </section>

    <!-- 分类快捷入口 -->
    <section class="category-strip">
      <RouterLink
        v-for="cat in quickCategories"
        :key="cat.name"
        :to="`/products?category=${encodeURIComponent(cat.name)}`"
        class="cat-tile"
      >
        <span class="cat-icon" aria-hidden="true">
          <svg
            v-if="cat.key === 'phone'"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <rect x="7" y="2" width="10" height="20" rx="2.2" />
            <line x1="11" y1="18.5" x2="13" y2="18.5" />
          </svg>
          <svg
            v-else-if="cat.key === 'laptop'"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <rect x="3" y="4" width="18" height="12" rx="1.8" />
            <path d="M2 19h20" />
          </svg>
          <svg
            v-else-if="cat.key === 'audio'"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path d="M4 13a8 8 0 0 1 16 0" />
            <rect x="3" y="13" width="4" height="7" rx="1.5" />
            <rect x="17" y="13" width="4" height="7" rx="1.5" />
          </svg>
          <svg
            v-else-if="cat.key === 'tablet'"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <circle cx="12" cy="18.5" r="0.8" fill="currentColor" />
          </svg>
          <svg
            v-else-if="cat.key === 'watch'"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <rect x="6.5" y="6" width="11" height="12" rx="2.8" />
            <path d="M9 6V3h6v3M9 18v3h6v-3" />
          </svg>
          <svg
            v-else-if="cat.key === 'desktop'"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <rect x="2.5" y="3.5" width="19" height="13" rx="2" />
            <path d="M8 20.5h8M12 16.5v4" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path d="M9 3v6m6-6v6M7 9h10v3a5 5 0 0 1-10 0V9Zm5 8v4" />
          </svg>
        </span>
        <span class="cat-name">{{ cat.name }}</span>
      </RouterLink>
    </section>

    <!-- 热门推荐 -->
    <section class="section">
      <div class="section-header">
        <div>
          <h2 class="section-title">热门推荐</h2>
          <p class="section-subtitle">基于全站浏览热度实时排行</p>
        </div>
        <RouterLink to="/products" class="section-more">查看全部 →</RouterLink>
      </div>

      <div v-if="isLoading" class="top-grid">
        <div v-for="n in 4" :key="n" class="skeleton-card">
          <div class="skeleton-block skeleton-img"></div>
          <div class="skeleton-body">
            <div class="skeleton-block skeleton-tag"></div>
            <div class="skeleton-block skeleton-title"></div>
            <div class="skeleton-block skeleton-price"></div>
          </div>
        </div>
      </div>

      <div v-else-if="errMsg" class="state-card state-error">
        <p>{{ errMsg }}</p>
        <button class="retry-btn" @click="load()">重新加载</button>
      </div>

      <div v-else-if="!products?.length" class="state-card">暂无推荐商品</div>

      <div v-else class="top-grid">
        <RouterLink
          v-for="product in products"
          :key="product.id"
          :to="`/products/${product.id}`"
          class="top-card"
          :class="{ 'is-sold-out': product.stock <= 0 }"
        >
          <div class="product-stage">
            <span v-if="product.stock <= 0" class="status-badge sold-out-badge">已售罄</span>
            <span v-else-if="product.stock <= 5" class="status-badge low-stock-badge">
              仅剩 {{ product.stock }} 件
            </span>
            <img :src="product.image" :alt="product.name" />
          </div>
          <div class="card-body">
            <span class="card-category">{{ product.category }}</span>
            <h3 class="card-name">{{ product.name }}</h3>
            <div class="card-price">¥{{ formatPrice(product.price) }}</div>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- 服务保障条 -->
    <section class="highlights">
      <div v-for="item in highlights" :key="item.title" class="highlight-item">
        <div class="highlight-icon" aria-hidden="true">
          <svg
            v-if="item.icon === 'shield'"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path d="M12 3 4 6.5v5.5c0 4.8 3.4 8.7 8 9.8 4.6-1.1 8-5 8-9.8V6.5L12 3Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <svg
            v-else-if="item.icon === 'bolt'"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
          </svg>
          <svg
            v-else-if="item.icon === 'lock'"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7v-7Z" />
            <circle cx="7.5" cy="17.5" r="1.5" />
            <circle cx="17.5" cy="17.5" r="1.5" />
          </svg>
        </div>
        <div>
          <div class="highlight-title">{{ item.title }}</div>
          <div class="highlight-desc">{{ item.desc }}</div>
        </div>
      </div>
    </section>

    <footer class="footer">
      © 2026 MiniMall · 商品图片来源于网络，仅用于学习演示，版权归原作者所有
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { getHotProducts } from '@/api/products'
import { useAsyncData } from '@/composables/useAsyncData'
import { formatPrice } from '@/utils/format'

const authStore = useAuthStore()
const { user, isLoggedIn } = storeToRefs(authStore)
const { data, isLoading, errMsg, load } = useAsyncData(() => getHotProducts())
const products = computed(() => data.value?.products)

const quickCategories = [
  { name: '手机', key: 'phone' },
  { name: '笔记本', key: 'laptop' },
  { name: '耳机', key: 'audio' },
  { name: '平板', key: 'tablet' },
  { name: '手表', key: 'watch' },
  { name: '台式机', key: 'desktop' },
  { name: '配件', key: 'accessory' },
]

const highlights = [
  { icon: 'shield', title: '原厂正品精选', desc: '覆盖主流旗舰数码设备' },
  { icon: 'bolt', title: '实时库存校验', desc: '下单事务原子扣减防超卖' },
  { icon: 'lock', title: '安全会话保护', desc: 'httpOnly Cookie 鉴权机制' },
  { icon: 'truck', title: '全链路订单追踪', desc: '待付款到已完成清晰流转' },
]

onMounted(() => {
  load()
})
</script>

<style scoped>
.home-page {
  max-width: var(--page-max-width);
  margin: 0 auto;
  padding: var(--page-padding);
}

/* ===== Hero 横幅 ===== */
.hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;
  gap: 32px;
  align-items: center;
  padding: 44px 48px;
  margin-bottom: 24px;
  border-radius: var(--border-radius-lg);
  background:
    radial-gradient(circle at 85% 20%, rgba(0, 102, 204, 0.34), transparent 52%),
    radial-gradient(circle at 12% 88%, rgba(56, 189, 248, 0.16), transparent 45%),
    linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #111827 100%);
  color: #fff;
  box-shadow: var(--shadow-lg);
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  margin-bottom: 18px;
  font-size: 12px;
  font-weight: 500;
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
}

.eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #38bdf8;
}

.hero-title {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.22;
  letter-spacing: -0.025em;
  margin-bottom: 14px;
}

.hero-subtitle {
  max-width: 520px;
  font-size: 15px;
  line-height: 1.7;
  color: #cbd5e1;
  margin-bottom: 28px;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 12px 26px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
  background: #fff;
  border-radius: 999px;
  transition: all var(--transition);
}

.hero-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
}

.hero-btn-secondary {
  display: inline-flex;
  align-items: center;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  transition: all var(--transition);
}

.hero-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateY(-2px);
}

/* 右侧焦点单品卡 */
.hero-spotlight {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(12px);
  transition: all var(--transition);
}

.hero-spotlight:hover {
  background: rgba(255, 255, 255, 0.14);
  transform: translateY(-3px);
}

.spotlight-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.spotlight-pill {
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  color: #0f172a;
  background: #38bdf8;
  border-radius: 999px;
}

.spotlight-cat {
  font-size: 12px;
  color: #cbd5e1;
}

.spotlight-stage {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  aspect-ratio: 16 / 10;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.spotlight-stage img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.spotlight-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.spotlight-name {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spotlight-price {
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #38bdf8;
  flex-shrink: 0;
}

/* ===== 分类快捷条 ===== */
.category-strip {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;
  margin-bottom: 40px;
}

.cat-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 10px;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  color: var(--color-text-secondary);
  transition: all var(--transition);
}

.cat-tile:hover {
  color: var(--color-ink);
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.cat-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--color-stage);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-ink);
  transition: background var(--transition);
}

.cat-tile:hover .cat-icon {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.cat-name {
  font-size: 13px;
  font-weight: 500;
}

/* ===== 热门推荐 ===== */
.section {
  margin-bottom: 44px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-ink);
}

.section-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.section-more {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-primary);
  transition: color var(--transition);
}

.section-more:hover {
  color: var(--color-primary-dark);
}

.state-card {
  padding: 56px 24px;
  text-align: center;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  color: var(--color-text-muted);
}

.state-error {
  color: var(--color-danger);
}

.retry-btn {
  margin-top: 14px;
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background: var(--color-ink);
  border-radius: 999px;
}

/* ===== 商品网格 & 骨架屏 ===== */
.top-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.skeleton-card {
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.skeleton-img {
  width: 100%;
  aspect-ratio: 1;
}

.skeleton-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-tag {
  width: 44px;
  height: 18px;
  border-radius: 6px;
}

.skeleton-title {
  width: 85%;
  height: 18px;
  border-radius: 6px;
}

.skeleton-price {
  width: 60px;
  height: 22px;
  border-radius: 6px;
}

.top-card {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: all var(--transition);
}

.top-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}

.product-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  padding: 22px;
  background: var(--color-stage);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-stage img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.top-card:hover .product-stage img {
  transform: scale(1.05);
}

.top-card.is-sold-out .product-stage img {
  filter: grayscale(0.6);
  opacity: 0.55;
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 999px;
}

.sold-out-badge {
  color: #fff;
  background: rgba(17, 24, 39, 0.72);
  backdrop-filter: blur(6px);
}

.low-stock-badge {
  color: var(--color-warning);
  background: var(--color-warning-light);
  border: 1px solid rgba(217, 119, 6, 0.2);
}

.card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.card-category {
  align-self: flex-start;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-muted);
  background: var(--color-stage);
  border-radius: 6px;
}

.card-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-ink);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-price {
  margin-top: auto;
  padding-top: 4px;
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-ink);
}

/* ===== 服务保障条 ===== */
.highlights {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 36px;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.highlight-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 10px;
  background: var(--color-stage);
  color: var(--color-ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.highlight-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
}

.highlight-desc {
  margin-top: 2px;
  font-size: 12px;
  color: var(--color-text-muted);
}

/* ===== Footer ===== */
.footer {
  padding: 24px 0 8px;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-placeholder);
  border-top: 1px solid var(--color-hairline);
}

@media (max-width: 1024px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 36px 28px;
  }

  .category-strip {
    grid-template-columns: repeat(4, 1fr);
  }

  .top-grid,
  .highlights {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .home-page {
    padding: 18px 16px 36px;
  }

  .hero {
    padding: 28px 20px;
  }

  .hero-title {
    font-size: 26px;
  }

  .category-strip {
    grid-template-columns: repeat(3, 1fr);
  }

  .top-grid {
    gap: 12px;
  }

  .highlights {
    grid-template-columns: 1fr;
  }
}
</style>
