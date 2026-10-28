import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Kind, MarvelEntity } from '@/api/types'
import { entityImage } from '@/lib/media'

export interface FavoriteEntry {
  id: number
  kind: Kind
  name: string
  image: string | null
  addedAt: number
}

const STORAGE_KEY = 'marvel-client:favorites'

function restore(): FavoriteEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is FavoriteEntry => {
      const entry = item as Partial<FavoriteEntry>
      return typeof entry?.id === 'number' && typeof entry?.kind === 'string' && typeof entry?.name === 'string'
    })
  } catch {
    return []
  }
}

export const useFavoritesStore = defineStore('favorites', () => {
  const entries = ref<FavoriteEntry[]>(restore())

  watch(
    entries,
    (value) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        /* приватний режим / переповнене сховище — просто ігноруємо */
      }
    },
    { deep: true },
  )

  const count = computed(() => entries.value.length)

  const isFavorite = (kind: Kind, id: number) =>
    entries.value.some((entry) => entry.kind === kind && entry.id === id)

  function toggle(entity: MarvelEntity) {
    const index = entries.value.findIndex((entry) => entry.kind === entity.kind && entry.id === entity.id)
    if (index >= 0) {
      entries.value.splice(index, 1)
      return false
    }
    entries.value.unshift({
      id: entity.id,
      kind: entity.kind,
      name: entity.name,
      image: entityImage(entity),
      addedAt: Date.now(),
    })
    return true
  }

  function remove(kind: Kind, id: number) {
    entries.value = entries.value.filter((entry) => !(entry.kind === kind && entry.id === id))
  }

  function clear() {
    entries.value = []
  }

  return { entries, count, isFavorite, toggle, remove, clear }
})
