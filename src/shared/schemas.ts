import { z } from 'zod'

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(40),
  color: z.string()
})

export const CountdownSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  notes: z.string().max(2000).optional(),
  dueAt: z.string().datetime({ offset: true }),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  notifyLeadMinutes: z.array(z.number().int().positive()).default([]),
  notified: z
    .object({ lead: z.array(z.number()).default([]), due: z.boolean().default(false) })
    .default({ lead: [], due: false }),
  completedAt: z.string().optional(),
  createdAt: z.string()
})

export const CountdownInputSchema = CountdownSchema.omit({
  id: true,
  createdAt: true,
  notified: true,
  completedAt: true
})

export const SettingsSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']).default('system'),
  shortcut: z.string().default('Alt+Shift+C'),
  launchAtLogin: z.boolean().default(false),
  showCountInTray: z.boolean().default(true)
})

export const StoreSchema = z.object({
  schemaVersion: z.literal(1).default(1),
  countdowns: z.array(CountdownSchema).default([]),
  categories: z.array(CategorySchema).default([]),
  settings: SettingsSchema.default(SettingsSchema.parse({}))
})
