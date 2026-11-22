<template>
  <div class="not-found-page">
    <div class="not-found-card">
      <div class="not-found-code">404</div>
      <h1 class="not-found-title">页面不存在</h1>
      <p class="not-found-desc">您访问的页面可能已移动或暂时无法访问</p>
      <div class="not-found-actions">
        <RouterLink to="/" class="back-btn">返回首页</RouterLink>
        <RouterLink to="/products" class="browse-btn">去逛逛</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.not-found-page {
  max-width: var(--page-max-width);
  margin: 0 auto;
  padding: var(--page-padding);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 64px);
}

.not-found-card {
  text-align: center;
  background: var(--color-bg-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  padding: 56px 64px;
  max-width: 480px;
  width: 100%;
}

.not-found-code {
  font-size: 84px;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--color-border);
  line-height: 1;
  margin-bottom: 16px;
}

.not-found-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 8px;
}

.not-found-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-bottom: 32px;
}

.not-found-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.back-btn,
.browse-btn {
  padding: 10px 26px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition);
}

.back-btn {
  background: var(--color-ink);
  color: #fff;
}

.back-btn:hover {
  background: var(--color-ink-hover);
  transform: translateY(-1px);
}

.browse-btn {
  background: var(--color-bg-white);
  color: var(--color-ink);
  border: 1px solid var(--color-border);
}

.browse-btn:hover {
  border-color: var(--color-ink);
  background: var(--color-stage);
}
</style>
