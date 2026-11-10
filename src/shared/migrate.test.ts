import { describe, expect, it } from 'vitest'
import { migrateStore } from './migrate'
import { StoreSchema } from './schemas'

const v1 = {
    schemaVersion: 1,
    settings: { theme: 'dark' },
    categories: [
        { id: 'a', name: 'School', color: 'blue' },
        { id: 'b', name: 'Home', color: 'pink', icon: 'House' }
    ],
    countdowns: [
        {
            id: '1',
            title: 'Essay',
            icon: 'GraduationCap',
            categoryId: 'a',
            dueAt: '2026-01-01T00:00:00.000Z',
            createdAt: 'x'
        },
        {
            id: '2',
            title: 'Exam',
            icon: 'Pin',
            categoryId: 'a',
            dueAt: '2026-01-02T00:00:00.000Z',
            createdAt: 'x'
        },
        {
            id: '3',
            title: 'Rent',
            icon: 'Wallet',
            categoryId: 'b',
            dueAt: '2026-01-03T00:00:00.000Z',
            createdAt: 'x'
        },
        { id: '4', title: 'Loose', icon: 'Star', dueAt: '2026-01-04T00:00:00.000Z', createdAt: 'x' }
    ]
}

describe('migrateStore', () => {
    it('moves a countdown icon onto its category and drops it from countdowns', () => {
        const out = StoreSchema.parse(migrateStore(v1))
        expect(out.schemaVersion).toBe(2)
        expect(out.categories[0].icon).toBe('GraduationCap')
        expect(out.countdowns.every((c) => !('icon' in c))).toBe(true)
    })

    it('keeps an icon the category already has', () => {
        expect(StoreSchema.parse(migrateStore(v1)).categories[1].icon).toBe('House')
    })

    it('keeps every countdown, including uncategorized ones', () => {
        expect(StoreSchema.parse(migrateStore(v1)).countdowns).toHaveLength(4)
    })

    it('leaves a current or unrecognised file alone', () => {
        const current = { schemaVersion: 2, countdowns: [], categories: [] }
        expect(migrateStore(current)).toBe(current)
        expect(migrateStore(null)).toBe(null)
    })
})
