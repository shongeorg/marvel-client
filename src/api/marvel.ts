import type { ApiEnvelope, Kind, ListResult, MarvelEntity } from './types'

const RAW_BASE = import.meta.env.VITE_MARVEL_API_BASE ?? 'https://marvel-api-orpin.vercel.app'

export const API_BASE = RAW_BASE.replace(/\/+$/, '')

export const PAGE_SIZE_OPTIONS = [20, 50, 100] as const

export class ApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      signal,
      headers: { Accept: 'application/json' },
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error
    throw new ApiError('Не вдалося з’єднатися з Marvel API. Перевірте підключення до мережі.')
  }

  if (!response.ok) {
    throw new ApiError(`API відповів помилкою ${response.status} ${response.statusText}`, response.status)
  }

  return (await response.json()) as T
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const body = await getJson<ApiEnvelope<T>>(path, signal)
  if (body?.code !== 200) {
    throw new ApiError(body?.status || 'API повернув невідомий статус', body?.code)
  }
  return body.data
}

export interface ListParams {
  page?: number
  limit?: number
  search?: string
  signal?: AbortSignal
}

export function fetchList(kind: Kind, params: ListParams = {}): Promise<ListResult> {
  const { page = 1, limit = 20, search = '', signal } = params
  const query = new URLSearchParams({ page: String(page), limit: String(limit) })
  const term = search.trim()
  if (term) query.set('search', term)
  return request<ListResult>(`/v1/public/${kind}?${query.toString()}`, signal)
}

export async function fetchEntity(kind: Kind, id: string | number, signal?: AbortSignal): Promise<MarvelEntity> {
  const data = await request<{ results?: MarvelEntity[] }>(
    `/v1/public/${kind}/${encodeURIComponent(String(id))}`,
    signal,
  )
  const entity = data?.results?.[0]
  if (!entity) throw new ApiError('Запис не знайдено', 404)
  return entity
}

export interface ApiInfo {
  name: string
  version: string
  counts: Partial<Record<Kind, number>>
}

/**
 * Кореневий ендпоінт `/` віддає опис API разом із кількістю записів у кожній колекції.
 * Не має конверта `{ code, status, data }`, тому читається окремо.
 */
export async function fetchApiInfo(signal?: AbortSignal): Promise<ApiInfo> {
  const info = await getJson<Partial<ApiInfo>>('/', signal)
  return {
    name: info.name ?? 'Marvel API',
    version: info.version ?? '',
    counts: info.counts ?? {},
  }
}
