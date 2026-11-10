import { ENTRY_ICONS } from '../lib/entryIcons'

/** Renders a countdown's chosen icon by name; renders nothing for none/unknown names. */
export function EntryIcon({
    name,
    size = 16,
    className
}: {
    name: string | undefined
    size?: number
    className?: string
}): React.JSX.Element | null {
    const Icon = name ? ENTRY_ICONS[name] : undefined
    return Icon ? <Icon size={size} className={className} /> : null
}
