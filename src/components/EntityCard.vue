<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import type { MarvelEntity } from '@/api/types'
import { KIND_META } from '@/api/kinds'
import { describe, entityImage, formatDate } from '@/lib/media'
import FavoriteButton from './FavoriteButton.vue'
import KindIcon from './KindIcon.vue'

const props = withDefaults(
  defineProps<{
    entity: MarvelEntity
    dateLabel?: string
  }>(),
  { dateLabel: 'Оновлено' },
)

const image = computed(() => entityImage(props.entity))
const broken = ref(false)

watch(image, () => {
  broken.value = false
})

const meta = computed(() => KIND_META[props.entity.kind])
const summary = computed(() => describe(props.entity, 150))
</script>

<template>
  <article class="card entity">
    <RouterLink class="entity__link" :to="{ name: 'detail', params: { kind: entity.kind, id: entity.id } }">
      <div class="entity__media" :style="{ '--accent': meta.accent }">
        <img v-if="image && !broken" :src="image" :alt="entity.name" loading="lazy" @error="broken = true" />
        <div v-else class="entity__placeholder">
          <KindIcon :kind="entity.kind" :size="34" />
        </div>
        <span class="entity__kind">
          <KindIcon :kind="entity.kind" :size="13" />
          {{ meta.singular }}
        </span>
      </div>

      <div class="entity__body">
        <h3 class="entity__name clamp-2">{{ entity.name }}</h3>
        <p v-if="summary" class="entity__desc clamp-3">{{ summary }}</p>
        <p v-else class="entity__desc muted">Опис відсутній у базі.</p>
      </div>
    </RouterLink>

    <footer class="entity__foot">
      <span class="entity__date">{{ dateLabel }} {{ formatDate(entity.modified) }}</span>
      <FavoriteButton :entity="entity" />
    </footer>
  </article>
</template>

<style scoped>
.entity {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.entity:hover {
  transform: translateY(-4px);
  border-color: var(--border-strong);
  box-shadow: var(--shadow);
}

.entity__link {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.entity__media {
  position: relative;
  aspect-ratio: 3 / 4;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.01));
  overflow: hidden;
}

.entity__media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 55%, rgba(9, 10, 14, 0.92));
}

.entity__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.entity:hover .entity__media img {
  transform: scale(1.05);
}

.entity__placeholder {
  display: grid;
  place-items: center;
  height: 100%;
  color: var(--text-mute);
}

.entity__kind {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  background: color-mix(in srgb, var(--accent) 78%, #000);
  border: 1px solid color-mix(in srgb, var(--accent) 60%, #fff 15%);
}

.entity__body {
  flex: 1;
  padding: 14px 14px 10px;
}

.entity__name {
  font-size: 1rem;
  min-height: 2.3em;
}

.entity__desc {
  margin-top: 8px;
  font-size: 0.85rem;
  color: var(--text-dim);
}

.entity__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px 14px;
  border-top: 1px solid var(--border);
}

.entity__date {
  font-size: 0.72rem;
  color: var(--text-mute);
}
</style>
