/** A keyboard key cap, e.g. <Kbd>⌘</Kbd><Kbd>↵</Kbd>. */
export function Kbd({ children }: { children: React.ReactNode }): React.JSX.Element {
    return (
        <kbd className="inline-grid h-[18px] min-w-[18px] place-items-center rounded-[5px] border border-line bg-hover px-1 font-sans text-[11px] leading-none text-muted">
            {children}
        </kbd>
    )
}
