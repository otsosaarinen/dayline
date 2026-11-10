import { AlignLeft, Bell, CalendarDays, CircleCheck, CircleDashed, Trash2 } from 'lucide-react'
import type { Category, Countdown } from '@shared/types'
import { formatTimeOfDay, type TimeFormat } from '../lib/dates'
import { bigNumber, urgencyOf, type Urgency } from '../lib/time'
import { CategorySquare } from './CategorySquare'
import { EntryIcon } from './EntryIcon'

const numberColor: Record<Urgency, string> = {
    overdue: 'text-danger',
    soon: 'text-warn',
    today: 'text-fg',
    later: 'text-fg',
    done: 'text-faint'
}

/** Width of the category square + gap. Lines 2/3 and an icon'd title all align to this. */
const INDENT = 26

export function CountdownRow({
    item,
    now,
    category,
    timeFormat
}: {
    item: Countdown
    now: number
    category?: Category
    timeFormat: TimeFormat
}): React.JSX.Element {
    const done = !!item.completedAt
    const urgency = urgencyOf(item, now)
    const num = bigNumber(item, now)
    const due = new Date(item.dueAt)

    // Bright = needs attention, dim = can wait (same rule as the reference).
    const attention = urgency === 'overdue' || urgency === 'soon' || urgency === 'today'
    const titleClass = done ? 'text-faint' : attention ? 'text-fg' : 'text-muted'
    const nameClass = done ? 'text-faint' : attention ? 'text-fg/80' : 'text-muted'
    const statusClass =
        urgency === 'overdue' ? 'text-danger' : attention ? 'text-info' : 'text-faint'
    const hasReminders = item.notifyLeadMinutes.length > 0

    return (
        <div className="group flex items-start gap-2.5 rounded-lg px-1.5 py-3 hover:bg-hover">
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
                {/* Line 1: title (an optional icon sits in the indent column, like the pin) */}
                <div className="flex h-[22px] items-center">
                    {item.icon && (
                        <span
                            className="flex shrink-0 items-center text-faint"
                            style={{ width: INDENT }}
                        >
                            <EntryIcon name={item.icon} size={15} />
                        </span>
                    )}
                    <span className={`truncate text-[16px] leading-[22px] ${titleClass}`}>
                        {item.title}
                    </span>
                </div>

                {/* Line 2: category chip + date */}
                <div className="mt-0.5 flex h-[22px] items-center gap-2 text-[15px]">
                    {category && (
                        <span className="flex min-w-0 items-center gap-2">
                            <CategorySquare category={category} size={18} />
                            <span className={`truncate font-medium ${nameClass}`}>
                                {category.name}
                            </span>
                        </span>
                    )}
                    <span className="flex shrink-0 items-center gap-1.5 text-[14px] whitespace-nowrap text-faint">
                        <CalendarDays size={15} />
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

                {/* Line 3: description (wraps under the name, like the branch line) */}
                {item.description && (
                    <div
                        className="mt-0.5 flex h-[21px] items-center gap-1.5 text-[14px] text-faint"
                        style={{ paddingLeft: category ? INDENT : 0 }}
                    >
                        <AlignLeft size={15} className="shrink-0" />
                        <span className="truncate">{item.description}</span>
                    </div>
                )}
            </div>

            <div className="flex shrink-0 flex-col items-end self-start pr-1.5">
                <div className="flex h-[22px] items-center gap-1.5">
                    <button
                        aria-label={done ? 'Mark not done' : 'Mark done'}
                        title={done ? 'Mark not done' : 'Mark done'}
                        onClick={() => window.api.invoke('countdown:complete', item.id, !done)}
                        className={done ? 'text-ok' : `${statusClass} hover:text-ok`}
                    >
                        {done ? <CircleCheck size={18} /> : <CircleDashed size={18} />}
                    </button>
                </div>
                <div className="mt-0.5 flex h-[22px] items-center">
                    {hasReminders && (
                        <Bell
                            size={15}
                            aria-label="Has reminders"
                            className="text-faint group-hover:hidden"
                        />
                    )}
                    <button
                        aria-label="Delete"
                        title="Delete"
                        onClick={() => window.api.invoke('countdown:delete', item.id)}
                        className="hidden text-faint hover:text-danger group-hover:block"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>
        </div>
    )
}
