import { useEffect, useState } from 'react'
import type { Category } from '@shared/types'
import { REMINDER_OPTIONS } from '../lib/reminders'
import { addDays, toDateValue, type TimeFormat } from '../lib/dates'
import { CategorySelect } from './CategorySelect'
import { DateField } from './DateField'
import { Kbd } from './Kbd'
import { SubmitButton } from './SubmitButton'
import { ReminderSelect } from './ReminderSelect'
import { TimeField } from './TimeField'

export function AddForm({
    categories,
    timeFormat,
    onClose
}: {
    categories: Category[]
    timeFormat: TimeFormat
    onClose: () => void
}): React.JSX.Element {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [date, setDate] = useState(() => toDateValue(addDays(new Date(), 1)))
    const [time, setTime] = useState<string | null>(null) // null = date only
    const [leads, setLeads] = useState<number[]>([])
    const [categoryId, setCategoryId] = useState<string | undefined>()

    const canSubmit = title.trim().length > 0

    const submit = async (e?: React.FormEvent): Promise<void> => {
        e?.preventDefault()
        if (!canSubmit) return
        // Date-only countdowns are stored as local midnight of that date.
        const due = new Date(`${date}T${time ?? '00:00'}`)
        if (Number.isNaN(due.getTime())) return
        const allowed = REMINDER_OPTIONS.filter((o) => time !== null || !o.timedOnly).map(
            (o) => o.minutes
        )
        await window.api.invoke('countdown:add', {
            title: title.trim(),
            description: description.trim() || undefined,
            categoryId,
            dueAt: due.toISOString(),
            hasTime: time !== null,
            notifyLeadMinutes: leads.filter((m) => allowed.includes(m))
        })
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
                <DateField value={date} onChange={setDate} />
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
                <SubmitButton type="submit" label="Add" keys="⌘↵" disabled={!canSubmit} />
            </div>
        </form>
    )
}
