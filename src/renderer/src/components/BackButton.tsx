/** "← Back" row at the top of the full-screen views (Settings, New countdown). */
export function BackButton({ onClick }: { onClick: () => void }): React.JSX.Element {
    return (
        <button
            type="button"
            onClick={onClick}
            className="-ml-1.5 rounded-md px-1.5 py-0.5 text-[13px] text-muted hover:bg-hover hover:text-fg"
        >
            ← Back
        </button>
    )
}
