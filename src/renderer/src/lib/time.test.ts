import { describe, expect, it } from 'vitest'
import type { Countdown } from '@shared/types'
import { formatRemaining, groupOf, urgencyOf } from './time'

const NOW = new Date('2026-11-10T12:00:00').getTime()
const make = (dueAt: string, extra: Partial<Countdown> = {}): Countdown => ({
  id: '1',
  title: 't',
  dueAt: new Date(dueAt).toISOString(),
  tags: [],
  notifyLeadMinutes: [],
  notified: { lead: [], due: false },
  createdAt: new Date(NOW).toISOString(),
  ...extra
})

describe('formatRemaining', () => {
  it('formats units', () => {
    expect(formatRemaining(2 * 86_400_000 + 4 * 3_600_000)).toBe('2d 4h')
    expect(formatRemaining(3 * 3_600_000 + 12 * 60_000)).toBe('3h 12m')
    expect(formatRemaining(8 * 60_000)).toBe('8m')
    expect(formatRemaining(10_000)).toBe('<1m')
  })
})

describe('groupOf / urgencyOf', () => {
  it('buckets by due date', () => {
    expect(groupOf(make('2026-11-10T09:00:00'), NOW)).toBe('Overdue')
    expect(groupOf(make('2026-11-10T18:00:00'), NOW)).toBe('Today')
    expect(groupOf(make('2026-11-14T09:00:00'), NOW)).toBe('This week')
    expect(groupOf(make('2026-12-30T09:00:00'), NOW)).toBe('Later')
    expect(groupOf(make('2026-11-14T09:00:00', { completedAt: 'x' }), NOW)).toBe('Done')
  })
  it('flags urgency', () => {
    expect(urgencyOf(make('2026-11-10T13:00:00'), NOW)).toBe('soon')
    expect(urgencyOf(make('2026-11-10T09:00:00'), NOW)).toBe('overdue')
  })
})
