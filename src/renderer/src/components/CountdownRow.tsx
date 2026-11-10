import { CircleCheck, CircleDashed, Trash2 } from 'lucide-react'
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
    const due = new Date(item.dueAt)

    // Bright = needs attention, dim = can wait (same rule as the reference).
    const attention = urgency === 'overdue' || urgency === 'soon' || urgency === 'today'
    const titleClass = done ? 'text-faint' : attention ? 'text-fg' : 'text-muted'
    const nameClass = done ? 'text-faint' : attention ? 'text-fg/80' : 'text-muted'
    // Meaning first: finished = green, overdue = red; otherwise the category's color (neutral
    // when it has none).
    const barClass = done
        ? 'bg-ok'
        : urgency === 'overdue'
          ? 'bg-danger'
          : category
            ? ''
            : 'bg-muted'
    const barColor = barClass || !category ? undefined : `var(--cat-${category.color})`
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
                        <span className="shrink-0 whitespace-nowrap text-faint">
                            {due.toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric'
                            })}
                            {item.hasTime && (
                                <span className={done ? '' : attention ? statusClass : ''}>
                                    {' · '}
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
            <div
                role="progressbar"
                aria-valuenow={Math.round(progress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="mt-2.5 ml-[52px] h-[3px] overflow-hidden rounded-full bg-fg/10"
            >
                <div
                    className={`h-full rounded-full ${barClass}`}
                    style={{ width: `${progress * 100}%`, backgroundColor: barColor }}
                />
            </div>
        </div>
    )
}
