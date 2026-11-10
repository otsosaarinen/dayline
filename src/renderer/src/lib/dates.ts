const pad = (n: number): string => String(n).padStart(2, '0')

/** yyyy-MM-dd in local time. */
export function toDateValue(d: Date): string {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
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

/** "09:00" -> "9:00 AM" (or "09:00", depending on the system locale). */
export function formatTimeValue(value: string): string {
    const [h, m] = value.split(':').map(Number)
    return new Date(2000, 0, 1, h, m).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}
