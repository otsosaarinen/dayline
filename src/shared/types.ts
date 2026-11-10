import type { z } from 'zod'
import type {
    CategorySchema,
    CountdownInputSchema,
    CountdownSchema,
    SettingsSchema,
    StoreSchema
} from './schemas'

export type Category = z.infer<typeof CategorySchema>
export type Countdown = z.infer<typeof CountdownSchema>
export type CountdownInput = z.infer<typeof CountdownInputSchema>
export type Settings = z.infer<typeof SettingsSchema>
export type StoreData = z.infer<typeof StoreSchema>
