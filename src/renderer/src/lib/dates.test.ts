import { describe, expect, it } from 'vitest'
import { addDays, addMonths, describeDate, fromDateValue, toDateValue } from './dates'
import { isSameDay, monthGrid } from './calendar'

const TODAY = new Date(2026, 10, 10, 15, 30) // Tue 10 Nov 2026, mid-afternoon

describe('date values', () => {
    it('round-trips yyyy-MM-dd in local time', () => {
        expect(toDateValue(new Date(2026, 0, 5))).toBe('2026-01-05')
        expect(toDateValue(fromDateValue('2026-11-30'))).toBe('2026-11-30')
    })
    it('adds days across month boundaries', () => {
        expect(toDateValue(addDays(new Date(2026, 10, 28), 5))).toBe('2026-12-03')
    })
    it('adds months, clamping to the shorter month', () => {
        expect(toDateValue(addMonths(new Date(2026, 0, 31), 1))).toBe('2026-02-28')
        expect(toDateValue(addMonths(new Date(2026, 10, 10), 1))).toBe('2026-12-10')
        expect(toDateValue(addMonths(new Date(2026, 11, 15), 2))).toBe('2027-02-15')
    })
})

describe('describeDate', () => {
    it('uses friendly names near today', () => {
        expect(describeDate('2026-11-10', TODAY)).toBe('Today')
        expect(describeDate('2026-11-11', TODAY)).toBe('Tomorrow')
        expect(describeDate('2026-11-09', TODAY)).toBe('Yesterday')
    })
    it('adds the year only when it is not this year', () => {
        expect(describeDate('2026-12-24', TODAY)).not.toMatch(/2026/)
        expect(describeDate('2027-03-01', TODAY)).toMatch(/2027/)
    })
})

describe('monthGrid', () => {
    it('is always 6 weeks and starts on the chosen weekday', () => {
        const grid = monthGrid(2026, 10, 1) // November 2026; the 1st is a Sunday
        expect(grid).toHaveLength(42)
        expect(grid[0].getDay()).toBe(1) // Monday
        expect(isSameDay(grid[6], new Date(2026, 10, 1))).toBe(true)
    })
    it('starts on the 1st when the month begins on the week start', () => {
        const grid = monthGrid(2026, 5, 1) // June 2026; the 1st is a Monday
        expect(isSameDay(grid[0], new Date(2026, 5, 1))).toBe(true)
    })
})
