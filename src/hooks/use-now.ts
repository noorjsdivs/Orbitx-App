import { useEffect, useState } from 'react';

/** Wall clock that re-renders the caller every `interval` ms (for countdowns). */
export function useNow(interval = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

/** Seconds left until `until` (epoch ms), clamped at 0. */
export function useSecondsLeft(until: number): number {
  const now = useNow(250);
  return Math.max(0, Math.ceil((until - now) / 1000));
}
