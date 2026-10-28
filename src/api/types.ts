export type Kind = 'characters' | 'comics' | 'creators' | 'events' | 'series' | 'stories'

export interface Thumbnail {
  path: string
  extension: string
}

export interface MarvelEntity {
  id: number
  kind: Kind
  slug: string
  name: string
  description: string | null
  thumbnail: Thumbnail | null
  modified: string | null
  sourceUrl: string
  /** Сирі атрибути вікі. Присутні лише у відповіді детального ендпоінта. */
  data?: Record<string, unknown>
}

export interface ListResult {
  kind: Kind
  results: MarvelEntity[]
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiEnvelope<T> {
  code: number
  status: string
  data: T
}
