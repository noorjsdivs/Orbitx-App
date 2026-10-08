/** Park–Miller seeded PRNG so charts and books are stable per symbol. */
export function rng(seed: number): () => number {
  let s = (Math.abs(Math.floor(seed)) % 2147483646) + 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export function hash(t: string): number {
  let h = 7;
  for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) % 1000003;
  return h + 1;
}
