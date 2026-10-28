<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { KIND_META, KIND_LIST } from '@/api/kinds'
import type { Kind, MarvelEntity } from '@/api/types'
import { useFavoritesStore, type FavoriteEntry } from '@/stores/favorites'
import EntityCard from '@/components/EntityCard.vue'
import KindIcon from '@/components/KindIcon.vue'
import StateMessage from '@/components/StateMessage.vue'

const favorites = useFavoritesStore()
const activeKind = ref<Kind | 'all'>('all')

const visible = computed(() =>
  activeKind.value === 'all'
    ? favorites.entries
    : favorites.entries.filter((entry) => entry.kind === activeKind.value),
)

const countsByKind = computed(() => {
  const map = new Map<Kind, number>()
  for (const entry of favorites.entries) {
    map.set(entry.kind, (map.get(entry.kind) ?? 0) + 1)
  }
  return map
})

/** Перетворює збережений елемент на форму, яку очікує картка. */
function toEntity(entry: FavoriteEntry): MarvelEntity {
  return {
    id: entry.id,
    kind: entry.kind,
    slug: entry.name,
    name: entry.name,
    description: null,
    thumbnail: null,
    modified: new Date(entry.addedAt).toISOString(),
    sourceUrl: '',
    data: entry.image ? { image: entry.image } : undefined,
  }
}
</script>

<template>
  <section class="page">
    <div class="container">
      <header class="head">
        <p class="strike-line">Особиста колекція</p>
        <div class="head__row">
          <h1>Обране</h1>
          <span class="chip">{{ favorites.count }} збережено</span>
        </div>
        <p class="muted">Записи зберігаються локально у вашому браузері.</p>
      </header>

      <template v-if="favorites.count">
        <div class="filters">
          <button
            type="button"
            class="btn btn-sm"
            :class="{ 'btn-primary': activeKind === 'all' }"
            @click="activeKind = 'all'"
          >
            Усі ({{ favorites.count }})
          </button>
          <button
            v-for="meta in KIND_LIST"
            :key="meta.kind"
            type="button"
            class="btn btn-sm"
            :class="{ 'btn-primary': activeKind === meta.kind }"
            :disabled="!countsByKind.get(meta.kind)"
            @click="activeKind = meta.kind"
          >
            <KindIcon :kind="meta.kind" :size="14" />
            {{ meta.label }} ({{ countsByKind.get(meta.kind) ?? 0 }})
          </button>
        </div>

        <div v-if="visible.length" class="grid">
          <EntityCard
            v-for="entry in visible"
            :key="`${entry.kind}-${entry.id}`"
            :entity="toEntity(entry)"
            date-label="Додано"
          />
        </div>

        <StateMessage
          v-else
          title="У цьому розділі порожньо"
          text="Оберіть інший розділ або додайте нові записи з каталогу."
        />

        <div class="actions">
          <button type="button" class="btn btn-sm" @click="favorites.clear()">Очистити колекцію</button>
        </div>
      </template>

      <StateMessage
        v-else
        title="Колекція порожня"
        text="Натискайте на серце в картках або на сторінці запису, щоб зібрати власну добірку героїв і коміксів."
      >
        <RouterLink class="btn btn-primary btn-sm" :to="{ name: 'list', params: { kind: 'characters' } }">
          Дивитись персонажів
        </RouterLink>
      </StateMessage>
    </div>
  </section>
</template>

<style scoped>
.head {
  margin-bottom: 22px;
}

.head__row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin: 6px 0;
}

.head h1 {
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  text-transform: uppercase;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 22px;
}

.grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.actions {
  margin-top: 28px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}
</style>
