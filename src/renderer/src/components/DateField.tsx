import { CalendarDays } from 'lucide-react'
import { addDays, addMonths, describeDate, toDateValue } from '../lib/dates'
import { DatePicker } from './DatePicker'
import { FieldRow } from './FieldRow'
import { Menu } from './Menu'

const PRESETS: { label: string; resolve: (today: Date) => Date }[] = [
    { label: 'Today', resolve: (t) => t },
    { label: 'Tomorrow', resolve: (t) => addDays(t, 1) },
    { label: 'In a week', resolve: (t) => addDays(t, 7) },
    { label: 'In a month', resolve: (t) => addMonths(t, 1) }
]

/** Required due date: quick presets plus a month calendar. */
export function DateField({
    value,
    onChange
}: {
    value: string
    onChange: (value: string) => void
}): React.JSX.Element {
    return (
        <Menu
            anchorToParent
            panelClassName="w-[300px]"
            trigger={({ toggle }) => (
                <FieldRow
                    icon={<CalendarDays size={16} />}
                    label="Date"
                    value={describeDate(value)}
                    active
                    onClick={toggle}
                />
            )}
        >
            {(close) => (
                <div className="p-1.5">
                    <div className="mb-2.5 flex gap-1.5">
                        {PRESETS.map((p) => (
                            <button
                                type="button"
                                key={p.label}
                                onClick={() => {
                                    onChange(toDateValue(p.resolve(new Date())))
                                    close()
                                }}
                                className="min-w-0 flex-1 rounded-md border border-line px-1 py-0.5 text-[11px] whitespace-nowrap text-muted hover:bg-hover hover:text-fg"
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                    <DatePicker
                        value={value}
                        onSelect={(v) => {
                            onChange(v)
                            close()
                        }}
                    />
                </div>
            )}
        </Menu>
    )
}
