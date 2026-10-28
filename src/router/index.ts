import { createRouter, createWebHistory } from 'vue-router'
import { KIND_META, isKind } from '@/api/kinds'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/favorites',
      name: 'favorites',
      // Ліниве завантаження: окремий чанк для розділу обраного.
      component: () => import('@/views/FavoritesView.vue'),
    },
    {
      path: '/:kind',
      name: 'list',
      component: () => import('@/views/ListView.vue'),
      props: false,
    },
    {
      path: '/:kind/:id',
      name: 'detail',
      component: () => import('@/views/DetailView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    // Зміна лише query (пагінація, пошук) не має скидати прокрутку.
    if (to.path !== from.path) return { top: 0 }
    return false
  },
})

const BASE_TITLE = 'Marvel Explorer'

router.afterEach((to) => {
  const kind = to.params.kind
  if (isKind(kind)) {
    document.title = `${KIND_META[kind].label} · ${BASE_TITLE}`
    return
  }
  if (to.name === 'favorites') {
    document.title = `Обране · ${BASE_TITLE}`
    return
  }
  document.title = BASE_TITLE
})

export default router
