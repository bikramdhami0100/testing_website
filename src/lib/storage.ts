import type { UserSettings, TestHistoryItem, TestFlow } from '@/types'

const STORAGE_KEYS = [
  'last-report',
  'recent-urls',
  'settings',
  'theme',
  'custom-test-flows',
  'test-history',
] as const

export type StorageKey = (typeof STORAGE_KEYS)[number]

function getStorageKey(key: StorageKey): string {
  return `web-check-${key}`
}

export function getItem<T = unknown>(key: StorageKey): T | null {
  try {
    const raw = localStorage.getItem(getStorageKey(key))
    if (raw === null) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function setItem<T = unknown>(key: StorageKey, value: T): boolean {
  try {
    localStorage.setItem(getStorageKey(key), JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeItem(key: StorageKey): boolean {
  try {
    localStorage.removeItem(getStorageKey(key))
    return true
  } catch {
    return false
  }
}

export function getAllKeys(): StorageKey[] {
  const keys: StorageKey[] = []
  for (const key of STORAGE_KEYS) {
    const raw = localStorage.getItem(getStorageKey(key))
    if (raw !== null) {
      keys.push(key)
    }
  }
  return keys
}

export function getRecentUrls(): string[] {
  return getItem<string[]>('recent-urls') ?? []
}

export function addRecentUrl(url: string): void {
  const urls = getRecentUrls().filter((u) => u !== url)
  urls.unshift(url)
  setItem('recent-urls', urls.slice(0, 20))
}

export function getSettings(): UserSettings | null {
  return getItem<UserSettings>('settings')
}

export function saveSettings(settings: UserSettings): boolean {
  return setItem('settings', settings)
}

export function getTheme(): string | null {
  return getItem<string>('theme')
}

export function saveTheme(theme: string): boolean {
  return setItem('theme', theme)
}

export function getTestFlows(): TestFlow[] {
  return getItem<TestFlow[]>('custom-test-flows') ?? []
}

export function saveTestFlows(flows: TestFlow[]): boolean {
  return setItem('custom-test-flows', flows)
}

export function getTestHistory(): TestHistoryItem[] {
  return getItem<TestHistoryItem[]>('test-history') ?? []
}

export function addTestHistoryItem(item: TestHistoryItem): boolean {
  const history = getTestHistory()
  history.unshift(item)
  return setItem('test-history', history.slice(0, 100))
}

export function clearTestHistory(): boolean {
  return setItem('test-history', [])
}

export function getLastReport(): Record<string, unknown> | null {
  return getItem<Record<string, unknown>>('last-report')
}

export function saveLastReport(report: Record<string, unknown>): boolean {
  return setItem('last-report', report)
}
