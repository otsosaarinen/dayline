/**
 * A keyboard shortcut as one small pill, e.g. <Kbd>⌘F</Kbd> (one box per chord, not per key).
 * `onAccent` = sits on the solid accent button, where the usual subtle fill would vanish.
 */
export function Kbd({
    children,
    onAccent = false
}: {
    children: string
    onAccent?: boolean
}): React.JSX.Element {
    return (
        <kbd
            className={`inline-block rounded-[5px] border px-1.5 py-[3px] font-sans text-[11px] leading-none tracking-wider ${
                onAccent
                    ? 'border-transparent bg-accent-fg/15 text-accent-fg/70'
                    : 'border-line bg-hover text-muted'
            }`}
        >
            {children}
        </kbd>
    )
}
