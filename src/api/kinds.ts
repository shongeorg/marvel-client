import type { Kind } from './types'

export interface KindMeta {
  kind: Kind
  label: string
  singular: string
  tagline: string
  accent: string
}

export const KIND_META: Record<Kind, KindMeta> = {
  characters: {
    kind: 'characters',
    label: 'Персонажі',
    singular: 'Персонаж',
    tagline: 'Герої, лиходії та всі, хто між ними',
    accent: '#e62429',
  },
  comics: {
    kind: 'comics',
    label: 'Комікси',
    singular: 'Комікс',
    tagline: 'Окремі випуски та їхні творці',
    accent: '#3b7bff',
  },
  creators: {
    kind: 'creators',
    label: 'Творці',
    singular: 'Творець',
    tagline: 'Сценаристи, художники, редактори',
    accent: '#f2b418',
  },
  events: {
    kind: 'events',
    label: 'Події',
    singular: 'Подія',
    tagline: 'Кросовери та великі сюжети',
    accent: '#8b5cf6',
  },
  series: {
    kind: 'series',
    label: 'Серії',
    singular: 'Серія',
    tagline: 'Лінійки, томи та продовження',
    accent: '#14b8a6',
  },
  stories: {
    kind: 'stories',
    label: 'Історії',
    singular: 'Історія',
    tagline: 'Сюжетні арки всередині випусків',
    accent: '#ec4899',
  },
}

export const KIND_LIST: KindMeta[] = [
  KIND_META.characters,
  KIND_META.comics,
  KIND_META.creators,
  KIND_META.events,
  KIND_META.series,
  KIND_META.stories,
]

export function isKind(value: unknown): value is Kind {
  return typeof value === 'string' && value in KIND_META
}

export interface FieldSpec {
  key: string
  label: string
}

/** Куровані поля для детальної сторінки (решта сирих атрибутів показується окремим блоком). */
export const DETAIL_FIELDS: Partial<Record<Kind, FieldSpec[]>> = {
  characters: [
    { key: 'Name', label: 'Справжнє ім’я' },
    { key: 'aliases', label: 'Псевдоніми' },
    { key: 'Identity', label: 'Особистість' },
    { key: 'Citizenship', label: 'Громадянство' },
    { key: 'Origin', label: 'Походження' },
    { key: 'Occupation', label: 'Зайнятість' },
    { key: 'Affiliation', label: 'Приналежність' },
    { key: 'BaseOfOperations', label: 'База операцій' },
    { key: 'Reality', label: 'Реальність' },
    { key: 'firstAppearance', label: 'Перша поява' },
    { key: 'Creators', label: 'Творці' },
    { key: 'Abilities', label: 'Здібності' },
    { key: 'Equipment', label: 'Спорядження' },
    { key: 'Gender', label: 'Стать' },
    { key: 'Height', label: 'Зріст' },
    { key: 'Weight', label: 'Вага' },
    { key: 'Eyes', label: 'Колір очей' },
    { key: 'Hair', label: 'Волосся' },
    { key: 'Quotation', label: 'Цитата' },
  ],
  comics: [
    { key: 'ReleaseDate', label: 'Дата випуску' },
    { key: 'Pages', label: 'Сторінок' },
    { key: 'Rating', label: 'Рейтинг' },
    { key: 'OriginalPrice', label: 'Ціна' },
    { key: 'StoryTitle1', label: 'Історія' },
    { key: 'Writer1_1', label: 'Сценарист' },
    { key: 'Penciler1_1', label: 'Олівець' },
    { key: 'Inker1_1', label: 'Туш' },
    { key: 'Colorist1_1', label: 'Колір' },
    { key: 'Letterer1_1', label: 'Літерування' },
    { key: 'Editor1_1', label: 'Редактор' },
    { key: 'universe', label: 'Всесвіт' },
    { key: 'PreviousIssue', label: 'Попередній випуск' },
    { key: 'Synopsis1', label: 'Синопсис' },
  ],
  creators: [
    { key: 'Titles', label: 'Роль' },
    { key: 'Employers', label: 'Видавець' },
    { key: 'CountryOfBirth', label: 'Країна народження' },
    { key: 'CityOfBirth', label: 'Місто народження' },
    { key: 'YearOfBirth', label: 'Рік народження' },
    { key: 'Creations', label: 'Створив' },
    { key: 'aliases', label: 'Псевдоніми' },
    { key: 'OfficialWebsite', label: 'Сайт' },
    { key: 'ProfessionalHistory', label: 'Професійний шлях' },
    { key: 'PersonalHistory', label: 'Біографія' },
  ],
  series: [
    { key: 'type', label: 'Тип' },
    { key: 'format', label: 'Формат' },
    { key: 'status', label: 'Статус' },
    { key: 'genres', label: 'Жанри' },
    { key: 'publisher', label: 'Видавець' },
    { key: 'featured', label: 'Головні герої' },
    { key: 'universe', label: 'Всесвіт' },
    { key: 'PreviousVol', label: 'Попередній том' },
    { key: 'NextVol', label: 'Наступний том' },
    { key: 'creators', label: 'Творці' },
  ],
  events: [
    { key: 'universe', label: 'Всесвіт' },
    { key: 'creators', label: 'Творці' },
    { key: 'aliases', label: 'Псевдоніми' },
    { key: 'firstAppearance', label: 'Перша поява' },
  ],
}
