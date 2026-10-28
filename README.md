# Marvel Explorer

Клієнт до власного [Marvel API](https://marvel-api-orpin.vercel.app): персонажі, комікси, творці, події, серії та історії. Дані — з Marvel Database (Fandom), їх роздає окремий бекенд `marvel-api`.

**Стек:** Vue 3.5 · Vue Router 5 · Pinia 4 · Vite 8 · TypeScript 6 · vite-plugin-pwa 2 (Workbox)

## Можливості

- **Шість розділів** — персонажі, комікси, творці, події, серії, історії: сітка карток, пагінація (20/50/100 на сторінку) і пошук із debounce 400 мс. Стан списку живе в query-параметрах (`?search=&page=&limit=`), тож посиланням можна ділитися як є.
- **Сторінки деталей** — hero-зображення з ланцюжком фолбеків (`thumbnail` → сире `image` з вікі → плейсхолдер), класичні характеристики розділу й додаткові атрибути вікі з очищенням розмітки, посилання на джерело у Fandom.
- **Обране** — Pinia + `localStorage` (`marvel-client:favorites`), окремий розділ і лічильник у шапці.
- **PWA** — встановлюваний застосунок: веб-маніфест, `sw.js` на Workbox, офлайн-робота SPA-маршрутів (`navigateFallback: /index.html`), автопоновлення сервіс-воркера. Кеші: `marvel-api` (NetworkFirst, таймаут 6 с) і `marvel-images` (CacheFirst, 30 днів).
- **Адаптивність** — на ≤900px навігація згортається в бургер-меню (закривається по Escape, кліку по фону або зміні маршруту).
- **Дрібниці** — скасування застарілих запитів через `AbortController`, прокрутка не скидається при зміні лише query, темна тема Marvel, заголовок документа за розділом.

## Швидкий старт

Потрібен Node `^22.18.0` або `>=24.12.0`.

```sh
npm install
npm run dev        # http://localhost:5173
```

## Скрипти

| Команда                | Що робить                                                        |
| ---------------------- | ---------------------------------------------------------------- |
| `npm run dev`          | Дев-сервер Vite з HMR                                             |
| `npm run build`        | Паралельно `vue-tsc` і продакшн-збірка Vite (+ генерація PWA)     |
| `npm run preview`      | Локальний перегляд зібраного `dist`                               |
| `npm run type-check`   | Лише перевірка типів (`vue-tsc --build`)                          |
| `npm run deploy`       | `vercel deploy --prod`                                            |

## Налаштування

Єдина змінна оточення — база API. За замовчуванням використовується публічний бекенд, тож для старту нічого налаштовувати не треба:

```sh
# .env.local
VITE_MARVEL_API_BASE=https://marvel-api-orpin.vercel.app
```

## API

Відповіді приходять у конверті `{ code, status, data }`; кореневий `/` — без конверта.

| Метод | Шлях                       | Опис                                          |
| ----- | -------------------------- | --------------------------------------------- |
| GET   | `/`                        | Опис API, версія та кількість записів         |
| GET   | `/v1/public/{kind}`        | Список: `page` (з 1), `limit` (20/50/100), `search` |
| GET   | `/v1/public/{kind}/{id}`   | Один запис (`data.results[0]`)                |

`kind`: `characters` · `comics` · `creators` · `events` · `series` · `stories`.

## Структура

```
src/
├── api/          # kinds.ts — метадані розділів, marvel.ts — HTTP-клієнт, types.ts
├── components/   # AppHeader, AppFooter, EntityCard/EntityGrid, PaginationBar, …
├── lib/media.ts  # URL-и зображень, формати дат і чисел, очищення вікі-розмітки
├── router/       # маршрути, заголовок документа, scrollBehavior
├── stores/       # favorites.ts — Pinia-стор обраного
└── views/        # Home, List, Detail, Favorites, NotFound
```

## Деплой

Збірка статична (`dist/`), сервіс-воркер і маніфест генеруються автоматично. Оскільки роутер працює в history-режимі, хостинг має віддавати `index.html` на будь-який маршрут: якщо deep-link-и дають 404, додай `rewrites` на `/index.html` (наприклад, у `vercel.json`).

Нюанс: іконка застосунку — SVG (`public/icon.svg`); якщо потрібна підтримка `apple-touch-icon` на iOS, додай PNG-копії 180/192/512.

## Розробка

Редактор — VS Code з розширенням [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (конфіг лежить у `.vscode/extensions.json`). Типи для `.vue` перевіряє `vue-tsc`, тож `tsc` напряму не використовується.
