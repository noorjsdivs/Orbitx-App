import { useEffect, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

/**
 * Eased 0→1 progress over `duration` ms (ease-out cubic), restarted whenever `key` changes.
 * Multiply a number by it to get the design's "count-up 900ms" effect.
 * Returns 1 immediately when the OS "Reduce Motion" setting is on.
 */
export function useCountUp(key: unknown, duration = 900): number {
  const reduce = useReducedMotion();
  const [k, setK] = useState(0);
  const [prevKey, setPrevKey] = useState(key);
  if (prevKey !== key) {
    // Restart from zero in the same render the key changes (no flash of the old value).
    setPrevKey(key);
    setK(0);
  }
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const t0 = Date.now();
    const step = () => {
      const p = Math.min(1, (Date.now() - t0) / duration);
      setK(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [key, duration, reduce]);
  return reduce ? 1 : k;
}
