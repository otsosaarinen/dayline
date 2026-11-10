import type { z } from 'zod'
import type {
    CategorySchema,
    CountdownInputSchema,
    CountdownPatchSchema,
    CountdownSchema,
    SettingsSchema,
    StoreSchema
} from './schemas'

export type Category = z.infer<typeof CategorySchema>
export type Countdown = z.infer<typeof CountdownSchema>
export type CountdownInput = z.infer<typeof CountdownInputSchema>
export type CountdownPatch = z.infer<typeof CountdownPatchSchema>
export type Settings = z.infer<typeof SettingsSchema>
export type StoreData = z.infer<typeof StoreSchema>
