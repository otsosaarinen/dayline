import { useEffect, useMemo, useState } from 'react'
import { useStore } from './store/useStore'
import { groupCountdowns, needsFastTick } from './lib/time'
import { useNow } from './lib/useNow'
import { CountdownRow } from './components/CountdownRow'
import { AddForm } from './components/AddForm'

export default function App(): React.JSX.Element {
  const data = useStore((s) => s.data)
  const init = useStore((s) => s.init)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    const unsub = init()
    return () => void unsub.then((fn) => fn())
  }, [init])

  const countdowns = useMemo(() => data?.countdowns ?? [], [data])
  const fast = useMemo(() => needsFastTick(countdowns, Date.now()), [countdowns])
  const now = useNow(fast)
  const groups = useMemo(() => groupCountdowns(countdowns, now), [countdowns, now])

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && !adding) window.api.invoke('popover:hide')
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') setAdding(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [adding])

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-bg">
      <header className="drag flex items-center justify-between px-4 pt-3 pb-2">
        <h1 className="text-[13px] font-semibold tracking-tight">Countdowns</h1>
        <button
          onClick={() => setAdding(true)}
          className="no-drag rounded-md border border-line px-2 py-0.5 text-xs text-muted hover:bg-hover hover:text-fg"
        >
          New <span className="ml-1 text-faint">⌘N</span>
        </button>
      </header>

      {adding && <AddForm onClose={() => setAdding(false)} />}

      <main className="flex-1 overflow-y-auto px-2 pb-3">
        {groups.length === 0 && !adding ? (
          <div className="grid h-full place-items-center text-center text-muted">
            <div>
              <div className="text-sm text-fg">Nothing counting down</div>
              <div className="mt-1 text-xs">Press ⌘N to add your first one.</div>
            </div>
          </div>
        ) : (
          groups.map(({ group, items }) => (
            <section key={group} className="mt-2">
              <h2 className="px-2 pb-1 text-[11px] font-medium tracking-wide text-faint uppercase">
                {group} <span className="ml-1">{items.length}</span>
              </h2>
              {items.map((item) => (
                <CountdownRow key={item.id} item={item} now={now} />
              ))}
            </section>
          ))
        )}
      </main>
    </div>
  )
}
