import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

/**
 * Smoothly tweens a number toward `target` (ease-out cubic). Starting from `from`
 * gives the design's count-up on first render; later changes (live prices, trades)
 * roll to the new value instead of jumping.
 */
export function useTween(target: number, { duration = 700, from }: { duration?: number; from?: number } = {}): number {
  const reduce = useReducedMotion();
  const start = from ?? target;
  const [value, setValue] = useState(start);
  const current = useRef(start);

  useEffect(() => {
    const a = current.current;
    const b = Number.isFinite(target) ? target : 0;
    if (a === b) return;
    if (reduce) {
      current.current = b;
      const id = requestAnimationFrame(() => setValue(b));
      return () => cancelAnimationFrame(id);
    }
    const t0 = Date.now();
    let raf = 0;
    const step = () => {
      const p = Math.min(1, (Date.now() - t0) / duration);
      const v = a + (b - a) * (1 - Math.pow(1 - p, 3));
      current.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduce]);

  return value;
}
