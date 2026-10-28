<script setup lang="ts">
import type { Kind } from '@/api/types'

withDefaults(
  defineProps<{
    kind: Kind
    size?: number
  }>(),
  { size: 18 },
)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="kind === 'characters'">
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20c0-3.6 3.2-6 7.2-6s7.2 2.4 7.2 6" />
    </template>
    <template v-else-if="kind === 'comics'">
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a1.7 1.7 0 0 0-1.7-1.7H4Z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a1.7 1.7 0 0 1 1.7-1.7H20Z" />
    </template>
    <template v-else-if="kind === 'creators'">
      <path d="M14.5 3.5 20.5 9.5 9 21H3v-6Z" />
      <path d="M12.5 5.5 18.5 11.5" />
    </template>
    <template v-else-if="kind === 'events'">
      <path d="M12 2.5 14.6 9l6.9.4-5.3 4.4 1.7 6.7L12 16.8 6.1 20.5l1.7-6.7L2.5 9.4 9.4 9Z" />
    </template>
    <template v-else-if="kind === 'series'">
      <path d="M12 3 3 7.5l9 4.5 9-4.5Z" />
      <path d="M3 12.5 12 17l9-4.5" />
      <path d="M3 17 12 21.5 21 17" />
    </template>
    <template v-else>
      <path d="M6.5 3.5h8L19 8v12.5H6.5Z" />
      <path d="M14 3.5V8h4.5" />
      <path d="M9.5 12.5h6M9.5 16h6" />
    </template>
  </svg>
</template>
