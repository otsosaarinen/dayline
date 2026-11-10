/** Reminder offsets in minutes. Short ones only make sense when a time of day is set. */
export const REMINDER_OPTIONS = [
    { label: '10 minutes before', minutes: 10, timedOnly: true },
    { label: '1 hour before', minutes: 60, timedOnly: true },
    { label: '1 day before', minutes: 1440, timedOnly: false },
    { label: '3 days before', minutes: 4320, timedOnly: false },
    { label: '1 week before', minutes: 10080, timedOnly: false }
]

export function reminderSummary(selected: number[]): string {
    if (selected.length === 0) return 'No reminders'
    if (selected.length === 1)
        return REMINDER_OPTIONS.find((o) => o.minutes === selected[0])?.label ?? '1 reminder'
    return `${selected.length} reminders`
}
