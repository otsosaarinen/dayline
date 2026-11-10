import { useState } from 'react'
import type { Category } from '@shared/types'
import { REMINDER_OPTIONS } from '../lib/reminders'
import { addDays, toDateValue } from '../lib/dates'
import { CategorySelect } from './CategorySelect'
import { DateField } from './DateField'
import { IconPicker } from './IconPicker'
import { ReminderSelect } from './ReminderSelect'
import { Tooltip } from './Tooltip'
import { TimeField } from './TimeField'

export function AddForm({
    categories,
    onClose
}: {
    categories: Category[]
    onClose: () => void
}): React.JSX.Element {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [date, setDate] = useState(() => toDateValue(addDays(new Date(), 1)))
    const [time, setTime] = useState<string | null>(null) // null = date only
    const [leads, setLeads] = useState<number[]>([])
    const [categoryId, setCategoryId] = useState<string | undefined>()
    const [icon, setIcon] = useState<string | undefined>()

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
            icon,
            categoryId,
            dueAt: due.toISOString(),
            hasTime: time !== null,
            notifyLeadMinutes: leads.filter((m) => allowed.includes(m))
        })
        onClose()
    }

    return (
        <form
            onSubmit={submit}
            onKeyDown={(e) => {
                if (e.key === 'Escape') onClose()
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void submit()
            }}
            className="relative border-b border-line px-3 pb-3"
        >
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

            <div className="-mx-1.5 mt-3 border-t border-line pt-1.5">
                <DateField value={date} onChange={setDate} />
                <TimeField value={time} onChange={setTime} />
                <CategorySelect
                    categories={categories}
                    value={categoryId}
                    onChange={setCategoryId}
                />
                <IconPicker value={icon} onChange={setIcon} />
                <ReminderSelect value={leads} onChange={setLeads} withTime={time !== null} />
            </div>

            <div className="mt-3 flex justify-end">
                <Tooltip label="Add" keys={['⌘', '↵']} side="top" align="end">
                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="rounded-lg bg-accent px-3.5 py-1 text-[13px] font-medium text-accent-fg disabled:opacity-30"
                    >
                        Add
                    </button>
                </Tooltip>
            </div>
        </form>
    )
}
