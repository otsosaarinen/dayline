import { useEffect, useState } from 'react'
import type { Countdown } from '@shared/types'
import { needsFastTick } from './time'

/** Current time, ticking every 1s when something is due within the hour, else every 30s. */
export function useNow(countdowns: Countdown[]): number {
    const [now, setNow] = useState(() => Date.now())
    const fast = needsFastTick(countdowns, now)

    useEffect(() => {
        // Refresh right away (list changed), then on the interval. Deferred so setState isn't synchronous in the effect.
        const kick = setTimeout(() => setNow(Date.now()), 0)
        const id = setInterval(() => setNow(Date.now()), fast ? 1000 : 30_000)
        return () => {
            clearTimeout(kick)
            clearInterval(id)
        }
    }, [fast, countdowns])

    return now
}
