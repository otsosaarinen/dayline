import { describe, expect, it } from 'vitest'
import type { Countdown } from '@shared/types'
import { bigNumber, groupOf, progressOf, urgencyOf } from './time'

const NOW = new Date('2026-11-10T12:00:00').getTime()
const make = (dueAt: string, extra: Partial<Countdown> = {}): Countdown => ({
    id: '1',
    title: 't',
    hasTime: true,
    dueAt: new Date(dueAt).toISOString(),
    startAt: new Date('2026-11-08T00:00:00').toISOString(),
    notifyLeadMinutes: [],
    createdAt: new Date(NOW).toISOString(),
    ...extra
})

describe('groupOf / urgencyOf', () => {
    it('buckets by due date', () => {
        expect(groupOf(make('2026-11-10T09:00:00'), NOW)).toBe('Overdue')
        expect(groupOf(make('2026-11-10T18:00:00'), NOW)).toBe('Today')
        expect(groupOf(make('2026-11-14T09:00:00'), NOW)).toBe('This week')
        expect(groupOf(make('2026-12-30T09:00:00'), NOW)).toBe('Later')
    })
    it('flags urgency', () => {
        expect(urgencyOf(make('2026-11-10T13:00:00'), NOW)).toBe('soon')
        expect(urgencyOf(make('2026-11-10T09:00:00'), NOW)).toBe('overdue')
    })
})

describe('bigNumber', () => {
    it('shows days when a day or more away', () => {
        expect(bigNumber(make('2026-11-22T12:00:00'), NOW)).toEqual({ value: '12', unit: 'days' })
        expect(bigNumber(make('2026-11-11T12:00:00'), NOW)).toEqual({ value: '1', unit: 'day' })
    })
    it('drops to hours then minutes under a day', () => {
        expect(bigNumber(make('2026-11-10T17:30:00'), NOW)).toEqual({ value: '5', unit: 'hrs' })
        expect(bigNumber(make('2026-11-10T12:08:00'), NOW)).toEqual({ value: '8', unit: 'min' })
    })
    it('marks overdue', () => {
        expect(bigNumber(make('2026-11-08T12:00:00'), NOW)).toEqual({
            value: '2d',
            unit: 'overdue'
        })
    })
})

describe('date-only countdowns', () => {
    const dateOnly = (date: string, extra: Partial<Countdown> = {}): Countdown =>
        make(`${date}T00:00:00`, { hasTime: false, ...extra })

    it('counts calendar days, ignoring time of day', () => {
        expect(bigNumber(dateOnly('2026-11-17'), NOW)).toEqual({ value: '7', unit: 'days' })
        expect(bigNumber(dateOnly('2026-11-11'), NOW)).toEqual({ value: '1', unit: 'day' })
        // Due later today: still "today", not "12 hrs".
        expect(bigNumber(dateOnly('2026-11-10'), NOW)).toEqual({ value: '0', unit: 'today' })
    })
    it('is overdue only once the date has passed', () => {
        expect(urgencyOf(dateOnly('2026-11-10'), NOW)).toBe('soon')
        expect(urgencyOf(dateOnly('2026-11-09'), NOW)).toBe('overdue')
        expect(bigNumber(dateOnly('2026-11-08'), NOW)).toEqual({ value: '2d', unit: 'overdue' })
    })
    it('groups by calendar date', () => {
        expect(groupOf(dateOnly('2026-11-10'), NOW)).toBe('Today')
        expect(groupOf(dateOnly('2026-11-16'), NOW)).toBe('This week')
        expect(groupOf(dateOnly('2026-11-17'), NOW)).toBe('Later')
        expect(groupOf(dateOnly('2026-11-09'), NOW)).toBe('Overdue')
    })
})

describe('progressOf', () => {
    it('is the share of time between start and due that has passed', () => {
        // Start 2026-11-08 00:00, due 2026-11-12 12:00 (4.5 days); now is 2026-11-10 12:00 (2.5 days).
        expect(progressOf(make('2026-11-12T12:00:00'), NOW)).toBeCloseTo(2.5 / 4.5)
    })
    it('clamps before the start and after the due time', () => {
        expect(
            progressOf(
                make('2026-11-12T12:00:00', {
                    startAt: new Date('2026-11-20T00:00:00').toISOString()
                }),
                NOW
            )
        ).toBe(0)
        expect(progressOf(make('2026-11-10T08:00:00'), NOW)).toBe(1)
    })
    it('counts calendar days for date-only countdowns', () => {
        const dateOnly = (due: string, start: string): Countdown =>
            make(`${due}T00:00:00`, {
                hasTime: false,
                startAt: new Date(`${start}T00:00:00`).toISOString()
            })
        // Day 2 of 4, regardless of the time of day.
        expect(progressOf(dateOnly('2026-11-12', '2026-11-08'), NOW)).toBe(0.5)
        expect(progressOf(dateOnly('2026-11-10', '2026-11-08'), NOW)).toBe(1)
        expect(progressOf(dateOnly('2026-11-20', '2026-11-10'), NOW)).toBe(0)
    })
    it('is empty for a zero-length span that has not arrived', () => {
        const sameDay = make('2026-11-12T00:00:00', {
            startAt: new Date('2026-11-12T00:00:00').toISOString()
        })
        expect(progressOf(sameDay, NOW)).toBe(0)
    })
})
