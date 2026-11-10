import { CATEGORY_COLORS, type CategoryColor } from '@shared/constants'
import type { Category } from '@shared/types'

/** The first color no category uses yet; once all are taken, cycle through them. */
export function nextCategoryColor(existing: Pick<Category, 'color'>[]): CategoryColor {
    const used = new Set(existing.map((c) => c.color))
    return (
        CATEGORY_COLORS.find((c) => !used.has(c)) ??
        CATEGORY_COLORS[existing.length % CATEGORY_COLORS.length]
    )
}
