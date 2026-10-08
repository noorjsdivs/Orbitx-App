import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ThemeName } from '@/theme/tokens';

import { persistStorage } from './storage';

export type TradeMode = 'pro' | 'lite';
/** Developer override for list states, mirrors the design's "List states" control. */
export type ListState = 'live' | 'loading' | 'empty' | 'error';

type PrefsState = {
  theme: ThemeName;
  mode: TradeMode;
  hideBalance: boolean;
  favs: string[];
  lang: string;
  listState: ListState;
  livePrices: boolean;
  setTheme: (t: ThemeName) => void;
  setMode: (m: TradeMode) => void;
  toggleHide: () => void;
  toggleFav: (sym: string) => boolean;
  setFavs: (f: string[]) => void;
  setLang: (l: string) => void;
  setListState: (s: ListState) => void;
  setLivePrices: (on: boolean) => void;
};

export const usePrefs = create<PrefsState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      mode: 'pro',
      hideBalance: false,
      favs: ['BTC', 'ETH', 'SOL', 'DOGE'],
      lang: 'English',
      listState: 'live',
      livePrices: true,
      setTheme: (theme) => set({ theme }),
      setMode: (mode) => set({ mode }),
      toggleHide: () => set((s) => ({ hideBalance: !s.hideBalance })),
      toggleFav: (sym) => {
        const isFav = get().favs.includes(sym);
        set((s) => ({ favs: isFav ? s.favs.filter((x) => x !== sym) : [...s.favs, sym] }));
        return !isFav;
      },
      setFavs: (favs) => set({ favs }),
      setLang: (lang) => set({ lang }),
      setListState: (listState) => set({ listState }),
      setLivePrices: (livePrices) => set({ livePrices }),
    }),
    {
      name: 'orbitx.prefs',
      storage: persistStorage,
      partialize: ({ theme, mode, hideBalance, favs, lang }) => ({ theme, mode, hideBalance, favs, lang }),
    },
  ),
);
