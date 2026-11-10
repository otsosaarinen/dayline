import { CATEGORY_ICON_NAMES, CATEGORY_ICONS } from '../lib/categoryIcons'

/** Scrollable grid of category icons. Clicking the selected one clears it. */
export function IconGrid({
    value,
    onChange
}: {
    value: string | undefined
    onChange: (next: string | undefined) => void
}): React.JSX.Element {
    return (
        <div className="mt-2 grid max-h-[84px] grid-cols-8 gap-0.5 overflow-y-auto">
            {CATEGORY_ICON_NAMES.map((name) => {
                const Icon = CATEGORY_ICONS[name]
                return (
                    <button
                        type="button"
                        key={name}
                        aria-label={name}
                        aria-pressed={value === name}
                        onClick={() => onChange(value === name ? undefined : name)}
                        className={`grid size-7 place-items-center rounded-md hover:bg-hover ${
                            value === name ? 'bg-hover text-fg' : 'text-faint hover:text-fg'
                        }`}
                    >
                        <Icon size={15} />
                    </button>
                )
            })}
        </div>
    )
}
