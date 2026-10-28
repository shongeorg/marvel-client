<script setup lang="ts">
import { RouterLink } from 'vue-router'
import StateMessage from '@/components/StateMessage.vue'
</script>

<template>
  <section class="page">
    <div class="container">
      <StateMessage
        tone="error"
        title="Сторінку не знайдено"
        text="Такої адреси в застосунку немає. Скористайтеся навігацією вгорі або поверніться на головну."
      >
        <RouterLink class="btn btn-primary btn-sm" to="/">На головну</RouterLink>
        <RouterLink class="btn btn-sm" :to="{ name: 'list', params: { kind: 'characters' } }">
          Персонажі
        </RouterLink>
      </StateMessage>
    </div>
  </section>
</template>
