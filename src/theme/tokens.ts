/**
 * ORBITX design tokens, ported 1:1 from the Claude Design handoff (`[data-ox]` CSS variables).
 */

export type ThemeName = 'dark' | 'light';

export type Palette = {
  desk: string;
  bg: string;
  s1: string;
  s2: string;
  s3: string;
  s4: string;
  line: string;
  hair: string;
  cam: string;
  ctl: string;
  t1: string;
  t2: string;
  t3: string;
  t4: string;
  ac: string;
  acP: string;
  acT: string;
  onAc: string;
  up: string;
  dn: string;
  warn: string;
  glass: string;
  glass2: string;
  glassSheet: string;
  glassBar: string;
  glassBd: string;
  pill: string;
  scrim: string;
  placeholder: string;
  white: string;
};

const dark: Palette = {
  desk: '#050607',
  bg: '#0B0E11',
  s1: '#181A20',
  s2: '#1E2329',
  s3: '#2B3139',
  s4: '#363C45',
  line: '#252930',
  hair: '#1C2026',
  cam: '#06080A',
  ctl: '#474D57',
  t1: '#EAECEF',
  t2: '#B7BDC6',
  t3: '#848E9C',
  t4: '#5E6673',
  ac: '#F7C548',
  acP: '#E2AF34',
  acT: '#F7C548',
  onAc: '#181A20',
  up: '#0ECB81',
  dn: '#F6465D',
  warn: '#F59E3B',
  glass: 'rgba(30,35,41,0.55)',
  glass2: 'rgba(24,26,32,0.78)',
  glassSheet: 'rgba(24,26,32,0.96)',
  glassBar: 'rgba(11,14,17,0.66)',
  glassBd: 'rgba(255,255,255,0.08)',
  pill: 'rgba(255,255,255,0.08)',
  scrim: 'rgba(0,0,0,0.6)',
  placeholder: '#6B7280',
  white: '#FFFFFF',
};

const light: Palette = {
  desk: '#E4E6EA',
  bg: '#FFFFFF',
  s1: '#F5F5F5',
  s2: '#EEF0F2',
  s3: '#E6E8EA',
  s4: '#DADDE1',
  line: '#EAECEF',
  hair: '#F1F2F4',
  cam: '#1E2329',
  ctl: '#B7BDC6',
  t1: '#1E2329',
  t2: '#474D57',
  t3: '#707A8A',
  t4: '#929AA5',
  ac: '#F7C548',
  acP: '#E2AF34',
  acT: '#9A6E00',
  onAc: '#1E2329',
  up: '#03A66D',
  dn: '#CF304A',
  warn: '#C46A12',
  glass: 'rgba(255,255,255,0.64)',
  glass2: 'rgba(255,255,255,0.82)',
  glassSheet: 'rgba(255,255,255,0.97)',
  glassBar: 'rgba(255,255,255,0.74)',
  glassBd: 'rgba(30,35,41,0.09)',
  pill: 'rgba(30,35,41,0.06)',
  scrim: 'rgba(20,22,26,0.35)',
  placeholder: '#929AA5',
  white: '#FFFFFF',
};

export const palettes: Record<ThemeName, Palette> = { dark, light };

/** Shared motion curves from the design's motion spec. */
export const motion = {
  /** Screen push / content stagger — cubic-bezier(.2,.8,.2,1) */
  out: [0.2, 0.8, 0.2, 1] as const,
  /** Tab pill / segmented pills — cubic-bezier(.34,1.36,.64,1) */
  spring: [0.34, 1.36, 0.64, 1] as const,
  /** Toggles, pops — cubic-bezier(.34,1.56,.64,1) */
  pop: [0.34, 1.56, 0.64, 1] as const,
  /** Rings and loaders — cubic-bezier(.65,0,.25,1) */
  draw: [0.65, 0, 0.25, 1] as const,
};
