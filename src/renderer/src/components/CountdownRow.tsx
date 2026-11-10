import { ArrowRight, CircleCheck, CircleDashed, Trash2 } from 'lucide-react'
import type { Category, Countdown } from '@shared/types'
import { formatTimeOfDay, type TimeFormat } from '../lib/dates'
import { bigNumber, progressOf, urgencyOf, type Urgency } from '../lib/time'
import { CategoryMark } from './CategoryMark'
import { Tooltip } from './Tooltip'

const numberColor: Record<Urgency, string> = {
    overdue: 'text-danger',
    soon: 'text-warn',
    today: 'text-fg',
    later: 'text-fg',
    done: 'text-faint'
}

const shortDate = (d: Date): string => d.toLocaleDateString([], { month: 'short', day: 'numeric' })

/** Category mark size, and the indent (mark + gap) the description lines up under. */
const MARK = 14
const INDENT = MARK + 8

export function CountdownRow({
    item,
    now,
    category,
    timeFormat,
    onEdit
}: {
    item: Countdown
    now: number
    category?: Category
    timeFormat: TimeFormat
    /** Clicking the row (or Enter on it) opens the countdown for editing. */
    onEdit: () => void
}): React.JSX.Element {
    const done = !!item.completedAt
    const urgency = urgencyOf(item, now)
    const num = bigNumber(item, now)
    const progress = progressOf(item, now)
    // Rounded down so it only reads 100% once it really is (or the entry is done).
    const percent = Math.floor(progress * 100)
    const due = new Date(item.dueAt)
    const start = new Date(item.startAt)

    // Bright = needs attention, dim = can wait (same rule as the reference).
    const attention = urgency === 'overdue' || urgency === 'soon' || urgency === 'today'
    const titleClass = done ? 'text-faint' : attention ? 'text-fg' : 'text-muted'
    const nameClass = done ? 'text-faint' : attention ? 'text-fg/80' : 'text-muted'
    // The bar is the category's color (neutral grey when it has none), whatever the status.
    const barColor = category ? `var(--cat-${category.color})` : undefined
    const statusClass =
        urgency === 'overdue' ? 'text-danger' : attention ? 'text-info' : 'text-faint'

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onEdit}
            onKeyDown={(e) => e.target === e.currentTarget && e.key === 'Enter' && onEdit()}
            className="group cursor-pointer rounded-lg px-1.5 py-3 hover:bg-hover"
        >
            <div className="flex items-start gap-2.5">
                <div className="w-[42px] shrink-0 self-center text-center">
                    <div
                        className={`text-[26px] leading-none font-bold tracking-tight tabular-nums ${numberColor[urgency]}`}
                    >
                        {num.value}
                    </div>
                    <div className="mt-1 text-[9px] font-medium tracking-wide text-faint uppercase">
                        {num.unit}
                    </div>
                </div>

                <div className="min-w-0 flex-1">
                    {/* Line 1: title */}
                    <div className={`truncate text-[16px] leading-[22px] ${titleClass}`}>
                        {item.title}
                    </div>

                    {/* Line 2: category + date */}
                    <div className="mt-0.5 flex h-5 items-center gap-2 text-[13px]">
                        {category && (
                            <span className="flex min-w-0 items-center gap-2">
                                <CategoryMark category={category} size={MARK} />
                                <span className={`truncate font-medium ${nameClass}`}>
                                    {category.name}
                                </span>
                            </span>
                        )}
                        {/* start -> due, together so they read as one range */}
                        <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-faint">
                            {shortDate(start)}
                            <ArrowRight size={12} />
                            {shortDate(due)}
                            {item.hasTime && (
                                <span className={done ? '' : attention ? statusClass : ''}>
                                    {'· '}
                                    {formatTimeOfDay(due, timeFormat)}
                                </span>
                            )}
                        </span>
                    </div>

                    {/* Line 3: description, indented to line up under the category name */}
                    {item.description && (
                        <div
                            className="mt-0.5 h-5 truncate text-[13px] leading-5 text-faint"
                            style={{ paddingLeft: category ? INDENT : 0 }}
                        >
                            {item.description}
                        </div>
                    )}
                </div>

                <div className="flex shrink-0 flex-col items-end self-start pr-1.5">
                    <div className="flex h-[22px] items-center">
                        <Tooltip
                            label={done ? 'Mark not done' : 'Mark done'}
                            side="bottom"
                            align="end"
                        >
                            <button
                                aria-label={done ? 'Mark not done' : 'Mark done'}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    void window.api.invoke('countdown:complete', item.id, !done)
                                }}
                                className={
                                    done
                                        ? 'text-ok'
                                        : 'text-faint opacity-0 group-hover:opacity-100 hover:text-ok focus-visible:opacity-100'
                                }
                            >
                                {done ? <CircleCheck size={18} /> : <CircleDashed size={18} />}
                            </button>
                        </Tooltip>
                    </div>
                    <div className="mt-0.5 flex h-5 items-center">
                        <Tooltip label="Delete" side="bottom" align="end">
                            <button
                                aria-label="Delete"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    void window.api.invoke('countdown:delete', item.id)
                                }}
                                className="text-faint opacity-0 group-hover:opacity-100 hover:text-danger focus-visible:opacity-100"
                            >
                                <Trash2 size={15} />
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Progress from the start date to the due date, lined up under the text. */}
            <div className="mt-2 ml-[52px] flex items-center gap-2.5">
                <div
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-[3px] flex-1 overflow-hidden rounded-full bg-fg/10"
                >
                    <div
                        className={`h-full rounded-full ${category ? '' : 'bg-muted'}`}
                        style={{ width: `${progress * 100}%`, backgroundColor: barColor }}
                    />
                </div>
                <span className="-my-1 w-8 text-right text-[11px] leading-none text-faint tabular-nums">
                    {percent}%
                </span>
            </div>
        </div>
    )
}
