import { useState } from 'react'

/** yyyy-MM-ddTHH:mm in local time, for <input type="datetime-local">. */
function localInputValue(d: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const LEADS = [
  { label: '10m', minutes: 10 },
  { label: '1h', minutes: 60 },
  { label: '1d', minutes: 1440 }
]

export function AddForm({ onClose }: { onClose: () => void }): React.JSX.Element {
  const [title, setTitle] = useState('')
  const [due, setDue] = useState(() => {
    const d = new Date(Date.now() + 24 * 3_600_000)
    d.setMinutes(0, 0, 0)
    return localInputValue(d)
  })
  const [leads, setLeads] = useState<number[]>([])

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!title.trim() || !due) return
    await window.api.invoke('countdown:add', {
      title: title.trim(),
      dueAt: new Date(due).toISOString(),
      tags: [],
      notifyLeadMinutes: leads
    })
    onClose()
  }

  return (
    <form onSubmit={submit} className="m-2 space-y-2 rounded-lg border border-line bg-surface p-3">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What's due?"
        className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-faint"
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      />
      <input
        type="datetime-local"
        value={due}
        onChange={(e) => setDue(e.target.value)}
        className="w-full rounded-md border border-line bg-transparent px-2 py-1 text-xs text-fg outline-none focus:border-accent"
      />
      <div className="flex items-center gap-1.5 text-[11px] text-muted">
        <span>Remind before</span>
        {LEADS.map((l) => {
          const on = leads.includes(l.minutes)
          return (
            <button
              type="button"
              key={l.minutes}
              onClick={() => setLeads(on ? leads.filter((m) => m !== l.minutes) : [...leads, l.minutes])}
              className={`rounded-full border px-2 py-0.5 ${
                on ? 'border-accent text-accent' : 'border-line hover:bg-hover'
              }`}
            >
              {l.label}
            </button>
          )
        })}
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onClose} className="rounded-md px-2.5 py-1 text-xs text-muted hover:bg-hover">
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-fg disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </form>
  )
}
