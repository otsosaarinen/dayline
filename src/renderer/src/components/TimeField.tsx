import { useState } from 'react'
import { Clock } from 'lucide-react'
import { formatTimeValue, parseTimeInput, type TimeFormat } from '../lib/dates'
import { FieldRow } from './FieldRow'
import { Menu, MenuItem } from './Menu'

const PRESETS = ['09:00', '12:00', '15:00', '18:00']

/** Optional time of day. `null` = date only. Shown in the user's 12/24-hour format. */
export function TimeField({
    value,
    format,
    onChange
}: {
    value: string | null
    format: TimeFormat
    onChange: (value: string | null) => void
}): React.JSX.Element {
    return (
        <Menu
            anchorToParent
            panelClassName="w-52"
            trigger={({ toggle }) => (
                <FieldRow
                    icon={<Clock size={16} />}
                    label="Time"
                    value={value ? formatTimeValue(value, format) : 'None'}
                    active={value !== null}
                    onClick={toggle}
                />
            )}
        >
            {(close) => (
                <>
                    <MenuItem
                        selected={value === null}
                        onClick={() => {
                            onChange(null)
                            close()
                        }}
                    >
                        <span className="text-muted">No time</span>
                    </MenuItem>
                    {PRESETS.map((t) => (
                        <MenuItem
                            key={t}
                            selected={value === t}
                            onClick={() => {
                                onChange(t)
                                close()
                            }}
                        >
                            {formatTimeValue(t, format)}
                        </MenuItem>
                    ))}
                    <div className="my-1 h-px bg-line" />
                    {/* key: remount (reset the typed text) whenever the value or format changes */}
                    <CustomTime
                        key={`${value}-${format}`}
                        value={value}
                        format={format}
                        onChange={onChange}
                        onDone={close}
                    />
                </>
            )}
        </Menu>
    )
}

/**
 * Type any time ("3pm", "15:30", "930"). Our own field instead of <input type="time">, because
 * the native one shows 12 or 24 hours by system locale and would ignore the user's setting.
 */
function CustomTime({
    value,
    format,
    onChange,
    onDone
}: {
    value: string | null
    format: TimeFormat
    onChange: (value: string | null) => void
    onDone: () => void
}): React.JSX.Element {
    const [text, setText] = useState(value ? formatTimeValue(value, format) : '')
    const [invalid, setInvalid] = useState(false)

    const commit = (): boolean => {
        if (text.trim() === '') return true
        const parsed = parseTimeInput(text)
        setInvalid(parsed === null)
        if (parsed !== null) onChange(parsed)
        return parsed !== null
    }

    return (
        <label className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-muted">
            Custom
            <input
                value={text}
                onChange={(e) => {
                    setText(e.target.value)
                    setInvalid(false)
                }}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key !== 'Enter') return
                    // Enter here must not submit the surrounding add form.
                    e.preventDefault()
                    e.stopPropagation()
                    if (commit()) onDone()
                }}
                placeholder={format === '24h' ? 'HH:mm' : 'h:mm AM'}
                aria-invalid={invalid}
                className={`w-24 rounded-md border bg-transparent px-1.5 py-0.5 text-right text-[13px] text-fg outline-none placeholder:text-faint ${
                    invalid ? 'border-danger' : 'border-line focus:border-fg/40'
                }`}
            />
        </label>
    )
}
