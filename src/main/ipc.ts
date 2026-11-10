import { BrowserWindow, ipcMain } from 'electron'
import { CountdownInputSchema, SettingsSchema, CategorySchema } from '@shared/schemas'
import type { IpcEvents, IpcInvoke } from '@shared/ipc-contract'
import * as store from './store'

type Handlers = {
    [C in keyof IpcInvoke]: (...args: IpcInvoke[C]['args']) => IpcInvoke[C]['result']
}

export function broadcast<C extends keyof IpcEvents>(channel: C, payload: IpcEvents[C]): void {
    for (const win of BrowserWindow.getAllWindows()) {
        if (!win.isDestroyed()) win.webContents.send(channel, payload)
    }
}

/** Registers all handlers. `onChange` runs after every mutation (re-arm scheduler, update tray, etc). */
export function registerIpc(opts: { hidePopover: () => void; onChange: () => void }): void {
    const changed = <T>(value: T): T => {
        broadcast('state:changed', store.getState())
        opts.onChange()
        return value
    }

    const handlers: Handlers = {
        'state:get': () => store.getState(),
        'countdown:add': (input) => changed(store.addCountdown(CountdownInputSchema.parse(input))),
        'countdown:update': (id, patch) =>
            changed(store.updateCountdown(id, CountdownInputSchema.partial().parse(patch))),
        'countdown:complete': (id, done) => changed(store.setCompleted(id, done)),
        'countdown:delete': (id) => changed(store.deleteCountdown(id)),
        'category:add': (input) =>
            changed(store.addCategory(CategorySchema.omit({ id: true }).parse(input))),
        'category:delete': (id) => changed(store.deleteCategory(id)),
        'settings:update': (patch) =>
            changed(store.updateSettings(SettingsSchema.partial().parse(patch))),
        'popover:hide': () => opts.hidePopover()
    }

    for (const channel of Object.keys(handlers) as (keyof IpcInvoke)[]) {
        ipcMain.handle(channel, (_e, ...args) =>
            (handlers[channel] as (...a: unknown[]) => unknown)(...args)
        )
    }
}
