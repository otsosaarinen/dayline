import { Kbd } from './Kbd'

/**
 * The primary action of a form or menu ("Add", "Create", "Save") with its shortcut as a pill.
 * Flat and faint while it can't be used yet, solid once it can.
 */
export function SubmitButton({
    label,
    keys,
    disabled,
    onClick,
    type = 'button'
}: {
    label: string
    keys: string
    disabled: boolean
    onClick?: () => void
    type?: 'button' | 'submit'
}): React.JSX.Element {
    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className="flex h-6 items-center gap-1.5 rounded-md bg-accent pr-1.5 pl-2.5 text-[13px] font-medium text-accent-fg transition-colors disabled:bg-transparent disabled:text-faint"
        >
            {label}
            <Kbd onAccent={!disabled}>{keys}</Kbd>
        </button>
    )
}
