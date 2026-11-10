import type { Category, Countdown, CountdownInput, Settings, StoreData } from './types'

/** Renderer -> main request/response channels (ipcRenderer.invoke). */
export interface IpcInvoke {
  'state:get': { args: []; result: StoreData }
  'countdown:add': { args: [CountdownInput]; result: Countdown }
  'countdown:update': { args: [string, Partial<CountdownInput>]; result: Countdown | null }
  'countdown:complete': { args: [string, boolean]; result: Countdown | null }
  'countdown:delete': { args: [string]; result: boolean }
  'category:add': { args: [Omit<Category, 'id'>]; result: Category }
  'category:delete': { args: [string]; result: boolean }
  'settings:update': { args: [Partial<Settings>]; result: Settings }
  'popover:hide': { args: []; result: void }
}

/** Main -> renderer push events. */
export interface IpcEvents {
  'state:changed': StoreData
}

export type InvokeChannel = keyof IpcInvoke
export type EventChannel = keyof IpcEvents

export interface Api {
  invoke<C extends InvokeChannel>(channel: C, ...args: IpcInvoke[C]['args']): Promise<IpcInvoke[C]['result']>
  on<C extends EventChannel>(channel: C, cb: (payload: IpcEvents[C]) => void): () => void
}
