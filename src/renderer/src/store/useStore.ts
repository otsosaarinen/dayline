import { create } from 'zustand'
import type { StoreData } from '@shared/types'

interface State {
    data: StoreData | null
    init: () => Promise<() => void>
}

export const useStore = create<State>((set) => ({
    data: null,
    init: async () => {
        set({ data: await window.api.invoke('state:get') })
        // Main is the source of truth; it pushes the full state after every mutation.
        return window.api.on('state:changed', (data) => set({ data }))
    }
}))
