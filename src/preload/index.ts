import { contextBridge, ipcRenderer } from 'electron'
import type { Api } from '@shared/ipc-contract'

const api: Api = {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    on: (channel, cb) => {
        const listener = (_: unknown, payload: Parameters<typeof cb>[0]): void => cb(payload)
        ipcRenderer.on(channel, listener)
        return () => ipcRenderer.removeListener(channel, listener)
    }
}

contextBridge.exposeInMainWorld('api', api)
