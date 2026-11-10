/** 42 days (6 weeks) covering the month, starting on `weekStartsOn` (0 = Sunday, 1 = Monday). */
export function monthGrid(year: number, month: number, weekStartsOn: 0 | 1 = 1): Date[] {
    const first = new Date(year, month, 1)
    const offset = (first.getDay() - weekStartsOn + 7) % 7
    return Array.from({ length: 42 }, (_, i) => new Date(year, month, 1 - offset + i))
}

export function isSameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}
