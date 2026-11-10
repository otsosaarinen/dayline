import type { Countdown } from '@shared/types'
import { remainingLabel, urgencyOf, type Urgency } from '../lib/time'

const urgencyColor: Record<Urgency, string> = {
  overdue: 'text-danger',
  soon: 'text-warn',
  today: 'text-fg',
  later: 'text-muted',
  done: 'text-faint'
}

export function CountdownRow({ item, now }: { item: Countdown; now: number }): React.JSX.Element {
  const done = !!item.completedAt
  const urgency = urgencyOf(item, now)
  const due = new Date(item.dueAt)

  return (
    <div className="group flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-hover">
      <button
        aria-label={done ? 'Mark not done' : 'Mark done'}
        onClick={() => window.api.invoke('countdown:complete', item.id, !done)}
        className={`size-4 shrink-0 rounded-full border transition-colors ${
          done ? 'border-accent bg-accent' : 'border-faint hover:border-accent'
        }`}
      />
      <div className="min-w-0 flex-1">
        <div className={`truncate ${done ? 'text-faint line-through' : 'text-fg'}`}>{item.title}</div>
        <div className="truncate text-[11px] text-faint">
          {due.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      <div className={`shrink-0 text-xs font-medium tabular-nums ${urgencyColor[urgency]}`}>
        {remainingLabel(item, now)}
      </div>
      <button
        aria-label="Delete"
        onClick={() => window.api.invoke('countdown:delete', item.id)}
        className="hidden size-5 shrink-0 place-items-center rounded text-faint hover:bg-hover hover:text-danger group-hover:grid"
      >
        ×
      </button>
    </div>
  )
}
