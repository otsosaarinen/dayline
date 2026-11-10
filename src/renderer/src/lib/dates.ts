const pad = (n: number): string => String(n).padStart(2, '0')

/** yyyy-MM-dd in local time. */
export function toDateValue(d: Date): string {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** HH:mm in local time. */
export function toTimeValue(d: Date): string {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Local midnight of a yyyy-MM-dd value. */
export function fromDateValue(value: string): Date {
    return new Date(`${value}T00:00`)
}

export function addDays(d: Date, n: number): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

/** Same day next month(s); clamps to the end of shorter months (Jan 31 + 1 month = Feb 28). */
export function addMonths(d: Date, n: number): Date {
    const target = new Date(d.getFullYear(), d.getMonth() + n, 1)
    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
    return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), lastDay))
}

/** "Today", "Tomorrow", "Nov 11", or "Nov 11, 2027" when it's not this year. */
export function describeDate(value: string, today: Date = new Date()): string {
    const date = fromDateValue(value)
    const diff = Math.round(
        (date.getTime() -
            new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
            86_400_000
    )
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Tomorrow'
    if (diff === -1) return 'Yesterday'
    return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric'
    })
}

export type TimeFormat = '24h' | '12h'

/**
 * A time of day as text: "15:00" (24h) or "3:00 PM" (12h). Written out by hand on purpose:
 * toLocaleTimeString follows the system locale (Finnish gives "15.00"), which would ignore
 * the user's setting.
 */
export function formatClock(hours: number, minutes: number, format: TimeFormat): string {
    const mm = pad(minutes)
    if (format === '24h') return `${pad(hours)}:${mm}`
    return `${hours % 12 === 0 ? 12 : hours % 12}:${mm} ${hours < 12 ? 'AM' : 'PM'}`
}

/** "15:00" (the stored form) -> display text. */
export function formatTimeValue(value: string, format: TimeFormat): string {
    const [h, m] = value.split(':').map(Number)
    return formatClock(h, m, format)
}

export function formatTimeOfDay(d: Date, format: TimeFormat): string {
    return formatClock(d.getHours(), d.getMinutes(), format)
}

/**
 * Typed time -> "HH:mm", or null if it isn't a time. Accepts "15:30", "1530", "930", "15",
 * "3pm", "3:30 pm", "3.30pm". With am/pm the hour must be 1-12; without, 0-23.
 */
export function parseTimeInput(text: string): string | null {
    const m = text
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '')
        .match(/^(\d{1,2})(?:[:.]?(\d{2}))?(am|pm|a|p)?$/)
    if (!m) return null
    let hours = Number(m[1])
    const minutes = m[2] === undefined ? 0 : Number(m[2])
    const suffix = m[3]?.[0]
    if (minutes > 59) return null
    if (suffix) {
        if (hours < 1 || hours > 12) return null
        hours = (hours % 12) + (suffix === 'p' ? 12 : 0)
    } else if (hours > 23) return null
    return `${pad(hours)}:${pad(minutes)}`
}
