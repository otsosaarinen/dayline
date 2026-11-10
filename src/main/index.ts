import { app } from 'electron'
import { optimizer } from '@electron-toolkit/utils'
import { TrayController } from './tray'
import { registerIpc } from './ipc'
import { getState } from './store'
import { applyTheme } from './theme'

let tray: TrayController | null = null

if (!app.requestSingleInstanceLock()) {
    app.quit()
} else {
    app.whenReady().then(() => {
        // Menu-bar-only app: no Dock icon.
        app.dock?.hide()

        app.on('browser-window-created', (_, window) => {
            optimizer.watchWindowShortcuts(window)
        })

        // Before any window exists, so the first paint (and vibrancy) is already themed.
        applyTheme(getState().settings.theme)

        tray = new TrayController()
        registerIpc({
            hidePopover: () => tray?.hide(),
            onChange: () => {
                applyTheme(getState().settings.theme)
            }
        })
    })

    // Keep running with no visible windows; the tray is the app.
    app.on('window-all-closed', () => {})
    // Launching the already-running app again (Spotlight, Finder) shows the popover.
    app.on('activate', () => tray?.show())
}
