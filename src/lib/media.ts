import type { MarvelEntity, Thumbnail } from '@/api/types'

const urlPattern = /^https?:\/\//

export function thumbnailUrl(thumbnail: Thumbnail | null | undefined): string | null {
  if (!thumbnail?.path || !thumbnail?.extension) return null
  return `${thumbnail.path}.${thumbnail.extension}`
}

/**
 * Усі доступні URL зображення у порядку пріоритету: спершу thumbnail з API (сам файл),
 * далі — сире поле `image` з вікі. Частина `revision`-посилань вікі віддає 404, тому
 * компоненти пробують варіанти по черзі.
 */
export function entityImageCandidates(entity: MarvelEntity | null | undefined): string[] {
  const raw = entity?.data?.image
  const candidates: string[] = []
  const thumb = thumbnailUrl(entity?.thumbnail)
  if (thumb) candidates.push(thumb)
  if (typeof raw === 'string' && urlPattern.test(raw) && raw !== thumb) candidates.push(raw)
  return candidates
}

/** Найкраще доступне зображення. */
export function entityImage(entity: MarvelEntity | null | undefined): string | null {
  return entityImageCandidates(entity)[0] ?? null
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('uk-UA').format(value)
}

export function formatDate(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' }).format(date)
}

export function describe(entity: MarvelEntity | null | undefined, maxLength = 0): string {
  if (!entity) return ''
  const source =
    entity.description ||
    (typeof entity.data?.History === 'string' ? (entity.data.History as string) : '') ||
    (typeof entity.data?.Synopsis1 === 'string' ? (entity.data.Synopsis1 as string) : '') ||
    (typeof entity.data?.PersonalHistory === 'string' ? (entity.data.PersonalHistory as string) : '')
  const text = cleanWikiText(source)
  if (maxLength > 0 && text.length > maxLength) return `${text.slice(0, maxLength).trimEnd()}…`
  return text
}

const wikiReplacements: Array<[RegExp, string]> = [
  [/<ref[^>]*>[\s\S]*?<\/ref>/g, ''],
  [/<[^>]+>/g, ''],
  [/\{\|[\s\S]*?\|\}/g, ''],
  [/\{\{[^{}]*\}\}/g, ''],
  [/\{\{[^{}]*\}\}/g, ''],
  [/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1'],
  [/\[\[([^\]]*)\]\]/g, '$1'],
  [/'''/g, ''],
  [/''/g, ''],
  [/&nbsp;/g, ' '],
  [/&amp;/g, '&'],
]

/** Прибирає вікі-розмітку, щоб текст можна було показати як звичайний. */
export function cleanWikiText(value: string | null | undefined): string {
  if (!value) return ''
  let text = value
  for (const [pattern, replacement] of wikiReplacements) {
    text = text.replace(pattern, replacement)
  }
  return text
    .split('\n')
    .map((line) => line.replace(/^\s*\*+\s*/, '• ').trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

/** Перетворює сирі значення атрибутів вікі у читабельний рядок (або null, якщо показувати нічого). */
export function attributeToString(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') {
    const text = cleanWikiText(value)
    return text.length ? text : null
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) {
    const parts = value.map(attributeToString).filter((part): part is string => Boolean(part))
    return parts.length ? parts.join(', ') : null
  }
  return null
}

export function humanizeKey(key: string): string {
  const spaced = key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
  if (!spaced) return key
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** Службові атрибути вікі, які не має сенсу показувати в списку характеристик. */
export const HIDDEN_ATTRIBUTES = new Set([
  'image',
  'Image',
  'Image1',
  'Image1_Artist1',
  'template',
  'Appendix',
  'Links',
  'CharRef',
  'Speaker',
  'QuoteSource',
  'Recommended',
  'Trivia',
  'Notes',
])
