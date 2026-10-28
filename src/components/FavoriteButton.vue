<script setup lang="ts">
import { computed } from 'vue'
import type { MarvelEntity } from '@/api/types'
import { useFavoritesStore } from '@/stores/favorites'

const props = withDefaults(
  defineProps<{
    entity: MarvelEntity
    label?: boolean
  }>(),
  { label: false },
)

const favorites = useFavoritesStore()
const active = computed(() => favorites.isFavorite(props.entity.kind, props.entity.id))
</script>

<template>
  <button
    type="button"
    class="fav"
    :class="{ 'fav--active': active }"
    :aria-pressed="active"
    :title="active ? 'Прибрати з обраного' : 'Додати в обране'"
    @click.prevent.stop="favorites.toggle(entity)"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" :fill="active ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13Z" />
    </svg>
    <span v-if="label">{{ active ? 'В обраному' : 'В обране' }}</span>
  </button>
</template>

<style scoped>
.fav {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: rgba(9, 10, 14, 0.7);
  backdrop-filter: blur(6px);
  color: var(--text-dim);
  cursor: pointer;
  transition: color 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.fav:hover {
  color: var(--mx-red);
  border-color: rgba(230, 36, 41, 0.6);
}

.fav--active {
  color: var(--mx-red);
  border-color: rgba(230, 36, 41, 0.6);
  background: var(--mx-red-soft);
}
</style>
