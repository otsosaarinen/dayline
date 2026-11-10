import { z } from 'zod'
import { CATEGORY_COLORS } from './constants'

export const CategorySchema = z.object({
    id: z.string(),
    name: z.string().min(1).max(40),
    color: z.enum(CATEGORY_COLORS)
})

/** Updating a category: only the provided fields (name and/or color). */
export const CategoryPatchSchema = CategorySchema.omit({ id: true }).partial()

/** Creating a countdown: omitted optional bits get sensible defaults. */
export const CountdownInputSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    /** Name of an icon in lib/entryIcons.ts (lucide). Unknown names render nothing. */
    icon: z.string().max(40).optional(),
    /**
     * ISO instant. When `hasTime` is false this is local midnight of the due *date*;
     * only the calendar date is meaningful (see lib/time.ts).
     */
    dueAt: z.string().datetime({ offset: true }),
    hasTime: z.boolean().default(true),
    categoryId: z.string().optional(),
    notifyLeadMinutes: z.array(z.number().int().positive()).default([])
})

/** A stored countdown. Defaults make older/hand-edited files load safely. */
export const CountdownSchema = CountdownInputSchema.extend({
    id: z.string(),
    completedAt: z.string().optional(),
    createdAt: z.string()
})

const ThemeSchema = z.enum(['system', 'light', 'dark'])
const TimeFormatSchema = z.enum(['24h', '12h'])

/** Stored settings: defaults fill anything missing. */
export const SettingsSchema = z.object({
    theme: ThemeSchema.default('system'),
    timeFormat: TimeFormatSchema.default('24h')
})

/** Changing settings: only the provided keys. Built without defaults (`.partial()` would re-apply them). */
export const SettingsPatchSchema = z
    .object({ theme: ThemeSchema, timeFormat: TimeFormatSchema })
    .partial()

export const StoreSchema = z.object({
    schemaVersion: z.literal(1).default(1),
    countdowns: z.array(CountdownSchema).default([]),
    categories: z.array(CategorySchema).default([]),
    settings: SettingsSchema.default(SettingsSchema.parse({}))
})
