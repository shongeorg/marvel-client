<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { KIND_LIST } from '@/api/kinds'
import { useFavoritesStore } from '@/stores/favorites'
import KindIcon from './KindIcon.vue'

const route = useRoute()
const favorites = useFavoritesStore()

const activeKind = computed(() => (typeof route.params.kind === 'string' ? route.params.kind : ''))

/** Бургер-меню для вузьких екранів: розкривний список навігації під шапкою. */
const menuOpen = ref(false)

function closeMenu() {
  menuOpen.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMenu()
}

watch(() => route.fullPath, closeMenu)

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div v-if="menuOpen" class="nav-backdrop" @click="closeMenu" />

  <header class="header">
    <div class="container header__inner">
      <RouterLink class="brand" to="/">
        <span class="brand__mark">MARVEL</span>
        <span class="brand__text">
          <strong>База даних</strong>
          <small>персонажі · комікси · творці</small>
        </span>
      </RouterLink>

      <button
        class="burger"
        :class="{ 'burger--open': menuOpen }"
        type="button"
        aria-label="Меню навігації"
        aria-controls="main-nav"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        <span class="burger__line" />
        <span class="burger__line" />
        <span class="burger__line" />
      </button>

      <nav id="main-nav" class="nav" :class="{ 'nav--open': menuOpen }" aria-label="Головна навігація">
        <RouterLink
          v-for="meta in KIND_LIST"
          :key="meta.kind"
          class="nav__item"
          :class="{ 'nav__item--active': activeKind === meta.kind }"
          :to="{ name: 'list', params: { kind: meta.kind } }"
        >
          <KindIcon :kind="meta.kind" :size="15" />
          {{ meta.label }}
        </RouterLink>

        <RouterLink class="nav__item nav__item--fav" :class="{ 'nav__item--active': route.name === 'favorites' }" to="/favorites">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13Z" />
          </svg>
          Обране
          <span v-if="favorites.count" class="nav__badge">{{ favorites.count }}</span>
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 30;
  border-bottom: 1px solid var(--border);
  background: rgba(9, 10, 14, 0.86);
  backdrop-filter: blur(14px);
}

.header__inner {
  display: flex;
  align-items: center;
  gap: 22px;
  min-height: 66px;
  padding-top: 10px;
  padding-bottom: 10px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.brand__mark {
  display: grid;
  place-items: center;
  padding: 6px 9px;
  border-radius: 6px;
  background: var(--mx-red);
  color: #fff;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.14em;
}

.brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.brand__text strong {
  font-family: var(--font-display);
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.brand__text small {
  color: var(--text-mute);
  font-size: 0.7rem;
}

.nav {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  overflow-x: auto;
  scrollbar-width: none;
}

.nav::-webkit-scrollbar {
  display: none;
}

.nav__item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  color: var(--text-dim);
  white-space: nowrap;
  transition: background 0.18s ease, color 0.18s ease;
}

.nav__item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
}

.nav__item--active {
  background: var(--mx-red-soft);
  color: #fff;
}

.nav__item--fav {
  border: 1px solid var(--border);
}

.nav__badge {
  display: grid;
  place-items: center;
  min-width: 19px;
  height: 19px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--mx-red);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
}

.burger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 42px;
  height: 42px;
  padding: 0 10px;
  margin-left: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: border-color 0.18s ease, background 0.18s ease;
}

.burger:hover {
  border-color: var(--mx-red);
  background: var(--mx-red-soft);
}

.burger__line {
  display: block;
  height: 2px;
  border-radius: 2px;
  background: var(--text);
  transition: transform 0.22s ease, opacity 0.16s ease;
}

.burger--open .burger__line:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.burger--open .burger__line:nth-child(2) {
  opacity: 0;
}

.burger--open .burger__line:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.nav-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: rgba(4, 5, 8, 0.62);
}

@media (max-width: 900px) {
  .header__inner {
    gap: 12px;
  }

  .burger {
    display: flex;
  }

  .nav {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1;
    display: none;
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
    margin-left: 0;
    padding: 12px 20px 18px;
    border-bottom: 1px solid var(--border);
    background: rgba(9, 10, 14, 0.98);
    backdrop-filter: blur(14px);
    box-shadow: 0 20px 34px rgba(0, 0, 0, 0.5);
  }

  .nav--open {
    display: flex;
  }

  .nav__item {
    justify-content: flex-start;
    padding: 12px 14px;
    border-radius: 10px;
    font-size: 0.95rem;
  }
}
</style>
