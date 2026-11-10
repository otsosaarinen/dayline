import { Kbd } from './Kbd'

/** Shown under the list while a category filter is on: clears it (also bound to ⌘⇧⌫). */
export function ClearFilter({ onClick }: { onClick: () => void }): React.JSX.Element {
    return (
        <button
            type="button"
            onClick={onClick}
            className="mx-auto mt-2 flex items-center gap-2 rounded-md px-2.5 py-1 text-[13px] text-muted hover:bg-hover hover:text-fg"
        >
            Clear filter
            <Kbd>⌘⇧⌫</Kbd>
        </button>
    )
}
