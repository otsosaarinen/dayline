import { Tooltip } from './Tooltip'

/**
 * Square header icon button with a tooltip. `active` = the panel it controls is open / a filter
 * is on. `color` overrides the icon color (e.g. a category color). `tooltipDisabled` hides the
 * tooltip while what it opens is already showing.
 */
export function IconButton({
    label,
    shortcut,
    active,
    color,
    tooltipDisabled,
    onClick,
    children
}: {
    label: string
    shortcut?: string[]
    active?: boolean
    color?: string
    tooltipDisabled?: boolean
    onClick: () => void
    children: React.ReactNode
}): React.JSX.Element {
    return (
        <Tooltip label={label} keys={shortcut} align="end" disabled={tooltipDisabled}>
            <button
                type="button"
                aria-label={label}
                onClick={onClick}
                style={color ? { color } : undefined}
                className={`grid size-[33px] place-items-center rounded-lg hover:text-fg ${
                    active ? 'text-accent' : 'text-fg/60'
                }`}
            >
                {children}
            </button>
        </Tooltip>
    )
}
