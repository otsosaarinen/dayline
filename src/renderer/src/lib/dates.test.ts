import { describe, expect, it } from 'vitest'
import {
    addDays,
    addMonths,
    describeDate,
    formatClock,
    formatTimeValue,
    fromDateValue,
    parseTimeInput,
    toDateValue
} from './dates'
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

describe('formatClock', () => {
    it('24-hour is zero-padded and never locale-dependent', () => {
        expect(formatClock(9, 5, '24h')).toBe('09:05')
        expect(formatClock(0, 0, '24h')).toBe('00:00')
        expect(formatClock(23, 59, '24h')).toBe('23:59')
    })
    it('12-hour handles midnight, noon and the PM hours', () => {
        expect(formatClock(0, 0, '12h')).toBe('12:00 AM')
        expect(formatClock(12, 0, '12h')).toBe('12:00 PM')
        expect(formatClock(9, 5, '12h')).toBe('9:05 AM')
        expect(formatClock(15, 30, '12h')).toBe('3:30 PM')
        expect(formatClock(23, 59, '12h')).toBe('11:59 PM')
    })
    it('formats a stored HH:mm value', () => {
        expect(formatTimeValue('15:30', '24h')).toBe('15:30')
        expect(formatTimeValue('15:30', '12h')).toBe('3:30 PM')
    })
})

describe('parseTimeInput', () => {
    it('reads 24-hour times in the usual shapes', () => {
        expect(parseTimeInput('15:30')).toBe('15:30')
        expect(parseTimeInput('1530')).toBe('15:30')
        expect(parseTimeInput('930')).toBe('09:30')
        expect(parseTimeInput('15')).toBe('15:00')
        expect(parseTimeInput('7')).toBe('07:00')
        expect(parseTimeInput('0:05')).toBe('00:05')
    })
    it('reads am/pm times, with or without spaces, colons or dots', () => {
        expect(parseTimeInput('3pm')).toBe('15:00')
        expect(parseTimeInput('3:30 PM')).toBe('15:30')
        expect(parseTimeInput('3.30pm')).toBe('15:30')
        expect(parseTimeInput('12am')).toBe('00:00')
        expect(parseTimeInput('12pm')).toBe('12:00')
        expect(parseTimeInput('11:59p')).toBe('23:59')
    })
    it('rejects things that are not a time', () => {
        for (const bad of ['', '  ', 'abc', '24:00', '25', '9:75', '13pm', '0am', '3:5', '3:30:15'])
            expect(parseTimeInput(bad), bad).toBeNull()
    })
})
