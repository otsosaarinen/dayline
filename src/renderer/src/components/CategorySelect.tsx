import { Folder } from 'lucide-react'
import type { Category } from '@shared/types'
import { CategorySquare } from './CategorySquare'
import { FieldRow } from './FieldRow'
import { Menu, MenuItem } from './Menu'

/** Single-select category dropdown used in the add form. */
export function CategorySelect({
    categories,
    value,
    onChange
}: {
    categories: Category[]
    value: string | undefined
    onChange: (id: string | undefined) => void
}): React.JSX.Element | null {
    if (categories.length === 0) return null
    const current = categories.find((c) => c.id === value)

    return (
        <Menu
            anchorToParent
            trigger={({ toggle }) => (
                <FieldRow
                    icon={<Folder size={16} />}
                    label="Category"
                    value={
                        current ? (
                            <>
                                <CategorySquare category={current} size={16} />
                                <span className="truncate">{current.name}</span>
                            </>
                        ) : (
                            'None'
                        )
                    }
                    active={!!current}
                    onClick={toggle}
                />
            )}
        >
            {(close) => (
                <>
                    <MenuItem
                        selected={!value}
                        onClick={() => {
                            onChange(undefined)
                            close()
                        }}
                    >
                        <span className="text-muted">No category</span>
                    </MenuItem>
                    {categories.map((c) => (
                        <MenuItem
                            key={c.id}
                            selected={value === c.id}
                            onClick={() => {
                                onChange(c.id)
                                close()
                            }}
                        >
                            <CategorySquare category={c} size={18} />
                            {c.name}
                        </MenuItem>
                    ))}
                </>
            )}
        </Menu>
    )
}
