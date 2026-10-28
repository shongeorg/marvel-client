<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    text?: string
    tone?: 'error' | 'empty'
  }>(),
  { tone: 'empty', text: '' },
)
</script>

<template>
  <div class="state" :class="`state--${tone}`">
    <div class="state__icon">
      <svg v-if="tone === 'error'" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
        <path d="M12 8.5v5M12 16.6v.1" />
        <path d="M12 3.5 2.8 20h18.4Z" stroke-linejoin="round" />
      </svg>
      <svg v-else width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </svg>
    </div>
    <h3>{{ title }}</h3>
    <p v-if="text" class="muted">{{ text }}</p>
    <div class="state__action">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  padding: 64px 24px;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.015);
}

.state h3 {
  font-size: 1.15rem;
}

.state p {
  max-width: 46ch;
}

.state__icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  color: var(--text-dim);
  background: rgba(255, 255, 255, 0.05);
}

.state--error .state__icon {
  color: var(--mx-red);
  background: var(--mx-red-soft);
}

.state__action:empty {
  display: none;
}
</style>
