import { BrowserWindow, ipcMain, shell } from 'electron'
import {
    CategoryPatchSchema,
    CountdownInputSchema,
    SettingsPatchSchema,
    CategorySchema
} from '@shared/schemas'
import { REPO_URL } from '@shared/constants'
import type { IpcEvents, IpcInvoke } from '@shared/ipc-contract'
import * as store from './store'

type Handlers = {
    [C in keyof IpcInvoke]: (...args: IpcInvoke[C]['args']) => IpcInvoke[C]['result']
}

function broadcast<C extends keyof IpcEvents>(channel: C, payload: IpcEvents[C]): void {
    for (const win of BrowserWindow.getAllWindows()) {
        if (!win.isDestroyed()) win.webContents.send(channel, payload)
    }
}

/** Registers all handlers. `onChange` runs after every mutation. */
export function registerIpc(opts: { hidePopover: () => void; onChange: () => void }): void {
    const changed = <T>(value: T): T => {
        broadcast('state:changed', store.getState())
        opts.onChange()
        return value
    }

    const handlers: Handlers = {
        'state:get': () => store.getState(),
        'countdown:add': (input) => changed(store.addCountdown(CountdownInputSchema.parse(input))),
        'countdown:complete': (id, done) => changed(store.setCompleted(id, done)),
        'countdown:delete': (id) => changed(store.deleteCountdown(id)),
        'category:add': (input) =>
            changed(store.addCategory(CategorySchema.omit({ id: true }).parse(input))),
        'category:update': (id, patch) =>
            changed(store.updateCategory(id, CategoryPatchSchema.parse(patch))),
        'category:delete': (id) => changed(store.deleteCategory(id)),
        'settings:update': (patch) =>
            changed(store.updateSettings(SettingsPatchSchema.parse(patch))),
        'popover:hide': () => opts.hidePopover(),
        // Only ever opens the fixed repository URL, never a URL supplied by the renderer.
        'app:openRepo': () => {
            if (REPO_URL.startsWith('https://')) void shell.openExternal(REPO_URL)
        }
    }

    for (const channel of Object.keys(handlers) as (keyof IpcInvoke)[]) {
        ipcMain.handle(channel, (_e, ...args) =>
            (handlers[channel] as (...a: unknown[]) => unknown)(...args)
        )
    }
}
