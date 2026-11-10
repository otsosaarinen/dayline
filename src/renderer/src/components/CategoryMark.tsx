import type { Category } from '@shared/types'
import { CATEGORY_SHEEN } from '../lib/categories'
import { CATEGORY_ICONS } from '../lib/categoryIcons'

/**
 * What marks a category: its icon tinted with its color, or, without an icon, a plain colored
 * rounded square. Color only, never a letter.
 */
export function CategoryMark({
    category,
    size = 20
}: {
    category: Pick<Category, 'color' | 'icon'>
    size?: number
}): React.JSX.Element {
    const Icon = category.icon ? CATEGORY_ICONS[category.icon] : undefined
    const color = `var(--cat-${category.color})`
    if (Icon) return <Icon size={size} className="shrink-0" style={{ color }} />
    return (
        <span
            className="block shrink-0"
            style={{
                width: size,
                height: size,
                borderRadius: size * 0.28,
                // Faint diagonal highlight over the flat color.
                backgroundColor: color,
                backgroundImage: CATEGORY_SHEEN,
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)'
            }}
        />
    )
}
