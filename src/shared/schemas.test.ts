import { describe, expect, it } from 'vitest'
import {
    CategoryPatchSchema,
    CountdownInputSchema,
    SettingsPatchSchema,
    SettingsSchema,
    StoreSchema
} from './schemas'

describe('settings defaults', () => {
    it('defaults to following the system theme', () => {
        expect(SettingsSchema.parse({}).theme).toBe('system')
        expect(StoreSchema.parse({}).settings.theme).toBe('system')
    })

    it('defaults to a 24-hour clock', () => {
        expect(SettingsSchema.parse({}).timeFormat).toBe('24h')
        expect(StoreSchema.parse({}).settings.timeFormat).toBe('24h')
    })

    it('keeps an explicit theme choice', () => {
        expect(SettingsSchema.parse({ theme: 'light' }).theme).toBe('light')
    })
})

describe('countdown schemas', () => {
    const base = { title: 'Essay', dueAt: '2026-12-01T00:00:00.000Z' }

    it('defaults a new countdown to having a time and no reminders', () => {
        expect(CountdownInputSchema.parse(base)).toMatchObject({
            hasTime: true,
            notifyLeadMinutes: []
        })
    })
    it('accepts an optional description', () => {
        expect(
            CountdownInputSchema.parse({ ...base, description: 'Chapters 3-5' }).description
        ).toBe('Chapters 3-5')
    })
    it('patches settings without applying defaults for omitted keys', () => {
        expect(SettingsPatchSchema.parse({ theme: 'light' })).toEqual({ theme: 'light' })
        expect(SettingsPatchSchema.parse({})).toEqual({})
        expect(SettingsPatchSchema.parse({ timeFormat: '12h' })).toEqual({ timeFormat: '12h' })
        expect(() => SettingsPatchSchema.parse({ timeFormat: '13h' })).toThrow()
    })
})

describe('category patch', () => {
    it('accepts a rename or a recolor on its own', () => {
        expect(CategoryPatchSchema.parse({ name: 'Maths' })).toEqual({ name: 'Maths' })
        expect(CategoryPatchSchema.parse({ color: 'teal' })).toEqual({ color: 'teal' })
    })
    it('rejects an empty name, an unknown color, and an attempt to change the id', () => {
        expect(() => CategoryPatchSchema.parse({ name: '' })).toThrow()
        expect(() => CategoryPatchSchema.parse({ color: 'hotpink' })).toThrow()
        expect(CategoryPatchSchema.parse({ id: 'x', name: 'A' })).toEqual({ name: 'A' })
    })
})
