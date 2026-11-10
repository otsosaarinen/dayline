import { useEffect, useState } from 'react'
import { CalendarDays, CalendarPlus } from 'lucide-react'
import type { Category, Countdown } from '@shared/types'
import { REMINDER_OPTIONS } from '../lib/reminders'
import { addDays, fromDateValue, toDateValue, toTimeValue, type TimeFormat } from '../lib/dates'
import { CategorySelect } from './CategorySelect'
import { DateField } from './DateField'
import { Kbd } from './Kbd'
import { SubmitButton } from './SubmitButton'
import { ReminderSelect } from './ReminderSelect'
import { TimeField } from './TimeField'

/** Creates a countdown, or edits `countdown` when given (prefilled, saved in place). */
export function CountdownForm({
    countdown,
    categories,
    timeFormat,
    onClose
}: {
    countdown?: Countdown
    categories: Category[]
    timeFormat: TimeFormat
    onClose: () => void
}): React.JSX.Element {
    const due = countdown && new Date(countdown.dueAt)
    const [title, setTitle] = useState(countdown?.title ?? '')
    const [description, setDescription] = useState(countdown?.description ?? '')
    // Start defaults to today (the day it's created). The two dates never end up reversed:
    // moving one past the other drags the other along.
    const [start, setStart] = useState(() =>
        toDateValue(countdown ? new Date(countdown.startAt) : new Date())
    )
    const [date, setDate] = useState(() => toDateValue(due ?? addDays(new Date(), 1)))
    // null = date only
    const [time, setTime] = useState<string | null>(
        due && countdown.hasTime ? toTimeValue(due) : null
    )
    const [leads, setLeads] = useState<number[]>(countdown?.notifyLeadMinutes ?? [])
    const [categoryId, setCategoryId] = useState<string | undefined>(countdown?.categoryId)

    const canSubmit = title.trim().length > 0

    const submit = async (e?: React.FormEvent): Promise<void> => {
        e?.preventDefault()
        if (!canSubmit) return
        // Date-only countdowns are stored as local midnight of that date.
        const dueAt = new Date(`${date}T${time ?? '00:00'}`)
        if (Number.isNaN(dueAt.getTime())) return
        const allowed = REMINDER_OPTIONS.filter((o) => time !== null || !o.timedOnly).map(
            (o) => o.minutes
        )
        const fields = {
            title: title.trim(),
            description: description.trim() || undefined,
            categoryId,
            startAt: fromDateValue(start).toISOString(),
            dueAt: dueAt.toISOString(),
            hasTime: time !== null,
            notifyLeadMinutes: leads.filter((m) => allowed.includes(m))
        }
        if (countdown) await window.api.invoke('countdown:update', countdown.id, fields)
        else await window.api.invoke('countdown:add', fields)
        onClose()
    }

    // On the window, not the form: after picking from a dropdown, focus is on the page
    // background and a form-level handler would never see the keypress.
    useEffect(() => {
        const onKey = (e: KeyboardEvent): void => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                void submit()
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    })

    return (
        <form onSubmit={submit} className="relative flex-1 px-5 pt-2 pb-4">
            <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's it for?"
                className="w-full bg-transparent text-[16px] text-fg outline-none placeholder:text-faint"
            />
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description"
                rows={1}
                className="mt-1 max-h-24 min-h-[22px] w-full resize-none bg-transparent text-[14px] text-muted outline-none [field-sizing:content] placeholder:text-faint"
            />

            <div className="-mx-1.5 mt-4 border-t border-line pt-1.5">
                <DateField
                    label="Start"
                    icon={<CalendarPlus size={16} />}
                    value={start}
                    onChange={(v) => {
                        setStart(v)
                        if (v > date) setDate(v)
                    }}
                />
                <DateField
                    label="Due"
                    icon={<CalendarDays size={16} />}
                    value={date}
                    onChange={(v) => {
                        setDate(v)
                        if (v < start) setStart(v)
                    }}
                />
                <TimeField value={time} format={timeFormat} onChange={setTime} />
                <CategorySelect
                    categories={categories}
                    value={categoryId}
                    onChange={setCategoryId}
                />
                <ReminderSelect value={leads} onChange={setLeads} withTime={time !== null} />
            </div>

            <div className="mt-3 flex items-center justify-end gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-6 items-center gap-1.5 rounded-md px-2.5 text-[13px] text-muted hover:bg-hover hover:text-fg"
                >
                    Cancel
                    <Kbd>Esc</Kbd>
                </button>
                <SubmitButton
                    type="submit"
                    label={countdown ? 'Save' : 'Add'}
                    keys="⌘↵"
                    disabled={!canSubmit}
                />
            </div>
        </form>
    )
}
