import { useState } from 'react'
import { Smile } from 'lucide-react'
import { ENTRY_ICON_NAMES, ENTRY_ICONS } from '../lib/entryIcons'
import { FieldRow } from './FieldRow'
import { EntryIcon } from './EntryIcon'
import { Menu } from './Menu'

/** Optional icon for a countdown. Click to open a searchable grid; "None" clears it. */
export function IconPicker({
    value,
    onChange
}: {
    value: string | undefined
    onChange: (next: string | undefined) => void
}): React.JSX.Element {
    const [query, setQuery] = useState('')
    const names = ENTRY_ICON_NAMES.filter((n) =>
        n.toLowerCase().includes(query.trim().toLowerCase())
    )

    return (
        <Menu
            anchorToParent
            panelClassName="w-64"
            trigger={({ toggle }) => (
                <FieldRow
                    icon={<Smile size={16} />}
                    label="Icon"
                    value={
                        value && ENTRY_ICONS[value] ? <EntryIcon name={value} size={16} /> : 'None'
                    }
                    active={!!value && !!ENTRY_ICONS[value]}
                    onClick={toggle}
                />
            )}
        >
            {(close) => (
                <div className="p-1">
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search icons"
                        className="mb-1.5 w-full rounded-lg border border-line bg-transparent px-2 py-1 text-[13px] text-fg outline-none placeholder:text-faint focus:border-accent"
                    />
                    <div className="grid max-h-44 grid-cols-7 gap-0.5 overflow-y-auto">
                        {names.map((name) => {
                            const Icon = ENTRY_ICONS[name]
                            return (
                                <button
                                    type="button"
                                    key={name}
                                    title={name}
                                    aria-label={name}
                                    onClick={() => {
                                        onChange(name)
                                        close()
                                    }}
                                    className={`grid size-8 place-items-center rounded-lg hover:bg-hover ${
                                        value === name
                                            ? 'bg-hover text-accent'
                                            : 'text-muted hover:text-fg'
                                    }`}
                                >
                                    <Icon size={16} />
                                </button>
                            )
                        })}
                        {names.length === 0 && (
                            <div className="col-span-7 py-3 text-center text-xs text-faint">
                                No icons match
                            </div>
                        )}
                    </div>
                    {value && (
                        <button
                            type="button"
                            onClick={() => {
                                onChange(undefined)
                                close()
                            }}
                            className="mt-1.5 w-full rounded-lg px-2 py-1 text-left text-xs text-muted hover:bg-hover hover:text-fg"
                        >
                            Remove icon
                        </button>
                    )}
                </div>
            )}
        </Menu>
    )
}
