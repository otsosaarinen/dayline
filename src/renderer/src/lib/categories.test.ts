import { describe, expect, it } from 'vitest'
import { CATEGORY_COLORS } from '@shared/constants'
import { nextCategoryColor } from './categories'

describe('nextCategoryColor', () => {
    it('starts with the first color', () => {
        expect(nextCategoryColor([])).toBe(CATEGORY_COLORS[0])
    })
    it('skips colors already in use', () => {
        expect(nextCategoryColor([{ color: 'blue' }, { color: 'pink' }])).toBe('orange')
    })
    it('cycles once every color is taken', () => {
        const all = CATEGORY_COLORS.map((color) => ({ color }))
        expect(nextCategoryColor(all)).toBe(CATEGORY_COLORS[0])
        expect(nextCategoryColor([...all, { color: 'blue' as const }])).toBe(CATEGORY_COLORS[1])
    })
})
