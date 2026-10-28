<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { KIND_LIST, type KindMeta } from '@/api/kinds'
import { API_BASE, fetchApiInfo } from '@/api/marvel'
import type { Kind } from '@/api/types'
import { formatNumber } from '@/lib/media'
import KindIcon from '@/components/KindIcon.vue'

const router = useRouter()

const controller = new AbortController()

const stats = ref<Array<{ meta: KindMeta; total: number | null }>>(
  KIND_LIST.map((meta) => ({ meta, total: null })),
)

/**
 * API не має сортування й шукає підрядок у назві, тож «перші N записів» — це
 * сміттєві початки алфавіту. Замість фейкової добірки даємо ярлики швидкого пошуку.
 */
const QUICK_SEARCHES = [
  'Spider-Man',
  'Iron Man',
  'Captain America',
  'Thor',
  'Hulk',
  'Wolverine',
  'X-Men',
  'Avengers',
  'Fantastic Four',
  'Doctor Doom',
]

const term = ref('')
const target = ref<Kind>('characters')

async function loadStats() {
  try {
    const info = await fetchApiInfo(controller.signal)
    for (const entry of stats.value) {
      const total = info.counts[entry.meta.kind]
      if (typeof total === 'number') entry.total = total
    }
  } catch {
    /* статистика не критична — картки лишаться з підписом «підрахунок…» */
  }
}

function submit() {
  const search = term.value.trim()
  router.push({
    name: 'list',
    params: { kind: target.value },
    query: search ? { search } : {},
  })
}

function quickSearch(value: string) {
  target.value = 'characters'
  term.value = value
  router.push({ name: 'list', params: { kind: 'characters' }, query: { search: value } })
}

onMounted(loadStats)

onBeforeUnmount(() => controller.abort())
</script>

<template>
  <section class="hero">
    <div class="container hero__inner">
      <div class="hero__text">
        <p class="strike-line">Marvel Database Explorer</p>
        <h1>
          Уся <span class="hero__accent">Marvel</span><br />
          в одному клієнті
        </h1>
        <p class="hero__lead muted">
          Персонажі, комікси, творці, події, серії та історії — з власного Marvel API.
          Шукайте, гортайте сторінки й зберігайте улюблене.
        </p>

        <form class="hero__search" @submit.prevent="submit">
          <label class="hero__select">
            <span class="visually-hidden">Розділ</span>
            <select v-model="target" class="field">
              <option v-for="meta in KIND_LIST" :key="meta.kind" :value="meta.kind">{{ meta.label }}</option>
            </select>
          </label>
          <input v-model="term" class="field hero__input" type="search" placeholder="Наприклад: Spider-Man, X-Men, 1963…" />
          <button type="submit" class="btn btn-primary">Шукати</button>
        </form>

        <p class="hero__api muted">
          Джерело даних: <a :href="API_BASE" target="_blank" rel="noopener">{{ API_BASE.replace('https://', '') }}</a>
        </p>
      </div>
    </div>
  </section>

  <section class="page">
    <div class="container">
      <div class="section-head">
        <h2>Розділи бази</h2>
        <span class="hint">Шість колекцій API</span>
      </div>

      <div class="categories">
        <RouterLink
          v-for="entry in stats"
          :key="entry.meta.kind"
          class="category card"
          :style="{ '--accent': entry.meta.accent }"
          :to="{ name: 'list', params: { kind: entry.meta.kind } }"
        >
          <span class="category__icon">
            <KindIcon :kind="entry.meta.kind" :size="22" />
          </span>
          <span class="category__label">{{ entry.meta.label }}</span>
          <span class="category__tagline muted">{{ entry.meta.tagline }}</span>
          <span class="category__total">
            <template v-if="entry.total !== null">{{ formatNumber(entry.total) }} записів</template>
            <template v-else>підрахунок…</template>
          </span>
        </RouterLink>
      </div>

      <div class="section">
        <div class="section-head">
          <h2>Швидкий пошук</h2>
          <span class="hint">Популярні запити</span>
        </div>
        <div class="quick">
          <button
            v-for="value in QUICK_SEARCHES"
            :key="value"
            type="button"
            class="quick__chip"
            @click="quickSearch(value)"
          >
            {{ value }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 64px 0 8px;
  border-bottom: 1px solid var(--border);
  background: linear-gradient(180deg, rgba(230, 36, 41, 0.1), transparent 70%);
}

.hero__inner {
  padding-bottom: 46px;
}

.hero__text {
  max-width: 780px;
}

.hero h1 {
  font-size: clamp(2.1rem, 6vw, 4rem);
  text-transform: uppercase;
  margin: 10px 0 16px;
}

.hero__accent {
  color: var(--mx-red);
}

.hero__lead {
  max-width: 60ch;
  font-size: 1.02rem;
}

.hero__search {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 26px;
}

.hero__select .field {
  border-radius: 999px;
  padding-top: 11px;
  padding-bottom: 11px;
}

.hero__input {
  flex: 1 1 260px;
  border-radius: 999px;
}

.hero__api {
  margin-top: 18px;
  font-size: 0.8rem;
}

.hero__api a {
  text-decoration: underline;
  color: var(--text-dim);
}

.categories {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}

.category {
  display: grid;
  gap: 6px;
  padding: 20px;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.category:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--accent) 55%, transparent);
  background: var(--bg-elev-hover);
}

.category__icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  margin-bottom: 6px;
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 16%, transparent);
}

.category__label {
  font-family: var(--font-display);
  font-size: 1.15rem;
  text-transform: uppercase;
}

.category__tagline {
  font-size: 0.85rem;
}

.category__total {
  margin-top: 8px;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
}

.quick {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick__chip {
  padding: 9px 18px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-elev);
  color: var(--text);
  font-family: var(--font-display);
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.15s ease, color 0.15s ease,
    background 0.15s ease;
}

.quick__chip:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--mx-red) 55%, transparent);
  background: var(--bg-elev-hover);
  color: var(--mx-red);
}
</style>
