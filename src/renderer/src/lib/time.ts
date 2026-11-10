import type { Countdown } from '@shared/types'

export type Urgency = 'overdue' | 'soon' | 'today' | 'later' | 'done'
export type Group = 'Overdue' | 'Today' | 'This week' | 'Later' | 'Done'

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

/** "2d 4h", "3h 12m", "8m", "now"; prefixed handled by caller for overdue. */
export function formatRemaining(ms: number): string {
  const abs = Math.abs(ms)
  if (abs < MIN) return ms < 0 ? 'just now' : '<1m'
  const d = Math.floor(abs / DAY)
  const h = Math.floor((abs % DAY) / HOUR)
  const m = Math.floor((abs % HOUR) / MIN)
  if (d > 0) return h > 0 ? `${d}d ${h}h` : `${d}d`
  if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`
  return `${m}m`
}

export function remainingLabel(c: Countdown, now: number): string {
  if (c.completedAt) return 'Done'
  const ms = new Date(c.dueAt).getTime() - now
  return ms < 0 ? `${formatRemaining(ms)} ago` : formatRemaining(ms)
}

export function urgencyOf(c: Countdown, now: number): Urgency {
  if (c.completedAt) return 'done'
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
  const due = new Date(c.dueAt).getTime()
  if (due < now) return 'Overdue'
  const eod = endOfLocalDay(now)
  if (due <= eod) return 'Today'
  if (due <= eod + 6 * DAY) return 'This week'
  return 'Later'
}

const ORDER: Group[] = ['Overdue', 'Today', 'This week', 'Later', 'Done']

export function groupCountdowns(list: Countdown[], now: number): { group: Group; items: Countdown[] }[] {
  const buckets = new Map<Group, Countdown[]>()
  for (const c of list) {
    const g = groupOf(c, now)
    buckets.set(g, [...(buckets.get(g) ?? []), c])
  }
  return ORDER.filter((g) => buckets.has(g)).map((group) => ({
    group,
    items: buckets.get(group)!.sort((a, b) =>
      group === 'Done'
        ? (b.completedAt ?? '').localeCompare(a.completedAt ?? '')
        : a.dueAt.localeCompare(b.dueAt)
    )
  }))
}

/** True when anything is due within the hour (renderer ticks every second instead of every 30s). */
export function needsFastTick(list: Countdown[], now: number): boolean {
  return list.some((c) => {
    if (c.completedAt) return false
    const ms = new Date(c.dueAt).getTime() - now
    return ms > 0 && ms < HOUR
  })
}
