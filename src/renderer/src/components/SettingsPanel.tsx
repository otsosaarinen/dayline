import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react'
import type { Settings } from '@shared/types'
import { formatClock } from '../lib/dates'
import { BackButton } from './BackButton'

const THEMES: { value: Settings['theme']; label: string; hint: string; Icon: LucideIcon }[] = [
    { value: 'system', label: 'System', hint: 'Matches your Mac', Icon: Monitor },
    { value: 'dark', label: 'Dark', hint: 'Always dark', Icon: Moon },
    { value: 'light', label: 'Light', hint: 'Always light', Icon: Sun }
]

const TIME_FORMATS: { value: Settings['timeFormat']; label: string }[] = [
    { value: '24h', label: '24h' },
    { value: '12h', label: '12h' }
]

export function SettingsPanel({
    settings,
    onBack
}: {
    settings: Settings
    onBack: () => void
}): React.JSX.Element {
    return (
        <div className="flex-1 space-y-6 overflow-y-auto px-5 pb-4">
            <BackButton onClick={onBack} />

            <section className="flex items-center justify-between">
                <div>
                    <div className="text-[15px] text-fg">Appearance</div>
                    <div className="text-[13px] text-faint">
                        {THEMES.find((t) => t.value === settings.theme)?.hint}
                    </div>
                </div>
                <div className="flex rounded-lg border border-line p-0.5">
                    {THEMES.map(({ value, label, Icon }) => (
                        <button
                            key={value}
                            aria-label={label}
                            aria-pressed={settings.theme === value}
                            title={label}
                            onClick={() => window.api.invoke('settings:update', { theme: value })}
                            className={`grid size-7 place-items-center rounded-md transition-colors ${
                                settings.theme === value
                                    ? 'bg-hover text-fg'
                                    : 'text-faint hover:text-fg'
                            }`}
                        >
                            <Icon size={16} />
                        </button>
                    ))}
                </div>
            </section>

            <section className="flex items-center justify-between">
                <div>
                    <div className="text-[15px] text-fg">Time format</div>
                    <div className="text-[13px] text-faint">
                        Shows times like {formatClock(15, 0, settings.timeFormat)}
                    </div>
                </div>
                <div className="flex rounded-lg border border-line p-0.5">
                    {TIME_FORMATS.map(({ value, label }) => (
                        <button
                            key={value}
                            aria-pressed={settings.timeFormat === value}
                            onClick={() =>
                                window.api.invoke('settings:update', { timeFormat: value })
                            }
                            className={`h-7 min-w-9 rounded-md px-2 text-xs transition-colors ${
                                settings.timeFormat === value
                                    ? 'bg-hover text-fg'
                                    : 'text-faint hover:text-fg'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </section>
        </div>
    )
}
