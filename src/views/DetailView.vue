<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { DETAIL_FIELDS, KIND_META, isKind } from '@/api/kinds'
import { fetchEntity } from '@/api/marvel'
import type { Kind, MarvelEntity } from '@/api/types'
import {
  HIDDEN_ATTRIBUTES,
  attributeToString,
  describe,
  entityImageCandidates,
  formatDate,
  humanizeKey,
} from '@/lib/media'
import FavoriteButton from '@/components/FavoriteButton.vue'
import KindIcon from '@/components/KindIcon.vue'
import StateMessage from '@/components/StateMessage.vue'

const route = useRoute()

const kind = computed<Kind | null>(() => (isKind(route.params.kind) ? route.params.kind : null))
const id = computed(() => String(route.params.id ?? ''))

const entity = ref<MarvelEntity | null>(null)
const loading = ref(false)
const error = ref('')
const imageStep = ref(0)
const showAllAttributes = ref(false)

let controller: AbortController | null = null
let requestId = 0

async function load() {
  const current = kind.value
  if (!current || !id.value) return

  const request = ++requestId
  controller?.abort()
  const ctrl = new AbortController()
  controller = ctrl

  loading.value = true
  error.value = ''
  entity.value = null
  imageStep.value = 0

  try {
    const result = await fetchEntity(current, id.value, ctrl.signal)
    if (request !== requestId) return
    entity.value = result
  } catch (caught) {
    if (request !== requestId || (caught as Error)?.name === 'AbortError') return
    error.value = caught instanceof Error ? caught.message : 'Невідома помилка'
  } finally {
    if (request === requestId) loading.value = false
  }
}

watch([kind, id], load, { immediate: true })

onBeforeUnmount(() => {
  requestId += 1
  controller?.abort()
})

const meta = computed(() => (kind.value ? KIND_META[kind.value] : null))
const imageCandidates = computed(() => entityImageCandidates(entity.value))
const image = computed(() => imageCandidates.value[imageStep.value] ?? null)
const description = computed(() => describe(entity.value))
const is404 = computed(() => !loading.value && /404|не знайдено/i.test(error.value))

const facts = computed(() => {
  const current = entity.value
  if (!current) return []
  const specs = DETAIL_FIELDS[current.kind] ?? []
  return specs
    .map((spec) => ({ label: spec.label, value: attributeToString(current.data?.[spec.key]) }))
    .filter((fact): fact is { label: string; value: string } => Boolean(fact.value))
})

const extraFacts = computed(() => {
  const current = entity.value
  if (!current?.data) return []
  const used = new Set((DETAIL_FIELDS[current.kind] ?? []).map((spec) => spec.key))
  return Object.keys(current.data)
    .filter((key) => !used.has(key) && !HIDDEN_ATTRIBUTES.has(key))
    .map((key) => ({ label: humanizeKey(key), value: attributeToString(current.data?.[key]) }))
    .filter((fact): fact is { label: string; value: string } => Boolean(fact.value))
})

const visibleExtraFacts = computed(() => (showAllAttributes.value ? extraFacts.value : extraFacts.value.slice(0, 18)))
</script>

<template>
  <section class="page">
    <div class="container">
      <div v-if="loading" class="loading">
        <span class="spinner" />
        <p class="muted">Завантажуємо запис…</p>
      </div>

      <StateMessage
        v-else-if="error"
        :title="is404 ? 'Запис не знайдено' : 'Не вдалося завантажити запис'"
        :text="is404 ? 'Можливо, посилання застаріло або ідентифікатор неправильний.' : error"
        tone="error"
      >
        <RouterLink v-if="meta" class="btn btn-sm" :to="{ name: 'list', params: { kind: meta.kind } }">
          До розділу «{{ meta.label }}»
        </RouterLink>
        <RouterLink class="btn btn-primary btn-sm" to="/">На головну</RouterLink>
      </StateMessage>

      <article v-else-if="entity && meta" class="detail">
        <nav class="crumbs muted">
          <RouterLink to="/">Головна</RouterLink>
          <span>/</span>
          <RouterLink :to="{ name: 'list', params: { kind: meta.kind } }">{{ meta.label }}</RouterLink>
          <span>/</span>
          <span class="crumbs__current">{{ entity.name }}</span>
        </nav>

        <div class="hero">
          <div class="hero__media">
            <img v-if="image" :src="image" :alt="entity.name" @error="imageStep += 1" />
            <div v-else class="hero__placeholder">
              <KindIcon :kind="meta.kind" :size="44" />
            </div>
          </div>

          <div class="hero__info">
            <p class="strike-line">{{ meta.singular }}</p>
            <h1>{{ entity.name }}</h1>
            <p v-if="entity.slug && entity.slug !== entity.name" class="hero__slug muted">{{ entity.slug }}</p>

            <div class="hero__chips">
              <span class="chip">
                <KindIcon :kind="meta.kind" :size="13" />
                {{ meta.label }}
              </span>
              <span class="chip">ID {{ entity.id }}</span>
              <span class="chip">Оновлено {{ formatDate(entity.modified) }}</span>
            </div>

            <p v-if="description" class="hero__desc">{{ description }}</p>
            <p v-else class="hero__desc muted">Опис у базі відсутній.</p>

            <div class="hero__actions">
              <FavoriteButton :entity="entity" label />
              <RouterLink class="btn btn-sm" :to="{ name: 'list', params: { kind: meta.kind } }">
                ← Усі {{ meta.label.toLowerCase() }}
              </RouterLink>
              <a v-if="entity.sourceUrl" class="btn btn-sm" :href="entity.sourceUrl" target="_blank" rel="noopener">
                Джерело на Fandom
              </a>
            </div>
          </div>
        </div>

        <div v-if="facts.length" class="section">
          <div class="section-head">
            <h2>Характеристики</h2>
            <span class="hint">{{ facts.length }} полів</span>
          </div>
          <dl class="facts">
            <div v-for="fact in facts" :key="fact.label" class="facts__row">
              <dt>{{ fact.label }}</dt>
              <dd>{{ fact.value }}</dd>
            </div>
          </dl>
        </div>

        <div v-if="extraFacts.length" class="section">
          <div class="section-head">
            <h2>Додаткові атрибути</h2>
            <span class="hint">{{ extraFacts.length }} полів</span>
          </div>
          <dl class="facts">
            <div v-for="fact in visibleExtraFacts" :key="fact.label" class="facts__row">
              <dt>{{ fact.label }}</dt>
              <dd>{{ fact.value }}</dd>
            </div>
          </dl>
          <button
            v-if="extraFacts.length > 18"
            type="button"
            class="btn btn-sm show-more"
            @click="showAllAttributes = !showAllAttributes"
          >
            {{ showAllAttributes ? 'Згорнути' : `Показати всі (${extraFacts.length})` }}
          </button>
        </div>
      </article>

      <StateMessage
        v-else
        tone="error"
        title="Невідомий розділ"
        :text="`Розділ «${route.params.kind}» не існує, тому запис показати неможливо.`"
      >
        <RouterLink class="btn btn-primary btn-sm" to="/">На головну</RouterLink>
      </StateMessage>
    </div>
  </section>
</template>

<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 90px 0;
}

.crumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.82rem;
  margin-bottom: 20px;
}

.crumbs a:hover {
  color: var(--text);
}

.crumbs__current {
  color: var(--text-dim);
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 320px) minmax(0, 1fr);
  gap: 32px;
  align-items: start;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: linear-gradient(150deg, rgba(230, 36, 41, 0.08), rgba(255, 255, 255, 0.02) 45%), var(--bg-soft);
}

.hero__media {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: var(--radius);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
}

.hero__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero__placeholder {
  display: grid;
  place-items: center;
  height: 100%;
  color: var(--text-mute);
}

.hero__info h1 {
  font-size: clamp(1.8rem, 4.4vw, 3rem);
  margin: 6px 0 4px;
}

.hero__slug {
  font-size: 0.9rem;
  margin-bottom: 14px;
}

.hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

.hero__desc {
  white-space: pre-line;
  color: var(--text-dim);
  max-width: 74ch;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.facts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0 28px;
  border-top: 1px solid var(--border);
}

.facts__row {
  display: grid;
  grid-template-columns: minmax(130px, 38%) 1fr;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.facts dt {
  color: var(--text-mute);
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.facts dd {
  white-space: pre-line;
  font-size: 0.92rem;
}

.show-more {
  margin-top: 18px;
}

@media (max-width: 780px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 18px;
  }

  .hero__media {
    max-width: 260px;
  }
}
</style>
