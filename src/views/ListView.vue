<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { KIND_META, isKind } from '@/api/kinds'
import { fetchList } from '@/api/marvel'
import type { Kind, MarvelEntity } from '@/api/types'
import { formatNumber } from '@/lib/media'
import EntityGrid from '@/components/EntityGrid.vue'
import KindIcon from '@/components/KindIcon.vue'
import PaginationBar from '@/components/PaginationBar.vue'
import StateMessage from '@/components/StateMessage.vue'

const route = useRoute()
const router = useRouter()

const kind = computed<Kind | null>(() => (isKind(route.params.kind) ? route.params.kind : null))
const meta = computed(() => (kind.value ? KIND_META[kind.value] : null))

const searchInput = ref('')
const searchTerm = ref('')

const items = ref<MarvelEntity[]>([])
const total = ref(0)
const totalPages = ref(1)
const loading = ref(false)
const error = ref('')

let controller: AbortController | null = null
let requestId = 0

function positiveInt(raw: unknown, fallback: number): number {
  const value = Number.parseInt(String(raw ?? ''), 10)
  return Number.isFinite(value) && value > 0 ? value : fallback
}

const page = computed(() => positiveInt(route.query.page, 1))
const limit = computed(() => [20, 50, 100].includes(Number(route.query.limit)) ? Number(route.query.limit) : 20)

async function load() {
  const current = kind.value
  if (!current) return

  const id = ++requestId
  controller?.abort()
  const ctrl = new AbortController()
  controller = ctrl

  loading.value = true
  error.value = ''

  try {
    const result = await fetchList(current, {
      page: page.value,
      limit: limit.value,
      search: searchTerm.value,
      signal: ctrl.signal,
    })
    if (id !== requestId) return
    items.value = result.results ?? []
    total.value = result.total ?? 0
    totalPages.value = Math.max(1, result.totalPages ?? 1)
  } catch (caught) {
    if (id !== requestId || (caught as Error)?.name === 'AbortError') return
    error.value = caught instanceof Error ? caught.message : 'Невідома помилка'
    items.value = []
    total.value = 0
    totalPages.value = 1
  } finally {
    if (id === requestId) loading.value = false
  }
}

/** Синхронізуємо локальний ввід із запитом у URL (у т.ч. при переході між розділами). */
watch(
  () => [route.params.kind, route.query.search] as const,
  () => {
    const fromQuery = typeof route.query.search === 'string' ? route.query.search : ''
    if (fromQuery !== searchTerm.value) {
      searchTerm.value = fromQuery
      searchInput.value = fromQuery
    }
  },
  { immediate: true },
)

watch([kind, page, limit, searchTerm], load, { immediate: true })

watch(page, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

let searchTimer: number | undefined
watch(searchInput, (value) => {
  window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => {
    const term = value.trim()
    if (term === searchTerm.value) return
    searchTerm.value = term
    changeQuery({ search: term })
  }, 400)
})

/** Складає чистий query: значення за замовчуванням (стор. 1, limit 20) у URL не потрапляють. */
function changeQuery(patch: { page?: number; limit?: number; search?: string }) {
  const search = 'search' in patch ? (patch.search ?? '') : (typeof route.query.search === 'string' ? route.query.search : '')
  const nextLimit = patch.limit ?? limit.value
  const nextPage = patch.page ?? 1

  const query: Record<string, string> = {}
  if (search) query.search = search
  if (nextLimit !== 20) query.limit = String(nextLimit)
  if (nextPage > 1) query.page = String(nextPage)

  router.push({ name: 'list', params: { kind: kind.value }, query })
}

function submitSearch() {
  searchInput.value = searchInput.value.trim()
  searchTerm.value = searchInput.value
  changeQuery({ search: searchTerm.value })
}

function clearSearch() {
  searchInput.value = ''
  searchTerm.value = ''
  changeQuery({ search: '' })
}

onBeforeUnmount(() => {
  window.clearTimeout(searchTimer)
  requestId += 1
  controller?.abort()
})
</script>

<template>
  <section class="page">
    <div class="container">
      <template v-if="meta">
        <header class="head">
          <p class="strike-line">Marvel · {{ meta.singular }}</p>
          <div class="head__row">
            <h1>
              <KindIcon :kind="meta.kind" :size="26" />
              {{ meta.label }}
            </h1>
            <span v-if="!loading && !error" class="chip">{{ formatNumber(total) }} записів</span>
          </div>
          <p class="muted">{{ meta.tagline }}</p>
        </header>

        <form class="toolbar" role="search" @submit.prevent="submitSearch">
          <label class="toolbar__search">
            <span class="visually-hidden">Пошук</span>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>
            <input
              v-model="searchInput"
              class="field"
              type="search"
              :placeholder="`Пошук у розділі «${meta.label}»…`"
            />
            <button v-if="searchInput" type="button" class="toolbar__clear" title="Очистити" @click="clearSearch">
              &times;
            </button>
          </label>
          <button type="submit" class="btn btn-primary">Знайти</button>
        </form>

        <p v-if="searchTerm" class="toolbar__hint muted">
          Результати за запитом «{{ searchTerm }}»
        </p>

        <EntityGrid
          :items="items"
          :loading="loading"
          :error="error"
          :skeleton-count="limit > 50 ? 12 : 10"
          @retry="load"
        />

        <PaginationBar
          v-if="!loading && !error && items.length"
          :page="page"
          :total-pages="totalPages"
          :total="total"
          :limit="limit"
          @update:page="(value) => changeQuery({ page: value })"
          @update:limit="(value) => changeQuery({ limit: value })"
        />
      </template>

      <StateMessage
        v-else
        tone="error"
        title="Невідомий розділ"
        :text="`Розділ «${route.params.kind}» не існує. Доступні: персонажі, комікси, творці, події, серії, історії.`"
      >
        <RouterLink class="btn btn-primary btn-sm" to="/">На головну</RouterLink>
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
  margin: 6px 0 6px;
}

.head h1 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  text-transform: uppercase;
}

.toolbar {
  display: flex;
  gap: 10px;
  align-items: stretch;
  max-width: 640px;
}

.toolbar__search {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
}

.toolbar__search svg {
  position: absolute;
  left: 14px;
  color: var(--text-mute);
}

.toolbar__search .field {
  padding-left: 40px;
  padding-right: 38px;
}

.toolbar__search input[type='search']::-webkit-search-cancel-button {
  display: none;
}

.toolbar__clear {
  position: absolute;
  right: 12px;
  border: 0;
  background: transparent;
  color: var(--text-mute);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
}

.toolbar__clear:hover {
  color: var(--text);
}

.toolbar__hint {
  margin-top: 12px;
  font-size: 0.85rem;
}
</style>
