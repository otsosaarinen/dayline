import { CATEGORY_COLORS, type CategoryColor } from '@shared/constants'
import type { Category } from '@shared/types'

/**
 * Faint diagonal highlight laid over a category's flat color (top-left corner, gone by ~68%).
 * Used by every category color square so they all match.
 */
export const CATEGORY_SHEEN =
    'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 68%)'

/** The first color no category uses yet; once all are taken, cycle through them. */
export function nextCategoryColor(existing: Pick<Category, 'color'>[]): CategoryColor {
    const used = new Set(existing.map((c) => c.color))
    return (
        CATEGORY_COLORS.find((c) => !used.has(c)) ??
        CATEGORY_COLORS[existing.length % CATEGORY_COLORS.length]
    )
}
