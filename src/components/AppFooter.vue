<script setup lang="ts">
import { KIND_LIST } from '@/api/kinds'
import { API_BASE } from '@/api/marvel'
</script>

<template>
  <footer class="footer">
    <div class="container footer__inner">
      <div>
        <strong class="footer__title">Marvel Explorer</strong>
        <p class="muted footer__text">
          Клієнт до власного Marvel API. Дані отримано з Marvel Database (Fandom).
        </p>
      </div>

      <nav class="footer__links">
        <RouterLink v-for="meta in KIND_LIST" :key="meta.kind" :to="{ name: 'list', params: { kind: meta.kind } }">
          {{ meta.label }}
        </RouterLink>
      </nav>

      <p class="footer__api muted">
        API: <a :href="API_BASE" target="_blank" rel="noopener">{{ API_BASE }}</a>
      </p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--border);
  background: rgba(9, 10, 14, 0.6);
  padding: 28px 0;
}

.footer__inner {
  display: flex;
  flex-wrap: wrap;
  gap: 18px 32px;
  align-items: flex-start;
  justify-content: space-between;
}

.footer__title {
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--mx-red);
}

.footer__text {
  font-size: 0.85rem;
  max-width: 42ch;
}

.footer__links {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  font-size: 0.85rem;
  color: var(--text-dim);
}

.footer__links a:hover {
  color: var(--text);
}

.footer__api {
  font-size: 0.78rem;
  width: 100%;
  word-break: break-all;
}

.footer__api a {
  color: var(--text-dim);
  text-decoration: underline;
}
</style>
