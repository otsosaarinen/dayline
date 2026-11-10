import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Search, Settings, SquarePen } from 'lucide-react'
import { useStore } from './store/useStore'
import { groupCountdowns } from './lib/time'
import { useNow } from './lib/useNow'
import { CountdownRow } from './components/CountdownRow'
import { AddForm } from './components/AddForm'
import { CategoryMenu } from './components/CategoryMenu'
import { GithubLink } from './components/GithubLink'
import { IconButton } from './components/IconButton'
import { ClearFilter } from './components/ClearFilter'
import { Kbd } from './components/Kbd'
import { QuitButton } from './components/QuitButton'
import { SettingsPanel } from './components/SettingsPanel'

export default function App(): React.JSX.Element {
    const data = useStore((s) => s.data)
    const init = useStore((s) => s.init)
    // One screen at a time. Opening one replaces the others, so nothing lingers underneath.
    const [view, setView] = useState<'list' | 'add' | 'settings'>('list')
    const [categoriesOpen, setCategoriesOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [filterCategory, setFilterCategory] = useState<string | null>(null)
    const searchRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const unsub = init()
        return () => void unsub.then((fn) => fn())
    }, [init])

    const countdowns = useMemo(() => data?.countdowns ?? [], [data])
    const categories = useMemo(() => data?.categories ?? [], [data])
    const timeFormat = data?.settings.timeFormat ?? '24h'
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

    // Every screen change goes through here, so the categories menu never stays open
    // behind a screen and pops back up later.
    const go = useCallback((next: 'list' | 'add' | 'settings') => {
        setView(next)
        setCategoriesOpen(false)
    }, [])

    useEffect(() => {
        const onKey = (e: KeyboardEvent): void => {
            // Open dropdowns swallow Escape first (Menu). Otherwise step back one level.
            if (e.key === 'Escape') {
                if (view !== 'list') go('list')
                else if (query) setQuery('')
                else window.api.invoke('popover:hide')
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
                go('add')
            }
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
                e.preventDefault()
                go('list')
                setCategoriesOpen(true)
            }
            if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'f') {
                go('list')
                requestAnimationFrame(() => searchRef.current?.focus())
            }
            if ((e.metaKey || e.ctrlKey) && e.key === ',') {
                go('settings')
            }
            // Clear the category filter (⇧ keeps it from clashing with ⌘⌫ deleting text in search).
            if (
                (e.metaKey || e.ctrlKey) &&
                e.shiftKey &&
                e.key === 'Backspace' &&
                view === 'list'
            ) {
                setFilterCategory(null)
            }
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'q') {
                window.api.invoke('app:quit')
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [view, query, go])

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-bg">
            <header className="drag flex items-center gap-2 pt-4 pr-2 pb-2.5 pl-3">
                {view === 'list' ? (
                    <label className="no-drag group/search flex flex-1 items-center gap-2.5 text-fg/60">
                        <Search size={17} className="shrink-0" />
                        <input
                            ref={searchRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search"
                            className="field-sizing-content max-w-full min-w-0 bg-transparent text-[16px] text-fg outline-none placeholder:text-fg/60"
                        />
                        {/* Shortcut hint: gone while the field is focused or has text. */}
                        {!query && (
                            <span className="group-focus-within/search:hidden">
                                <Kbd>⌘F</Kbd>
                            </span>
                        )}
                    </label>
                ) : (
                    <h1 className="flex-1 text-[16px] font-semibold tracking-tight">
                        {view === 'add' ? 'New countdown' : 'Settings'}
                    </h1>
                )}
                <div className="no-drag flex items-center">
                    {view !== 'settings' && (
                        <IconButton
                            label="New countdown"
                            shortcut={['⌘', 'N']}
                            active={view === 'add'}
                            tooltipDisabled={view === 'add'}
                            onClick={() => go('add')}
                        >
                            <SquarePen size={17} />
                        </IconButton>
                    )}
                    {view === 'list' && (
                        <CategoryMenu
                            categories={categories}
                            activeFilter={activeFilter}
                            onFilter={setFilterCategory}
                            open={categoriesOpen}
                            onOpenChange={setCategoriesOpen}
                        />
                    )}
                    {view !== 'add' && (
                        <IconButton
                            label="Settings"
                            shortcut={['⌘', ',']}
                            active={view === 'settings'}
                            tooltipDisabled={view === 'settings'}
                            onClick={() => go('settings')}
                        >
                            <Settings size={17} />
                        </IconButton>
                    )}
                </div>
            </header>

            {view === 'settings' ? (
                data && <SettingsPanel settings={data.settings} onBack={() => go('list')} />
            ) : view === 'add' ? (
                <AddForm
                    categories={categories}
                    timeFormat={timeFormat}
                    onClose={() => go('list')}
                />
            ) : (
                <main className="flex-1 overflow-y-auto px-1.5 pb-3">
                    {flat.length === 0 ? (
                        <div className="grid h-full place-items-center text-center text-muted">
                            <div>
                                <div className="text-[15px] text-fg">
                                    {query || activeFilter ? 'No matches' : 'Nothing counting down'}
                                </div>
                                <div className="mt-1 text-[13px]">
                                    {query || activeFilter ? (
                                        'Try a different search or filter.'
                                    ) : (
                                        <span className="inline-flex items-center gap-1">
                                            Press <Kbd>⌘N</Kbd> to add your first one
                                        </span>
                                    )}
                                </div>
                                {activeFilter && (
                                    <ClearFilter onClick={() => setFilterCategory(null)} />
                                )}
                            </div>
                        </div>
                    ) : (
                        flat.map((item) => (
                            <CountdownRow
                                key={item.id}
                                item={item}
                                now={now}
                                timeFormat={timeFormat}
                                category={
                                    item.categoryId ? categoryById.get(item.categoryId) : undefined
                                }
                            />
                        ))
                    )}
                    {activeFilter && flat.length > 0 && (
                        <ClearFilter onClick={() => setFilterCategory(null)} />
                    )}
                </main>
            )}

            <footer className="flex items-center justify-between px-3 pb-2.5">
                <QuitButton />
                <GithubLink />
            </footer>
        </div>
    )
}
