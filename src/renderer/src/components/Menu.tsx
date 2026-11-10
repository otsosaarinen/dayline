import { useEffect, useRef, useState } from 'react'

/**
 * Small dropdown: `trigger` renders the button, `children` renders the panel contents.
 * Closes on outside click and Escape. Escape is swallowed so it closes only the menu,
 * not the whole popover.
 */
export function Menu({
    trigger,
    children,
    align = 'left',
    anchorToParent = false,
    panelClassName = ''
}: {
    trigger: (state: { open: boolean; toggle: () => void }) => React.ReactNode
    children: (close: () => void) => React.ReactNode
    align?: 'left' | 'right'
    /** Position the panel against the nearest positioned ancestor (e.g. a form) instead of the trigger. */
    anchorToParent?: boolean
    panelClassName?: string
}): React.JSX.Element {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return
        const onDown = (e: MouseEvent): void => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false)
        }
        const onKey = (e: KeyboardEvent): void => {
            if (e.key !== 'Escape') return
            e.stopPropagation()
            setOpen(false)
        }
        document.addEventListener('mousedown', onDown)
        window.addEventListener('keydown', onKey, true) // capture: runs before other Escape handlers
        return () => {
            document.removeEventListener('mousedown', onDown)
            window.removeEventListener('keydown', onKey, true)
        }
    }, [open])

    return (
        <div ref={ref} className={anchorToParent ? '' : 'relative'}>
            {trigger({ open, toggle: () => setOpen((o) => !o) })}
            {open && (
                <div
                    className={`absolute z-30 mt-1.5 min-w-48 rounded-xl border border-line bg-elevated p-1 shadow-2xl ${
                        align === 'right' ? 'right-0' : anchorToParent ? 'left-3' : 'left-0'
                    } ${panelClassName}`}
                >
                    {children(() => setOpen(false))}
                </div>
            )}
        </div>
    )
}

export function MenuItem({
    selected,
    onClick,
    children
}: {
    selected?: boolean
    onClick: () => void
    children: React.ReactNode
}): React.JSX.Element {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] text-fg hover:bg-hover"
        >
            {children}
            {selected !== undefined && (
                <span
                    className={`ml-auto text-accent group-hover/row:invisible ${selected ? '' : 'invisible'}`}
                >
                    ✓
                </span>
            )}
        </button>
    )
}
