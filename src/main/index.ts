import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { TrayController } from './tray'
import { registerIpc } from './ipc'

let tray: TrayController | null = null

if (!app.requestSingleInstanceLock()) {
    app.quit()
} else {
    app.whenReady().then(() => {
        electronApp.setAppUserModelId('com.countdown.app')
        // Menu-bar-only app: no Dock icon.
        app.dock?.hide()

        app.on('browser-window-created', (_, window) => {
            optimizer.watchWindowShortcuts(window)
        })

        tray = new TrayController()
        registerIpc({
            hidePopover: () => tray?.hide(),
            onChange: () => {
                // Scheduler / tray title hooks land here (build step 6).
            }
        })
    })

    // Keep running with no visible windows; the tray is the app.
    app.on('window-all-closed', () => {})
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) tray?.show()
    })
}
