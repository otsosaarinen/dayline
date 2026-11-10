import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Settings, SquarePen } from 'lucide-react'
import { useStore } from './store/useStore'
import { groupCountdowns } from './lib/time'
import { useNow } from './lib/useNow'
import { CountdownRow } from './components/CountdownRow'
import { AddForm } from './components/AddForm'
import { CategoryMenu } from './components/CategoryMenu'
import { IconButton } from './components/IconButton'
import { Kbd } from './components/Kbd'
import { SettingsPanel } from './components/SettingsPanel'

export default function App(): React.JSX.Element {
    const data = useStore((s) => s.data)
    const init = useStore((s) => s.init)
    const [adding, setAdding] = useState(false)
    const [view, setView] = useState<'list' | 'settings'>('list')
    const [query, setQuery] = useState('')
    const [filterCategory, setFilterCategory] = useState<string | null>(null)
    const searchRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const unsub = init()
        return () => void unsub.then((fn) => fn())
    }, [init])

    const countdowns = useMemo(() => data?.countdowns ?? [], [data])
    const categories = useMemo(() => data?.categories ?? [], [data])
    const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])
    const activeFilter = filterCategory && categoryById.has(filterCategory) ? filterCategory : null

    const now = useNow(countdowns)
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        return countdowns.filter(
            (c) =>
                (!activeFilter || c.categoryId === activeFilter) &&
                (!q || c.title.toLowerCase().includes(q))
        )
    }, [countdowns, query, activeFilter])
    // Flat list (no group headings, like the design); grouping still decides the order:
    // overdue, today, this week, later, done.
    const flat = useMemo(
        () => groupCountdowns(filtered, now).flatMap((g) => g.items),
        [filtered, now]
    )

    useEffect(() => {
        const onKey = (e: KeyboardEvent): void => {
            if (e.key === 'Escape' && !adding) {
                if (view === 'settings') setView('list')
                else if (query) setQuery('')
                else window.api.invoke('popover:hide')
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
                setView('list')
                setAdding(true)
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
                setView('list')
                searchRef.current?.focus()
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [adding, view, query])

    const inSettings = view === 'settings'

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-bg">
            <header className="drag flex items-center gap-2 pt-4 pr-2 pb-2.5 pl-3">
                {inSettings ? (
                    <h1 className="flex-1 text-[16px] font-semibold tracking-tight">Settings</h1>
                ) : (
                    <label className="no-drag flex flex-1 items-center gap-2.5 text-fg/60">
                        <Search size={17} />
                        <input
                            ref={searchRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search"
                            className="w-full bg-transparent text-[16px] text-fg outline-none placeholder:text-fg/60"
                        />
                    </label>
                )}
                <div className="no-drag flex items-center">
                    {!inSettings && (
                        <>
                            <IconButton
                                label="New countdown"
                                shortcut={['⌘', 'N']}
                                active={adding}
                                onClick={() => {
                                    setView('list')
                                    setAdding(!adding)
                                }}
                            >
                                <SquarePen size={17} />
                            </IconButton>
                            <CategoryMenu
                                categories={categories}
                                activeFilter={activeFilter}
                                onFilter={setFilterCategory}
                            />
                        </>
                    )}
                    <IconButton
                        label={inSettings ? 'Close settings' : 'Settings'}
                        active={inSettings}
                        onClick={() => setView(inSettings ? 'list' : 'settings')}
                    >
                        <Settings size={17} />
                    </IconButton>
                </div>
            </header>

            {inSettings && data ? (
                <SettingsPanel settings={data.settings} onBack={() => setView('list')} />
            ) : (
                <>
                    {adding && <AddForm categories={categories} onClose={() => setAdding(false)} />}

                    <main className="flex-1 overflow-y-auto px-1.5 pb-3">
                        {flat.length === 0 && !adding ? (
                            <div className="grid h-full place-items-center text-center text-muted">
                                <div>
                                    <div className="text-[15px] text-fg">
                                        {query || activeFilter
                                            ? 'No matches'
                                            : 'Nothing counting down'}
                                    </div>
                                    <div className="mt-1 text-[13px]">
                                        {query || activeFilter ? (
                                            'Try a different search or filter.'
                                        ) : (
                                            <span className="inline-flex items-center gap-1">
                                                Press <Kbd>⌘</Kbd>
                                                <Kbd>N</Kbd> to add your first one
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            flat.map((item) => (
                                <CountdownRow
                                    key={item.id}
                                    item={item}
                                    now={now}
                                    category={
                                        item.categoryId
                                            ? categoryById.get(item.categoryId)
                                            : undefined
                                    }
                                />
                            ))
                        )}
                    </main>
                </>
            )}
        </div>
    )
}
