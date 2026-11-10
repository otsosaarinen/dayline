import Store from 'electron-store'
import { randomUUID } from 'crypto'
import { migrateStore } from '@shared/migrate'
import { StoreSchema } from '@shared/schemas'
import type { Category, Countdown, CountdownInput, Settings, StoreData } from '@shared/types'

const disk = new Store<StoreData>({ name: 'countdowns' })

/** Upgrades old files, then validates on every read so a hand-edited/corrupt file can't crash the app. */
export function getState(): StoreData {
    const parsed = StoreSchema.safeParse(migrateStore(disk.store))
    return parsed.success ? parsed.data : StoreSchema.parse({})
}

function save(next: StoreData): StoreData {
    disk.store = next
    return next
}

export function addCountdown(input: CountdownInput): Countdown {
    const state = getState()
    const countdown: Countdown = {
        ...input,
        id: randomUUID(),
        createdAt: new Date().toISOString()
    }
    save({ ...state, countdowns: [...state.countdowns, countdown] })
    return countdown
}

export function setCompleted(id: string, done: boolean): Countdown | null {
    const state = getState()
    const existing = state.countdowns.find((c) => c.id === id)
    if (!existing) return null
    const updated: Countdown = {
        ...existing,
        completedAt: done ? new Date().toISOString() : undefined
    }
    save({ ...state, countdowns: state.countdowns.map((c) => (c.id === id ? updated : c)) })
    return updated
}

export function deleteCountdown(id: string): boolean {
    const state = getState()
    const next = state.countdowns.filter((c) => c.id !== id)
    save({ ...state, countdowns: next })
    return next.length !== state.countdowns.length
}

export function addCategory(input: Omit<Category, 'id'>): Category {
    const state = getState()
    const category: Category = { ...input, id: randomUUID() }
    save({ ...state, categories: [...state.categories, category] })
    return category
}

export function updateCategory(id: string, patch: Partial<Omit<Category, 'id'>>): Category | null {
    const state = getState()
    const existing = state.categories.find((c) => c.id === id)
    if (!existing) return null
    const updated: Category = { ...existing, ...patch }
    save({ ...state, categories: state.categories.map((c) => (c.id === id ? updated : c)) })
    return updated
}

export function deleteCategory(id: string): boolean {
    const state = getState()
    const next = state.categories.filter((c) => c.id !== id)
    save({
        ...state,
        categories: next,
        countdowns: state.countdowns.map((c) =>
            c.categoryId === id ? { ...c, categoryId: undefined } : c
        )
    })
    return next.length !== state.categories.length
}

export function updateSettings(patch: Partial<Settings>): Settings {
    const state = getState()
    const settings = { ...state.settings, ...patch }
    save({ ...state, settings })
    return settings
}
