import type { Category } from '@shared/types'

/** The colored rounded square that marks a category (the "project icon" in the design). Color only, no letter. */
export function CategorySquare({
    category,
    size = 20
}: {
    category: Pick<Category, 'color'>
    size?: number
}): React.JSX.Element {
    return (
        <span
            className="block shrink-0"
            style={{
                width: size,
                height: size,
                borderRadius: size * 0.28,
                // Soft top-light gradient over the flat color, like the reference icons.
                backgroundColor: `var(--cat-${category.color})`,
                backgroundImage:
                    'linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0))',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)'
            }}
        />
    )
}
