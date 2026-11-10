import { nativeTheme } from 'electron'
import type { Settings } from '@shared/types'

/**
 * Drives both the window vibrancy and the renderer's `prefers-color-scheme`,
 * so one call themes the whole popover.
 */
export function applyTheme(theme: Settings['theme']): void {
    nativeTheme.themeSource = theme
}
