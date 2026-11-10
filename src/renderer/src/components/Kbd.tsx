/**
 * A keyboard key cap, e.g. <Kbd>⌘</Kbd><Kbd>↵</Kbd>. `onAccent` = sits on the solid accent
 * button (primary action), where the usual subtle fill would vanish.
 */
export function Kbd({
    children,
    onAccent = false
}: {
    children: React.ReactNode
    onAccent?: boolean
}): React.JSX.Element {
    return (
        <kbd
            className={`inline-grid h-[18px] min-w-[18px] place-items-center rounded-[5px] border px-1 font-sans text-[11px] leading-none ${
                onAccent
                    ? 'border-transparent bg-accent-fg/15 text-accent-fg/70'
                    : 'border-line bg-hover text-muted'
            }`}
        >
            {children}
        </kbd>
    )
}
