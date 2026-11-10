import { Clock } from 'lucide-react'
import { formatTimeValue } from '../lib/dates'
import { FieldRow } from './FieldRow'
import { Menu, MenuItem } from './Menu'

const PRESETS = ['09:00', '12:00', '15:00', '18:00']

/** Optional time of day. `null` = date only. */
export function TimeField({
    value,
    onChange
}: {
    value: string | null
    onChange: (value: string | null) => void
}): React.JSX.Element {
    return (
        <Menu
            anchorToParent
            panelClassName="w-52"
            trigger={({ toggle }) => (
                <FieldRow
                    icon={<Clock size={16} />}
                    label="Time"
                    value={value ? formatTimeValue(value) : 'None'}
                    active={value !== null}
                    onClick={toggle}
                />
            )}
        >
            {(close) => (
                <>
                    <MenuItem
                        selected={value === null}
                        onClick={() => {
                            onChange(null)
                            close()
                        }}
                    >
                        <span className="text-muted">No time</span>
                    </MenuItem>
                    {PRESETS.map((t) => (
                        <MenuItem
                            key={t}
                            selected={value === t}
                            onClick={() => {
                                onChange(t)
                                close()
                            }}
                        >
                            {formatTimeValue(t)}
                        </MenuItem>
                    ))}
                    <div className="my-1 h-px bg-line" />
                    <label className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-muted">
                        Custom
                        <input
                            type="time"
                            value={value ?? ''}
                            onChange={(e) => onChange(e.target.value || null)}
                            className="rounded-md border border-line bg-transparent px-1.5 py-0.5 text-[13px] text-fg outline-none focus:border-accent [&::-webkit-calendar-picker-indicator]:hidden"
                        />
                    </label>
                </>
            )}
        </Menu>
    )
}
