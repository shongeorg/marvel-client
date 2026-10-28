<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { PAGE_SIZE_OPTIONS } from '@/api/marvel'
import { formatNumber } from '@/lib/media'

const props = defineProps<{
  page: number
  totalPages: number
  total: number
  limit: number
}>()

const emit = defineEmits<{
  'update:page': [value: number]
  'update:limit': [value: number]
}>()

const jump = ref(String(props.page))

watch(
  () => props.page,
  (value) => {
    jump.value = String(value)
  },
)

const from = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.limit + 1))
const to = computed(() => Math.min(props.page * props.limit, props.total))
const canPrev = computed(() => props.page > 1)
const canNext = computed(() => props.page < props.totalPages)

function go(page: number) {
  const target = Math.min(Math.max(1, page), Math.max(1, props.totalPages))
  if (target !== props.page) emit('update:page', target)
}

function applyJump() {
  const parsed = Number.parseInt(jump.value, 10)
  if (Number.isNaN(parsed)) {
    jump.value = String(props.page)
    return
  }
  go(parsed)
}

function changeLimit(event: Event) {
  emit('update:limit', Number((event.target as HTMLSelectElement).value))
}
</script>

<template>
  <nav class="pager" aria-label="Пагінація">
    <p class="pager__info muted">
      <template v-if="total">
        Показано <strong>{{ formatNumber(from) }}–{{ formatNumber(to) }}</strong>
        з {{ formatNumber(total) }}
      </template>
      <template v-else>Немає записів</template>
    </p>

    <div class="pager__controls">
      <button type="button" class="btn btn-sm" :disabled="!canPrev" title="Перша сторінка" @click="go(1)">
        &laquo;
      </button>
      <button type="button" class="btn btn-sm" :disabled="!canPrev" @click="go(page - 1)">Назад</button>

      <label class="pager__jump">
        <span class="visually-hidden">Номер сторінки</span>
        <input
          v-model="jump"
          class="field"
          type="number"
          min="1"
          :max="Math.max(1, totalPages)"
          inputmode="numeric"
          @keyup.enter="applyJump"
          @blur="applyJump"
        />
        <span class="pager__of muted">/ {{ formatNumber(Math.max(1, totalPages)) }}</span>
      </label>

      <button type="button" class="btn btn-sm" :disabled="!canNext" @click="go(page + 1)">Далі</button>
      <button
        type="button"
        class="btn btn-sm"
        :disabled="!canNext"
        title="Остання сторінка"
        @click="go(totalPages)"
      >
        &raquo;
      </button>

      <label class="pager__limit">
        <span class="visually-hidden">Елементів на сторінці</span>
        <select :value="limit" class="field" @change="changeLimit">
          <option v-for="size in PAGE_SIZE_OPTIONS" :key="size" :value="size">по {{ size }}</option>
        </select>
      </label>
    </div>
  </nav>
</template>

<style scoped>
.pager {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 28px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}

.pager__info {
  font-size: 0.85rem;
}

.pager__info strong {
  color: var(--text);
  font-weight: 600;
}

.pager__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.pager__jump {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.pager__jump .field {
  width: 74px;
  padding: 6px 8px;
  text-align: center;
  border-radius: var(--radius-sm);
}

.pager__of {
  font-size: 0.8rem;
  white-space: nowrap;
}

.pager__limit .field {
  width: auto;
  padding: 6px 34px 6px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
