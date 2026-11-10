import { Kbd } from './Kbd'

/**
 * Styled hover tooltip (the native `title` one is slow, unstyled and unreliable in a frameless
 * window). Pure CSS: appears ~0.5s after hover, no JS state. `keys` renders shortcut keycaps.
 */
export function Tooltip({
    label,
    keys,
    side = 'bottom',
    align = 'center',
    children
}: {
    label: string
    keys?: string[]
    side?: 'top' | 'bottom'
    align?: 'start' | 'center' | 'end'
    children: React.ReactNode
}): React.JSX.Element {
    return (
        <span className="group/tip relative inline-flex">
            {children}
            <span
                role="tooltip"
                className={`pointer-events-none absolute z-40 flex items-center gap-1.5 rounded-lg border border-line bg-elevated px-2 py-1 text-xs whitespace-nowrap text-fg opacity-0 shadow-lg transition-opacity duration-100 group-hover/tip:opacity-100 group-hover/tip:delay-500 ${
                    side === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                } ${
                    align === 'end'
                        ? 'right-0'
                        : align === 'start'
                          ? 'left-0'
                          : 'left-1/2 -translate-x-1/2'
                }`}
            >
                {label}
                {keys && (
                    <span className="flex gap-0.5">
                        {keys.map((k) => (
                            <Kbd key={k}>{k}</Kbd>
                        ))}
                    </span>
                )}
            </span>
        </span>
    )
}
