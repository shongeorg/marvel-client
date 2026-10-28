<script setup lang="ts">
import type { MarvelEntity } from '@/api/types'
import EntityCard from './EntityCard.vue'
import StateMessage from './StateMessage.vue'

withDefaults(
  defineProps<{
    items: MarvelEntity[]
    loading?: boolean
    error?: string
    skeletonCount?: number
    columns?: 'grid' | 'compact'
  }>(),
  { loading: false, error: '', skeletonCount: 12, columns: 'grid' },
)

defineEmits<{ retry: [] }>()
</script>

<template>
  <div>
    <div v-if="loading" class="grid" :class="`grid--${columns}`">
      <div v-for="index in skeletonCount" :key="index" class="card skeleton-card">
        <div class="skeleton skeleton-card__media" />
        <div class="skeleton-card__body">
          <div class="skeleton skeleton-card__line" />
          <div class="skeleton skeleton-card__line skeleton-card__line--short" />
        </div>
      </div>
    </div>

    <StateMessage
      v-else-if="error"
      tone="error"
      title="Не вдалося завантажити дані"
      :text="error"
    >
      <button type="button" class="btn btn-primary btn-sm" @click="$emit('retry')">Спробувати ще раз</button>
    </StateMessage>

    <StateMessage
      v-else-if="!items.length"
      title="Нічого не знайдено"
      text="Спробуйте інший запит або змініть фільтри пошуку."
    />

    <div v-else class="grid" :class="`grid--${columns}`">
      <EntityCard v-for="item in items" :key="`${item.kind}-${item.id}`" :entity="item" />
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.grid--compact {
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 14px;
}

.skeleton-card {
  overflow: hidden;
}

.skeleton-card__media {
  aspect-ratio: 3 / 4;
}

.skeleton-card__body {
  padding: 14px;
  display: grid;
  gap: 10px;
}

.skeleton-card__line {
  height: 12px;
  border-radius: 6px;
}

.skeleton-card__line--short {
  width: 60%;
}
</style>
