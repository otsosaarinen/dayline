import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { isSameDay, monthGrid } from '../lib/calendar'
import { fromDateValue, toDateValue } from '../lib/dates'

/** Small month calendar (Monday first). Custom on purpose: no native picker popup to fight the popover. */
export function DatePicker({
    value,
    onSelect
}: {
    value: string
    onSelect: (value: string) => void
}): React.JSX.Element {
    const selected = fromDateValue(value)
    const [today] = useState(() => new Date())
    const [view, setView] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1))
    const cells = monthGrid(view.getFullYear(), view.getMonth())
    const weekdays = useMemo(
        // 1 Jan 2024 was a Monday.
        () =>
            Array.from({ length: 7 }, (_, i) =>
                new Date(2024, 0, 1 + i).toLocaleDateString([], { weekday: 'narrow' })
            ),
        []
    )
    const shiftMonth = (n: number): void =>
        setView(new Date(view.getFullYear(), view.getMonth() + n, 1))

    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between px-1">
                <span className="text-[13px] font-medium text-fg">
                    {view.toLocaleDateString([], { month: 'long', year: 'numeric' })}
                </span>
                <div className="flex">
                    <button
                        type="button"
                        aria-label="Previous month"
                        onClick={() => shiftMonth(-1)}
                        className="grid size-6 place-items-center rounded-md text-muted hover:bg-hover hover:text-fg"
                    >
                        <ChevronLeft size={15} />
                    </button>
                    <button
                        type="button"
                        aria-label="Next month"
                        onClick={() => shiftMonth(1)}
                        className="grid size-6 place-items-center rounded-md text-muted hover:bg-hover hover:text-fg"
                    >
                        <ChevronRight size={15} />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-0.5">
                {weekdays.map((w, i) => (
                    <div key={i} className="grid h-6 place-items-center text-[11px] text-faint">
                        {w}
                    </div>
                ))}
                {cells.map((d) => {
                    const isSelected = isSameDay(d, selected)
                    const inMonth = d.getMonth() === view.getMonth()
                    const isToday = isSameDay(d, today)
                    return (
                        <button
                            type="button"
                            key={d.getTime()}
                            onClick={() => onSelect(toDateValue(d))}
                            className={`grid h-8 w-full place-items-center rounded-lg text-[13px] tabular-nums ${
                                isSelected
                                    ? 'bg-accent font-medium text-accent-fg'
                                    : `hover:bg-hover ${
                                          isToday
                                              ? 'bg-hover font-semibold text-fg'
                                              : inMonth
                                                ? 'text-fg'
                                                : 'text-faint'
                                      }`
                            }`}
                        >
                            {d.getDate()}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
