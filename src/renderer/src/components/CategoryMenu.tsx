import { useState } from 'react'
import { Check, Folder, Pencil, Plus, Trash2 } from 'lucide-react'
import { CATEGORY_COLORS, type CategoryColor } from '@shared/constants'
import type { Category } from '@shared/types'
import { nextCategoryColor } from '../lib/categories'
import { CategorySquare } from './CategorySquare'
import { IconButton } from './IconButton'
import { Menu, MenuItem } from './Menu'
import { Tooltip } from './Tooltip'

/**
 * One place for everything about categories: filter the list by one, create, edit
 * (rename / recolor) and delete. Replaces the old filter button, new-folder form and Settings list.
 */
export function CategoryMenu({
    categories,
    activeFilter,
    onFilter
}: {
    categories: Category[]
    activeFilter: string | null
    onFilter: (id: string | null) => void
}): React.JSX.Element {
    return (
        <Menu
            align="right"
            panelClassName="w-64"
            trigger={({ toggle }) => (
                <IconButton label="Categories" active={!!activeFilter} onClick={toggle}>
                    <Folder size={17} />
                </IconButton>
            )}
        >
            {(close) => (
                <MenuBody
                    categories={categories}
                    activeFilter={activeFilter}
                    onFilter={(id) => {
                        onFilter(id)
                        close()
                    }}
                />
            )}
        </Menu>
    )
}

function MenuBody({
    categories,
    activeFilter,
    onFilter
}: {
    categories: Category[]
    activeFilter: string | null
    onFilter: (id: string | null) => void
}): React.JSX.Element {
    const [creating, setCreating] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    return (
        <div>
            <MenuItem selected={!activeFilter} onClick={() => onFilter(null)}>
                <span className="text-muted">All categories</span>
            </MenuItem>

            {categories.map((c) =>
                editingId === c.id ? (
                    <CategoryEditor
                        key={c.id}
                        initialName={c.name}
                        initialColor={c.color}
                        placeholder="Category name"
                        onSubmit={async (name, color) => {
                            await window.api.invoke('category:update', c.id, { name, color })
                            setEditingId(null)
                        }}
                    />
                ) : (
                    <div key={c.id} className="group/row relative">
                        <MenuItem selected={activeFilter === c.id} onClick={() => onFilter(c.id)}>
                            <CategorySquare category={c} size={18} />
                            <span className="truncate">{c.name}</span>
                        </MenuItem>
                        <div className="absolute top-1/2 right-1.5 hidden -translate-y-1/2 items-center group-hover/row:flex">
                            <Tooltip label="Edit" side="top">
                                <button
                                    type="button"
                                    aria-label={`Edit ${c.name}`}
                                    onClick={() => {
                                        setCreating(false)
                                        setEditingId(c.id)
                                    }}
                                    className="rounded-md p-1 text-faint hover:text-fg"
                                >
                                    <Pencil size={14} />
                                </button>
                            </Tooltip>
                            <Tooltip label="Delete" side="top" align="end">
                                <button
                                    type="button"
                                    aria-label={`Delete ${c.name}`}
                                    onClick={() => window.api.invoke('category:delete', c.id)}
                                    className="rounded-md p-1 text-faint hover:text-danger"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                )
            )}

            <div className="my-1 h-px bg-line" />

            {creating ? (
                <CategoryEditor
                    initialName=""
                    initialColor={nextCategoryColor(categories)}
                    placeholder="Category name, then Enter"
                    onSubmit={async (name, color) => {
                        await window.api.invoke('category:add', { name, color })
                        setCreating(false)
                    }}
                />
            ) : (
                <MenuItem
                    onClick={() => {
                        setEditingId(null)
                        setCreating(true)
                    }}
                >
                    <Plus size={16} className="text-muted" />
                    <span className="text-muted">New category</span>
                </MenuItem>
            )}
        </div>
    )
}

/** Name + color editor, shared by "New category" and "Edit". Enter saves. */
function CategoryEditor({
    initialName,
    initialColor,
    placeholder,
    onSubmit
}: {
    initialName: string
    initialColor: CategoryColor
    placeholder: string
    onSubmit: (name: string, color: CategoryColor) => Promise<void>
}): React.JSX.Element {
    const [name, setName] = useState(initialName)
    const [color, setColor] = useState<CategoryColor>(initialColor)
    const [pickingColor, setPickingColor] = useState(false)

    const save = (): void => {
        const trimmed = name.trim()
        if (trimmed) void onSubmit(trimmed, color)
    }

    return (
        <div className="p-1.5">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    aria-label="Choose color"
                    onClick={() => setPickingColor((p) => !p)}
                    className="shrink-0"
                >
                    <CategorySquare category={{ color }} size={22} />
                </button>
                <input
                    autoFocus
                    value={name}
                    maxLength={40}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={(e) => e.currentTarget.select()}
                    onKeyDown={(e) => e.key === 'Enter' && save()}
                    placeholder={placeholder}
                    className="min-w-0 flex-1 bg-transparent text-[14px] text-fg outline-none placeholder:text-faint"
                />
            </div>
            {pickingColor && (
                <div className="mt-2.5 flex items-center gap-1.5 pl-0.5">
                    {CATEGORY_COLORS.map((c) => (
                        <button
                            type="button"
                            key={c}
                            aria-label={c}
                            aria-pressed={color === c}
                            onClick={() => {
                                setColor(c)
                                setPickingColor(false)
                            }}
                            className="grid size-5 place-items-center rounded-md text-white transition-transform hover:scale-110"
                            style={{
                                backgroundColor: `var(--cat-${c})`,
                                backgroundImage:
                                    'linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0))'
                            }}
                        >
                            {color === c && <Check size={12} strokeWidth={3} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
