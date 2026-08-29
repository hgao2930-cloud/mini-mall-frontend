<template>
  <div class="not-found-page">
    <div class="not-found-card">
      <div class="not-found-code">404</div>
      <h1 class="not-found-title">页面不存在</h1>
      <p class="not-found-desc">您访问的页面暂时无法访问</p>
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
  min-height: 60vh;
}

.not-found-card {
  text-align: center;
  background: var(--color-bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 60px 80px;
}

.not-found-code {
  font-size: 80px;
  font-weight: 800;
  color: var(--color-border-light);
  line-height: 1;
  margin-bottom: 16px;
}

.not-found-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
}

.not-found-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 32px;
}

.not-found-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.back-btn,
.browse-btn {
  padding: 10px 24px;
  border-radius: var(--border-radius);
  font-size: 14px;
  text-decoration: none;
  transition: all var(--transition);
}

.back-btn {
  background: var(--color-primary);
  color: #fff;
}

.back-btn:hover {
  background: var(--color-primary-dark);
}

.browse-btn {
  background: var(--color-bg);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.browse-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}
</style>
