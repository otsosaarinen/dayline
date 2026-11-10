import { Bell, Check } from 'lucide-react'
import { REMINDER_OPTIONS, reminderSummary } from '../lib/reminders'
import { FieldRow } from './FieldRow'
import { Menu } from './Menu'

/** Multi-select dropdown of reminder offsets. Stays open while you tick several. */
export function ReminderSelect({
    value,
    onChange,
    withTime
}: {
    value: number[]
    onChange: (next: number[]) => void
    withTime: boolean
}): React.JSX.Element {
    const options = REMINDER_OPTIONS.filter((o) => withTime || !o.timedOnly)
    const active = value.filter((m) => options.some((o) => o.minutes === m))

    return (
        <Menu
            anchorToParent
            trigger={({ toggle }) => (
                <FieldRow
                    icon={<Bell size={16} />}
                    label="Remind me"
                    value={active.length ? reminderSummary(active) : 'None'}
                    active={active.length > 0}
                    onClick={toggle}
                />
            )}
        >
            {() => (
                <div role="group" aria-label="Reminders">
                    {options.map((o) => {
                        const on = active.includes(o.minutes)
                        return (
                            <button
                                type="button"
                                key={o.minutes}
                                role="checkbox"
                                aria-checked={on}
                                onClick={() =>
                                    onChange(
                                        on
                                            ? active.filter((m) => m !== o.minutes)
                                            : [...active, o.minutes]
                                    )
                                }
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] text-fg hover:bg-hover"
                            >
                                <span
                                    className={`grid size-4 place-items-center rounded border ${
                                        on
                                            ? 'border-accent bg-accent text-accent-fg'
                                            : 'border-faint'
                                    }`}
                                >
                                    {on && <Check size={12} strokeWidth={3} />}
                                </span>
                                {o.label}
                            </button>
                        )
                    })}
                </div>
            )}
        </Menu>
    )
}
