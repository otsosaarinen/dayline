import { useEffect, useState } from 'react'

/** Re-renders on an interval; fast (1s) when something is about to expire, else 30s. */
export function useNow(fast: boolean): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), fast ? 1000 : 30_000)
    return () => clearInterval(id)
  }, [fast])
  return now
}
