import type { Countdown } from '@shared/types'

export type Urgency = 'overdue' | 'soon' | 'today' | 'later' | 'done'
export type Group = 'Overdue' | 'Today' | 'This week' | 'Later' | 'Done'

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

function startOfLocalDay(ms: number): number {
    const d = new Date(ms)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
}

/**
 * Whole calendar days from `now` to the due date (negative = past, 0 = today).
 * Only meaningful for date-only countdowns, where the time of day doesn't exist.
 * `Math.round` absorbs 23h/25h days around daylight saving changes.
 */
function calendarDaysUntil(c: Countdown, now: number): number {
    return Math.round((startOfLocalDay(new Date(c.dueAt).getTime()) - startOfLocalDay(now)) / DAY)
}

export function urgencyOf(c: Countdown, now: number): Urgency {
    if (c.completedAt) return 'done'
    if (!c.hasTime) {
        const days = calendarDaysUntil(c, now)
        if (days < 0) return 'overdue'
        if (days === 0) return 'soon'
        return days === 1 ? 'today' : 'later'
    }
    const ms = new Date(c.dueAt).getTime() - now
    if (ms < 0) return 'overdue'
    if (ms < 3 * HOUR) return 'soon'
    if (ms < DAY) return 'today'
    return 'later'
}

function endOfLocalDay(now: number): number {
    const d = new Date(now)
    d.setHours(23, 59, 59, 999)
    return d.getTime()
}

export function groupOf(c: Countdown, now: number): Group {
    if (c.completedAt) return 'Done'
    if (!c.hasTime) {
        const days = calendarDaysUntil(c, now)
        if (days < 0) return 'Overdue'
        if (days === 0) return 'Today'
        return days <= 6 ? 'This week' : 'Later'
    }
    const due = new Date(c.dueAt).getTime()
    if (due < now) return 'Overdue'
    const eod = endOfLocalDay(now)
    if (due <= eod) return 'Today'
    if (due <= eod + 6 * DAY) return 'This week'
    return 'Later'
}

const ORDER: Group[] = ['Overdue', 'Today', 'This week', 'Later', 'Done']

export function groupCountdowns(
    list: Countdown[],
    now: number
): { group: Group; items: Countdown[] }[] {
    const buckets = new Map<Group, Countdown[]>()
    for (const c of list) {
        const g = groupOf(c, now)
        buckets.set(g, [...(buckets.get(g) ?? []), c])
    }
    return ORDER.filter((g) => buckets.has(g)).map((group) => ({
        group,
        items: buckets
            .get(group)!
            .sort((a, b) =>
                group === 'Done'
                    ? (b.completedAt ?? '').localeCompare(a.completedAt ?? '')
                    : a.dueAt.localeCompare(b.dueAt)
            )
    }))
}

/** True when anything is due within the hour (renderer ticks every second instead of every 30s). */
export function needsFastTick(list: Countdown[], now: number): boolean {
    return list.some((c) => {
        if (c.completedAt || !c.hasTime) return false
        const ms = new Date(c.dueAt).getTime() - now
        return ms > 0 && ms < HOUR
    })
}

export interface BigNumber {
    value: string
    unit: string
}

/** The large figure shown on the left of a row: days until due, dropping to hours/minutes under a day. */
export function bigNumber(c: Countdown, now: number): BigNumber {
    if (c.completedAt) return { value: '✓', unit: 'done' }
    if (!c.hasTime) {
        const days = calendarDaysUntil(c, now)
        if (days < 0) return { value: `${-days}d`, unit: 'overdue' }
        if (days === 0) return { value: '0', unit: 'today' }
        return { value: String(days), unit: days === 1 ? 'day' : 'days' }
    }
    const ms = new Date(c.dueAt).getTime() - now
    const abs = Math.abs(ms)
    if (ms < 0) {
        if (abs < MIN) return { value: '<1m', unit: 'overdue' }
        if (abs < HOUR) return { value: `${Math.floor(abs / MIN)}m`, unit: 'overdue' }
        if (abs < DAY) return { value: `${Math.floor(abs / HOUR)}h`, unit: 'overdue' }
        return { value: `${Math.floor(abs / DAY)}d`, unit: 'overdue' }
    }
    if (abs >= DAY) {
        const n = Math.floor(abs / DAY)
        return { value: String(n), unit: n === 1 ? 'day' : 'days' }
    }
    if (abs >= HOUR) {
        const n = Math.floor(abs / HOUR)
        return { value: String(n), unit: n === 1 ? 'hr' : 'hrs' }
    }
    if (abs >= MIN) return { value: String(Math.floor(abs / MIN)), unit: 'min' }
    return { value: '<1', unit: 'min' }
}
