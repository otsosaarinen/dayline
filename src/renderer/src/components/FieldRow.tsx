import { ChevronDown } from 'lucide-react'

/**
 * One option in the add form, as a full-width row: icon + field name on the left, current
 * value on the right. Clicking opens the field's menu. Rows stack vertically.
 */
export function FieldRow({
    icon,
    label,
    value,
    active = false,
    onClick
}: {
    icon: React.ReactNode
    label: string
    value: React.ReactNode
    active?: boolean
    onClick: () => void
}): React.JSX.Element {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2 text-[14px] hover:bg-hover"
        >
            <span className="text-faint">{icon}</span>
            <span className="text-muted">{label}</span>
            <span
                className={`ml-auto flex min-w-0 items-center gap-2 ${active ? 'text-fg' : 'text-faint'}`}
            >
                {value}
            </span>
            <ChevronDown size={14} className="shrink-0 text-faint" />
        </button>
    )
}
